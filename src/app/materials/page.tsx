import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import NativeBannerAd from "@/components/NativeBannerAd";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import materialsData from "@/data/materials.json";
import recipesData from "@/data/drink-recipes.json";
import YouTubeEmbed from "@/components/YouTubeEmbed";

const materials = materialsData.materials;
const recipes = recipesData.recipes;

const FAQS = [
  {
    question: "How do you find leaves in Fortune\u0027s Weave?",
    answer:
      "Overworld Search points are marked with a vegetable icon. Stand on one and use the Search function repeatedly until the material drops; the same node can yield more than one leaf type, which is why two quests can be finished on a single trip.",
  },
  {
    question: "Where do you hand the leaves in?",
    answer:
      "At the Tavern in Dagsion. The drink recipes are a perform quest chain for Leda, and each request asks for one leaf type in sequence.",
  },
  {
    question: "Can you gather all four leaves before you need them?",
    answer:
      "Yes, and it is the recommended approach. Collecting one of each early keeps the chain moving, and the only rule is to hold at least one leaf of the type a pending request asks for rather than spending it elsewhere.",
  },
  {
    question: "Why does the Wonder Leaves entry mention two different routes?",
    answer:
      "Because sources disagree. Two describe Mahapira Garden as a Search node, while one reports that searching the overworld does not produce them and that the Dance for Benetnasch quest is the only source. Both routes are listed and the conflict is dated rather than resolved.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Leaf Locations and Recipes",
  description:
    "Where to find every Fire Emblem: Fortune\u0027s Weave leaf, which Drink Recipe quest needs it, and what each step of the chain pays out.",
  path: "/materials/",
});

