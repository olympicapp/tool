# Onderzoek — Concurrentie-prijzen tool (Olympic Hotel Amsterdam)

Doel: een tool in de Olympic Tools-suite (naast de Jacuzzi-planner) die **realtime
kamerprijzen van concurrent-hotels** ophaalt en vergelijkt (per dag/week/maand/seizoen).

## Conclusie / aanbeveling
**Start met de SerpApi Google Hotels API** (gratis 250 zoekopdrachten/mnd om te
prototypen → $75/mnd voor 5.000). Geen partner-goedkeuring nodig, geeft datum-prijzen
+ per-OTA uitsplitsing, en de juridische scraping-last ligt bij de leverancier.
- **Upgrade-opties:** Makcorps ($250/mnd, 200+ OTA's) of turnkey **Lighthouse Rate
  Insight** (kopen i.p.v. bouwen).
- **Niet doen:** zelf Booking.com/Google scrapen (tegen ToS + EU databankrecht) en
  Booking/Expedia partner-API's (gated, niet haalbaar voor één hotel).

## Concurrentieset (Oud-Zuid / Zuidas / RAI)
**4★ (direct vergelijken):** Apollo Hotel (Tribute), Gresham Memphis, Hotel JL No76,
Conscious Museum Square/Vondelpark, The College Hotel, nhow Amsterdam RAI, Novotel
City (RAI), Element Amsterdam, Crowne Plaza Zuid, Van der Valk Zuidas, Leonardo/Fletcher.
**5★ (plafond-referentie):** Hilton Amsterdam, Bilderberg Garden, Okura, Conservatorium.

**Prijsgedrag (2025):** Amsterdam ADR ~€185–211; weekenden/hoogseizoen 4★ ~€220–350;
**RAI-congressen/events €350–500+** (Zuidas-hotels swingen het hardst → daar verdient
een rate-shopper zich terug).

## Architectuur (Next.js + Supabase + Vercel)
1. **Vercel Cron** → Next.js route (`/api/shop`) draait dagelijks.
2. Eén Google-Hotels-zoekopdracht per stay-datum voor de Oud-Zuid/RAI-regio (hele set
   in één call); rolling window 0–90 dagen.
3. **Upsert** in Supabase `rate_snapshots` (incl. Olympic zelf als referentie-rij).
4. **Dashboard**: comp-set min/mediaan/max vs. Olympic per nacht; heatmap waar we boven/
   onder de markt zitten; weekend-vs-doordeweeks + seizoensweergave; event-pieken markeren.

### Supabase-schema (tijdreeks)
```sql
competitors(id, name, stars, address, area, serpapi_token, active)
rate_snapshots(
  id bigint pk, captured_at timestamptz, competitor_id fk,
  stay_date date, los int default 1, occupancy int default 2,
  rate_eur numeric, currency text, source text, room_type text, raw jsonb
)
-- index (competitor_id, stay_date, captured_at)
```

**Prototype gratis:** SerpApi free 250/mnd + Supabase free + Vercel Hobby = €0 om te
valideren; daarna $25–75/mnd opschalen.

**Bronnen:** serpapi.com/google-hotels-api · makcorps.com · developers.booking.com
(Demand API) · mylighthouse.com · hotelnewsresource.com (ADR 2025).
