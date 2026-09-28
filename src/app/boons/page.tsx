import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import boonsData from "@/data/boons.json";

const boons = boonsData.boons;
const blessings = boonsData.blessings;
const mechanics = boonsData._mechanics as Record<string, string>;
const gaps = boonsData._openGaps;

const priced = boons.filter((boon) => boon.firstTierPrice !== null);
const knownFirstTierTotal = priced.reduce((sum, boon) => sum + (boon.firstTierPrice || 0), 0);
const categories: string[] = [];
for (const boon of boons) {
  if (!categories.includes(boon.category)) categories.push(boon.category);
}

const FAQS = [
  {
    question: "What are Boons of Salvation?",
    answer:
      "They are permanent, account-wide upgrades bought with Karma Shards at the Shrine of Causality. They apply across all four Part I routes, which makes them a long-term account investment rather than a route upgrade, and each one can be toggled on and off once unlocked.",
  },
  {
    question: "How do I get Karma Shards?",
    answer:
      "By completing Notable Deeds. The four Part I route completions alone pay 20,000 of the 20,695 recorded shards, so finishing a second route is the fastest way to fund the boons you want.",
  },
  {
    question: "Do the tiers need route completions?",
    answer:
      "That is what the source records, with stars marking how many Part I routes have to be finished for each tier, but the page it publishes them on states those requirements are its own estimates rather than confirmed figures. Treat them as a reasonable expectation rather than a guarantee.",
  },
  {
    question: "Who are Aurora, Mars, Smyrnos, Jurah, Kalla and Credna?",
    answer:
      "They are the six named blessings whose discount boons are sold at the Shrine of Causality, and they are the only divine names the record carries. Smyrnos also names the shrine where Combat Arts are strengthened, and the crown of Smyrnos is the Dagdan name of Macuil\u0027s Diadem. No source publishes a pantheon, a domain list or a myth for any of the six.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Boons of Salvation and Blessings",
  description:
    "All 31 Fortune\u0027s Weave Boons of Salvation with their tiers and known Karma Shard prices, plus the six named blessings sold at the Shrine of Causality.",
  path: "/boons/",
});

export default function BoonsPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Boons", item: "/boons/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Boons of Salvation and Blessings"
        description="What the Karma Shards buy: every recorded boon, what the tiers are worth, and the six named blessings sold at the Shrine of Causality."
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What Karma Shards are for
          </h2>
          <p>{mechanics.what}</p>
          <p>{mechanics.scope}</p>
          <p>
            {"There are " + boons.length + " recorded boons across " + categories.length +
              " groups, and the shape of the list says a lot about the intended second playthrough: experience boosts and shop discounts, not combat power. Nothing here raises a stat in battle directly, which makes the boons a comfort layer for a replay rather than a difficulty answer."}
          </p>
          <p>{mechanics.toggling}</p>
          <p className="text-gray-700 dark:text-gray-300">{mechanics.unlocks}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What the prices do and do not tell you
          </h2>
          <p>
            {"Prices are published for " + priced.length + " of the " + boons.length +
              " boons, and only for their first tier. Those known first tiers add up to about " +
              knownFirstTierTotal.toLocaleString("en-US") +
              " shards, which fits comfortably inside the 5,695 a single completed route pays out in recorded deeds."}
          </p>
          <p>
            {"The remaining " + (boons.length - priced.length) +
              " boons have no published price at all, and no second or third tier anywhere has one, so a full unlock total cannot be calculated from any source. Anyone quoting an exact figure for all of them is guessing."}
          </p>
          <p>
            {"The practical consequence of that gap is ordering rather than arithmetic. " + mechanics.shardUse +
              " " + mechanics.refunds}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The six blessings and their gods
          </h2>
          <p>
            {"Six of the boons are discounts on a named blessing rather than on a shop. These are the only divine names the record carries: " +
              blessings.map((entry) => entry.name.replace("\u0027s Blessing", "")).join(", ") +
              ". The full pantheon of twelve gods is recorded on the deities page; what no source adds for any of these six is a myth, a story or a relationship, so they are listed here by name with what is actually recorded and nothing more."}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {blessings.map((entry) => (
              <article key={entry.id} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{entry.name}</h3>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{entry.note}</p>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  {"Discount boon tiers: " + entry.discountTiers.join(", ")}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Every recorded boon
          </h2>
          {categories.map((category) => (
            <article key={category} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {category}
                <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                  {boons.filter((boon) => boon.category === category).length} boons
                </span>
              </h3>
              <table className="mt-3 w-full border-collapse text-sm">
                <tbody>
                  {boons
                    .filter((boon) => boon.category === category)
                    .map((boon) => (
                      <tr key={boon.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                          {boon.name}
                        </td>
                        <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                          {boon.tiers.join(" / ")}
                        </td>
                        <td className="py-2 text-right text-gray-700 dark:text-gray-300">
                          {boon.firstTierPrice === null
                            ? "No price published"
                            : boon.firstTierPrice + " shards"}
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
            What the record does not cover
          </h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            {gaps.map((gap: string) => (
              <li key={gap}>{gap}</li>
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
            Shards come from Notable Deeds, which are listed in full on the deeds page, and what happens to
            them once the story ends is on the post-game page.
          </p>
        </section>
      </main>
    </>
  );
}
