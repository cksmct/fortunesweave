import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import systemsData from "@/data/systems.json";

const systems = systemsData.systems;
const blazeUsers = systemsData.blazeUsers;
const blazeArts = systemsData.blazeArts;

const blazeTypes = Array.from(new Set(blazeArts.map((entry) => entry.blazeType)));
const perUser = (name: string) => blazeArts.filter((entry) => entry.owner === name);

const FAQS = [
  {
    question: "How long is one Turn of Free Time?",
    answer:
      "Six in-game hours. The deadline before the next Main Battle is given as a number of Turns, which is why planning a week is really planning how many six-hour blocks you can spend before the next fight.",
  },
  {
    question: "What is the difference between tactical combat and Clash?",
    answer:
      "Tactical combat is the grid battle system the series is known for. Clash is the dungeon system, closer to a party-based turn-based RPG: the party shares one HP pool, losing it forces an evacuation, and commands cover Attack, Combat Arts and a Link action that costs Link Points.",
  },
  {
    question: "How do Blaze Arts actually work?",
    answer:
      "They are character-specific Combat Arts paid for with HP instead of weapon durability. Using them fills a Blaze Meter: half full grants Overblaze, which raises stats and opens up certain Arts, and a completely full meter triggers a Burst that cuts maximum HP in half for the rest of the battle.",
  },
  {
    question: "How do you unlock Fortuna\u0027s Blessing?",
    answer:
      "Through Divine Sand. Fortuna gives Eshmel a pouch, and each Flame Lord receives one at a different point in the chronology, so the rewinding ability arrives with the character rather than with the chapter.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Core Systems and Blaze Arts",
  description:
    "Free Time, Main Battles, Clash, Fortuna\u0027s Blessing and the full Blaze Art list with each Art\u0027s HP cost, meter rules and effects.",
  path: "/systems/",
});

export default function SystemsPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Systems", item: "/systems/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Core Systems and Blaze Arts"
        description="The loop between battles, the two combat systems, the rewind mechanic, and every recorded Blaze Art with what it costs and what it does."
        path="/systems/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The loop, and why it is measured in hours
          </h2>
          <p>
            {"Fortune\u0027s Weave replaces the classic chapter treadmill with a preparation loop. Each Main Battle is announced ahead of time with a stat card of information and recommendations, and the same card states how many Turns you have before you have to start fighting. Because one Turn is six in-game hours, the deadline is a real budget rather than a countdown: a week of Free Time is a fixed number of six-hour blocks to spend on meals, training, shopping and support conversations."}
          </p>
          <p>
            Every system below feeds that budget in some way. Shopping and training spend Turns to raise
            a roster; meals and rests spend them to raise supports; dungeons spend a different kind of
            currency, which is Renown, and pay back in chests. The one thing the loop will not let you do
            is convert Turns into everything at once, which is the actual difficulty of the game.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Every core system in one place
          </h2>
          <p>
            {"The " + systems.length + " systems recorded here are the ones that change how a week is planned rather than the ones that only appear in battle."}
          </p>
          <div className="space-y-4">
            {systems.map((entry) => (
              <article key={entry.id} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {entry.name}
                  <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                    {entry.category}
                  </span>
                </h3>
                <p className="mt-2 text-gray-700 dark:text-gray-300">{entry.summary}</p>
                <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {entry.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {"Blaze Arts: " + blazeUsers.length + " characters, " + blazeArts.length + " recorded Arts"}
          </h2>
          <p>
            Blaze Arts are the sharpest expression of the systems above because they are paid for out of
            the character rather than out of an inventory. There is no weapon durability cost: each Art
            consumes a portion of the user&apos;s HP, and the portion differs from Art to Art. Using Arts
            fills a Blaze Meter, and the meter has two thresholds that matter. Half full grants Overblaze,
            which raises stats and unlocks certain Arts. Completely full triggers a Burst, which empties
            the gauge but halves that character&apos;s maximum HP for the remainder of the battle.
          </p>
          <p>
            That structure creates the real decision. Overblaze is strong enough to want on purpose, and a
            Burst is punishing enough to avoid by accident, so tracking your own meter is a skill the game
            tests constantly. The three types matter here too: Celestial Wells fill the gauge even with
            ordinary attacks, Underworld Arts come from a character&apos;s cursed object and are fuelled by
            it, and Automaton Arts do not refill from cursed weapons at all. No Automaton Arts are recorded
            in the sources checked yet, so that type is listed without a table.
          </p>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Who has Blaze Arts</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                  <th className="py-2 pr-4">Character</th>
                  <th className="py-2 pr-4">Blaze type</th>
                  <th className="py-2 pr-4">Power source</th>
                  <th className="py-2">Recorded Arts</th>
                </tr>
              </thead>
              <tbody>
                {blazeUsers.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                      {entry.name}
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{entry.blazeType}</td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{entry.blazeSource}</td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">
                      {perUser(entry.name).length > 0 ? perUser(entry.name).length : "Names not recorded yet"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {blazeTypes.map((type) => (
            <article key={type} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {type}
                <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                  {blazeArts.filter((entry) => entry.blazeType === type).length} recorded
                </span>
              </h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                      <th className="py-2 pr-4">Art</th>
                      <th className="py-2 pr-4">Character</th>
                      <th className="py-2">Effect</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blazeArts
                      .filter((entry) => entry.blazeType === type)
                      .map((entry) => (
                        <tr key={entry.id} className="border-b border-gray-200 dark:border-gray-800">
                          <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                            {entry.name}
                          </td>
                          <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{entry.owner}</td>
                          <td className="py-2 text-gray-700 dark:text-gray-300">{entry.effect}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
          <p className="text-gray-700 dark:text-gray-300">
            Two Arts are listed without an effect because the source has not recorded what they do, and
            one row on the character table carries an attribution the source itself contradicts. Both are
            left exactly as written instead of being tidied into something tidy but wrong.
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
            Blaze Arts are tied to cursed objects, and the equipment page records which objects belong to
            which characters and where each one comes from.
          </p>
        </section>
      </main>
    </>
  );
}
