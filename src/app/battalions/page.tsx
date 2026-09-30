import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import NativeBannerAd from "@/components/NativeBannerAd";
import { JsonLd } from "@/components/JsonLd";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import battalionsData from "@/data/battalions.json";

const mechanics = battalionsData._mechanics;
const perks = battalionsData.renownPerks;
const gaps = battalionsData._openGaps;
const confirmed = mechanics.filter((entry) => entry.grade === "cross-checked");

const FAQS = [
  {
    question: "Who can use gambits and battalions?",
    answer:
      "Theodora. Gambits and battalions are her route talent, so the command and the units belong to her and her allies while the other three Flame Lords get different systems. She recruits them from settlement nodes on the world map with her Recruit Soldiers action.",
  },
  {
    question: "Why can my unit not equip a battalion?",
    answer:
      "Three reasons cover almost every case. Only infantry can hold a battalion, so mounted units never can. A unit can only equip battalions at or below its own Authority skill level. And the battalion has to be assigned in the inventory menu first, because the Gambit command does not appear until it is.",
  },
  {
    question: "Why is the Gambit command missing in battle?",
    answer:
      "Each battalion gambit carries a fixed spatial requirement relative to its target, and the condition has to be met exactly before the option shows up. Gambits also cannot be used at all during the turn-based Clashes inside dungeons, which is the other reason the command disappears.",
  },
  {
    question: "Does Charm matter for gambits?",
    answer:
      "Yes. Charm raises how effective a gambit is, which is why Theodora and Bonaventure suit a gambit-driven build. Authority is the separate stat that gates what a unit can equip, and the two are easy to confuse.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Gambits and Battalions",
  description:
    "How gambits and battalions work in Fire Emblem: Fortune\u0027s Weave: the Theodora-only recruitment loop, Authority and Charm, and the Renown perks.",
  path: "/battalions/",
});

