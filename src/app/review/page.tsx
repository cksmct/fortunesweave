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
    question: "Is Fire Emblem: Fortune's Weave worth buying?",
    answer:
      "The major outlets gathered on this page lean positive: GameSpot frames the entry as a new high-water mark for the series, and several Switch 2-focused outlets call it a must-have exclusive. Worth, though, is subjective, so the videos below are collected as third-party criticism rather than a single score from this site.",
  },
  {
    question: "How does it compare to Three Houses and Engage?",
    answer:
      "GameSpot's review explicitly reads Fortune's Weave as Intelligent Systems carrying forward what worked in Three Houses and correcting what did not in Engage, then folding in lessons from the series' stranger experiments. IGN and SwitchUp both situate the game inside that longer series lineage rather than treating it in isolation.",
  },
  {
    question: "Is it a good Nintendo Switch 2 game or system-seller?",
    answer:
      "Inside Games and several other outlets position the game as another must-have Switch 2 exclusive and ask whether it is the title that finally pulls newcomers into Fire Emblem. It is an anime-heavy tactical RPG built for the new hardware.",
  },
  {
    question: "Do the review videos contain story spoilers?",
    answer:
      "These are mostly structure and impression pieces: combat, scope, and how the game sits in the series. They generally avoid late-game plot spoilers, but a few touch on the opening premise, so treat them as safe to watch before you start a route.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Reviews and Critic Impressions",
  description:
    "How critics and creators received Fire Emblem: Fortune's Weave, from IGN and GameSpot to SwitchUp, Nintendo Life, Skill Up, GameRant and Inside Games.",
  path: "/review/",
});

