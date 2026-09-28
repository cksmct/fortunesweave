import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import deedsData from "@/data/deeds.json";

const deeds = deedsData.deeds;
const mechanics = deedsData._mechanics as Record<string, string>;
const economy = deedsData._economy as Record<string, string>;
const gaps = deedsData._openGaps;

const total = deeds.reduce((sum, deed) => sum + deed.karmaShards, 0);
const maxShards = Math.max(...deeds.map((d) => d.karmaShards));
const routeDeed = deeds.find((deed) => deed.karmaShards === maxShards);
const bigPayouts = deeds.filter((deed) => deed.karmaShards >= 100);
const categories: string[] = [];
for (const deed of deeds) {
  if (!categories.includes(deed.category)) categories.push(deed.category);
}

const FAQS = [
  {
    question: "What are Notable Deeds in Fortune\u0027s Weave?",
    answer:
      "They are the game\u0027s achievement list, and they pay Karma Shards rather than trophies. Completed deeds are claimed at any Pale Raven\u0027s Perch in Dagsion or at the Shrine of Causality in the Obelisk Chamber.",
  },
  {
    question: "What are Karma Shards actually spent on?",
    answer:
      "Two things. They buy Boons of Salvation, the account-wide upgrades sold at the Shrine of Causality, and from Part III onwards they also feed Merge Causality, which combines multiple Part 1 versions of a unit into one Part 3 unit.",
  },
  {
    question: "Do I need every deed to get every boon?",
    answer:
      "No. The sources state that you do not need to complete all of the deeds in order to unlock all of the boons, so a completionist run is optional. The four Part I route completions alone pay 20,000 of the 20,695 recorded shards, which is most of what the list is worth.",
  },
  {
    question: "Ten hours of play time is a deed?",
    answer:
      "Yes, and several entries are like that: milestones that arrive on their own during a normal playthrough rather than things you chase. They are listed here anyway so that the shard total is honest rather than flattering.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Notable Deeds and Karma Shards",
  description:
    "All 53 recorded Fire Emblem: Fortune\u0027s Weave Notable Deeds with their Karma Shard rewards, where to claim them and what the shards are spent on.",
  path: "/deeds/",
});

export default function DeedsPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Notable Deeds", item: "/deeds/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Notable Deeds and Karma Shards"
        description="The achievement list in full, the shard payout of each entry, and the four route completions that account for almost all of it."
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            An achievement list that pays a currency
          </h2>
          <p>
            {"Notable Deeds are the achievement layer of Fortune\u0027s Weave, and instead of a trophy case they pay Karma Shards. The " +
              deeds.length + " entries recorded here come to " + total.toLocaleString("en-US") +
              " shards, and the four Part I route completions alone account for 20,000 of it, which tells you where the money really is."}
          </p>
          <p>{mechanics.where}</p>
          <p>{mechanics.purpose}</p>
          <p>{mechanics.completeness}</p>
          <p className="text-gray-700 dark:text-gray-300">{mechanics.reminder}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Where the shards are, and where they are not
          </h2>
          <p>
            {"Fourteen of the " + deeds.length +
              " entries pay more than the standard ten shards. They are the ones worth aiming at deliberately: " +
              bigPayouts.map((deed) => deed.requirement + " for " + deed.karmaShards).join("; ") + "."}
          </p>
          <p>
            {"Everything else is a ten-shard grind, and " + (deeds.length - bigPayouts.length) +
              " of the entries pay exactly that. The pattern is deliberate on the design side: the list rewards playing the game broadly rather than executing a checklist, and entries like playing for more than ten hours exist to make that literal."}
          </p>
          <p>
            {"The economy numbers are worth stating plainly. " + economy.oneRoute + " " + economy.allRoutes +
              " " + economy.knownFirstTierCosts + " " + economy.caveat}
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Every recorded deed
          </h2>
          {categories.map((category) => (
            <article key={category} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {category}
                <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                  {deeds.filter((deed) => deed.category === category).length} entries
                </span>
              </h3>
              <table className="mt-3 w-full border-collapse text-sm">
                <tbody>
                  {deeds
                    .filter((deed) => deed.category === category)
                    .map((deed) => (
                      <tr key={deed.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{deed.order}</td>
                        <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{deed.requirement}</td>
                        <td className="py-2 text-right font-medium text-gray-900 dark:text-gray-100">
                          {deed.karmaShards}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </article>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Why this list is a floor, not the full set
          </h2>
          <p>
            Every entry here is marked unverified by the source that compiled it, one of the two lists behind
            it describes itself as work in progress, and the other states outright that it does not publish
            every deed. No source states how many Notable Deeds the game contains, so the honest number is
            &quot;at least {deeds.length}&quot;.
          </p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            {gaps.map((gap: string) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
          <p className="text-gray-700 dark:text-gray-300">
            {routeDeed
              ? `The four route-completion entries are the exception to all of that uncertainty: they are worth ${routeDeed.karmaShards.toLocaleString()} shards each, they are immune to whether the list is complete, and they are the reason a second playthrough is the fastest way to fund the boons you actually want.`
              : ""}
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
            What the shards buy is on the boons page, and where the shards go after the story ends is on the
            post-game page.
          </p>
        </section>
      </main>
    </>
  );
}
