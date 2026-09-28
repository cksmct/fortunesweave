import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import questsData from "@/data/sidequests.json";

const quests = questsData.quests;
const mechanics = questsData._mechanics as Record<string, string>;
const gaps = questsData._openGaps;

const buckets: number[] = [];
for (const quest of quests) {
  if (!buckets.includes(quest.chapter)) buckets.push(quest.chapter);
}
buckets.sort((x, y) => (x === 0 ? 99 : x) - (y === 0 ? 99 : y));
const priority = quests.filter((quest) => quest.deadline !== "No deadline");
const noDeadline = quests.filter((quest) => quest.deadline === "No deadline");
const unlocks = quests.filter((quest) => /unlocks the/i.test(quest.note));
const supplies = quests.filter((quest) => quest.name.indexOf("Send Supplies") === 0);

const FAQS = [
  {
    question: "How do subquests work in Fortune\u0027s Weave?",
    answer:
      "Two kinds exist. Generic subquests are taken from bulletin boards in Dagsion and appear on more than one route, while route-specific subquests belong to one Flame Lord\u0027s path and can be missed entirely on another path.",
  },
  {
    question: "What happens if I miss a subquest deadline?",
    answer:
      "The reward is simply gone. No run fails because of a missed subquest, but several of them unlock a class outright, so missing the wrong one costs a whole unit type rather than some gold.",
  },
  {
    question: "Why do so many deadlines say 27/11?",
    answer:
      "Because that is the practical outer edge of Part I. Deadlines here are in-game dates in day and month form, not real calendar dates, and a cluster of quests expiring on the same date is a sign that Part I is about to end.",
  },
  {
    question: "Where is the Missing Master?",
    answer:
      "Recorded as a route-specific priority subquest at Dagsion in Chapter 9, with a 15/10 deadline and a 4000 gold and 130 Renown reward. The source records the location but not the NPC, which is why players search for this one by name.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Subquests and Deadlines",
  description:
    "All 125 recorded Fire Emblem: Fortune\u0027s Weave subquests by chapter, with locations, rewards and the in-game deadline that decides whether you get them.",
  path: "/sidequests/",
});

export default function SidequestsPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Subquests", item: "/sidequests/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Subquests and Deadlines"
        description="Every recorded subquest by chapter, with the reward and the in-game date it dies on, because a missed deadline only ever costs you the reward."
        path="/sidequests/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            A deadline list is the only list that matters
          </h2>
          <p>
            {"Fortune\u0027s Weave runs " + quests.length +
              " recorded subquests, and almost every one of them expires. That is the single fact which decides how useful a quest list is: a list without deadlines tells you what exists, while this one tells you what is still reachable from where you are standing."}
          </p>
          <p>{mechanics.kinds}</p>
          <p>{mechanics.priority}</p>
          <p>{mechanics.dates}</p>
          <p>{mechanics.supplies}</p>
        </section>

        {/* Tactical Video Guide & Subquest Priority Breakdown */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Verified Video Intel &middot; Audio Transcript
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                Act 1 Missables &amp; Crucial Subquest Priorities
              </h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">Jay Dunna</span> &middot; Verified English Captions
            </div>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="kVyB4HlKpa8"
              title="EVERYTHING You NEED to Do Before Finishing Act 1 – Fire Emblem: Fortune's Weave"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                01 &middot; 6-Slot Carryover
              </span>
              <h3 className="text-sm font-semibold text-white">Inventory Purge Rules</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Advancing from Part 1 clears unheld storage inventory and unspent gold. Each combatant only carries 6 equipment items forward; sell non-essentials, upgrade core weapons at the forge, and exhaust surplus coin on permanent items before departing.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                02 &middot; Flame Lord Chains
              </span>
              <h3 className="text-sm font-semibold text-white">Unique Character Quests</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Give strict priority to personal questlines—such as Dietrich&apos;s <em>Headhunters</em> chain and Kai&apos;s <em>Kindness</em> requests. These bestow exclusive combat passives and rewards that cannot be recovered once the act concludes.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                03 &middot; The Weekend Reset
              </span>
              <h3 className="text-sm font-semibold text-white">Saturday-Sunday Refresh</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Coordinate town visits on Saturday: complete temple blessings, arena skill bouts, and inn support meals. Advance one day to Sunday (Goddess Day) for refreshed services and 50% food discounts to double your weekly gains.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The ones worth rerouting a chapter for
          </h2>
          <p>
            {"Three recorded subquests unlock a class outright, and those are the entries where a missed deadline costs a unit type rather than money: " +
              unlocks.map((quest) => quest.name + " unlocks " + quest.note.replace(/^.*unlocks /i, "")).join("; ") + "."}
          </p>
          <p>
            {"The Send Supplies chain on Theodora\u0027s route is the other structural trap: " + supplies.length +
              " recorded delivery quests, all expiring on 24/10, and they gate Cataphract, Guardian and Dragoon between them. Items have to be gathered during the chapters that offer them rather than banked for later."}
          </p>
          <p>
            {"Of the " + quests.length + " entries, " + priority.length +
              " carry a deadline and " + noDeadline.length +
              " are recorded without one. No deadline means untested rather than safe, which is the reading the sources support: they list what they have seen, not what cannot expire."}
          </p>
        </section>

          <p>
            Fire Emblem: Fortune&apos;s Weave Missing Master is the entry searched for most often, and the record explains
            why: it is a route-specific priority subquest at Dagsion in Chapter 9 with a 15/10 deadline, a
            4000 gold and 130 Renown payout, and no NPC name attached, so the quest name is the only thing
            a player has to search with. Purloined Spellcaster&apos;s Tools is the same shape of problem for a
            different reason: the record gives its location as the Secret Altar without saying who to speak to
            or how to reach it.
          </p>
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Every recorded subquest, chapter by chapter
          </h2>
          {buckets.map((chapter) => (
            <article key={"ch-" + chapter} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {chapter === 0 ? "Timing not recorded" : "Chapter " + chapter}
                <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                  {quests.filter((quest) => quest.chapter === chapter).length} subquests
                </span>
              </h3>
              <table className="mt-3 w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left dark:border-gray-800">
                    <th className="py-2 pr-3">Subquest</th>
                    <th className="py-2 pr-3">Where</th>
                    <th className="py-2 pr-3">Reward</th>
                    <th className="py-2">Ends</th>
                  </tr>
                </thead>
                <tbody>
                  {quests
                    .filter((quest) => quest.chapter === chapter)
                    .map((quest) => (
                      <tr key={quest.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 pr-3 font-medium text-gray-900 dark:text-gray-100">
                          {quest.name}
                          <span className="ml-1 text-xs font-normal text-gray-600 dark:text-gray-400">
                            {quest.accept === "board" ? "(board)" : quest.accept === "route" ? "(route only)" : ""}
                          </span>
                          {quest.note ? (
                            <span className="mt-1 block text-xs font-normal text-gray-600 dark:text-gray-400">
                              {quest.note}
                            </span>
                          ) : null}
                        </td>
                        <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{quest.location}</td>
                        <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{quest.reward}</td>
                        <td className="py-2 text-gray-700 dark:text-gray-300">{quest.deadline}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </article>
          ))}
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
            {"Four entries are flagged as " + mechanics.semirandom.split(":")[0].toLowerCase() +
              ", which matters when you are hunting a specific reward and cannot find it: their availability varies between playthroughs, so their absence is not a bug."}
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
            Paralogues are covered separately on the walkthrough page, the materials each delivery asks for are
            on the materials page, and the classes these subquests unlock are on the classes page.
          </p>
        </section>
      </main>
    </>
  );
}
