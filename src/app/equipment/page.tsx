import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import equipmentData from "@/data/equipment.json";

const weaponTypes = equipmentData.weaponTypes;
const items = equipmentData.items;

const categories = Array.from(new Set(items.map((entry) => entry.category)));
const linked = items.filter((entry) => entry.locationSlug !== "");
const cursed = items.filter((entry) => entry.category.startsWith("Cursed"));

const FAQS = [
  {
    question: "Is there a weapon triangle in this game?",
    answer:
      "No. Fortune Weave drops the weapon triangle and gives each weapon type its own baseline mechanic instead: spears break cavalry, bows break fliers, axes trade accuracy for power and a guaranteed damage floor, gauntlets trade damage for evasion, swords boost follow-up attacks, and magic punishes low resistance.",
  },
  {
    question: "What are cursed objects and why do they matter?",
    answer:
      "Cursed objects are a special item type found in Dagda that show up as weapons and as accessories. Possession appears to be what grants access to Blaze Arts, which makes them build-defining rather than collectible trivia.",
  },
  {
    question: "How do cursed weapons interact with Blaze Art gauges?",
    answer:
      "Using a cursed weapon adds to the gauge of a unit with Underworld Blaze Arts, while a unit with Celestial Blaze Arts has its gauge depleted instead. The gauge of Orchel is unaffected either way, so the same weapon is a resource for one build and a cost for another.",
  },
  {
    question: "Where do the strongest items come from?",
    answer:
      "Partly from the story and partly from dungeon chests. Several cursed weapons and accessories are recorded as chest rewards in named dungeons, and the locations page carries those dungeons with their Renown gates and enemy levels.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Weapons and Cursed Objects",
  description:
    "How weapon types work in Fire Emblem: Fortune\u0027s Weave without a weapon triangle, plus every recorded cursed object, where it drops and who wields it.",
  path: "/equipment/",
});

