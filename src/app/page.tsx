import Link from "next/link";

const tools = [
  {
    name: "Jacuzzi-planner",
    status: "In ontwikkeling",
    description:
      "Twee jacuzzi's (Jacuzzi 1 & 2) als één boekbare agenda. Klant kiest gewoon een tijd (09:00–22:00, blokken van 45 min); wij verdelen automatisch over de twee jacuzzi's en pushen naar Google Agenda — en later Mews.",
    href: "/tools/jacuzzi",
    accent: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30",
  },
];

const research = [
  { label: "Google Agenda koppelen (2 agenda's → 1 boekbare pool)", done: false },
  { label: "45-min slots, 09:00–22:00, auto-verdeling Jacuzzi 1/2", done: false },
  { label: "Mews-integratie: wat is mogelijk?", done: false },
  { label: "Bestaande tools/libraries verkennen (Cal.com, Cronofy, Nylas)", done: false },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12">
          <p className="text-sm font-medium uppercase tracking-widest text-cyan-400">
            Olympic Hotel · Amsterdam
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Interne Tools</h1>
          <p className="mt-3 max-w-xl text-neutral-400">
            Een groeiende verzameling tools die ons werk in het hotel makkelijker
            maken. Eerste tool: de Jacuzzi-planner.
          </p>
        </header>

        <section className="mb-14">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Tools
          </h2>
          <div className="grid gap-4">
            {tools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className={`group rounded-2xl border bg-gradient-to-br ${tool.accent} p-6 transition hover:scale-[1.01]`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{tool.name}</h3>
                  <span className="rounded-full bg-neutral-800/80 px-3 py-1 text-xs text-neutral-300">
                    {tool.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-neutral-300">{tool.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Onderzoek / To-do
          </h2>
          <ul className="space-y-2">
            {research.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-3"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs ${
                    item.done
                      ? "border-cyan-500 bg-cyan-500 text-neutral-950"
                      : "border-neutral-700 text-transparent"
                  }`}
                >
                  ✓
                </span>
                <span className="text-sm text-neutral-300">{item.label}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
