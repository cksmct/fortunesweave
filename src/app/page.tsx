import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import HeroMediaFacade from "@/components/HeroMediaFacade";
import NativeBannerAd from "@/components/NativeBannerAd";
import { JsonLd } from "@/components/JsonLd";
import { getGameConfig } from "@/lib/data";
import {
  buildBreadcrumbSchema,
  generateFAQSchema,
  generateSEOMetadata,
  generateVideoGameSchema,
} from "@/lib/seo";
import updatesData from "@/data/updates.json";

const config = getGameConfig();
const latest = updatesData.updates[0];

/**
 * 首页 FAQ。答案遵循「证据优先」四段式：当前答案 -> 来源与日期 -> 字段级不确定 -> 下一步动作。
 * 严禁出现把发布方能力缺口当版面的句式（audit-trust-copy.mjs 会拦）。
 */
const FAQS = [
  {
    question: "Is this an official Fire Emblem: Fortune\u0027s Weave site?",
    answer:
      "No. fortunesweave.online is an independent fan reference, not affiliated with, endorsed by or sponsored by Nintendo or Intelligent Systems. The official product page is on nintendo.com and is linked from the footer.",
  },
  {
    question: "Which version of the game is this written for?",
    answer:
      "Version 1.0.1, the launch-day update released on September 17, 2026, together with the free collaboration-weapon update that shipped the same day. Patch-level changes are tracked on the updates page.",
  },
  {
    question: "How is data sourced when this game cannot be datamined?",
    answer:
      "Every row lists its sources, an evidence tier and the date it was last checked. Rows that two independent sources agree on carry the Cross-checked tier; single-source rows carry Source-reported. Where guides disagree, both figures are printed with their own dates instead of being averaged.",
  },
  {
    question: "What is the most commonly missed content?",
    answer:
      "Paralogues, quest materials with deadlines, and support ranks. Part I paralogues open inside chapter windows, and several stay closed once that window passes, so they are the first thing the checklists track.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Fire Emblem: Fortune\u0027s Weave Guide & Wiki",
  description:
    "An independent Fire Emblem: Fortune\u0027s Weave companion: character, class, paralogue, gift and material data with a source and a date on every row.",
  path: "/",
});

const FLAME_LORDS = [
  {
    name: "Cai",
    title: "The Ashen Flame",
    tagline: "Frontline vanguard commanding lethal Blaze Arts that burn health for catastrophic bursts.",
    chapters: "12 Chapters + Shared War Act",
    focus: "Offensive Melee & Blaze Scaling",
    badge: "Aggressive",
  },
  {
    name: "Dietrich",
    title: "The Iron Sovereign",
    tagline: "Stalwart shieldmaster anchoring fortified battle lines and counter-clash certifications.",
    chapters: "12 Chapters + Shared War Act",
    focus: "Defense Formations & Shield Ranks",
    badge: "Defensive",
  },
  {
    name: "Theodora",
    title: "The Gilded Strategist",
    tagline: "Diplomatic aristocrat mastering recruit negotiations, renown influence and support synergy.",
    chapters: "12 Chapters + Shared War Act",
    focus: "Negotiations & Renown Ranks",
    badge: "Tactical",
  },
  {
    name: "Leda",
    title: "The Mystic Weaver",
    tagline: "Ancient weave magus unlocking occult paralogues, high-tier spells and relic synchrony.",
    chapters: "12 Chapters + Shared War Act",
    focus: "Occult Spells & Paralogue Keys",
    badge: "Arcane",
  },
];

const DATABASES = [
  {
    title: "Characters",
    href: "/characters/",
    desc: "Every playable unit with recruitment conditions, stats and optimal class progressions.",
    tag: "Recruitment",
  },
  {
    title: "Classes",
    href: "/classes/",
    desc: "Every tier, certification exam requirement, weapon affinity and promotion curve.",
    tag: "Tiers & Skills",
  },
  {
    title: "Materials",
    href: "/materials/",
    desc: "Leaf ingredients, exploration gathering spots, quest deadlines and recipe requirements.",
    tag: "Deadlines",
  },
  {
    title: "Gifts",
    href: "/gifts/",
    desc: "The complete catalog with like and dislike reactions across all four houses.",
    tag: "Supports",
  },
  {
    title: "Supports & Romance",
    href: "/supports/",
    desc: "Rank unlock thresholds, conversational branches and verified romance conclusions.",
    tag: "Endings",
  },
  {
    title: "Paralogues",
    href: "/paralogues/",
    desc: "Time-gated side missions, missable unlock windows and unique relic rewards.",
    tag: "Missable",
  },
  {
    title: "Pale Raven Activities",
    href: "/activities/",
    desc: "Free-time schedules, bird time intervals, minigame rewards and conversation choices.",
    tag: "Free-Time",
  },
  {
    title: "Equipment & Relics",
    href: "/equipment/",
    desc: "Cursed objects, legendary forge items, weapon stat caps and drop requirements.",
    tag: "Weapons",
  },
  {
    title: "Locations & Dungeons",
    href: "/locations/",
    desc: "Map schematic nodes, dungeon encounters, Clash battle arenas and loot chests.",
    tag: "Exploration",
  },
];

