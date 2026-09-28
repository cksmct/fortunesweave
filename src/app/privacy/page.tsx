import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { getGameConfig } from "@/lib/data";
import { buildBreadcrumbSchema, generateSEOMetadata } from "@/lib/seo";

const config = getGameConfig();

export const metadata: Metadata = generateSEOMetadata({
  title: "Privacy Policy",
  description:
    "What this Fire Emblem: Fortune\u0027s Weave reference stores, what runs in your browser, and how tool progress kept in local storage can be cleared.",
  path: "/privacy/",
});

export default function PrivacyPage() {
  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Privacy Policy", item: "/privacy/" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <PageHeader
        title="Privacy Policy"
        description="This reference is built to work without collecting anything about you. Here is exactly what is stored, where, and how to remove it."
        path="/privacy/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What this site stores
          </h2>
          <p>
            Nothing is stored on a server about you. There are no accounts, no sign-in, no profiles and
            no submissions. The site is a set of static pages, which means the same file is served to
            every visitor and no per-visitor record is created at the application level.
          </p>
          <p>
            The only data kept about your use of the site lives in your own browser, is readable only by
            this site on your device, and never travels anywhere. It exists so that checklists and
            planners remember what you ticked between visits.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Cookies and analytics
          </h2>
          <p>
            No cookies are set by this site. No analytics, advertising or third-party measurement
            scripts are loaded at present, so there is nothing to consent to and nothing to decline.
          </p>
          <p>
            If advertising or measurement is added in the future, this policy will be updated before any
            such script loads, and consent handling will follow the rules that apply in the visitor&apos;s
            region: an explicit choice first where local law requires it, and no interruption where it
            does not. Any consent panel will offer a permanent withdrawal route from the footer rather
            than a one-time prompt.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Local storage</h2>
          <p>
            Tool pages keep their state in browser local storage under site-specific keys. A paralogue
            checklist stores which entries you ticked; planners store the filters you last used. These
            values are plain text on your device. They contain no identifier, no email address and no
            browsing history.
          </p>
          <p>
            Clearing them is done from your browser: site data or local storage settings for this
            domain. Doing so resets tool progress to its default state and has no other effect, because
            nothing else depends on it.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Hosting and server logs
          </h2>
          <p>
            The site is served from static hosting, which necessarily processes the request that fetches
            a page. Standard request metadata such as IP address, user agent and timestamp may be logged
            by the hosting provider for security, abuse prevention and traffic accounting. That
            processing happens at the provider level and is described in the provider&apos;s own privacy
            terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Links and embedded content
          </h2>
          <p>
            Pages link out to sources such as the publisher&apos;s product page and reference wikis.
            Following an outbound link takes you to a site with its own privacy practices, which apply
            from the moment you arrive. If video is embedded here in future, it will be served through
            the platform&apos;s own embed mechanism, and that platform&apos;s policy and cookie
            behaviour will be noted on the page that carries it.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Email correspondence
          </h2>
          <p>
            If you send a correction or a question to{" "}
            <a href={"mailto:" + config.seo.email} className="underline">
              {config.seo.email}
            </a>
            , your address and message are kept so the report can be checked and the row re-dated.
            Correspondence is not added to any mailing list and is not shared. A request to delete past
            correspondence is honoured, although the corrected row stays on the site, since the data
            itself carries no personal information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Changes to this policy
          </h2>
          <p>
            Material changes are dated and noted on the{" "}
            <Link href="/updates/" className="underline">
              patch timeline
            </Link>{" "}
            alongside game changes, so the history of this page is as traceable as the history of the
            data. Questions about anything on this page can be sent to the same inbox.
          </p>
        </section>
      </main>
    </>
  );
}
