import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import mountsData from "@/data/mounts.json";

const mechanics = mountsData._mechanics;
const mounts = mountsData.mounts;
const abilities = mountsData.bondAbilities;
const spawns = mountsData.spawns;
const openQuestions = mountsData._openQuestions;

const breeds = Array.from(new Set(mounts.map((entry) => entry.breed)));
const regions = Array.from(new Set(spawns.map((entry) => entry.region)));
const reachable = spawns.filter((entry) => entry.caiPartOne === "Yes");

const FAQS = [
  {
    question: "Who can catch animal mounts in Fortune\u0027s Weave?",
    answer:
      "The mechanic belongs to Cai. It opens on his Part I route at Chapter 5, and the animals you lure in are kept in the stable in Lowtown, Dagsion.",
  },
  {
    question: "What do mounts actually give you?",
    answer:
      "Each Bond Level with a mount grants one stat point and five percent growth in a stat, so Bond 5 is five points and twenty five percent. The stat point and the growth rarely land on the same stat, which is why a mount can hand out flat Speed while boosting Dexterity growth.",
  },
  {
    question: "How do you capture a mount?",
    answer:
      "Animal tiles appear on the world map. Choose Lure, place a food item, and match the species preference to improve the odds. After several turns the tile fills a capture gauge, and returning to choose Capture plays a short scene. A failure still pays out as that animal\u0027s manure for fertiliser.",
  },
  {
    question: "Why are some rows marked community reported?",
    answer:
      "Because the figures come from one forum thread rather than from two independent publications. Several posters corroborate parts of the table inside that thread, and one site republishes those same figures, but a republisher is not a second source, so the label stays honest rather than flattering.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Animal Mounts and Bonds",
  description:
    "How Fire Emblem: Fortune\u0027s Weave animal mounts work: capture, bonding, every subspecies with its stat and growth bonuses, and where each one spawns.",
  path: "/mounts/",
});

