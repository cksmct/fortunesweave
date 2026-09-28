import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { getGameConfig } from "@/lib/data";
import { buildBreadcrumbSchema, generateSEOMetadata } from "@/lib/seo";

const config = getGameConfig();

export const metadata: Metadata = generateSEOMetadata({
  title: "About and How We Verify",
  description:
    "Who runs this Fire Emblem: Fortune\u0027s Weave reference, the source tiers every data row carries, and how to send a correction with evidence.",
  path: "/about/",
});

const SOURCE_TIERS = [
  {
    tier: "Official",
    meaning: "The game\u0027s own product page, Nintendo presentations and patch notes.",
  },
  {
    tier: "Cross-checked",
    meaning:
      "Two or more independent sources agree on the same figure on the same day. This is the strongest tier a non-official figure can reach.",
  },
  {
    tier: "Source-reported",
    meaning:
      "One source, dated. Common in the weeks after a release, and labelled so you can weigh it accordingly.",
  },
  {
    tier: "Community-reported",
    meaning:
      "A forum or Discord lead with no second source yet. Treated as a lead to chase, never as a published figure.",
  },
];

export default function AboutPage() {
  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "About", item: "/about/" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <PageHeader
        title="About and How We Verify"
        description="Who maintains this reference, the evidence tier every row carries, the sources it draws on, and how to send a correction that will actually be acted on."
        path="/about/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">What this site is</h2>
          <p>
            {config.seo.siteName} is an independent reference for Fire Emblem: Fortune&apos;s Weave, the
            Nintendo Switch 2 entry released on September 17, 2026. It covers characters, classes,
            materials, gifts, supports, paralogues, activities, equipment and locations, plus the tools
            that make those lists usable while you are playing.
          </p>
          <p>
            The site is built around one constraint. This game cannot be datamined, so no value on it can
            be read out of the game files. Everything published here is established by observation,
            capture comparison and cross-checking independent reports. That makes provenance the whole
            product: a number without a source behind it is worth less than no number at all.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Who maintains this site
          </h2>
          <p>
            The site is maintained by {config.author.maintainer} under the {config.author.name} imprint.
            It is run as a reference project rather than a media outlet: there is no advertising at
            present, no sponsored content, and no affiliate placement inside database rows. Editorial
            decisions are limited to source tiering, conflict disclosure and check dates.
          </p>
          <p>
            It is an unofficial fan project. It is not affiliated with, endorsed by or sponsored by
            Nintendo or Intelligent Systems, and the trademarks and copyrights in the game remain with
            their owners. The official product page is linked from the footer for anyone who wants the
            publisher&apos;s own description.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How information is verified
          </h2>
          <p>
            Every data row carries its sources, one of four evidence tiers, and the date it was last
            checked. The tiers mean specific things:
          </p>
          <dl className="space-y-4">
            {SOURCE_TIERS.map((item) => (
              <div key={item.tier}>
                <dt className="font-semibold text-gray-900 dark:text-gray-100">{item.tier}</dt>
                <dd className="mt-1 text-gray-700 dark:text-gray-300">{item.meaning}</dd>
              </div>
            ))}
          </dl>
          <p>
            When sources conflict, both figures are printed with their own dates rather than averaged or
            silently resolved. Two guides disagreeing about a quest deadline is information; a single
            confident number invented to hide that disagreement is not. Rows also carry the date they
            were last checked, which is deliberately allowed to differ from the page date: a patch can
            invalidate one row without touching the rest of the page.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Where the information comes from
          </h2>
          <p>
            Four families of source feed the databases. Official material covers the Nintendo product
            page, presentations and patch notes. Community reference wikis supply structured lists that
            can be checked against each other. Established games media supply walkthrough-level detail
            and location reporting. Video coverage, including captioned guide and playthrough footage,
            supplies the finest-grained mechanical detail, since it is the closest thing to watching the
            game being played.
          </p>
          <p>
            Community posts are treated as leads only. A claim that appears solely on a forum or a chat
            server is recorded as Community-reported, then chased against a second source before it can
            be presented as established.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Corrections</h2>
          <p>
            Send corrections to{" "}
            <a href={"mailto:" + config.seo.email} className="underline">
              {config.seo.email}
            </a>
            . A correction that gets acted on fastest includes the page, the row, what it should say,
            and where the new figure can be checked. Screenshots or a clip are the strongest evidence,
            because they let the row move straight to Cross-checked instead of waiting on a second
            write-up.
          </p>
          <p>
            Accepted corrections are reflected in the row check date, and material conflicts are
            recorded rather than quietly overwritten. The{" "}
            <Link href="/updates/" className="underline">
              patch timeline
            </Link>{" "}
            records which patches triggered a re-check.
          </p>
        </section>
      </main>
    </>
  );
}