const TOOLS = [
  {
    name: "Paralogue Checklist",
    href: "/tools/paralogue-checklist/",
    desc: "Interactive tracker flagging missable chapter windows to prevent lockout.",
  },
  {
    name: "Drink Recipe Solver",
    href: "/tools/recipe-solver/",
    desc: "Input inventory ingredients to compute valid buff drinks instantly.",
  },
  {
    name: "Gift Finder",
    href: "/tools/gift-finder/",
    desc: "Filter best gifts by character to optimize support points per tea time.",
  },
  {
    name: "Recruitment Planner",
    href: "/tools/recruitment-planner/",
    desc: "Calculate required renown, stat thresholds and conversation choices.",
  },
  {
    name: "Class Certification Planner",
    href: "/tools/class-planner/",
    desc: "Plot unit certification exam odds and skill proficiency pathways.",
  },
  {
    name: "Support Matrix",
    href: "/tools/support-matrix/",
    desc: "Cross-reference pairing compatibility and combat bond modifiers.",
  },
  {
    name: "Bird Time Lookup",
    href: "/tools/bird-time/",
    desc: "Search character activity schedules and high-yield encounter intervals.",
  },
];

export default function HomePage() {
  const faqSchema = generateFAQSchema(FAQS);
  const breadcrumbSchema = buildBreadcrumbSchema([{ name: "Home", item: "/" }]);
  const videoGameSchema = generateVideoGameSchema();

  return (
    <>
      <JsonLd data={[videoGameSchema, breadcrumbSchema, faqSchema]} />
      <PageHeader
        accent="gold"
        eyebrow={
          <span className="tag-brass shadow-sm">
            <span className="glow-dot-gold" />
            Independent Reference · v{config.game.currentVersion}
          </span>
        }
        title={
          <>
            Fire Emblem: Fortune&apos;s Weave
            <span className="block text-[#d3b475] mt-1 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Tactical Archives, Solvers &amp; Patch Notes
            </span>
          </>
        }
        description="Every character, class, paralogue, gift and material published here carries its own sources and check date, so you can see how a figure was established before you act on it."
        path="/"
        actions={
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
            <Link href="#databases" className="btn-brass w-full">
              Explore 9 Databases
            </Link>
            <Link href="/updates/" className="btn-tactical w-full">
              Patch Timeline (v{config.game.currentVersion})
            </Link>
          </div>
        }
        heroMedia={
          <div className="flex flex-col gap-3 w-full">
            <HeroMediaFacade />
            {/* 2x2 Bento Metric Cards balancing the left column height */}
            <div className="grid grid-cols-2 gap-2.5 w-full">
              <div className="tactical-card p-3 sm:p-3.5 border-l-2 border-l-[#d3b475]">
                <div className="text-[10px] font-bold tracking-wider uppercase text-[#bbc1cf]">
                  Current Build
                </div>
                <div className="text-sm font-extrabold text-[#f5f1eb] mt-0.5 flex items-center gap-1.5">
                  <span className="glow-dot-gold" />
                  v{config.game.currentVersion}
                </div>
              </div>
              <div className="tactical-card p-3 sm:p-3.5 border-l-2 border-l-[#38bdf8]">
                <div className="text-[10px] font-bold tracking-wider uppercase text-[#bbc1cf]">
                  Flame Lords
                </div>
                <div className="text-sm font-extrabold text-[#f5f1eb] mt-0.5">
                  4 Epic Routes
                </div>
              </div>
              <div className="tactical-card p-3 sm:p-3.5 border-l-2 border-l-[#a855f7]">
                <div className="text-[10px] font-bold tracking-wider uppercase text-[#bbc1cf]">
                  Databases
                </div>
                <div className="text-sm font-extrabold text-[#f5f1eb] mt-0.5">
                  9 Verified
                </div>
              </div>
              <div className="tactical-card p-3 sm:p-3.5 border-l-2 border-l-[#10b981]">
                <div className="text-[10px] font-bold tracking-wider uppercase text-[#bbc1cf]">
                  Tactical Tools
                </div>
                <div className="text-sm font-extrabold text-[#f5f1eb] mt-0.5">
                  7 Interactive
                </div>
              </div>
            </div>
          </div>
        }
      />

      <main className="container-site space-y-16 py-12 sm:py-16">
        {/* Section 1: What Fortune's Weave Is & Four Flame Lords */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <span className="tag-brass mb-2">Campaign Architecture</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f5f1eb] tracking-tight">
                What Fire Emblem: Fortune&apos;s Weave is
              </h2>
            </div>
            <p className="text-xs text-[#bbc1cf] max-w-md">
              Intelligent Systems developed it and Nintendo published it as a Nintendo Switch 2
              exclusive on September 17, 2026 ($69.99 digital / $79.99 physical).
            </p>
          </div>

          <div className="text-sm leading-relaxed text-[#bbc1cf] space-y-3">
            <p>
              Fire Emblem: Fortune&apos;s Weave is the eighteenth mainline entry in the Fire Emblem
              series. The campaign splits into four routes, one for each Flame Lord: Cai, Dietrich,
              Theodora and Leda. Each route runs twelve chapters, followed by a shared six-chapter war
              act and a closing act.
            </p>
            <p>
              The systems players plan around include support conversations and romance, certification
              exams that change class, a calendar-driven free-time phase, dungeon exploration with its
              own Clash battle system, and Blaze Arts that spend the user&apos;s own HP. Recruitment is
              more conditional than in most entries in the series: units join on route-specific
              combinations of support level, renown rank and negotiation steps.
            </p>
          </div>

          {/* 4 Flame Lords Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {FLAME_LORDS.map((lord) => (
              <div
                key={lord.name}
                className="tactical-card p-5 flex flex-col justify-between group hover:border-[#d3b475]/60"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#d3b475] bg-[#d3b475]/10 px-2 py-0.5 rounded-full border border-[#d3b475]/30">
                      {lord.badge}
                    </span>
                    <span className="text-xs font-semibold text-[#bbc1cf] font-mono">Flame Lord</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#f5f1eb] group-hover:text-[#d3b475] transition-colors">
                    {lord.name}
                  </h3>
                  <div className="text-xs font-semibold text-[#d3b475] mb-2">{lord.title}</div>
                  <p className="text-xs text-[#bbc1cf] leading-relaxed mb-4">{lord.tagline}</p>
                </div>
                <div className="pt-3 border-t border-white/[0.06] text-xs space-y-1 text-[#bbc1cf]">
                  <div className="flex justify-between">
                    <span>Route Length:</span>
                    <span className="text-[#f5f1eb] font-medium">{lord.chapters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tactical Focus:</span>
                    <span className="text-[#d3b475] font-medium">{lord.focus}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 黄金次屏 Adsterra 原生信息流广告位 */}
        <NativeBannerAd />

        {/* Section 2: Command Databases (9 Items, 3x3 Bento Grid) */}
        <section id="databases" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <span className="tag-brass mb-2">Primary Registers</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f5f1eb] tracking-tight">
                Command Databases
              </h2>
            </div>
            <p className="text-xs text-[#bbc1cf] max-w-md">
              Nine verified databases cover the systems easiest to lose track of. Each row carries
              its own verification date and primary evidence tier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DATABASES.map((db) => (
              <Link
                key={db.title}
                href={db.href}
                className="tactical-card p-5 group flex flex-col justify-between hover:border-[#d3b475]/50 hover:bg-[#1b2130]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#d3b475] bg-[#d3b475]/10 px-2 py-0.5 rounded-full border border-[#d3b475]/20">
                      {db.tag}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-[#bbc1cf] group-hover:text-[#d3b475] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    >
                      &rarr;
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#f5f1eb] group-hover:text-[#d3b475] transition-colors">
                    {db.title}
                  </h3>
                  <p className="text-xs text-[#bbc1cf] leading-relaxed mt-2">{db.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.06] text-xs font-semibold text-[#d3b475] flex items-center justify-between">
                  <span>Browse register</span>
                  <span className="text-xs font-medium text-[#bbc1cf]">Verified 2026</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 3: Interactive Tactical Solvers (7 Tools) */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <span className="tag-brass mb-2">Client-Side Engines</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f5f1eb] tracking-tight">
                Interactive Tactical Tools
              </h2>
            </div>
            <p className="text-xs text-[#bbc1cf] max-w-md">
              Seven client-side tools run in your browser and preserve progress in local storage. No
              game saves or user inputs are uploaded anywhere.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {TOOLS.map((tool, idx) => (
              <Link
                key={tool.name}
                href={tool.href}
                className={`tactical-card p-4 group flex flex-col justify-between hover:border-[#38bdf8]/60 ${
                  idx === 0 ? "sm:col-span-2 lg:col-span-2 bg-[#1b2130]" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-[#38bdf8] flex items-center gap-1">
                      <span className="glow-dot-cyan" />
                      TOOL 0{idx + 1}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-[#bbc1cf] group-hover:text-[#38bdf8] group-hover:translate-x-0.5 transition-all text-sm"
                    >
                      &rarr;
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#f5f1eb] group-hover:text-[#38bdf8] transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-[#bbc1cf] leading-relaxed mt-1.5">{tool.desc}</p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-white/[0.06] text-xs font-medium text-[#bbc1cf]">
                  Runs offline in browser
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 4: Three-Tier Evidence & Provenance Standard */}
        <section className="space-y-6">
          <div className="border-b border-white/[0.08] pb-4">
            <span className="tag-brass mb-2">Trust Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f5f1eb] tracking-tight">
              How Every Row is Sourced
            </h2>
            <p className="text-sm text-[#bbc1cf] mt-2 max-w-2xl">
              Because Nintendo Switch 2 titles cannot be datamined at launch, this repository uses
              strict tiered evidence standards. When guides disagree, both figures are printed side
              by side with their own check dates instead of being averaged.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="tactical-card p-5 border-t-2 border-t-[#10b981]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#10b981] mb-1">
                Official Tier
              </div>
              <h3 className="text-base font-bold text-[#f5f1eb] mb-2">Direct Documentation</h3>
              <p className="text-xs text-[#bbc1cf] leading-relaxed">
                Extracted directly from Nintendo store listings, official Nintendo Direct broadcasts,
                or developer patch notes. Holds primary authority.
              </p>
            </div>
            <div className="tactical-card p-5 border-t-2 border-t-[#38bdf8]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#38bdf8] mb-1">
                Cross-Checked Tier
              </div>
              <h3 className="text-base font-bold text-[#f5f1eb] mb-2">Multi-Source Consensus</h3>
              <p className="text-xs text-[#bbc1cf] leading-relaxed">
                Two or more independent community playthroughs or guides agree on the exact figure on
                the same day. Discrepancies are preserved.
              </p>
            </div>
            <div className="tactical-card p-5 border-t-2 border-t-[#eab308]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#eab308] mb-1">
                Source-Reported Tier
              </div>
              <h3 className="text-base font-bold text-[#f5f1eb] mb-2">Single Verified Lead</h3>
              <p className="text-xs text-[#bbc1cf] leading-relaxed">
                One credible source has documented the interaction. Flagged with pending consensus
                until second-party verification is completed.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Current Version Banner */}
        <section className="tactical-card p-6 border-l-4 border-l-[#d3b475] bg-gradient-to-r from-[#1b2130] to-[#121824] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="glow-dot-gold" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#d3b475]">
                Version Invariant
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#f5f1eb]">
              Written against Version {config.game.currentVersion}
            </h3>
            <p className="text-xs text-[#bbc1cf] max-w-xl">
              Latest tracked update: <strong className="text-[#f5f1eb]">{latest.title}</strong> (
              {latest.date}) — {latest.headline}. Full patch chronology is maintained on the timeline.
            </p>
          </div>
          <Link href="/updates/" className="btn-brass whitespace-nowrap shrink-0">
            View Patch Timeline
          </Link>
        </section>

        {/* Section 6: Frequently Asked Questions */}
        <section className="space-y-6">
          <div className="border-b border-white/[0.08] pb-4">
            <span className="tag-brass mb-2">Player Inquiries</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f5f1eb] tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((item) => (
              <details
                key={item.question}
                className="tactical-card p-4 group open:border-[#d3b475]/40 transition-colors"
              >
                <summary className="font-semibold text-sm sm:text-base text-[#f5f1eb] cursor-pointer flex items-center justify-between list-none">
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className="text-[#d3b475] font-bold text-lg group-open:rotate-45 transition-transform shrink-0 ml-3"
                  >
                    +
                  </span>
                </summary>
                <div className="mt-3 pt-3 border-t border-white/[0.06] text-xs sm:text-sm text-[#bbc1cf] leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