export default function MountsPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Mounts", item: "/mounts/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Animal Mounts and Bonds"
        description="Capture, feeding and bonding, plus every recorded subspecies with the stat and growth bonuses it hands over at full bond."
        path="/mounts/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The capture loop
          </h2>
          <p>
            {"Animal mounts are Cai\u0027s mechanic: tiles marked with an animal appear on the world map, you place a food item to lure one, and a capture gauge fills while you get on with Dagsion. Returning to choose Capture either sends the animal to the stable in Lowtown or hands you that animal\u0027s manure, which is fertiliser rather than a consolation prize."}
          </p>
          <p>
            {"A mount is not equipment you equip and forget. It has a Bond Level with the unit caring for it, and only a unit in a matching mounted class gets the abilities: an Ornius pairs with an Ornius Rider, and no amount of bonding changes that. The stable runs to a hard capacity, recorded in the table above rather than repeated here, and extras can be released. Players also report that captures refresh daily while the rest of the world map runs weekly."}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <tbody>
                {mechanics.map((entry) => (
                  <tr key={entry.key} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                      {entry.key}
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{entry.value}</td>
                    <td className="py-2 text-xs text-gray-600 dark:text-gray-400">
                      {entry.sourceNote}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What a bond is actually worth
          </h2>
          <p>
            {"Each Bond Level grants one stat point and five percent growth in a stat, which compounds to five points and twenty five percent at Bond 5. The two halves are the part players miss: the flat point and the growth percentage rarely apply to the same stat, so a mount can be picked for its growth contribution while its flat bonus sits on something you did not want."}
          </p>
          <p>
            {"Two mounts break the pattern. Bucephalus and Rocinan, the unique mounts belonging to Alexandra and Io, cap at six reward points rather than five, for six points and thirty percent growth. Separately, players report that a Charioteer doubles the growth a mount provides and attribute it to the Charioteer\u0027s Path skill, though the thread itself treats that mechanism as unsettled rather than proven."}
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Every recorded subspecies
          </h2>
          <p>
            {"Figures below are Bond 5 values. A dash of doubt belongs on all of them: they come from one forum thread, and where the source itself calls a number unresolved that is stated in the row."}
          </p>
          {breeds.map((breed) => (
            <article key={breed} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {breed}
                <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                  {mounts.filter((entry) => entry.breed === breed).length} recorded
                </span>
              </h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                      <th className="py-2 pr-3">Subspecies</th>
                      <th className="py-2 pr-3">Food</th>
                      <th className="py-2 pr-3">Paired class</th>
                      <th className="py-2 pr-3">Abilities</th>
                      <th className="py-2 pr-3">Bond 5 stats</th>
                      <th className="py-2 pr-3">Bond 5 growth</th>
                      <th className="py-2">Spawns</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mounts
                      .filter((entry) => entry.breed === breed)
                      .map((entry) => (
                        <tr key={entry.id} className="border-b border-gray-200 dark:border-gray-800">
                          <td className="py-2 pr-3 font-medium text-gray-900 dark:text-gray-100">
                            {entry.name}
                          </td>
                          <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{entry.food}</td>
                          <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{entry.pairedClass}</td>
                          <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">
                            {entry.abilities.length > 0 ? entry.abilities.join(", ") : "Not recorded"}
                          </td>
                          <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{entry.statBonus}</td>
                          <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{entry.growthBonus}</td>
                          <td className="py-2 text-gray-700 dark:text-gray-300">
                            {entry.spawns.join(", ")}
                            <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">
                              {entry.spawnNote}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Paired abilities at Bond 3 and Bond 5
          </h2>
          <p>
            {"Abilities do not arrive as a flat package. Each one steps up at Bond 3 and again at Bond 5, which means a mount you intend to rely on has to be bonded twice over before it shows its full value. There are " +
              abilities.length + " recorded abilities in total, and most subspecies carry two of them."}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                  <th className="py-2 pr-4">Ability</th>
                  <th className="py-2 pr-4">Bond 3</th>
                  <th className="py-2">Bond 5</th>
                </tr>
              </thead>
              <tbody>
                {abilities.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                      {entry.name}
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{entry.bond3}</td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">{entry.bond5}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Where each subspecies spawns
          </h2>
          <p>
            {"Spawns are tied to world map locations rather than chapters, and Cai can only reach " +
              reachable.length + " of the " + spawns.length + " recorded spawns during Part I: the rest open later. Rare spawns share the tile with the common one, so a rare is a matter of patience at a tile whose common animal you may not want."}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                  <th className="py-2 pr-4">Region</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">Common</th>
                  <th className="py-2 pr-4">Rare</th>
                  <th className="py-2">Reachable in Cai Part I</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((region) =>
                  spawns
                    .filter((entry) => entry.region === region)
                    .map((entry) => (
                      <tr key={entry.id} className="border-b border-gray-200 dark:border-gray-800">
                        <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{entry.region}</td>
                        <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                          {entry.spot}
                        </td>
                        <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{entry.common}</td>
                        <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{entry.rare}</td>
                        <td className="py-2 text-gray-700 dark:text-gray-300">{entry.caiPartOne}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bond Timing Video Intel */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Verified Video Intel &middot; Audio Transcript
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                Bond Early, Ride Later
              </h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">Varsona</span> &middot; Verified
              English Captions &middot; <span className="font-mono">gTVnq4iqeGs</span>
            </div>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="gTVnq4iqeGs"
              title="Fortune's Weave Gave Mounted Units a Game-Changing Upgrade"
            />
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            This section exists for one mechanic that the tables above imply but never spell out: when the
            bond has to be built. The video it comes from is pre-release commentary recorded before the game
            shipped, so its speculation is labelled as speculation below and the parts that our tables have
            since settled are marked as settled. The load-bearing point it makes about timing is the one worth
            carrying into a run.
          </p>

          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                01 &middot; The Gate
              </span>
              <h3 className="text-sm font-semibold text-white">The class decides, not the bond</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Whether a unit may ride a given mount is decided by its class rather than by the mount, so a
                horse, an Ornius or a flying animal that is bonded to an infantry unit still does nothing
                until that unit is in a matching mounted class. That is the same rule the mechanics table
                above records, and it is why a mount is not simply equipment you swap in.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                02 &middot; The Trick
              </span>
              <h3 className="text-sm font-semibold text-white">Pre-build the bond in a non-mounted class</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The mechanic the video singles out is that bonding is not gated by the class that can use the
                mount. A unit can build its bond from a class that cannot ride the animal, so that the moment
                it promotes into the mounted tier the ability is already at the level it would otherwise have
                taken a tour of duty to reach. In practice this turns class planning into a scheduling problem
                rather than a swap.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                03 &middot; Unsettled
              </span>
              <h3 className="text-sm font-semibold text-white">Does the ability follow the unit?</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The creator raises, and explicitly declines to answer, whether an unlocked mount ability stays
                with the unit after the mount is swapped, or only while that specific animal is attached. He
                cannot confirm it from the footage. It is recorded here as unresolved, because the whole value
                of bonding early depends on the answer, and nobody has demonstrated it since.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                04 &middot; Settled Since
              </span>
              <h3 className="text-sm font-semibold text-white">Which routes get mounts at all</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The video also asks whether routes other than Cai&apos;s can obtain mounts, or only buy worse
                ones from vendors. That question has since been answered by the capture loop recorded on this
                page: the animal tiles, the lure and the Lowtown stable belong to Cai&apos;s Part I route from
                Chapter 5, which makes the mount subsystem a route mechanic rather than a universal vendor
                line.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Still open in the record
          </h2>
          <p>
            {"These are the questions the source itself leaves unanswered rather than questions this page is hiding. They are listed so that a reader can tell the difference between a gap and a fact, and so that the page can be corrected the moment one of them is settled."}
          </p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            {openQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
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
            Mounts sit next to the classes page, because a mount only works for a unit in a matching
            mounted class, and next to the equipment page, where the cursed objects carry their own
            trade-offs.
          </p>
        </section>
      </main>
    </>
  );
}
