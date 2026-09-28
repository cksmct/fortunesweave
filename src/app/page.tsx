import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { getGameConfig } from "@/lib/data";
import {
  buildBreadcrumbSchema,
  generateFAQSchema,
  generateSEOMetadata,
  generateVideoGameSchema,
} from "@/lib/seo";
import updatesData from "@/data/updates.json";

const config = getGameConfig();
const latest = updatesData.updates[0];

/**
 * 首页 FAQ。答案遵循「证据优先」四段式：当前答案 -> 来源与日期 -> 字段级不确定 -> 下一步动作。
 * 严禁出现把发布方能力缺口当版面的句式（audit-trust-copy.mjs 会拦）。
 */
const FAQS = [
  {
    question: "Is this an official Fire Emblem: Fortune\u0027s Weave site?",
    answer:
      "No. fortunesweave.online is an independent fan reference, not affiliated with, endorsed by or sponsored by Nintendo or Intelligent Systems. The official product page is on nintendo.com and is linked from the footer.",
  },
  {
    question: "Which version of the game is this written for?",
    answer:
      "Version 1.0.1, the launch-day update released on September 17, 2026, together with the free collaboration-weapon update that shipped the same day. Patch-level changes are tracked on the updates page.",
  },
  {
    question: "How is data sourced when this game cannot be datamined?",
    answer:
      "Every row lists its sources, an evidence tier and the date it was last checked. Rows that two independent sources agree on carry the Cross-checked tier; single-source rows carry Source-reported. Where guides disagree, both figures are printed with their own dates instead of being averaged.",
  },
  {
    question: "What is the most commonly missed content?",
    answer:
      "Paralogues, quest materials with deadlines, and support ranks. Part I paralogues open inside chapter windows, and several stay closed once that window passes, so they are the first thing the checklists track.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Fire Emblem: Fortune\u0027s Weave Guide & Wiki",
  description:
    "An independent Fire Emblem: Fortune\u0027s Weave companion: character, class, paralogue, gift and material data with a source and a date on every row.",
  path: "/",
});


export default function HomePage() {
  const faqSchema = generateFAQSchema(FAQS);
  const breadcrumbSchema = buildBreadcrumbSchema([{ name: "Home", item: "/" }]);
  const videoGameSchema = generateVideoGameSchema();

  return (
    <>
      <JsonLd data={[videoGameSchema, breadcrumbSchema, faqSchema]} />
      <PageHeader
        eyebrow={"Independent reference - written against v" + config.game.currentVersion}
        title={
          <>
            Fire Emblem: Fortune&apos;s Weave
            <span className="block">Database, Tools and Patch Notes</span>
          </>
        }
        description="Every character, class, paralogue, gift and material published here carries its own sources and check date, so you can see how a figure was established before you act on it."
        path="/"
        actions={
          <>
            <Link
              href="/updates/"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white dark:bg-gray-100 dark:text-gray-900"
            >
              Patch timeline
            </Link>
            <Link
              href="/about/"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100"
            >
              How we verify
            </Link>
          </>
        }
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What Fire Emblem: Fortune&apos;s Weave is
          </h2>
          <p>
            Fire Emblem: Fortune&apos;s Weave is the eighteenth mainline entry in the Fire Emblem
            series. Intelligent Systems developed it and Nintendo published it as a Nintendo Switch 2
            exclusive on September 17, 2026, at $69.99 digitally and $79.99 physically.
          </p>
          <p>
            The campaign splits into four routes, one for each Flame Lord: Cai, Dietrich, Theodora and
            Leda. Each route runs twelve chapters, followed by a shared six-chapter war act and a
            closing act. The systems players plan around include support conversations and romance,
            certification exams that change class, a calendar-driven free-time phase, dungeon
            exploration with its own Clash battle system, and Blaze Arts that spend the user&apos;s
            own HP.
          </p>
          <p>
            Recruitment is more conditional than in most entries in the series: units join on
            route-specific combinations of support level, renown rank and, in some cases, a
            negotiation step. Paralogues, quest materials with deadlines and support ranks are the
            three things players most often lose track of, which is why the databases here are built
            around them.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What this site publishes
          </h2>
          <p>Nine databases cover the parts of the game that are easiest to lose track of:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Characters</strong> - everyone playable, with joining conditions and recommended classes.</li>
            <li><strong>Classes</strong> - every tier, certification requirement and weapon type.</li>
            <li><strong>Materials</strong> - every ingredient, where it appears, which quests consume it and what deadlines apply.</li>
            <li><strong>Gifts</strong> - the full list, with who likes and dislikes each one.</li>
            <li><strong>Supports and romance</strong> - which pairs reach which ranks, and which can end in romance.</li>
            <li><strong>Paralogues</strong> - unlock windows, rewards, and which ones close permanently.</li>
            <li><strong>Free-time activities</strong> - how they work, what they pay out, and the reactions each character prefers.</li>
            <li><strong>Equipment</strong> - weapons, relics and accessories, with how to obtain each one.</li>
            <li><strong>Locations</strong> - towns, fields and dungeons, with what each one contains.</li>
          </ul>
          <p>
            Seven tools sit on top of those databases: an ingredient and recipe solver, a gift finder,
            a paralogue checklist that flags missable windows, a recruitment planner, a class
            certification planner, a support matrix and a reaction finder. They run in the browser and
            keep progress in local storage, so nothing is uploaded anywhere.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How every row is sourced
          </h2>
          <p>
            Every data row carries three things: its sources, an evidence tier and the date it was
            last checked. <strong>Official</strong> means the game&apos;s own store page, a Direct or
            patch notes. <strong>Cross-checked</strong> means two or more independent sources agree on
            the same figure on the same day. <strong>Source-reported</strong> means one source so far.{" "}
            <strong>Community-reported</strong> means a forum or Discord lead that no second source
            backs yet.
          </p>
          <p>
            Where guides disagree, both figures are printed side by side with their own dates. That is
            deliberate: a single averaged number would be wrong in a way no reader could detect.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Current version</h2>
          <p>
            This site is written against version {config.game.currentVersion}. The most recent tracked
            change is <strong>{latest.title}</strong> ({latest.date}) - {latest.headline}. The full
            patch timeline lives on the <Link href="/updates/" className="underline">updates page</Link>,
            and both places read the same data file, so they cannot disagree.
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
      </main>
    </>
  );
}
