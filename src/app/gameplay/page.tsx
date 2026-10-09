import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import NativeBannerAd from "@/components/NativeBannerAd";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import TacticalFigure from "@/components/TacticalFigure";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";

const FAQS = [
  {
    question: "Is Fire Emblem: Fortune\u0027s Weave on PC?",
    answer:
      "No. It is a Nintendo Switch 2 console exclusive, released on September 17, 2026, and there is no PC version. If you are on a PC, the only way to play is on a Switch 2; third-party emulators are not something this site covers.",
  },
  {
    question: "What is the core Fire Emblem: Fortune\u0027s Weave gameplay loop?",
    answer:
      "Each stretch of the campaign alternates a calendar-driven Free Time phase with a Main Battle. Free Time is measured in Turns of six in-game hours that you spend on supports, exploration and preparation, and the deadline before the next battle is counted in those Turns.",
  },
  {
    question: "How do the two battle systems differ?",
    answer:
      "Tactical combat is the grid battle the series is known for. Clash is the dungeon system: it plays like a party-based turn-based RPG where the party shares one HP pool, losing that pool forces an evacuation, and your options are Attack, Combat Arts and a Link action that costs Link Points.",
  },
  {
    question: "How do Blaze Arts work?",
    answer:
      "They are character-specific Combat Arts paid for with the user\u0027s own HP instead of weapon durability. Using them fills a Blaze Meter: half full grants Overblaze, which raises stats and opens up certain Arts, and a full meter triggers a Burst that cuts maximum HP in half for the rest of the battle.",
  },
  {
    question: "Is there a New Game Plus?",
    answer:
      "Not in the traditional sense. The replay route is Descend Again on the title screen, which restarts at a higher difficulty and carries over map exploration, unlocked classes, Boons of Salvation and sidequest progress once a Part I route is complete. The full rules are on the post-game page.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Fortune\u0027s Weave Gameplay & Combat",
  description:
    "Fire Emblem: Fortune\u0027s Weave gameplay blends a Free Time and Main Battle loop with tactical combat, Clash dungeons, Blaze Arts and class certification.",
  path: "/gameplay/",
});

