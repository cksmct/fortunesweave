import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import NativeBannerAd from "@/components/NativeBannerAd";
import { JsonLd } from "@/components/JsonLd";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import {
  buildBreadcrumbSchema,
  generateFAQSchema,
  generateSEOMetadata,
} from "@/lib/seo";

const FAQS = [
  {
    question: "Is the Fire Emblem: Fortune's Weave Expansion Pass out?",
    answer:
      "Yes. Nintendo released the Fire Emblem: Fortune's Weave Expansion Pass on October 15, 2026, together with an announcement trailer. This site verified the release through Nintendo's official channels rather than relying on leaks or speculation.",
  },
  {
    question: "Is the Expansion Pass free?",
    answer:
      "No. It is paid add-on content. The base game's eShop listing references in-game purchases, which is the standard signal that the Expansion Pass is sold separately from the main game.",
  },
  {
    question:       "What does the Expansion Pass actually add?",
    answer:
      "Per Nintendo's announcement trailer, the pass releases in three waves; Wave 1 (available now, October 15, 2026) adds prototype weapons based on the hero relics from Fire Emblem: Three Houses (one per main hero) and new appearance-changing outfits, plus the Dagda deities as new units and story following the four rivals in the Heroic Games. Later waves add more units and story. Full, current details are on Nintendo's official store page.",
  },
  {
    question: "Where do I buy the Expansion Pass?",
    answer:
      "Through the official Nintendo eShop listing for Fire Emblem: Fortune's Weave. Buy it only from Nintendo's official store to avoid third-party key resellers.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Expansion Pass",
  description:
    "Fire Emblem: Fortune's Weave Expansion Pass: three waves from Oct 15, 2026. Wave 1 weapons & outfits; Dagda units & story to come.",
  path: "/expansion-pass/",
});