export default function ReviewPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Reviews", item: "/review/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Reviews and Critic Impressions"
        description="What the press and prominent creators actually said about Fortune's Weave - gathered in one place as third-party opinion, not a score from this site."
        path="/review/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            A roundup, not a verdict
          </h2>
          <p>
            Fire Emblem: Fortune&apos;s Weave launched to a wide spread of critic and creator coverage. This
            page collects the most substantial English-captioned reviews and impression pieces in one
            place so you can compare how different outlets read the same game. Every video below is
            oEmbed-verified and carries English subtitles; the text under each one is a short, attributed
            summary of that outlet&apos;s stance rather than a quote, because auto-captions are unreliable on
            names and numbers.
          </p>
          <p>
            None of this is a score from fortunesweave.online. The site stays out of grading the game; these
            are the voices that do, kept here so a reader can weigh them against each other and against the
            mechanics documented elsewhere on the site.
          </p>
        </section>

        <NativeBannerAd />

        {/* Video intel: IyaSo06SmhM — IGN */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; verified English captions
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">IGN</h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">IGN</span> &middot;{" "}
              <span className="font-mono">IyaSo06SmhM</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed videoId="IyaSo06SmhM" title="Fire Emblem: Fortune's Weave Review" />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            IGN opens by restating what the series is for - a school for turning players into battlefield
            tacticians through its turn-based combat - and frames the modern entries as games where strategy
            matters as much between battles (training, shared meals, camaraderie) as during them. The review
            places Fortune&apos;s Weave inside that lineage rather than treating it in isolation, drawing on the
            series&apos; own history rather than only the new release.
          </p>
        </section>

        {/* Video intel: Bu0W6liPBWA — GameSpot */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; verified English captions
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">GameSpot</h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">GameSpot</span> &middot;{" "}
              <span className="font-mono">Bu0W6liPBWA</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="Bu0W6liPBWA"
              title="Fire Emblem: Fortune's Weave Is The Series' New Peak"
            />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            GameSpot&apos;s headline stance is that Intelligent Systems built this entry by consciously carrying
            forward what worked in Three Houses and correcting what did not in Engage, then folding in lessons
            from the series&apos; stranger experiments. The piece argues the result rewards players who want both
            a deeply interconnected story and tightly interlocking RPG systems at once, calling it a new
            high-water mark for the franchise.
          </p>
        </section>

        {/* Video intel: 5PU6DVmeoX4 — SwitchUp */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; verified English captions
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">SwitchUp</h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">SwitchUp</span> &middot;{" "}
              <span className="font-mono">5PU6DVmeoX4</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="5PU6DVmeoX4"
              title="Fire Emblem: Fortune's Weave Nintendo Switch 2 Review"
            />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            SwitchUp frames its look at the game through the series&apos; own history - from its near-cancellation
            before Awakening revived it to its 2026 Switch 2 appearance - and asks whether the franchise&apos;s
            continued momentum is earned. It is a retrospective-angled review rather than a bare verdict, which
            makes it a useful counterweight to the scored pieces.
          </p>
        </section>

        {/* Video intel: 7HwRQh2BOdo — Nintendo Life */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; verified English captions
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Nintendo Life</h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">Nintendo Life</span> &middot;{" "}
              <span className="font-mono">7HwRQh2BOdo</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="7HwRQh2BOdo"
              title="Fire Emblem: Fortune's Weave Switch 2 Review - Is It Worth It?"
            />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Nintendo Life reviews the game on Switch 2 hardware and, in its setup, describes the premise the
            story opens on - a world tipped toward collapse by a demon king and his armies. The video is the
            outlet&apos;s standard scored review, adapted from Jim Norman&apos;s written piece for the site.
          </p>
        </section>

        {/* Video intel: aSVvPliMJwg — Skill Up */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; verified English captions
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Skill Up</h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">Skill Up</span> &middot;{" "}
              <span className="font-mono">aSVvPliMJwg</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="aSVvPliMJwg"
              title="I just couldn't stop playing Fire Emblem: Fortune's Weave (Hands-On Impressions)"
            />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Skill Up&apos;s piece is hands-on rather than a scored review, and it is explicitly framed against the
            creator&apos;s earlier, more reserved take on Engage - he recalls recommending Engage while
            acknowledging that viewers found his reaction underwhelmed. Fortune&apos;s Weave is therefore read as
            a comparison point with his prior series coverage. (The video is sponsor-supported.)
          </p>
        </section>

        {/* Video intel: _Q3tCNMRMbU — GameRant */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; verified English captions
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">GameRant</h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">GameRant</span> &middot;{" "}
              <span className="font-mono">_Q3tCNMRMbU</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="_Q3tCNMRMbU"
              title="Fire Emblem: Fortune's Weave is Massive! - Review Roundup"
            />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            GameRant&apos;s roundup centers the debate on scope: the argument that more content is not
            automatically better, set against the contrast between long games that earn their length and those
            that overstay. The piece surveys how critics across gaming outlets received the entry&apos;s sheer
            size rather than issuing its own single score. Specific playtime figures are left out here because
            auto-captions are unreliable on numbers.
          </p>
        </section>

        {/* Video intel: YydIXGl5t9A — Inside Games */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; verified English captions
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Inside Games</h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">Inside Games</span> &middot;{" "}
              <span className="font-mono">YydIXGl5t9A</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="YydIXGl5t9A"
              title="Fire Emblem Fortune's Weave Is a Reason to Buy a Switch 2 - Inside Games Daily"
            />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Inside Games positions the game as another must-have Switch 2 exclusive and asks whether it is the
            title that finally pulls newcomers into Fire Emblem. The segment frames it as an anime-heavy tactical
            RPG and a potential system-seller, which is a different lens from the deep-dive reviews above.
          </p>
        </section>

        {/* Video intel: GATHznD5yYo — Arlo — verified English captions — transcribed 2026-10-10 */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; verified English captions
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Early impressions from a Three Houses fan</h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">Arlo</span> &middot;{" "}
              <span className="font-mono">GATHznD5yYo</span>
            </div>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed videoId="GATHznD5yYo" title="Fire Emblem: Fortune's Weave Is TOO MUCH" />
          </div>

          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Arlo (review copy from Nintendo) shares hands-on early thoughts rather than a full review. He argues the four story paths that converge into one file are a big step up from Three Houses&apos; single locked house, and that the avatar is no longer the lone protagonist — each of the four leads gets their own focus. He likes the more open, free-flowing hub with limited &quot;turns&quot; between story battles and the separate world-map mode, but finds the real-time dungeons and clash battles lightweight (auto-battle clears them). The tone is &quot;too much game&quot; in a positive sense.
          </p>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#d3b475]">Caption highlights</p>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-300">
              <li>Four separate story paths that all converge, versus Three Houses&apos; one locked house.</li>
              <li>The avatar is not the sole main character; each of the four leads drives their own arc.</li>
              <li>A more open hub with a limited number of &quot;turns&quot; spent between story battles, plus a distinct world-map exploration mode.</li>
              <li>Real-time dungeons and clash battles are deliberately simple supplements to the tactical combat, not a replacement.</li>
            </ul>
            <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">Drawn from the video&apos;s auto-generated English captions (community-reported; not verified in-game).</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Frequently asked questions
          </h2>
          <dl className="space-y-5">
            {FAQS.map((item) => (
              <div key={item.question}>
                <dt className="font-semibold text-gray-900 dark:text-gray-100">{item.question}</dt>
                <dd className="mt-1 text-gray-700 dark:text-zinc-300">{item.answer}</dd>
              </div>
            ))}
          </dl>
          <p className="text-gray-700 dark:text-zinc-300">
            Want the mechanics behind the praise? The systems and gameplay pages document the combat, class and
            between-battle loops the reviewers keep returning to, and the characters page records who can be
            recruited on which route.
          </p>
        </section>
      </main>
    </>
  );
}