export default function MaterialsPage() {
  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Materials", item: "/materials/" },
  ]);

  return (
    <>
      <JsonLd data={[breadcrumb, generateFAQSchema(FAQS)]} />
      <PageHeader
        title="Leaf Locations and Recipes"
        description="Four leaf types, one Search mechanic, and a quest chain that pays out Blaze Arts, Renown and two advanced classes. Here is where each leaf grows."
        path="/materials/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The four leaves and what they are for
          </h2>
          <p>
            Sweet, Pepper, Bitter and Wonder Leaves are the four gathering materials behind Leda&apos;s
            Drink Recipe perform quests. Each request in the chain asks for one leaf type, in this
            order: Sweet Leaves for Simple Drink Recipes, Pepper Leaves for Captains Drink Recipes,
            Bitter Leaves for Popular Drink Recipes, and Wonder Leaves for Elegant Drink Recipes.
          </p>
          <p>
            The leaves have no other use. Once gathered they go to the Tavern in Dagsion, where they
            are converted into drink recipes, and the later steps pay considerably better than the
            first: the chain hands out Blaze Arts, Renown, and at the end two advanced classes.
          </p>
        </section>

        {/* 黄金次屏 Adsterra 原生信息流广告位 */}
        <NativeBannerAd />

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How the Search mechanic works
          </h2>
          <p>
            Gathering happens on the world map at Search points, which are marked with a vegetable
            icon. Stand on one and use Search repeatedly rather than once; the node can yield more than
            one useful item, and Pepper and Bitter Leaves in particular come from the same location, so
            a single stop can cover two quests.
          </p>
          <p>
            Because the chain is sequential, the practical habit is to gather wide rather than narrow:
            pick up a leaf type when you pass its region even if the request for it has not appeared
            yet, and keep at least one of each type in hand until the matching request is turned in.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Where each leaf is found
          </h2>
          <p>
            The best single location is listed first for each leaf; the remaining entries are known
            alternates if you are already in that part of the map.
          </p>
          <div className="space-y-4">
            {materials.map((material) => (
              <article
                key={material.id}
                className="rounded-lg border border-gray-200 p-5 dark:border-gray-800"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {material.name}
                  </h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {material.category + (material.usedInQuests.length > 0 ? " - " + material.usedInQuests.join(", ") : "")}
                  </span>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {material.locations.map((location) => (
                    <li key={location.area}>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {location.area}
                      </span>{" "}
                      - {location.spot} ({location.method})
                    </li>
                  ))}
                </ul>
                {material.note ? (
                  <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">{material.note}</p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The Drink Recipe chain
          </h2>
          <p>
            Four requests, in order. Each needs one leaf type, and the later steps are the ones worth
            planning around because they carry the better rewards.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                  <th className="py-2 pr-4">Step</th>
                  <th className="py-2 pr-4">Quest</th>
                  <th className="py-2 pr-4">Leaf</th>
                  <th className="py-2">Rewards</th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((recipe) => (
                  <tr
                    key={recipe.id}
                    className="border-b border-gray-200 align-top dark:border-gray-800"
                  >
                    <td className="py-3 pr-4 font-semibold text-gray-900 dark:text-gray-100">
                      {recipe.order}
                    </td>
                    <td className="py-3 pr-4">
                      {recipe.name}
                      {recipe.renownRequirement ? (
                        <span className="block text-xs text-gray-600 dark:text-gray-400">
                          Renown {recipe.renownRequirement} required
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4">{recipe.leafRequired}</td>
                    <td className="py-3">{recipe.rewards.join("; ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The fastest collection route
          </h2>
          <p>
            Three stops cover the whole chain. Gather Sweet Leaves early at Traveler&apos;s Hill in the
            Elektra region, or pick them up around Verdant Hollow while passing through Daimon. Then
            make one dedicated trip to Traveler&apos;s Garden in the Castalia region, north-east of
            Dagda past Fortuna&apos;s Temple and the Port of Pandora, and Search until you hold one
            Pepper Leaf and one Bitter Leaf. Finally, for Wonder Leaves, continue Leda&apos;s story to
            Chapter 11 and complete Dance for Benetnasch in the Tavern, whose guaranteed reward covers
            the last request.
          </p>
          <p>
            Wonder Leaves are the one step worth reading twice, because the sources disagree about how
            they are obtained. Two describe Mahapira Garden, in the far south of the Ogmios region, as
            a Search node reachable by carriage from Salacia Posthouse. One reports that searching the
            overworld does not produce them at all, and that the Chapter 11 quest reward is the only
            route. If you are already heading into Chapter 11, the quest route settles the question
            either way.
          </p>
        </section>

        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; creator walkthrough
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                Paradise Fish and the Ninae recruitment
              </h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-200">MrEOD - Nintendo Games</span> &middot;{" "}
              <span className="font-mono">_FypuWmkSac</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed videoId="_FypuWmkSac" title="How to Recruit Ninae in Fire Emblem Fortune's Weave (Paradise Fish Locations)" />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {"Its English captions were transcribed on 2026-09-30. What it adds beyond the table is the shape of the trip: the lake is reached by caravan and then an underpass, and the last stretch can be guarded by level 25 enemies, so a lower level party should come back later. The catch is rare, so budget around twenty turns, and when a search comes up empty move a square away and search again rather than standing still. It also names the recruit as wanting one Paradise Fish and nothing else."}
          </p>
        </section>
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; second route
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                The same catch, from the southern road
              </h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-200">The Game Looters</span> &middot;{" "}
              <span className="font-mono">W54tJcJm6PE</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed videoId="W54tJcJm6PE" title="Fire Emblem: Fortune's Weave - How to Get Paradise Fish & Recruit Ninae!" />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {"A second creator route to the same lake, transcribed on 2026-09-30, and the one that records the recruitment requirements in full: support level three, a Renown gate on his route and one Paradise Fish. It reaches the lake from the mine road if the area is unexplored, or from the southern posthouse if the carriage route is already open, and it repeats the move a square and search again trick when the node dries up."}
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
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quick answers</h2>
          <p>
Fire Emblem: Fortune&apos;s Weave Wonder Leaves come from a performance quest chain rather than an overworld search point, which is why gathering them looks different from the other leaves. Fire Emblem: Fortune&apos;s Weave Pepper Leaves and Fire Emblem: Fortune&apos;s Weave Bitter Leaves feed the Captains&apos; and Popular Drink Recipes quests, while Sweet Leaves cover the Simple Drink Recipes quest.
          </p>
          <p>
            Meat works differently from the leaves. Fire Emblem: Fortune&apos;s Weave Giant Meat is the item the sources spell Giants&apos; Meat: it drops from giants fought in Pasithea, it comes out of a Luxury Meat Crate, and three pieces are what the Goliath recruitment asks for, which is why keeping a stock beats cooking it. Fire Emblem: Fortune&apos;s Weave Sandworm Meat comes from the same crate. Fire Emblem: Fortune&apos;s Weave Pure Water is the other request that lands on this page: a dungeon chest item in Cave Behind the Falls as well as a series staple that raises resistance for a single battle.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The four items asked about by name
          </h2>
          <p>
            A handful of items get searched for by name rather than by category, and they behave nothing
            alike. Fire Emblem: Fortune&apos;s Weave Cullet is the only one of the four with a recorded use:
            the sources describe it as a hard crystal shard found across the region&apos;s caves and used in
            forging to sharpen blades, and the Chapter 10 subquest One Last Challenge pays it out as well.
            Fire Emblem: Fortune&apos;s Weave Paradise Fish now has a recorded use: it is the item the Ninae
            recruitment asks for, and the search points around Lake Brontes in the far south are where a
            second source records it coming out of the water, so a player who wants Ninae should search
            those points repeatedly rather than once. Fire Emblem: Fortune&apos;s Weave Glirmosa is still
            only listed as an item with no source checked saying what it does, which is why it is carried
            here with its existence recorded and its effect left blank instead of described.
          </p>
          <p>
            Fortune&apos;s Weave Dates sits in between. Dates are not a foraging find but a quest payout: the
            Chapter 8 subquest Huge, Hairy Beast hands them over alongside Cadam, so a player scanning the
            map for them will never turn them up. Until a source describes what these three are for, this
            page keeps them as named rows rather than pretending they are understood.
          </p>
          <p>
            {"The southern search point that produces Paradise Fish is the same one that holds the last statue in the "}
            <Link className="font-medium text-[#8a6d2f] underline decoration-dotted dark:text-[#d3b475]" href="/sidequests/legacy-of-a-legendary-sculptor/">
              Legacy of a Legendary Sculptor
            </Link>
            {" subquest, so the fish and the statue are one trip. Giants&apos; Meat runs the same way in reverse: three pieces are what the Goliath recruitment asks for, and the characters page records the support level and Renown that recruitment needs before the meat matters."}
          </p>
        </section>
        {/* Video intel: W87RipJTy34 */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; verified English captions
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Pepper Leaves, on two recorded routes</h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-200">Bologna</span> &middot;{" "}
              <span className="font-mono">W87RipJTy34</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed videoId="W87RipJTy34" title="Spice Up Your Adventure: The Ultimate Pepper Leaf Guide in Fire Emblem Fortune’s Weave" />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">This captioned guide covers the leaf the table above files under Captains Drink Recipes, and it lands on two search points that match the record here.</p>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><span className="font-semibold text-zinc-200">Corroborated point.</span> The Great Tree of Miugria sits in the south of the map and is reached by travelling to the southern post house and heading south, which matches the Miugria fallback in the table.</li>
              <li><span className="font-semibold text-zinc-200">Corroborated point.</span> Traveler's Garden is reached by carriage and then east past the Port of Pandora, with a northbound road from the falls leading in, which matches the recorded Castalia route.</li>
              <li><span className="font-semibold text-zinc-200">Difficulty.</span> The creator rates Pepper Leaves as easier to find than Wonder Leaves but still not a passive pickup, which is why this page keeps one best point and several fallbacks.</li>
          </ul>
        </section>

      </main>
    </>
  );
}