export default function ExpansionPassPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Expansion Pass", item: "/expansion-pass/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Fire Emblem: Fortune's Weave — Expansion Pass"
        description="The game's first post-launch add-on, released October 15, 2026. Verified facts and official sources below."
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What the Expansion Pass is
          </h2>
          <p>
            The <strong>Fire Emblem: Fortune&apos;s Weave Expansion Pass</strong>{" "}
            is the first post-launch
            add-on content for the game. Nintendo announced and released it on{" "}
            <strong>October 15, 2026</strong>, accompanied by an official
            announcement trailer. For a title that launched September 17, 2026,
            this is the earliest major paid extension of the experience.
          </p>
          <p>
            This page exists because the Expansion Pass became the single
            highest-rising search term for the game in mid-October 2026. Where
            this site previously recorded no announced add-on content, that
            changed on release day — so the old &quot;no DLC announced&quot;
            note on the post-game page has been corrected to point here.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Release and verification
          </h2>
          <p>
            The release was confirmed through Nintendo&apos;s official channels.
            We cite the official announcement rather than community leaks: the
            Expansion Pass went on sale October 15, 2026, and a new trailer was
            published the same day. Our policy is to summarize only what is
            verifiable and to link to Nintendo for anything still in flux.
          </p>
          <ul className="list-disc space-y-2 pl-6 text-gray-700 dark:text-gray-300">
            <li>
              <span className="font-medium">Official name:</span> Fire Emblem:
              Fortune&apos;s Weave Expansion Pass.
            </li>
            <li>
              <span className="font-medium">Release date:</span> October 15,
              2026.
            </li>
            <li>
              <span className="font-medium">Type:</span> Paid add-on content
              (the base game&apos;s eShop listing references in-game purchases).
            </li>
            <li>
              <span className="font-medium">Where to buy:</span> the official
              Nintendo eShop listing for the game.
            </li>
          </ul>
        </section>

        {/* Official announcement trailer */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Official trailer &middot; Nintendo of America
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                Expansion Pass — Announcement Trailer
              </h2>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="9tDRjYdGrGs"
              title="Fire Emblem: Fortune's Weave Expansion Pass – Announcement Trailer | Nintendo Switch 2"
            />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            The official announcement trailer published by Nintendo of America on
            release day. This is the primary, verified source for the
            Expansion Pass; everything else on this page defers to it.
          </p>
        </section>

        {/* Confirmed contents — taken verbatim from Nintendo's official announcement trailer */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What the Expansion Pass includes (confirmed)
          </h2>
          <p>
            Nintendo laid out the pass&apos;s shape in the announcement trailer. It
            ships in <strong>three waves</strong>, and <strong>Wave 1 is
            available now</strong> (launched October 15, 2026). Confirmed contents
            so far:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-gray-700 dark:text-gray-300">
            <li>
              <span className="font-medium">
                Wave 1 — new weapons &amp; outfits:
              </span>{" "}
              prototype weapons modeled after the hero relics from{" "}
              <em>Fire Emblem: Three Houses</em> — one weapon for each of the
              four main heroes — plus a new appearance-changing outfit for each
              hero (allies can wear the new attire too).
            </li>
            <li>
              <span className="font-medium">New units:</span> the gods who once
              ruled Dagda join the army (see our{" "}
              <a
                href="/deities/"
                className="text-[#d3b475] hover:underline"
              >
                Deities of Dagda
              </a>{" "}
              coverage).
            </li>
            <li>
              <span className="font-medium">New story:</span> additional content
              following the four rivals contending for victory in the Heroic Games.
            </li>
            <li>
              <span className="font-medium">Availability:</span> sold on the
              Nintendo eShop as paid DLC.
            </li>
          </ul>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            These points are taken directly from Nintendo&apos;s official
            announcement trailer, not from community speculation. Later waves add
            more — see below for what is still to come.
          </p>
        </section>

        {/* Community analysis — embed-only, claims not restated as fact */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Community breakdown &middot; creator analysis
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                What the trailer hints at
              </h2>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="DFAdYm51dMc"
              title="Analysis & Theories for the Fortune's Weave Expansion Pass Trailer!"
            />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Nagapedia&apos;s breakdown of the announcement trailer. This is the
            creator&apos;s interpretation and speculation, not official
            information — included so you can follow the community discussion,
            not as confirmation of specific contents.
          </p>
        </section>

        {/* Community breakdown — transcribed from English subtitles; creator analysis, not official */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Community breakdown &middot; transcribed analysis
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                Lucky Crit&apos;s wave-by-wave read
              </h2>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="m2pyQkxonyU"
              title="The Fortune's Weave DLC Pass is HERE! Analysis & Trailer Breakdown"
            />
          </div>
          <div className="space-y-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            <p className="text-zinc-600 dark:text-zinc-400">
              The following is a summary of Lucky Crit&apos;s breakdown of the
              announcement trailer.{" "}
              <strong>
                It is the creator&apos;s analysis and interpretation, not official
                Nintendo information
              </strong>{" "}
              — included to help you follow the community discussion.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                He frames the pass as a large post-launch addition (his own
                estimate: on the order of another ~100 hours of content).
              </li>
              <li>
                He notes the US price is around <strong>$35</strong> (his figure;
                higher than the Three Houses DLC, which he attributes to
                inflation). Treat this as a creator claim, not a confirmed
                Nintendo price.
              </li>
              <li>
                His read of the waves: Wave 1 (out now) is weapons + outfits; he
                expects Wave 2 around the holiday season (roughly a month later)
                to bring the first story content and the Dagda deities as
                playable units; Wave 3 to add story for the four sub-lords.
              </li>
              <li>
                He highlights the relic-prototype weapons as E-rank, forgeable,
                and usable by anyone in your army, with some (e.g., a
                Failnaught-prototype bow) gaining extended range later in the
                game.
              </li>
            </ul>
          </div>
        </section>

        <NativeBannerAd />

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What is still to come
          </h2>
          <p>
            Nintendo confirmed the pass releases in three waves, and Wave 1
            (additional weapons and outfits) is available now. Waves 2 and 3 are
            still ahead: per the announcement, later waves add the Dagda deities
            as playable units and story content for the four rivals and the
            sub-lords. The exact release dates and full contents of those later
            waves are published by Nintendo on the official store page; this page
            is updated as each wave lands.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Frequently asked questions
          </h2>
          <dl className="space-y-5">
            {FAQS.map((item) => (
              <div key={item.question}>
                <dt className="font-semibold text-gray-900 dark:text-gray-100">
                  {item.question}
                </dt>
                <dd className="mt-1 text-gray-700 dark:text-gray-300">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            How we verify this page
          </h2>
          <p>
            This is an independent, community-run fan resource and is not
            affiliated with Nintendo or Intelligent Systems. Every claim above
            is tied to Nintendo&apos;s official announcement; anything not yet
            confirmed by Nintendo is explicitly marked as to-be-confirmed rather
            than guessed. If official details change, the verified facts here
            are updated to match.
          </p>
        </section>
      </main>
    </>
  );
}