export default function EquipmentPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Equipment", item: "/equipment/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Weapons and Cursed Objects"
        description="Six weapon types with their own mechanics instead of a triangle, and the cursed objects that quietly decide what a build can actually do."
        path="/equipment/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            No weapon triangle: six mechanics instead
          </h2>
          <p>
            {"Fortune\u0027s Weave removes the weapon triangle that has defined the series for decades. In its place, each of the six weapon types carries its own baseline mechanic, which changes how a team is assembled: a spear is not simply the answer to a sword, it is the answer to cavalry, and an axe is not the counter to a lance, it is a high-variance damage option with a floor under it."}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                  <th className="py-2 pr-4">Weapon type</th>
                  <th className="py-2">Baseline mechanic</th>
                </tr>
              </thead>
              <tbody>
                {weaponTypes.map((type) => (
                  <tr key={type.id} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                      {type.name}
                    </td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">{type.effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            Because the counter-relationships are now conditional rather than cyclic, the useful question
            when building a squad is not what counters what, but which of the six mechanics your current
            roster cannot produce. An army with no bow has no answer to fliers; an army with no spear
            hands every cavalry charge a free turn.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Cursed objects and the Blaze Art gauge
          </h2>
          <p>
            {"Cursed objects are a special item type found in Dagda, taking the form of weapons and accessories, and several are known as Drake\u0027s treasures after the pirate who originally owned them. What makes them more than curiosities is the interaction with Blaze Arts: possession appears to be what grants access to them at all, which means a cursed weapon is often the doorway to a whole build rather than an upgrade to one."}
          </p>
          <p>
            The gauge rules are asymmetric, and that asymmetry is the most useful thing on this page.
            Using a cursed weapon adds to the gauge of a unit with Underworld Blaze Arts, but depletes the
            gauge of a unit with Celestial Blaze Arts, while the gauge of Orchel is unaffected either way.
            The same weapon is therefore a resource for one unit and a running cost for another, and
            equipping it without checking which side of that line your unit sits on is how a build ends up
            fighting its own kit.
          </p>
          <p>
            On top of that, using a cursed weapon or equipping a cursed accessory gives a chance to
            activate the Diadem of Duality. Cai and Theodora skip the chance entirely: their cursed
            objects are embedded in their bodies, so they hold it regardless of what they carry.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Every recorded named object
          </h2>
          <p>
            {"These are the " + items.length + " objects that have individual entries in the sources checked, grouped by category: items that act on the world, weapons, accessories, legendary weapons and Heroes Relics."}
          </p>
          {categories.map((category) => (
            <article key={category} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {category}
                <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                  {items.filter((entry) => entry.category === category).length} recorded
                </span>
              </h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                      <th className="py-2 pr-4">Object</th>
                      <th className="py-2 pr-4">Wielder</th>
                      <th className="py-2 pr-4">What it does</th>
                      <th className="py-2">Where it comes from</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items
                      .filter((entry) => entry.category === category)
                      .map((entry) => (
                        <tr key={entry.id} className="border-b border-gray-200 dark:border-gray-800">
                          <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                            {entry.name}
                          </td>
                          <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                            {entry.owner === "" ? "Not recorded" : entry.owner}
                          </td>
                          <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{entry.effect}</td>
                          <td className="py-2 text-gray-700 dark:text-gray-300">{entry.acquisition}</td>
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
            Chest objects that tie back to the dungeon list
          </h2>
          <p>
            {"Of the " + items.length + " objects above, " + linked.length +
              " are recorded as coming out of a named dungeon, which turns the locations page into a shopping list. Those dungeons each carry a Renown gate and an expected enemy level, so the order to collect them in is a planning question rather than a preference."}
          </p>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {linked.map((entry) => (
              <li key={entry.id}>
                <span className="font-medium text-gray-900 dark:text-gray-100">{entry.name}</span>
                {" - " + entry.locationName}
              </li>
            ))}
          </ul>
        </section>

        {/* Treasure Run Video Intel */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Verified Video Intel &middot; Audio Transcript
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                What a Treasure Run Looks Like
              </h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">Jay Dunna</span> &middot; Verified
              English Captions &middot; <span className="font-mono">H56RfLy8iDA</span>
            </div>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="H56RfLy8iDA"
              title="How to Get CURSED BOW in Fire Emblem: Fortune's Weave"
            />
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The list above says what drops where; it cannot say what collecting one actually involves. This
            captioned walkthrough does, using the cursed bow as the worked example, and it is worth watching
            before a first treasure run because the dungeons do not draw you a map. The object and its
            location match the table above, which is the cross-check that lets the route detail be used.
          </p>

          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                01 &middot; Where
              </span>
              <h3 className="text-sm font-semibold text-white">Valhalla Mine, far south</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The bow sits in Valhalla Mine, reached from the capital by heading west and then far south,
                and the creator&apos;s route there uses the carriage rather than walking. That matches the
                Valhalla Mine row in the table above, so the entry and the video agree on the dungeon even
                though they come from different sources.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                02 &middot; Finding It
              </span>
              <h3 className="text-sm font-semibold text-white">No map, so use the compass</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Inside, there is no minimap, but the compass strip at the top of the screen gives the rough
                bearing of the chest, which is what the run is navigated by. The creator&apos;s route runs
                forward from the entrance into an open room, takes the right-hand branch rather than the left
                exit, makes a further left, and ends at the chest at the end of a tunnel.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                03 &middot; It Doubles Up
              </span>
              <h3 className="text-sm font-semibold text-white">The run is also a smithing-stone stop</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The same dungeon is described as one of the better places for smithing stones, which is what
                makes it worth a full sweep rather than a beeline: the creator clears the whole thing and
                upgrades several weapons on the way out. That pairs directly with the durability rule on the
                weapons page, where refinement is what restores a worn weapon&apos;s uses.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                04 &middot; Who
              </span>
              <h3 className="text-sm font-semibold text-white">The creator&apos;s wielder pick</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                He hands the bow to Leda, and treats the whole run as a before-you-continue job rather than
                something to leave for later. That is a recommendation rather than a rule, and the table above
                still records no confirmed wielder for the weapon, so the pick is worth reading as the
                creator&apos;s opinion about a good pairing.
              </p>
            </div>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Two cautions on the route as written. The creator used a chapter restart to re-record the walk
            after finishing it once, and the mine contains more than one enemy group and a rest spot he
            recommends using before the chest room, so the tunnel is not an empty corridor. Positions inside
            the dungeon are also the kind of detail captions carry imperfectly, which is why they are given
            here as the shape of the route rather than as room-by-room directions.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What this page covers, and what it deliberately does not
          </h2>
          <p>
            {"A consolidated weapon and spell table lives on the weapons page, so this page covers what that table cannot: the six weapon-type mechanics and the named cursed objects with their wielders and sources. Where a field is not in the source, the row says so instead of being filled in, and Onoa is the one object here that two independent sources agree on, down to the dungeon it drops in."}
          </p>
          <p>
            {"Content that the sources themselves flag as a story reveal is left out entirely, so item entries describe what an object does and where it comes from rather than what it turns out to be."}
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
            Building a team around one of these objects? The characters page records who can be recruited
            on which path, and the class planner covers the certification climb that decides which weapon
            types a unit can actually carry.
          </p>
        </section>
      </main>
    </>
  );
}
