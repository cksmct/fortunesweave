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
    "What this reference stores, which analytics and advertising cookies run in your browser, and how to withdraw consent or clear local storage.",
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
            Cookies, analytics and advertising
          </h2>
          <p>
            Two third-party services run in your browser on this site. Both are described below in
            full, and both are subject to your choice wherever the law requires one.
          </p>

          <h3 className="pt-2 text-lg font-bold text-gray-900 dark:text-gray-100">
            Google Analytics 4 (measurement)
          </h3>
          <p>
            This site uses Google Analytics 4, measurement ID G-5B4JGFSND2, to count visits and to see
            which pages are actually useful. The tag is deliberately slow to start: it is loaded only
            after your first interaction (scroll, click, key press or touch) or after 20 seconds,
            whichever comes first, so it never competes with the page you asked for. Google Analytics
            sets first-party cookies such as <code>_ga</code> and <code>_ga_5B4JGFSND2</code> that
            distinguish one browser from another, and it processes the IP address and user agent that
            any web request carries. That processing happens under Google&apos;s own terms; this site
            cannot read those cookies and does not combine them with anything else.
          </p>

          <h3 className="pt-2 text-lg font-bold text-gray-900 dark:text-gray-100">
            Advertising (third-party ad partners)
          </h3>
          <p>
            This site is free to read because it carries advertising supplied by third-party ad
            networks, currently Adsterra, and the domain is additionally declared to Google AdSense in
            our <code>ads.txt</code> file. Those partners may set or read cookies, web beacons and
            device identifiers — including IP address and user agent — and may use them to select,
            frequency-cap and measure advertising. Ad units on this site are labelled as advertising
            and their space is reserved in advance, so content does not jump when they load.
          </p>
          <p>
            Nothing you type is passed to an advertiser. Correction emails and contact messages go only
            to the address below, and checklist or planner state stays in your own browser&apos;s local
            storage.
          </p>

          <h3 className="pt-2 text-lg font-bold text-gray-900 dark:text-gray-100">
            Your choice, before anything is set
          </h3>
          <p>
            Google Consent Mode v2 defaults are set before any analytics or advertising tag can run.
            Where prior consent is required — the European Economic Area, the United Kingdom and
            Switzerland, detected from your time zone — analytics and advertising storage start{' '}
            <em>denied</em>, and a panel asks you to accept or reject before either service is allowed
            to store anything. Elsewhere storage starts granted and no panel is shown, because those
            regions do not require a prompt for this kind of processing.
          </p>
          <p>
            Rejecting keeps analytics and advertising cookies switched off and also deletes any that
            were already written on this domain.
          </p>

          <h3 className="pt-2 text-lg font-bold text-gray-900 dark:text-gray-100">
            Changing your mind, and opting out
          </h3>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Cookie Settings</strong> in the footer reopens your choice at any time, in every
              region, without reloading the page.
            </li>
            <li>
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Google Ads Settings
              </a>{' '}
              controls personalised advertising across Google services.
            </li>
            <li>
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                aboutads.info
              </a>{' '}
              and{' '}
              <a
                href="https://www.youronlinechoices.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                youronlinechoices.com
              </a>{' '}
              list industry-wide opt-outs for participating advertisers.
            </li>
            <li>
              Your browser settings can block or delete cookies for this domain; the reference still
              works with them blocked.
            </li>
          </ul>
          <p>
            The site is run by an independent publisher reachable at{' '}
            <a href={'mailto:' + config.seo.email} className="underline">
              {config.seo.email}
            </a>
            , which is also where requests about this policy — including access to, or deletion of,
            the correspondence described below — should be sent.
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
            from the moment you arrive.
          </p>
          <p>
            Many pages carry YouTube embeds — the trailer on the homepage and the press videos on the
            review page among them. They are click-to-load: nothing is requested from YouTube until
            you press play, and the player itself is served from YouTube&apos;s no-cookie domain. When
            you do press play, YouTube serves the video under its own policy and may set its own
            cookies. If you would rather not be connected to YouTube at all, simply do not press play;
            the surrounding text on those pages stands on its own.
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
