import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import locationsData from "@/data/locations.json";
import materialsData from "@/data/materials.json";

const dungeons = locationsData.dungeons;
const regions = Array.from(new Set(dungeons.map((entry) => entry.region))).sort((x, y) =>
  x.localeCompare(y)
);
const byRenown = dungeons
  .slice()
  .sort((x, y) => {
    const rx = x.renownRequired === "N/A" ? 999 : Number(x.renownRequired);
    const ry = y.renownRequired === "N/A" ? 999 : Number(y.renownRequired);
    return rx - ry || x.name.localeCompare(y.name);
  });
const treasureTotal = dungeons.reduce((sum, entry) => sum + entry.treasureCount, 0);
const seaDungeons = dungeons.filter((entry) => /Sea$/.test(entry.region));

const materialNames = materialsData.materials.map((entry) => entry.name);
const treasureInOurMaterialData = Array.from(
  new Set(
    dungeons
      .flatMap((entry) => entry.treasures)
      .filter((treasure) => materialNames.some((name) => treasure.includes(name)))
  )
).sort();

const FAQS = [
  {
    question: "When can you enter dungeons in Fortune\u0027s Weave?",
    answer:
      "Dungeons sit on the world map from Part 1 onward, but each one carries a Renown requirement, so the map opens in stages rather than all at once. Several are gated behind Renown 5 and above, which is well past where most runs sit when the regions first unlock.",
  },
  {
    question: "Do dungeon chests come back?",
    answer:
      "In Part 3 every dungeon replenishes with new unique chests, and the enemies inside scale with how far the story has progressed. Loot that looked finished in Part 1 is therefore not finished, and an early clear is worth repeating rather than considered closed.",
  },
  {
    question: "Are any dungeons locked to one path?",
    answer:
      "Two dungeons sit in seas that only Theodora can cross during Part 1, which is the one genuine path restriction in the list. The other parties can sail those waters later, so nothing is lost permanently, it just arrives on a different schedule.",
  },
  {
    question: "Should you clear dungeons by enemy level or by Renown?",
    answer:
      "Read both. Renown decides whether the door opens at all, and the recorded enemy level decides whether walking through it is survivable; the tables on this page are sorted by Renown so the next reachable dungeon is at the top.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Dungeons and Locations",
  description:
    "All Fire Emblem: Fortune\u0027s Weave dungeons with their region, Renown requirement, enemy level, treasure list and the Part 3 replenish rule.",
  path: "/locations/",
});

