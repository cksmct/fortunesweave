import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import YouTubeEmbed from "@/components/YouTubeEmbed";
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

        {/* Tactical Video Guide & Systems Breakdown */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Verified Video Intel &middot; Audio Transcript
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                Combat Loop &amp; Exploration Mechanics Field Guide
              </h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">PhillyBeatzU</span> &middot; Verified English Captions
            </div>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="WrupS2DQH-U"
              title="31+ EARLY Game Tips You Must Know (Fire Emblem Fortune's Weave)"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                01 &middot; Time Budget
              </span>
              <h3 className="text-sm font-semibold text-white">Quarter-Day Turn Economy</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Time is strictly partitioned: 4 turns equal 1 full in-game day (each turn represents a 6-hour segment). Moving across the world map consumes turns, requiring careful route planning to avoid missing weekly resets in Dagsion.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                02 &middot; Holy Day Cycles
              </span>
              <h3 className="text-sm font-semibold text-white">Deity Devotion Multipliers</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Temple services accumulate devotion that unlocks battle-altering blessings. Consult the in-game calendar for designated Holy Days, which multiply favor gains when praying to specific patrons.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                03 &middot; Zero-Turn Meals
              </span>
              <h3 className="text-sm font-semibold text-white">Inn Dining &amp; Sunday Discounts</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Sharing meals at the inn raises bond levels without consuming turn units—costing only gold. Dining on Sundays grants a 50% discount across all dishes, making weekend town visits ideal for economical support grinding.
              </p>
            </div>
          </div>
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
        {/* Video intel: UquUQo_Gzn0 */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; verified English captions
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">The mechanics the tutorials skip</h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-200">IGN</span> &middot;{" "}
              <span className="font-mono">UquUQo_Gzn0</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed videoId="UquUQo_Gzn0" title="Fire Emblem: Fortune's Weave - 18 Things It Doesn't Tell You" />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">IGN's captioned list covers the systems the opening hours do not explain, including one route decision the game never advertises.</p>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><span className="font-semibold text-zinc-200">Time is measured.</span> A day is made of turns shown as hourglasses, and each turn is six in game hours, which is the unit every weekly window and deadline on this site is counted in.</li>
              <li><span className="font-semibold text-zinc-200">The fifth door.</span> At the end of the prologue the four Flame Lords are offered, but walking to the door of the Obelisk Chamber lets you proceed in the present day with no recruits from the past.</li>
              <li><span className="font-semibold text-zinc-200">The cost.</span> That route skips all of Part I and Part II and drops you straight into Part III, opening on a hard fight and heavy story spoilers.</li>
              <li><span className="font-semibold text-zinc-200">The safety net.</span> If you die in that opening fight Fortuna teleports you back to the chamber, so the shortcut is recoverable rather than a dead end.</li>
          </ul>
        </section>

      </main>
    </>
  );
}
