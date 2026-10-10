import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import NativeBannerAd from "@/components/NativeBannerAd";
import { JsonLd } from "@/components/JsonLd";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import activitiesData from "@/data/activities.json";

const prompts = activitiesData.prompts;
const tiers = activitiesData._reactionTiers;
const characters = Array.from(new Set(prompts.map((row) => row.character))).sort((x, y) =>
  x.localeCompare(y)
);
const usuallyCount = prompts.filter((row) => row.reactionTier === "usually").length;
const rarelyCount = prompts.filter((row) => row.reactionTier === "rarely").length;

const FAQS = [
  {
    question: "How often can you feed the Pale Raven?",
    answer:
      "Once per game week, and the week refreshes on Sundays. You need to hand over a vegetable item from your materials bag to start each session, and the activity only exists in Part 1.",
  },
  {
    question: "Is there a wrong answer that wastes the week?",
    answer:
      "Every prompt offers three reactions and only one is correct; the two wrong options are random each time. Failing all three prompts gives a Bad result, which still earns a little support, so a bad week is not a wasted week.",
  },
  {
    question: "Why do some listed reactions say they are rarely correct?",
    answer:
      "Because the rarely list is not a list of wrong answers. Those reactions are reserved for very contextual prompts, so they do appear as the correct answer for a handful of the prompts recorded here, just far less often than the usually list.",
  },
  {
    question: "What do you actually get out of Bird Time?",
    answer:
      "Three things. Eshmel can appear during a killing blow in ordinary combat and block all incoming damage, with the chance rising as support grows. In Dungeon Clashes Eshmel can appear when your side is low on HP and defeat the enemy party instantly. Bird Time is also the route to unlocking an A rank support conversation between Eshmel and most characters recruitable in Part 1.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Pale Raven Bird Time",
  description:
    "Every recorded Pale Raven Bird Time prompt and its correct reaction in Fire Emblem: Fortune\u0027s Weave, sorted by character and reaction tier.",
  path: "/activities/",
});