export default function GameplayPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Gameplay", item: "/gameplay/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Fortune\u0027s Weave Gameplay & Combat"
        description="A field guide to how the game actually plays: the Free Time and Main Battle loop, the two battle systems, Blaze Arts, class certification and the choices that matter on a first run."
        path="/gameplay/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What the gameplay loop is
          </h2>
          <p>
            Fire Emblem: Fortune&apos;s Weave gameplay blends the series&apos; grid combat with a
            calendar-driven life-sim layer. Each stretch of the campaign alternates a Free Time phase
            with a Main Battle. Free Time is measured in Turns of six in-game hours, and the deadline
            before the next battle is expressed as a number of those Turns, so planning a week is really
            planning how many blocks you can spend before the fight.
          </p>
          <p>
            That structure is the backbone of the whole game: the same systems you manage in Free Time
            (supports, classes, exploration, materials) are what decide the battle that follows. The
            deeper mechanical breakdown lives on the{" "}
            <Link className="font-medium text-[#8a6d2f] underline decoration-dotted dark:text-[#d3b475]" href="/systems/">
              Core Systems
            </Link>{" "}
            page; this page is the entry point that explains how the pieces fit together.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Free Time and Main Battles
          </h2>
          <p>
            A Turn of Free Time is six in-game hours. You spend it on supports, exploration, class
            study or rest, and the calendar counts down to the next Main Battle. Because the deadline
            is given in Turns rather than a real clock, the practical skill is deciding which activities
            pay off before the next fight instead of hoarding them.
          </p>
          <p>
            Main Battles are the tactical grid encounters the series is built around. They are where
            routing, positioning and unit matchups decide the outcome, and the preparation you did in
            Free Time is what makes a difficult map manageable.
          </p>
        </section>

        {/* 黄金次屏 Adsterra 原生信息流广告位 */}
        <NativeBannerAd />

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Two battle systems: tactical combat and Clash
          </h2>
          <p>
            Tactical combat is the grid battle system. Clash is the dungeon system, closer to a
            party-based turn-based RPG: the party shares one HP pool, losing it forces an evacuation,
            and the available commands cover Attack, Combat Arts and a Link action that costs Link
            Points. Both systems draw on the same stats and class kit, so a unit strong in one tends to
            pull its weight in the other.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <TacticalFigure
              src="/images/gameplay/tactical-grid-battle.webp"
              srcSm="/images/gameplay/tactical-grid-battle-sm.webp"
              alt="Fire Emblem Fortune's Weave tactical grid combat and battle field deployment"
              badge="TACTICAL GRID"
              title="Main Tactical Grid Deployment"
              caption="Positioning units across elevation and cover tiles in Dagsion's arena maps to trigger weapon advantage bonuses."
            />
            <TacticalFigure
              src="/images/gameplay/tactical-positioning-clash.webp"
              srcSm="/images/gameplay/tactical-positioning-clash-sm.webp"
              alt="Fire Emblem Fortune's Weave party-based Clash dungeon combat mode"
              badge="CLASH SYSTEM"
              title="Shared-HP Clash Encounters"
              caption="Dungeon skirmishes where all deployed allies share a unified health reserve, emphasizing Link Point coordination."
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Blaze Arts: Combat Arts paid for with HP
          </h2>
          <p>
            Blaze Arts are character-specific Combat Arts that cost the user&apos;s own HP instead of
            weapon durability. Using them fills a Blaze Meter: at half the meter you get Overblaze,
            which raises stats and opens up certain Arts, and a full meter triggers a Burst that cuts
            maximum HP in half for the rest of the battle. The trade is deliberate, which is why they
            are best saved for turns where the burst in damage is worth the survivability cost.
          </p>

          <TacticalFigure
            src="/images/gameplay/tactical-blaze-meter.webp"
            srcSm="/images/gameplay/tactical-blaze-meter-sm.webp"
            alt="Fire Emblem Fortune's Weave Blaze Arts gauge and Overblaze offensive bursts"
            badge="BLAZE ARTS"
            title="Blaze Meter & Overblaze Thresholds"
            caption="Sacrificing vital unit HP to fuel lethal combat arts. Achieving 50% meter activates Overblaze state for immediate burst damage."
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Classes and certification exams
          </h2>
          <p>
            Changing class happens through certification exams rather than automatic promotion. The
            exam gates are what make class choice a planning decision on every route, and the full
            class list with its tiers is on the{" "}
            <Link className="font-medium text-[#8a6d2f] underline decoration-dotted dark:text-[#d3b475]" href="/classes/">
              Classes
            </Link>{" "}
            page. Unit matchups against the{" "}
            <Link className="font-medium text-[#8a6d2f] underline decoration-dotted dark:text-[#d3b475]" href="/weapons/">
              Weapons and Spells
            </Link>{" "}
            list also shape which certification you chase first.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Recruitment is conditional
          </h2>
          <p>
            Units join on route-specific combinations of support level, renown rank and negotiation
            steps rather than by clearing a map, which is more conditional than in most entries in the
            series. That makes the recruitment planner the first tool most players open, and the full
            roster with its conditions is on the{" "}
            <Link className="font-medium text-[#8a6d2f] underline decoration-dotted dark:text-[#d3b475]" href="/characters/">
              Characters
            </Link>{" "}
            page.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Exploration, farming and materials
          </h2>
          <p>
            Exploration is where materials come from. Overworld Search points drop the leaves and meats
            that feed Leda&apos;s drink-recipe chain and other uses, and the gathering routes are
            mapped on the{" "}
            <Link className="font-medium text-[#8a6d2f] underline decoration-dotted dark:text-[#d3b475]" href="/materials/">
              Leaf Materials
            </Link>{" "}
            page. Crop farming is the other steady supply line, covered on the{" "}
            <Link className="font-medium text-[#8a6d2f] underline decoration-dotted dark:text-[#d3b475]" href="/farming/">
              Farming
            </Link>{" "}
            page.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Beginner tips that follow from the systems
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-gray-700 dark:text-gray-300">
            <li>
              Spend Free Time on supports and exploration before each Main Battle. The Turn deadline is
              the real resource, and both activities pay off in the next fight or the one after.
            </li>
            <li>
              Certify a class early on the units you plan to lean on, because the exam gates are what
              unlock your strongest tools.
            </li>
            <li>
              Keep renown banked. Recruitment and several late unlocks are renown-gated, and it is
              easier to plan around a known balance than to scramble for it.
            </li>
            <li>
              Learn the Blaze Meter rhythm. Overblaze is a stat spike worth building toward, while a
              Burst halves max HP, so time the full meter for a turn where the damage spike wins the map.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Four routes and the war act
          </h2>
          <p>
            The campaign splits into four routes, one per Flame Lord: Cai, Dietrich, Theodora and Leda.
            Each route runs twelve chapters, followed by a shared six-chapter war act and a closing
            act. The chapter-by-chapter path and the route structure are on the{" "}
            <Link className="font-medium text-[#8a6d2f] underline decoration-dotted dark:text-[#d3b475]" href="/walkthrough/">
              Walkthrough
            </Link>{" "}
            page, and the replay and carryover rules are on the{" "}
            <Link className="font-medium text-[#8a6d2f] underline decoration-dotted dark:text-[#d3b475]" href="/postgame/">
              Post-game
            </Link>{" "}
            page.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            See it played: official combat and a beginner walkthrough
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Two videos with verified English captions that show the loop in motion. The first is
            Nintendo&apos;s own Treehouse battle demo; the second is a creator early-game guide. The
            notes below were transcribed from their English subtitles.
          </p>

          <div className="mx-auto max-w-3xl space-y-2 overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="ayC2vnT_fXY"
              title="Fire Emblem: Fortune's Weave – Battle Gameplay – Nintendo Treehouse: Live"
            />
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Coverage by <span className="font-medium text-gray-800 dark:text-gray-200">Nintendo of America</span> &middot; Verified English Captions
            </div>
          </div>

          <div className="mx-auto max-w-3xl space-y-2 overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="lzaIu8nb7Q4"
              title="Fire Emblem Fortune's Weave EARLY GAME GUIDE (20+ Tips)"
            />
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Coverage by <span className="font-medium text-gray-800 dark:text-gray-200">Jay Dunna</span> &middot; Verified English Captions
            </div>
          </div>

          <div className="mx-auto max-w-3xl space-y-2 overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="pmQIzdXSqYk"
              title="Fire Emblem Fortune's Weave Review After 57 Hours (part 1)"
            />
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Coverage by <span className="font-medium text-gray-800 dark:text-gray-200">PlayerEssence</span> &middot; Verified English Captions
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            A long-play reviewer&apos;s impressions of the same loop: the game runs two battle systems —
            the classic grid SRPG and the Clash system (pick one unit, chain combos, group HP,
            counterattack loop) — with dungeon crawling that mines resources and replenishes over time,
            and a class system you can max and re-spec. Difficulty ranges from Normal to Hard Classic,
            where keeping every unit alive changes the whole tone (transcribed from the English
            subtitles).
          </p>

          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/5 dark:bg-white/5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                What the official demo shows
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-xs text-gray-600 dark:text-gray-400">
                <li>
                  Battle maps play like a board game: each unit moves a set number of spaces, can
                  attack, some have support moves, and may wait a turn.
                </li>
                <li>
                  Placement is the puzzle — the danger radius (red arrows) shows where enemies can
                  reach, so keep fragile units out of it.
                </li>
                <li>
                  Unit roles differ: tankier units block and absorb hits up front, while magic users
                  are strong but fragile and best kept behind a wall while attacking at range.
                </li>
              </ul>
            </div>
            <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/5 dark:bg-white/5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                What the beginner guide covers
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-xs text-gray-600 dark:text-gray-400">
                <li>
                  Plan each Free Time around the turn limit: the arena (skill training), inn
                  (supports), temple (blessing) and port (item trade) are recurring priorities.
                </li>
                <li>Bird-time missions and bulletin-board quests are easy to skip but worth doing every cycle.</li>
                <li>
                  Class changes are gated by renown and can be revisited, so experiment with weapon
                  and class builds.
                </li>
                <li>
                  Finishing a route once unlocks the Boons of Salvation, which boost experience and
                  lower item costs on later runs (the creator&apos;s recommendation).
                </li>
              </ul>
            </div>
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
                <dd className="mt-1 text-gray-700 dark:text-gray-300">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Where to go next</h2>
          <p className="text-gray-700 dark:text-gray-300">
            The mechanical detail behind every system above is on the{" "}
            <Link className="font-medium text-[#8a6d2f] underline decoration-dotted dark:text-[#d3b475]" href="/systems/">
              Core Systems
            </Link>{" "}
            page, the roster and recruitment conditions are on the{" "}
            <Link className="font-medium text-[#8a6d2f] underline decoration-dotted dark:text-[#d3b475]" href="/characters/">
              Characters
            </Link>{" "}
            page, and the class tiers are on the{" "}
            <Link className="font-medium text-[#8a6d2f] underline decoration-dotted dark:text-[#d3b475]" href="/classes/">
              Classes
            </Link>{" "}
            page. For the route and chapter path, see the{" "}
            <Link className="font-medium text-[#8a6d2f] underline decoration-dotted dark:text-[#d3b475]" href="/walkthrough/">
              Walkthrough
            </Link>
            .
          </p>
        </section>
      </main>
    </>
  );
}
