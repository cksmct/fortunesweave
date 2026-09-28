import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import materialsData from "@/data/materials.json";
import recipesData from "@/data/drink-recipes.json";

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
            Fire Emblem: Fortune&apos;s Weave Paradise Fish and Fire Emblem: Fortune&apos;s Weave Glirmosa are
            both listed as items, and no source checked says what either one does, which is why they are
            carried here with their existence recorded and their effects left blank instead of described.
          </p>
          <p>
            Fortune&apos;s Weave Dates sits in between. Dates are not a foraging find but a quest payout: the
            Chapter 8 subquest Huge, Hairy Beast hands them over alongside Cadam, so a player scanning the
            map for them will never turn them up. Until a source describes what these three are for, this
            page keeps them as named rows rather than pretending they are understood.
          </p>
        </section>
      </main>
    </>
  );
}
