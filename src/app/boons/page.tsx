import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import YouTubeEmbed from "@/components/YouTubeEmbed";
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
      "They are the six named blessings whose discount boons are sold at the Shrine of Causality, and each one is also housed in a temple on Temple Row in Dagsion. Smyrnos also names the shrine where Combat Arts are strengthened, and the crown of Smyrnos is the Dagdan name of Macuil\u0027s Diadem. The domains, temple positions and battlefield effects recorded for them come from the tables on the deities page and from the captioned temple guide below, and what is still missing is a myth or a full account for Credna, whose blessing has not been recorded in footage.",
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

        {/* Blessing Priority Video Intel */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Verified Video Intel &middot; Audio Transcript
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                Which Blessing to Take First
              </h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">Joe Hammer Gaming</span> &middot;
              Verified English Captions &middot; <span className="font-mono">ZBVPkKVdFFY</span>
            </div>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="ZBVPkKVdFFY"
              title="Which Blessing First - Fire Emblem Fortunes Weave Tips And Tricks"
            />
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            This is the page that has to separate two systems that share a name, and a captioned blessing
            walkthrough is the clearest record of the second one. Boons of Salvation are the permanent Karma
            Shard purchases tabled above. Blessings are the in-battle effects, unlocked by serving at a temple
            and spent from a different resource, and the video below is about picking between them. As with
            every video-sourced section on the site, the creator&apos;s rankings are his judgement, and the
            values he quotes are left out because captions are not reliable for numbers.
          </p>

          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                01 &middot; Do Not Conflate
              </span>
              <h3 className="text-sm font-semibold text-white">Shards unlock, sand spends</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Karma Shards buy the permanent boons. Blessings are unlocked by providing service at the
                relevant god&apos;s temple and then paid for in battle from a separate, limited resource, so a
                player holding a large shard balance can still be unable to fire a blessing mid-map. That
                split is why the two halves of this page are worth reading as separate budgets rather than one
                upgrade list.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                02 &middot; Weekly Habit
              </span>
              <h3 className="text-sm font-semibold text-white">Temple service scales with Renown</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Providing service is a weekly action rather than a one-off purchase, and the contribution each
                service makes grows with your account-wide Renown level, so the same week of work fills a
                blessing faster on a high-Renown save. The creator&apos;s own takeaway is that he skipped
                services early and lost that time permanently, which makes the temple stop part of the weekly
                circuit rather than an optional detour.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                03 &middot; His Ranking
              </span>
              <h3 className="text-sm font-semibold text-white">Kalla first, by a wide margin</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Asked which blessing is worth unlocking first, the creator answers Kalla&apos;s without
                hesitation and calls it the strongest effect in the game: an avoidance blessing that turns a
                turn the army should have lost into one it walks through, and which he reaches for whenever he
                is under-levelled for an encounter. Fortuna&apos;s rewind he treats as effectively locked in
                rather than chosen.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                04 &middot; The Rest
              </span>
              <h3 className="text-sm font-semibold text-white">Situational, not weak</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The remaining blessings are judged by scenario rather than by tier. Magic-focused blessings
                suit two chapters spent training under-levelled mages before a push, damage halving suits a
                deliberately tanky run, and the accuracy blessings suit physical attackers who keep missing.
                What each god actually grants, and where their temple sits, is recorded on the deities page;
                this page keeps the decision rather than the layout.
              </p>
            </div>
          </div>
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
