import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { getGameConfig } from "@/lib/data";
import { buildBreadcrumbSchema, generateSEOMetadata } from "@/lib/seo";

const config = getGameConfig();

export const metadata: Metadata = generateSEOMetadata({
  title: "Contact",
  description:
    "How to reach the editors of this Fire Emblem: Fortune\u0027s Weave reference, what makes a correction get acted on fastest, and where game support requests belong.",
  path: "/contact/",
});

const CHECKLIST = [
  "The page and the exact row you are writing about.",
  "What the row should say instead.",
  "Where the new figure can be checked: a link, a screenshot or a short clip.",
  "The version you are playing, since a patch can move a value.",
];

export default function ContactPage() {
  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Contact", item: "/contact/" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <PageHeader
        title="Contact"
        description="Corrections, missing rows, conflicting sources and source tips all go to one inbox. Here is what makes a report quick to act on."
        path="/contact/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How to reach this site
          </h2>
          <p>
            Write to{" "}
            <a href={"mailto:" + config.seo.email} className="underline">
              {config.seo.email}
            </a>
            . Everything that arrives is read by {config.author.maintainer}, who maintains the site.
            There is no contact form, no account system and no newsletter; the inbox is the whole
            contact surface, which keeps the site free of the tracking that forms usually require.
          </p>
          <p>
            Corrections are the most valuable thing you can send. This site publishes figures that no one
            can read out of the game files, which means a player who has just measured something in-game
            is genuinely a better source than a second article repeating an older article.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What is worth sending
          </h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>A wrong figure.</strong> A material in the wrong region, a paralogue window that
              closed earlier than stated, a recruit condition that needs a different renown rank.
            </li>
            <li>
              <strong>A missing row.</strong> A gift, a class, a support pair or a dungeon reward that
              should be in a database and is not.
            </li>
            <li>
              <strong>A conflict.</strong> Two guides disagreeing, or a guide disagreeing with what is
              on the site. Conflicting reports get published side by side, so reporting one adds
              information rather than causing an argument.
            </li>
            <li>
              <strong>A source tip.</strong> A guide, a video with captions or a reference page that
              covers a gap. Captioned video is especially useful, because it can be transcribed and
              quoted.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What to include
          </h2>
          <ul className="list-disc space-y-2 pl-6">
            {CHECKLIST.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            If you can, state the version in your report. A value measured before the launch-day patch
            and a value measured after it can both be correct and still disagree, and knowing which
            build a figure came from is what turns a disagreement into a dated pair of rows.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What happens next
          </h2>
          <p>
            A report with evidence is checked against the existing sources for that row. If it holds up,
            the row is updated and its check date moves; if it conflicts with another source, both
            versions are published with their dates. You will not receive an automated confirmation,
            since the site has no account system to send one from, but the row itself is the receipt:
            the check date changes when the row changes.
          </p>
          <p>
            Larger findings are written up on the{" "}
            <Link href="/updates/" className="underline">
              patch timeline
            </Link>{" "}
            when they come from a patch, and in the affected database when they do not.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Where game support requests belong
          </h2>
          <p>
            Account issues, purchase problems, refunds and in-game bugs go to Nintendo support, which
            can actually act on them. This site publishes reference data for the game and has no access
            to any player account. For anything about the data on this site, the inbox above is the
            right place.
          </p>
        </section>
      </main>
    </>
  );
}