export default function BattalionsPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Battalions", item: "/battalions/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Gambits and Battalions"
        description="Theodora\u0027s route talent from end to end: recruiting, who may carry one, why the command vanishes, and what Renown buys."
        path="/battalions/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            A system with two separate gates
          </h2>
          <p>
            Gambits and battalions are Theodora&apos;s route talent rather than a universal mechanic, and
            they are gated twice. The first gate is who may hold one at all: infantry only, with mounted
            units, whether on a horse, an Ornius or a flying mount, permanently excluded. The second gate
            is Authority, which caps the rank of battalion a unit can equip. Both gates are on the unit
            side, because battalions do not carry an authority value of their own.
          </p>
          <p>
            The third thing that surprises players is not a gate but an ordering rule: a battalion has to
            be assigned in the inventory menu before the Gambit command appears on that unit. A
            battalion sitting unassigned in the bag does nothing at all, which is why so many players
            report the command being missing rather than the battalion being weak.
          </p>
          <p>
            Once equipped, a gambit still has to earn its turn. Each one carries a fixed spatial
            requirement relative to its target, and the condition has to be met exactly before the option
            appears. Gambits also cannot be used during the turn-based Clashes fought inside dungeons,
            which makes them a battlefield tool specifically rather than a universal answer.
          </p>
          <p>
            {"Charm is the stat that decides how hard a gambit hits rather than whether it can be used, and it is confirmed by two independent publications: " +
              confirmed.length + " of the " + mechanics.length +
              " rows below carry that confirmation, and the rest rest on a single community write-up that marks its own figures unverified."}
          </p>
        </section>

        {/* 黄金次屏 Adsterra 原生信息流广告位 */}
        <NativeBannerAd />

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Every recorded mechanic
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                  <th className="py-2 pr-4">Mechanic</th>
                  <th className="py-2 pr-4">What it does</th>
                  <th className="py-2">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {mechanics.map((entry) => (
                  <tr key={entry.key} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                      {entry.key}
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                      {entry.value}
                      {entry.note ? (
                        <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">
                          {entry.note}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 text-xs text-gray-700 dark:text-gray-300">
                      {entry.grade === "cross-checked"
                        ? "Confirmed by two sources"
                        : "Community reported"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The Renown perks at 5, 7 and 9
          </h2>
          <p>
            Renown does three things for this system, and it does them at the same three levels that gate
            so much else. The community write-up marks all three as unverified, so they are recorded here
            as reported rather than as settled numbers.
          </p>
          <div className="space-y-4">
            {perks.map((entry) => (
              <article key={entry.id} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {"Renown " + entry.level}
                </h3>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{entry.effect}</p>
              </article>
            ))}
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            The surplus path is worth knowing early: spare battalions convert into troop points at the
            Transport Chief, who unlocks in Theodora&apos;s Part I at Chapter 7, and 100 troop points buy
            a Tactics Manual. Hoarding battalions you will never field is therefore a waste rather than
            caution.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What no source has recorded yet
          </h2>
          <p>
            The names and effects of the first battalions recorded on this site come from the captioned
            route guide above, so this is a starting roster rather than an empty list: they are one
            creator&apos;s Theodora run, not the complete set the game ships with. A full table would need a
            second route guide and a second account of the same rows, and until that exists the list below is
            labelled as one creator&apos;s observations.
          </p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            {gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
          <p className="text-gray-700 dark:text-gray-300">
            The practical workaround in the meantime is to read the two gates rather than a tier list:
            pick battalions at or below your unit&apos;s Authority, keep them on infantry, and deploy the
            cleric-type ones to resource nodes and the mage-type ones to ore when they are not in use.
          </p>
        </section>

        {/* Battalion Roster Video Intel */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Verified Video Intel &middot; Audio Transcript
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                The First Named Battalions
              </h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">Jay Dunna</span> &middot; Verified
              English Captions &middot; <span className="font-mono">w9SoSWIcysg</span>
            </div>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="w9SoSWIcysg"
              title="BEST THEODORA Team Build in Fire Emblem: Fortune's Weave"
            />
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            This route-build guide is where the tables above stop being abstract, because the battalions it
            names are the clearest record of what a gambit actually does. Everything below is taken from the
            captions of one Theodora playthrough: the effects are the useful part, and the labels he uses for
            them are quoted rather than asserted, since a caption rendering of a menu name is not a
            verified string. His placements are his own choices for one team, not requirements.
          </p>

          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                01 &middot; Shape of Attack
              </span>
              <h3 className="text-sm font-semibold text-white">A battalion that strikes diagonally</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The most interesting one he fields is a caster battalion whose attack lands in an X pattern,
                which is worth more than it sounds: it gives a unit whose own attacks run in straight lines the
                ability to cover the diagonals around it. He puts it on Theodora precisely because her own
                ranged attacks are line-based, so the battalion closes the gaps her weapon cannot.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                02 &middot; Control
              </span>
              <h3 className="text-sm font-semibold text-white">A battalion that stops a target acting</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The second named effect immobilizes the target, which he reads as a survivability tool rather
                than a damage tool and assigns to the squishiest unit on the team: if a fragile caster is
                caught in melee she does not survive the retaliation, so removing the target&apos;s turn is
                worth more than adding damage to it. That is a genuinely different use of a gambit from
                hitting harder.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                03 &middot; Damage and Rank
              </span>
              <h3 className="text-sm font-semibold text-white">A heavy physical gambit and the entry tier</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The rest of his loadout covers the two ends of the ladder. One is described as a strong
                physical attack that he puts on a unit who meets its Authority requirement rather than on the
                unit who would hit hardest, and the others are the entry-level soldier and trainee-cleric
                battalions that come first and carry simple effects, the latter granting a form of healing.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                04 &middot; Upkeep
              </span>
              <h3 className="text-sm font-semibold text-white">Re-check the assign menu as Authority rises</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                His standing instruction is to keep opening the assign menu and upgrading battalions as each
                character&apos;s Authority skill climbs, because a battalion that was the best available at
                Authority one is usually outclassed a tier later. That is the same gate the FAQ above
                describes, seen from the maintenance side rather than the eligibility side.
              </p>
            </div>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Worth separating from battalions in the same video: his Theodora build leans on a class ability
            acquired by auto-levelling the class at the inn rather than by fielding her in it, which keeps her
            stat growth untouched while still banking the ability. The full battalion list and its gambit
            table are still waiting on a second independent route guide before any of the labels above are
            promoted to cross-checked.
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
            Route talents differ per Flame Lord, so Theodora&apos;s battalions are worth reading next to
            the systems page, which covers what the other paths get instead.
          </p>
        </section>
        {/* Video intel: MhZwvHSo1WE */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; verified English captions
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Cai's mounted line through Act 1</h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-200">Jay Dunna</span> &middot;{" "}
              <span className="font-mono">MhZwvHSo1WE</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed videoId="MhZwvHSo1WE" title="BEST CAI TEAM Build Guide (Act 1) in Fire Emblem: Fortune's Weave" />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">Jay Dunna's captioned build covers Cai's team end to end through Act 1, including the class progression and the two advanced options he rates highest.</p>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><span className="font-semibold text-zinc-200">Stable buff.</span> Cai buffs the whole team as members use the stable, which is why the creator builds the party mounted and treats mounted units as the safe pick.</li>
              <li><span className="font-semibold text-zinc-200">Charioteer.</span> He rates the Charioteer highly because it hits several enemies at once and its growths keep scaling with level, so it does not have to be abandoned later.</li>
              <li><span className="font-semibold text-zinc-200">The line.</span> His progression runs Ornius Rider first, for the speed that buys follow up attacks, then Light Cavalry, whose mastery ability adds health and avoidance against effective weapons.</li>
              <li><span className="font-semibold text-zinc-200">The finish.</span> He ends on the Dragoon for the hit bonus it grants on favourable terrain, or the other advanced lance option he personally prefers; both are listed in the class tables.</li>
          </ul>
        </section>

      </main>
    </>
  );
}
