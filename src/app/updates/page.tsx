import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import NativeBannerAd from "@/components/NativeBannerAd";
import { JsonLd } from "@/components/JsonLd";
import { getGameConfig } from "@/lib/data";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import updatesData from "@/data/updates.json";

const config = getGameConfig();
const updates = updatesData.updates;

const FAQS = [
  {
    question: "How quickly do patch notes appear here?",
    answer:
      "Each entry is added once the patch is live and at least one independent source documents it, normally within a day. The entry then carries the date it was checked, and any figure that only one source reports is labelled Source-reported until a second source confirms it.",
  },
  {
    question: "Do balance changes invalidate the databases?",
    answer:
      "They can. When a patch changes a class, a weapon or a recruit condition, the affected rows are re-checked and re-dated rather than left in place. Rows that two sources disagree about after a patch are printed with both figures and both dates.",
  },
  {
    question: "Where do patch notes come from?",
    answer:
      "The in-game update notification, the official product page and Nintendo-published patch summaries first, then launch-week coverage from established outlets. The source list for each entry is kept alongside it.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Fortune\u0027s Weave Patch Notes",
  description:
    "Every tracked Fire Emblem: Fortune\u0027s Weave patch and free update, with what changed, which guides it affects, and the date each entry was checked.",
  path: "/updates/",
});


export default function UpdatesPage() {
  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Updates", item: "/updates/" },
  ]);

  return (
    <>
      <JsonLd data={[breadcrumb, generateFAQSchema(FAQS)]} />
      <PageHeader
        title="Fortune&apos;s Weave Patch Notes"
        description="Every tracked patch and free update for the game, with what changed, which data rows it affects, and the date each entry was last checked."
        path="/updates/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How patch tracking works here
          </h2>
          <p>
            Fire Emblem: Fortune&apos;s Weave patches in two shapes: numbered fixes such as{" "}
            {config.game.currentVersion}, and free content updates that add weapons or adjust what
            already exists. Both are tracked on this page, because both can move a number that another
            page on this site depends on.
          </p>
          <p>
            Each entry states the version, the date it went live, what it changed, and which parts of
            the site were re-checked as a result. When a patch moves a recruit condition, a class
            certification or a quest deadline, the affected rows are re-dated instead of being left to
            age quietly. That is why a row can carry a newer check date than the page it sits on: the
            row was re-verified after the patch and the page around it did not need to move.
          </p>
        </section>

        {/* 黄金次屏 Adsterra 原生信息流广告位 */}
        <NativeBannerAd />

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Patch timeline</h2>
          <ol className="space-y-8">
            {updates.map((item) => (
              <li
                key={item.slug}
                className="rounded-xl border border-gray-200 p-6 dark:border-gray-800"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {item.title}
                  </h3>
                  <time
                    className="text-sm text-gray-500 dark:text-gray-400"
                    dateTime={item.isoDate}
                  >
                    {item.date}
                  </time>
                </div>
                <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                  {item.headline}
                </p>
                <p className="mt-3 text-gray-700 dark:text-gray-300">{item.description}</p>
                <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                  {item.features.map((feature) => (
                    <li
                      key={feature.label}
                      className="rounded-lg bg-gray-50 px-3 py-2 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    >
                      <span className="block font-semibold text-gray-900 dark:text-gray-100">
                        {feature.label}
                      </span>
                      {feature.text}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Version baseline: {config.game.currentVersion}. Platform: {config.game.platforms.join(", ")}.
            Release date: {config.game.releaseDate}. The same data file feeds the latest-update block
            on the{" "}
            <Link href="/" className="underline">
              home page
            </Link>
            , so the two can never show different news.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What usually changes in a patch
          </h2>
          <p>
            Balance patches for this series tend to touch weapon might and hit values, class growth
            modifiers, skill costs and enemy composition in specific chapters. Content updates tend to
            add weapons, items or cosmetic options rather than whole new chapters. Because this game
            cannot be datamined, none of those values can be read out of the game files: they are
            established by playing, by comparing before-and-after captures, and by cross-checking
            several independent reports made on the same day.
          </p>
          <p>
            That has a practical consequence for anyone reading this page. A value whose check date
            predates the newest patch is a value nobody has re-measured yet, rather than a value that
            failed a test. Where a patch is known to have moved something and the new figure is still
            single-source, the row says so on its face.
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