export default function ActivitiesPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Activities", item: "/activities/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Pale Raven Bird Time"
        description="Every recorded Bird Time prompt and its correct reaction, because the two wrong options are random and the week only comes around once."
        path="/activities/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What Bird Time actually is
          </h2>
          <p>
            During Part 1, Eshmel spends much of each story path disguised as the Pale Raven, a bird
            perched in the capital. Advancing any story path until the main character reaches the capital
            unlocks the Perch, and from then on you can feed the raven once per game week, with the week
            refreshing on Sundays. Handing over a vegetable item from the materials bag starts the
            minigame.
          </p>
          <p>
            The minigame is a conversation. The raven presents prompts and offers three reactions, of
            which exactly one is right. The two wrong reactions are always random, which is why no guide
            can predict the distractor options and why the useful asset is a table of prompts mapped to
            their correct answers rather than a theory about what the bird likes.
          </p>
          <p>
            Failing all three prompts produces a Bad result, but even that still earns a little support,
            so nothing is wasted. The activity is also exclusive to Part 1: once Part 2 begins, feeding
            the Pale Raven is gone and other ways of building the same bond take over.
          </p>
        </section>

        {/* 黄金次屏 Adsterra 原生信息流广告位 */}
        <NativeBannerAd />

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What the rewards are worth
          </h2>
          <p>
            Bird Time pays out in three places. In ordinary combat Eshmel can appear at the moment of a
            killing blow and block all incoming damage, and the chance rises as support grows. In Dungeon
            Clashes, when your side is low on total HP, Eshmel can appear and defeat the enemy party
            instantly. Third and most concretely, Bird Time is the route to unlocking an A rank support
            conversation between Eshmel and most characters recruitable in Part 1, which is what makes
            the activity worth the weekly trip even if you never care about the cutscenes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The two reaction lists
          </h2>
          <p>
            {"Across the recorded prompts, " + usuallyCount + " are answered with a reaction from the usually-correct list and " + rarelyCount +
              " with one from the rarely-correct list. The second list is the one that gets misread as a list of wrong answers: it is not. Those reactions are reserved for contextual prompts, so they do show up as correct, just far less often."}
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Usually correct ({tiers.usually.length})
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {tiers.usually.map((reaction) => (
                  <li key={reaction}>{reaction}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Rarely correct ({tiers.rarely.length})
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {tiers.rarely.map((reaction) => (
                  <li key={reaction}>{reaction}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Prompt answers by character
          </h2>
          <p>
            {"The tables below cover " + characters.length + " characters and " + prompts.length +
              " prompts. Find the character you are feeding with, search the page for the line the raven just said, and answer with the paired reaction. Rows marked rarely correct are the contextual exceptions mentioned above."}
          </p>
          <div className="space-y-6">
            {characters.map((name) => (
              <article key={name} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{name}</h3>
                <table className="mt-2 w-full border-collapse text-sm">
                  <tbody>
                    {prompts
                      .filter((row) => row.character === name)
                      .map((row) => (
                        <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{row.prompt}</td>
                          <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                            {row.reaction}
                          </td>
                          <td className="py-2 text-xs text-gray-600 dark:text-gray-400">
                            {row.reactionTier === "rarely" ? "rarely correct" : ""}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </article>
            ))}
          </div>
        </section>

        {/* Weekly Routine Video Intel */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Verified Video Intel &middot; Audio Transcript
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                The Rest of the Weekly Routine
              </h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">Jay Dunna</span> &middot; Verified
              English Captions &middot; <span className="font-mono">q9xlI364_Og</span>
            </div>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="q9xlI364_Og"
              title="EVERY WEEKLY MISSABLE Event in Fire Emblem: Fortune's Weave"
            />
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Bird Time is one stop on a weekly circuit rather than a standalone activity, so this walkthrough
            of every missable weekly event is worth reading next to the prompt tables above. The points below
            are the structural ones taken from its captions: what repeats weekly, in what order, and what
            permanently expires if a week goes by. The creator&apos;s own routine advice is labelled as such
            rather than presented as a rule the game enforces, and no figure from the captions is restated
            here as a number.
          </p>

          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                01 &middot; Plan First
              </span>
              <h3 className="text-sm font-semibold text-white">Read the calendar, then move</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The adventure guide holds a calendar listing the week&apos;s notable days, including the days
                arena training costs less and the Divine Service Days that boost gathering such as fishing and
                mining. Every weekly activity below is cheaper, better or gated by what that calendar says, and
                a week that is spent before it is read cannot be recovered.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                02 &middot; Order of Operations
              </span>
              <h3 className="text-sm font-semibold text-white">Spend motivation, then refresh it</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The routine the creator settled on is deliberately ordered: run the arena and the temple
                services first, because both consume a unit&apos;s motivation, then take the meal afterwards to
                restore it. Waiting on the meal until late in the day also lets a single session roll the week
                over, which is how one trip collects two weeks of refreshable activities.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                03 &middot; Recruiting Loop
              </span>
              <h3 className="text-sm font-semibold text-white">Feed the raven, then the table</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Bird Time sits at the start of the loop rather than the end. From the Perch the route continues
                to the innkeeper, whose meals build support with units that are not recruited yet, and the map
                shows both gates a recruit has to clear, the support level and the Renown level. The creator
                targets unrecruited characters with those meals specifically to shorten the wait on an A rank.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                04 &middot; Once a Week
              </span>
              <h3 className="text-sm font-semibold text-white">Temple service rotates by weekday</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The temple row allows one service per week, and each weekday favours a different one of the
                six named gods, so the blessing you buy depends on when you go rather than on a menu. Temples
                that are highlighted on the map are the ones paying out Renown at that moment, which the
                calendar confirms. The creator&apos;s shortcut is to book the service on the same day the week
                rolls over.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                05 &middot; Cai Only
              </span>
              <h3 className="text-sm font-semibold text-white">Stables level a mounted ability</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                On Cai&apos;s route the stables accept a weekly visit that tends the horses and, unlike most
                weekly jobs, does not hand over a one-off reward: it raises a mounted ability that keeps
                levelling with each visit. That makes the stable a compounding stop rather than a chore, and
                it is route-exclusive in the same way that battalions are Theodora&apos;s.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                06 &middot; Easy to Miss
              </span>
              <h3 className="text-sm font-semibold text-white">Gifts, thermae and paralogue windows</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Gifts are one per character per week, and characters can be warped to directly, so the cost of
                forgetting is a whole week of support. The thermae runs special baths at weekends with a
                different effect on different days and restores health and magic outright. Orange markers on
                the map are the quests and paralogues, and the creator&apos;s habit is to sweep the map every
                time a trip into Dagsion begins.
              </p>
            </div>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            One illusion worth clearing up from the same video: the clock advances as you fast travel, but it
            stops at the end of the current time block, so a long warp does not burn an extra turn. The
            planner-safe reading is that movement costs time only until the block is spent.
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
            Feeding mid-session and cannot scan a long page? The Bird Time lookup takes a character and
            shows the same prompts with their answers in a searchable list.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quick answers</h2>
          <p>
Fire Emblem: Fortune&apos;s Weave Bird Time runs once per game week and refreshes on Sundays, so a missed week is gone rather than delayed. A Fire Emblem: Fortune&apos;s Weave perfect bird time is simply all three prompts answered correctly, which is what the prompt tables above are for.
          </p>
        </section>
        {/* Video intel: KtqlIxZ1yHs */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; verified English captions
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Where Renown actually comes from</h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-200">Jay Dunna</span> &middot;{" "}
              <span className="font-mono">KtqlIxZ1yHs</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed videoId="KtqlIxZ1yHs" title="How to MAX RENOWN FAST in Fire Emblem: Fortune's Weave" />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">Jay Dunna's captioned guide builds Renown out of the weekly cycle rather than out of battles, which is the same loop the weekly events video above describes.</p>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><span className="font-semibold text-zinc-200">Temple prompt.</span> A temple row lit yellow on the map means it wants to talk, and the creator treats that as a do it now prompt rather than something to bank for later.</li>
              <li><span className="font-semibold text-zinc-200">Two receptions.</span> The weekly temple reception pays blessings and the audience reception pays Renown, so both belong in the same pass as the arena and the inn.</li>
              <li><span className="font-semibold text-zinc-200">Calendar.</span> Pressing the right bumper over the map menu opens the calendar, which lists which paralogues are open and which carry deadlines, and he plans the month from it.</li>
              <li><span className="font-semibold text-zinc-200">Repeatable.</span> Restarting a chapter keeps the support gained inside it, which is what makes a month's turn budget reusable when it ends short of the target.</li>
          </ul>
        </section>

        {/* Video intel: SISYRETbRDw */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; verified English captions
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                Four ways to grow a unit outside battle
              </h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-200">IGN</span> &middot;{" "}
              <span className="font-mono">SISYRETbRDw</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="SISYRETbRDw"
              title="Fire Emblem: Fortune's Weave - 4 Ways to Grow Outside of Battle"
            />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            IGN&apos;s captioned overview covers the four growth methods that run alongside the weekly
            battle loop, transcribed from its English subtitles.
          </p>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              <span className="font-semibold text-zinc-200">Support.</span> Gifts once a week in the
              city, feasts on the world map that lift the whole party, and training or temple service
              together all raise support, which unlocks scenes and grants passive attack and dodge
              bonuses to adjacent allies.
            </li>
            <li>
              <span className="font-semibold text-zinc-200">Renown.</span> Each protagonist&apos;s
              renown rises from temple visits, world-map defeats and the map&apos;s quest pins; higher
              renown opens advanced class options, a larger inn menu and mentorship lessons, and lets
              you pass locked world-map checkpoints.
            </li>
            <li>
              <span className="font-semibold text-zinc-200">Weapons.</span> Dungeon boxes, barrels and
              crystal deposits drop smithing materials; from chapter 6 the blacksmith can repair or
              refine, and refining both restores durability and improves power.
            </li>
            <li>
              <span className="font-semibold text-zinc-200">Recruits.</span> Recruitable units show as
              orange dots that turn green after you speak to them, and joining needs enough support or
              renown; you can gift and invite them to inn meals before they sign on.
            </li>
          </ul>
        </section>

        {/* Video intel: b8Coen3DLu8 — Varsona — verified English captions — transcribed 2026-10-10 */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; verified English captions
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">A free-time routine that works for any Flame Lord</h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">Varsona</span> &middot;{" "}
              <span className="font-mono">b8Coen3DLu8</span>
            </div>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed videoId="b8Coen3DLu8" title="The PERFECT Free Time Routine For Every Route in Fortune's Weave" />
          </div>

          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Varsona lays out a weekly free-time loop that works regardless of which Flame Lord you play. The core habit is gifting every unit you intend to recruit (rising reputation makes support easier), sharing a hotel meal after the gift (gourmet day is Sunday with half-off, which also lines up with the weekly reset), and using the arena&apos;s rotating training sets. The routine compounds the more often you run the weekly update.
          </p>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#d3b475]">Caption highlights</p>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-300">
              <li>Gift every unit you plan to recruit; rising reputation makes support faster, reducing the need to grind it.</li>
              <li>Share a hotel meal after giving a gift; gourmet day (Sunday) is half-off and coincides with the weekly reset.</li>
              <li>The arena offers four rotating training sets each week that raise different skills.</li>
              <li>The loop pays off more the more consistently you run the weekly update.</li>
            </ul>
            <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">Drawn from the video&apos;s auto-generated English captions (community-reported; not verified in-game).</p>
          </div>
        </section>

      </main>
    </>
  );
}