export default function LocationsPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Locations", item: "/locations/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Dungeons and Locations"
        description="Every recorded dungeon with its region, Renown gate, expected enemy level and chest contents, sorted so the next reachable one sits at the top."
        path="/locations/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Why dungeons matter more than they look
          </h2>
          <p>
            {"The world map holds " + dungeons.length + " dungeons spread across " + regions.length +
              " regions, carrying " + treasureTotal +
              " recorded chest rewards between them. Most of those rewards are not flavour: manuals that change how a class plays, gems that patch a weak stat, and upgrade seals that sit on the critical path to a promotion. Skipping dungeons does not make a run harder in an obvious way, it quietly delays the things that make a roster stronger."}
          </p>
          <p>
            Two gates decide whether a dungeon is a real option. Renown is the hard gate, and it is the
            account-wide progression stat rather than anything you can grind locally, so a low-Renown run
            cannot simply walk into the richest cave. The recorded enemy level is the soft gate: a level
            30 dungeon is open long before it is survivable, and treating the two numbers as one is how
            runs end early.
          </p>
          <p>
            Part 3 resets the calculation entirely. Every dungeon replenishes with new unique chests and
            its enemies scale with story progress, so a Part 1 clear is not a finished dungeon. Dungeons
            whose first pass looked unremarkable are worth a second visit once the army has caught up.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dungeons in progression order
          </h2>
          <p>
            Sorted by the Renown requirement, so the list reads as the order a run naturally unlocks it.
            Where a requirement is not recorded, the row says so instead of being given a plausible
            number.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                  <th className="py-2 pr-4">Dungeon</th>
                  <th className="py-2 pr-4">Region</th>
                  <th className="py-2 pr-4">Renown</th>
                  <th className="py-2 pr-4">Enemy level</th>
                  <th className="py-2">Treasures</th>
                </tr>
              </thead>
              <tbody>
                {byRenown.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                      {entry.name}
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{entry.region}</td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                      {entry.renownRequired === "N/A" ? "Not recorded" : entry.renownRequired}
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{entry.level}</td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">
                      {entry.treasures.length > 0
                        ? entry.treasures.join(", ")
                        : "Treasure not recorded yet"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dungeons by region
          </h2>
          <p>
            Regions are what the world map is divided into, and each one holds a small cluster of
            dungeons rather than a single landmark. Two of them are seas rather than land, and those are
            the ones with a path restriction attached during Part 1.
          </p>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {regions.map((region) => (
              <li key={region}>
                <span className="font-medium text-gray-900 dark:text-gray-100">{region}</span>
                {": " + dungeons.filter((entry) => entry.region === region).map((entry) => entry.name).join(", ")}
              </li>
            ))}
          </ul>
          <p className="text-gray-700 dark:text-gray-300">
            {seaDungeons.length > 0
              ? seaDungeons.map((entry) => entry.name).join(" and ") +
                " sit in sea regions. During Part 1 only Theodora can cross them; the other parties reach those waters later rather than never."
              : "No sea regions are recorded in the dungeon list checked."}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Treasures that feed the rest of the site
          </h2>
          <p>
            {"Some dungeon chests hold materials rather than gear, which is why the same names keep turning up in cooking and gathering guides. " +
              (treasureInOurMaterialData.length > 0
                ? "The overlap recorded here is " + treasureInOurMaterialData.join(", ") + ", and the material entries carry their own gathering notes."
                : "Where a chest item also has a material entry, the material page carries the gathering notes for it.")}
          </p>
          <p>
            The reverse also matters: a material that looks rare in the overworld can be sitting in a
            chest behind a Renown gate, so if a recipe stalls, checking the dungeon list is often faster
            than hunting search points.
          </p>
        </section>

        {/* Maze Dungeon Video Intel */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Verified Video Intel &middot; Audio Transcript
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                Wandering Wood: Reading the Maze
              </h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">Gamers Heroes</span> &middot;
              Verified English Captions &middot; <span className="font-mono">4wcckgCcdJA</span>
            </div>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="4wcckgCcdJA"
              title="How To Get Through The Wandering Woods (Cai) In Fire Emblem Fortunes Weave"
            />
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The table above treats Wandering Wood as one row with one chest. Inside, though, it behaves like
            a lost-woods maze rather than a corridor, and that is the part a chest list cannot carry. The
            captions that describe the route also confirm the reward matches the row, which is why the detail
            is published here rather than left as a footnote.
          </p>

          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                01 &middot; The Rule
              </span>
              <h3 className="text-sm font-semibold text-white">Follow the blue butterfly</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Each junction offers four directions and there is no compass to navigate by, so the cue the
                creator relies on is a blue butterfly that appears in front of the correct doorway. Take the
                door it stands at, and it repositions for the next junction rather than staying put. That
                single rule replaces a map: any door without the butterfly is a loop.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                02 &middot; The Length
              </span>
              <h3 className="text-sm font-semibold text-white">Five junctions, and the chest in the middle</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The maze runs for five doors in total in his run, and he reports that the third stop has been
                where the chest sits both for him and for another creator covering the same wood, which makes
                it the one junction worth searching rather than hurrying through. The exit then returns to the
                world map and onward to the quest area the wood was hiding.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                03 &middot; The Reward
              </span>
              <h3 className="text-sm font-semibold text-white">A gem, and it is the recorded one</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The chest holds a gem that can be sold or used, which lines up with the single treasure the
                table above records for this dungeon. Because the dungeon is reachable on all four Part 1
                paths and its Renown gate is one of the lowest recorded, this is a maze most runs will meet
                early rather than a late detour.
              </p>
            </div>
          </div>
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
        </section>
      </main>
    </>
  );
}
