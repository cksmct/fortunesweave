import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import NativeBannerAd from "@/components/NativeBannerAd";
import { JsonLd } from "@/components/JsonLd";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import postgameData from "@/data/postgame.json";

const checklist = postgameData.checklist;
const mechanics = postgameData._mechanics as Record<string, string>;
const gaps = postgameData._openGaps;

const FAQS = [
  {
    question: "Is there a post-game in Fortune\u0027s Weave?",
    answer:
      "No. Finishing the story returns you to the moment before the final battle and leaves the whole game open to replay, but there is no separate post-game campaign and nothing that only unlocks after the credits.",
  },
  {
    question: "Does the game have New Game Plus?",
    answer:
      "Not in the traditional sense. The replay route is Descend Again on the title screen, which restarts at a higher difficulty and replays the prologue. What carries over is map exploration, unlocked classes, Boons of Salvation and sidequest progress, and only once at least one Part I route is complete.",
  },
  {
    question: "What is Merge Causality?",
    answer:
      "A system at the Shrine of Causality that combines multiple Part 1 versions of the same unit, trained on different lords\u0027 routes, into a single flexible Part 3 unit. All Abilities and Combat Arts from the merged versions carry over and the higher stat wins wherever they disagree.",
  },
  {
    question: "Should I merge units or spend shards on boons first?",
    answer:
      "No source records the cost of a merge, so there is no way to compare them honestly. What is recorded is that shards are the currency for both, that boons apply across all four routes, and that whether merge spending is refundable on a restart is not documented, so the cautious order is boons first.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Post-game and Merge Causality",
  description:
    "There is no post-game and no New Game Plus in Fire Emblem: Fortune\u0027s Weave. What replaces them is Descend Again, Merge Causality and the unfinished routes.",
  path: "/postgame/",
});

export default function PostgamePage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Post-game", item: "/postgame/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Post-game, Descend Again and Merge Causality"
        description="There is no post-game and no New Game Plus here. What stands in for them is a replay from the title screen and a shrine that merges the versions of a unit you trained on other routes."
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The credits are not a gate
          </h2>
          <p>{mechanics.postgame}</p>
          <p>{mechanics.newGamePlus}</p>
          <p>
            {"That combination is unusual enough to state twice: nothing is locked behind the credits, and there is no second-playthrough unlock list. What the game offers instead is more of itself, at a higher difficulty, with the account-level progress you have already earned."}
          </p>
          <p>{mechanics.carryOver}</p>
        </section>

        {/* 黄金次屏 Adsterra 原生信息流广告位 */}
        <NativeBannerAd />

        {/* Tactical Video Guide & Field Breakdown */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Verified Video Intel &middot; Audio Transcript
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                New Game Plus &amp; Route Carryover Breakdown
              </h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">Jay Dunna</span> &middot; Verified English Captions
            </div>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="L1HNmEiQ_A4"
              title="EVERYTHING That Carries Over in Fire Emblem: Fortune's Weave"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                01 &middot; Sequence Priority
              </span>
              <h3 className="text-sm font-semibold text-white">Full Route Completion</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Finish all 12 chapters of a Flame Lord&apos;s Part 1 before beginning another protagonist. Clearing Part 1 completely activates account-wide carryovers across subsequent route restarts.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                02 &middot; World Persistence
              </span>
              <h3 className="text-sm font-semibold text-white">Map Fog &amp; Carriage Lines</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Discovered map fog-of-war, harvest ingredient nodes, and carriage travel lines carry over completely. Once Kai clears a carriage path, other lords use them after a single gate-opening interaction.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                03 &middot; Social &amp; Renown
              </span>
              <h3 className="text-sm font-semibold text-white">Cross-Route Supports &amp; Quests</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Support ranks persist across saves and can be pre-farmed by sharing meals across different Lord routes. Completed bulletin board sidequests auto-validate, dumping massive Renown and XP on chapter start.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Merge Causality, the real endgame system
          </h2>
          <p>{mechanics.merge}</p>
          <p>{mechanics.mergeRules}</p>
          <p>
            {"This is the system that finally explains why the game lets you play all four Part I routes with the same cast: training one character three different ways is not wasted effort, because the trained versions can be folded together later. " +
              mechanics.mergeTiming}
          </p>
          <p>
            {"Combat Arts in particular travel through a merge, which matters because they are not learned from scratch on a fresh save: " +
              "a Part 1 version that learned one takes it along. Support relationships are not recorded as travelling with the merge either way, so that question is left open rather than answered."}
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What to do after the final battle
          </h2>
          <ol className="space-y-4">
            {checklist.map((item) => (
              <li key={item.id} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {item.order}. {item.task}
                </h3>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{item.detail}</p>
                {item.note ? (
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">{item.note}</p>
                ) : null}
              </li>
            ))}
          </ol>
          <p>
            The third item is the one with a deadline-shaped problem attached: the Key of the Diadem lives in
            the Part III dungeons and the licence chamber it opens is in Part III Section 4. If the Divine
            classes are the goal, the keys have to be collected while those dungeons are still in reach,
            which means checking a Part III dungeon list before moving past it rather than after.
          </p>
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
          <p className="text-gray-700 dark:text-gray-300">
            {"The Merge Causality rules themselves are in better shape than most of this site\u0027s endgame material, because three independent outlets described the same behaviour: multiple trained versions in, one Part 3 unit out, every ability and Combat Art kept, and the higher stat winning each clash. That is the one row here graded cross-checked."}
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
          <p className="text-gray-700 dark:text-gray-300">
            The shards that fund a merge come from Notable Deeds, and what they buy besides the merge is on the
            boons page.
          </p>
        </section>
      </main>
    </>
  );
}
