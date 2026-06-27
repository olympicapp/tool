# Onderzoek — Jacuzzi-planner (Olympic Hotel Amsterdam)

Doel: twee jacuzzi's (Jacuzzi 1 & 2) als **één boekbare agenda** voor de klant.
Boekbaar 09:00–22:00, elke boeking 45 min. Klant kiest geen jacuzzi — wij verdelen
automatisch over de twee. Pushen naar Google Agenda, later koppelen aan Mews.

---

## Conclusie / aanbevolen architectuur

**Bouw custom op onze eigen stack (Next.js + Supabase + Vercel).** Het probleem is
klein en exact; bestaande platforms (Cal.com, Cronofy, Nylas) modelleren resources
als *personen/hosts* en zijn te zwaar of te duur voor 2 units. We willen Mews later
zelf koppelen, dus de boekingskern in eigen hand houden is het simpelst.

```
Klant → Next.js (Vercel) → Supabase Postgres  ← bron van waarheid + lock
                                  │
                                  ▼ server action
                        Google Calendar API (service account)
                          ├── Jacuzzi 1 agenda
                          └── Jacuzzi 2 agenda
```

**Supabase Postgres = bron van waarheid en slot-arbiter. Google Agenda = gespiegelde
weergave** (voor personeel), niet de boekingsautoriteit.

---

## 1. Google Agenda

- **Auth:** **service account** met de twee jacuzzi-agenda's *gedeeld* met het
  service-account-e-mailadres (rechten "Wijzigingen in afspraken aanbrengen").
  Géén domain-wide delegation (overkill, vereist Workspace), géén OAuth-user-flow
  (tokens verlopen). Werkt ook met gewone Gmail-agenda's.
- **Beschikbaarheid:** `freebusy.query` — beide agenda's in één call, geeft alleen
  bezet-blokken terug. Slots genereren in tijdzone **Europe/Amsterdam** (let op
  zomertijd!). Met 45-min back-to-back vanaf 09:00 is de laatste start 21:15 (17
  slots/dag). Stap/cadans is een productkeuze — afstemmen met hotel.
- **Slot boekbaar** als **minstens één** van de twee jacuzzi's vrij is.
- **Toewijzing + lock:** Google kan géén dubbele boeking voorkomen (`events.insert`
  heeft geen "alleen als vrij"). Daarom in **Postgres** arbitreren met een **GiST
  exclusion-constraint** op `(jacuzzi, tstzrange)` → de DB weigert overlap. Kies
  binnen dezelfde transactie de vrije jacuzzi (first-available / round-robin),
  commit, dán pas `events.insert`.
- **Idempotentie:** geef zelf het event-`id` mee (afgeleid van booking-UUID, base32hex)
  → herhaalde insert geeft 409 i.p.v. duplicaat.
- **Sync:** `events.watch` (push-notificaties) + incrementele sync met `syncToken`
  om handmatige wijzigingen van personeel op te vangen. Kanalen verlopen → vernieuwen
  via cron. Notificaties zijn niet 100% betrouwbaar → periodieke poll als vangnet.
- **Lib:** officiële `googleapis` (Node), draaien in Node-runtime (niet Edge).
- **Valkuil:** private key `\n` in Vercel-env un-escapen: `key.replace(/\\n/g,'\n')`.

## 2. Mews

- **API:** **Connector API** (gratis, self-service, **publieke demo/sandbox**
  `https://api.mews-demo.com`). Auth via ClientToken (jouw app) + AccessToken (per hotel).
- **Modellering jacuzzi-slot — 2 opties:**
  - **Optie B (aanbevolen v1):** jacuzzi-slot als **Product** (categorie *Wellness*)
    → boeking als **kosten op de rekening** van de ingecheckte gast. Eigen stack houdt
    de slot-logica; Mews krijgt de omzet/billing. Simpel.
  - **Optie A (later):** Bookable Service + **Resource Category "Jacuzzi"** met 2
    resource-units → Mews trackt zélf de pooling. Mooi conceptueel, maar Mews kent
    alleen Dag/Uur-tijdseenheden → **45-min mapt niet native**. Hou slot-logica dus
    zelf.
- **Lezen:** `reservations/getAll` (State=`Started`) → wie is in-house, om slots aan
  te bieden; webhooks voor realtime updates.
- **Go-live:** ontwikkelen mag vrij; **certificering vereist vóór productie** (gratis,
  technische review). Daarna geeft Olympic Hotel z'n eigen AccessToken af.
- **Kernpunt:** laat Mews níét het 09:00–22:00-rooster bezitten — Supabase/Google doen
  dat; Mews voor in-house-gasten + facturatie.

## 3. Build vs Buy

| Optie | Pooling/round-robin | Google-sync | Self-host | Kosten (onze schaal) | Oordeel |
|---|---|---|---|---|---|
| **Custom (Supabase + Google API)** | ja, exact | ja | n.v.t. | ~gratis | **Beste fit** |
| Cal.com | ja (Teams round-robin) | ja | ja (EE-licentie) | ~$12–15/user/mo | te zwaar |
| Cronofy | resource-tier | sterk | nee | ~$819–2.399/mo | te duur |
| Nylas | zelf logica | ja | nee | ~$10/mo | hedge voor OAuth |

→ **Custom bouwen.** Eventueel Nylas (~$10/mo) als we de Google-OAuth-laag willen
uitbesteden, maar niet nodig met een service account.

---

## Gefaseerd plan

1. **Fase 1 — kern (geen Mews):** Supabase-schema (`resources`, `bookings` met
   exclusion-constraint), boekingslogica (vrije jacuzzi kiezen + lock), Google
   Calendar-push, klant-UI (slot-picker).
2. **Fase 2 — Mews lezen:** Connector API op demo, in-house-gasten ophalen, webhooks.
3. **Fase 3 — Mews schrijven:** slot als Wellness-Product op de gastrekening.
4. **Fase 4 — go-live:** Marketplace-registratie + certificering + productie-token.

## Open vragen voor het hotel

- Exacte cadans: back-to-back vanaf 09:00, of vaste starttijden (:00/:30)?
- Schoonmaak-/buffertijd tussen boekingen?
- Wie beheert de Google-agenda's (Workspace of gewone Gmail)?
- Moet een boeking aan een ingecheckte gast gekoppeld zijn, of ook losse klanten?
