import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import battalionsData from "@/data/battalions.json";

const mechanics = battalionsData._mechanics;
const perks = battalionsData.renownPerks;
const gaps = battalionsData._openGaps;
const confirmed = mechanics.filter((entry) => entry.grade === "cross-checked");

const FAQS = [
  {
    question: "Who can use gambits and battalions?",
    answer:
      "Theodora. Gambits and battalions are her route talent, so the command and the units belong to her and her allies while the other three Flame Lords get different systems. She recruits them from settlement nodes on the world map with her Recruit Soldiers action.",
  },
  {
    question: "Why can my unit not equip a battalion?",
    answer:
      "Three reasons cover almost every case. Only infantry can hold a battalion, so mounted units never can. A unit can only equip battalions at or below its own Authority skill level. And the battalion has to be assigned in the inventory menu first, because the Gambit command does not appear until it is.",
  },
  {
    question: "Why is the Gambit command missing in battle?",
    answer:
      "Each battalion gambit carries a fixed spatial requirement relative to its target, and the condition has to be met exactly before the option shows up. Gambits also cannot be used at all during the turn-based Clashes inside dungeons, which is the other reason the command disappears.",
  },
  {
    question: "Does Charm matter for gambits?",
    answer:
      "Yes. Charm raises how effective a gambit is, which is why Theodora and Bonaventure suit a gambit-driven build. Authority is the separate stat that gates what a unit can equip, and the two are easy to confuse.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Gambits and Battalions",
  description:
    "How gambits and battalions work in Fire Emblem: Fortune\u0027s Weave: the Theodora-only recruitment loop, Authority and Charm, and the Renown perks.",
  path: "/battalions/",
});

export default function BattalionsPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Battalions", item: "/battalions/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Gambits and Battalions"
        description="Theodora\u0027s route talent from end to end: recruiting, who may carry one, why the command vanishes, and what Renown buys."
        path="/battalions/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            A system with two separate gates
          </h2>
          <p>
            Gambits and battalions are Theodora&apos;s route talent rather than a universal mechanic, and
            they are gated twice. The first gate is who may hold one at all: infantry only, with mounted
            units, whether on a horse, an Ornius or a flying mount, permanently excluded. The second gate
            is Authority, which caps the rank of battalion a unit can equip. Both gates are on the unit
            side, because battalions do not carry an authority value of their own.
          </p>
          <p>
            The third thing that surprises players is not a gate but an ordering rule: a battalion has to
            be assigned in the inventory menu before the Gambit command appears on that unit. A
            battalion sitting unassigned in the bag does nothing at all, which is why so many players
            report the command being missing rather than the battalion being weak.
          </p>
          <p>
            Once equipped, a gambit still has to earn its turn. Each one carries a fixed spatial
            requirement relative to its target, and the condition has to be met exactly before the option
            appears. Gambits also cannot be used during the turn-based Clashes fought inside dungeons,
            which makes them a battlefield tool specifically rather than a universal answer.
          </p>
          <p>
            {"Charm is the stat that decides how hard a gambit hits rather than whether it can be used, and it is confirmed by two independent publications: " +
              confirmed.length + " of the " + mechanics.length +
              " rows below carry that confirmation, and the rest rest on a single community write-up that marks its own figures unverified."}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Every recorded mechanic
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                  <th className="py-2 pr-4">Mechanic</th>
                  <th className="py-2 pr-4">What it does</th>
                  <th className="py-2">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {mechanics.map((entry) => (
                  <tr key={entry.key} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                      {entry.key}
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                      {entry.value}
                      {entry.note ? (
                        <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">
                          {entry.note}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 text-xs text-gray-700 dark:text-gray-300">
                      {entry.grade === "cross-checked"
                        ? "Confirmed by two sources"
                        : "Community reported"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The Renown perks at 5, 7 and 9
          </h2>
          <p>
            Renown does three things for this system, and it does them at the same three levels that gate
            so much else. The community write-up marks all three as unverified, so they are recorded here
            as reported rather than as settled numbers.
          </p>
          <div className="space-y-4">
            {perks.map((entry) => (
              <article key={entry.id} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {"Renown " + entry.level}
                </h3>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{entry.effect}</p>
              </article>
            ))}
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            The surplus path is worth knowing early: spare battalions convert into troop points at the
            Transport Chief, who unlocks in Theodora&apos;s Part I at Chapter 7, and 100 troop points buy
            a Tactics Manual. Hoarding battalions you will never field is therefore a waste rather than
            caution.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What no source has recorded yet
          </h2>
          <p>
            This is the one system on the site where the honest answer to &quot;which one should I
            use&quot; is that nobody has published a single named battalion or a single gambit effect.
            Rather than fill that hole with plausible names, the gap is stated.
          </p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            {gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
          <p className="text-gray-700 dark:text-gray-300">
            The practical workaround in the meantime is to read the two gates rather than a tier list:
            pick battalions at or below your unit&apos;s Authority, keep them on infantry, and deploy the
            cleric-type ones to resource nodes and the mage-type ones to ore when they are not in use.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Frequently asked questions
          </h2>
          <dl className="space-y-5">
            {FAQS.map((item) => (
              <div key={item.question}>
                <dt className="font-semibold text-gray-900 dark:text-gray-100">{item.question}</dt>
                <dd className="mt-1 text-gray-700 dark:text-gray-300">{item.answer}</dd>
              </div>
            ))}
          </dl>
          <p className="text-gray-700 dark:text-gray-300">
            Route talents differ per Flame Lord, so Theodora&apos;s battalions are worth reading next to
            the systems page, which covers what the other paths get instead.
          </p>
        </section>
      </main>
    </>
  );
}
