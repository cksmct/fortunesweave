import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { getGameConfig } from "@/lib/data";
import { buildBreadcrumbSchema, generateSEOMetadata } from "@/lib/seo";

const config = getGameConfig();

export const metadata: Metadata = generateSEOMetadata({
  title: "Terms of Use",
  description:
    "The terms covering use of this independent Fire Emblem: Fortune\u0027s Weave reference, including unofficial status, permitted use and accuracy limits.",
  path: "/terms/",
});

export default function TermsPage() {
  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Terms of Use", item: "/terms/" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <PageHeader
        title="Terms of Use"
        description="Plain terms for a plain reference site: what this project is, what you may do with it, and how to read data that is measured by players rather than read from game files."
        path="/terms/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Unofficial status
          </h2>
          <p>
            {config.seo.siteName} is an independent fan-made reference for Fire Emblem: Fortune&apos;s
            Weave. It has no connection to Nintendo or Intelligent Systems, and nothing on this site is
            approved, reviewed or endorsed by either company. Statements on this site are the site&apos;s
            own, made on the basis of the sources each row cites.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Intellectual property
          </h2>
          <p>
            Game names, character names, artwork and related marks belong to their respective owners.
            This site uses names and short factual descriptions to identify game content, and draws its
            own diagrams and layout rather than reproducing official artwork or map images. Written
            explanations, tables, tool behaviour and page design on this site are the site&apos;s own
            work.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Permitted use</h2>
          <p>
            You may read, bookmark, print and quote this site for personal use, and cite it as a source
            with a link. Bulk copying of a database, republishing pages as your own reference, or
            feeding the collected data into another site or application is not permitted without
            written permission. Short quotations with attribution are welcome.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Accuracy and how to read the data
          </h2>
          <p>
            Values on this site are established by observation and cross-checking, because the game
            cannot be datamined. Each row carries its sources, an evidence tier and a check date, and
            rows in conflict are printed with both figures. No warranty is given that any figure matches
            the copy of the game you are playing, particularly after a patch, and figures labelled
            Source-reported or Community-reported rest on thinner evidence than figures labelled
            Cross-checked.
          </p>
          <p>
            Practically: check the tier and the date before acting on a number, and treat anything
            irreversible in-game as worth confirming yourself first. Corrections are welcome and are the
            fastest route to a row becoming more reliable for everyone.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            External links and third parties
          </h2>
          <p>
            Pages link to outside sources such as the publisher&apos;s product page and reference wikis.
            Those destinations are governed by their own terms and privacy practices. This site is not
            responsible for their content, availability or accuracy.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Limitation of liability
          </h2>
          <p>
            The site is provided as is. To the extent permitted by law, liability arising from use of
            this site or reliance on its data is limited to the amount paid to use it, which is nothing.
            Losses of game progress, in-game currency or time are not covered, which is the practical
            reason the evidence tier and check date are shown on every row rather than hidden behind an
            average.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reporting a problem with these terms
          </h2>
          <p>
            If something on this page conflicts with how the site actually behaves, treat that conflict
            as a defect worth reporting to the same inbox used for data corrections. Describe the page,
            the clause and what happened instead. Reports of this kind are handled first, because a
            terms page that describes a different site than the one being served is worse than no terms
            page at all.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Changes</h2>
          <p>
            These terms may change as the site grows. Material changes are dated and appear on the{" "}
            <Link href="/updates/" className="underline">
              patch timeline
            </Link>
            . Continued use after a change means the updated terms apply. Questions go to{" "}
            <a href={"mailto:" + config.seo.email} className="underline">
              {config.seo.email}
            </a>
            .
          </p>
        </section>
      </main>
    </>
  );
}
