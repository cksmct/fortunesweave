import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import NativeBannerAd from "@/components/NativeBannerAd";
import { JsonLd } from "@/components/JsonLd";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import guidesData from "@/data/quest-guides.json";

const guides = guidesData.guides;
const mechanics = guidesData._mechanics as Record<string, string>;

const GRADE_LABEL: Record<string, string> = {
  official: "Official",
  "cross-checked": "Cross-checked",
  "source-reported": "Source-reported",
  "community-reported": "Source-reported",
};

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

function findGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = findGuide(slug);
  if (!guide) return {};
  return generateSEOMetadata({
    title: guide.name,
    description:
      "Where the four goddess statues of the " +
      guide.name +
      " subquest sit, with routes, rewards and the source conflict.",
    path: "/sidequests/" + guide.slug + "/",
  });
}

export default async function QuestGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = findGuide(slug);
  if (!guide) notFound();

  const sources = guide.sources;
  const gradeLabel = GRADE_LABEL[guide.grade] || "Source-reported";

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Subquests", item: "/sidequests/" },
            { name: guide.name, item: "/sidequests/" + guide.slug + "/" },
          ]),
          generateFAQSchema(guide.faqs),
        ]}
      />
      <PageHeader
        title={"Legacy of a Legendary Sculptor: all four statues"}
        description="The riddle names a temple, a pass, a grassland and a lake. This is where each of the four goddess statues actually sits, in the order that costs the least travel."
        path={"/sidequests/" + guide.slug + "/"}
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            A hunt across four corners of the map
          </h2>
          <p>
            {"Legacy of a Legendary Sculptor is a " + guide.kind.toLowerCase() + " recorded in " + guide.chapter + " of Fire Emblem: Fortune's Weave. It is not a battle and not a boss: the subordinate of General Senghor hands over a riddle about four statues of the Dagdan goddesses, and the army then has to find all four on the world map before reporting back."}
          </p>
          <p>{guide.clue}</p>
          <p>{mechanics.searchPoints}</p>
          <p>{mechanics.icons}</p>
          <p>{mechanics.timing}</p>
        </section>        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The four statues, in the cheapest order
          </h2>
          <p>
            {"Travel is the whole cost of this subquest, so the order below starts with the two statues inside the capital's reach and ends with the long run south. Every place named here appears in both sources, which is why this page can state them as a list rather than as a guess."}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 pr-4 font-semibold text-gray-900 dark:text-gray-100">Clue</th>
                  <th className="py-3 pr-4 font-semibold text-gray-900 dark:text-gray-100">Place</th>
                  <th className="py-3 pr-4 font-semibold text-gray-900 dark:text-gray-100">Statue</th>
                  <th className="py-3 font-semibold text-gray-900 dark:text-gray-100">Route in</th>
                </tr>
              </thead>
              <tbody>
                {guide.statues.map((statue) => (
                  <tr key={statue.order} className="border-b border-gray-100 align-top dark:border-gray-800">
                    <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">{statue.clue}</td>
                    <td className="py-3 pr-4 font-medium text-gray-900 dark:text-gray-100">{statue.place}</td>
                    <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">{statue.statue}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{statue.route}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="space-y-3">
            {guide.statues.map((statue) => (
              <li key={statue.order} className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {"Statue " + statue.order + ", " + statue.statue + " at " + statue.place + ". "}
                </span>
                {statue.where + " " + statue.extra}
              </li>
            ))}
          </ul>
        </section>

        {/* 黄金次屏 Adsterra 原生信息流广告位 */}
        <NativeBannerAd />

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Step order that avoids a second crossing
          </h2>
          <p>
            {"The four search points can be collected in any order, but two of them are close together and two are not. Working north first and finishing in the south means one crossing of the map instead of three."}
          </p>
          <ol className="list-decimal space-y-2 pl-6 text-gray-700 dark:text-gray-300">
            {guide.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What it gives, and where the sources disagree
          </h2>
          <p>
            {"Both sources agree that the subquest pays Renown and three manuals, and both agree that the three manuals are the reason to do it. They do not agree on which three. One records a heavy-armor, a riding and a flying manual together with five thousand gold and a hundred Renown. The other records three different experience manuals and no gold line at all."}
          </p>
          <p>
            {"This page keeps both figures side by side instead of choosing, because neither source explains the difference and a wrong pick would send a player looking for a payout that does not arrive. The deadline list on the subquests page carries the manual-and-gold figure, and the reward line above it is the source of the split."}
          </p>
          <p>{guide.whyItMatters}</p>
        </section>        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Four things that save a trip
          </h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            {guide.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; creator walkthrough
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                The sculptor quest, start to finish
              </h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-200">Joe Hammer Gaming</span> &middot;{" "}
              <span className="font-mono">cnYUzMclrjA</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed videoId="cnYUzMclrjA" title="Legacy Of A Legendary Sculptor - Fire Emblem Fortunes Weave" />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {"A seventy second run of the same subquest, transcribed on 2026-09-30. It works the four legs in a different order from the written sources and names the travel points out loud: the grass node beside Dagsion for Jurah, then north to the pass for Kalla, then the temple reached from the posthouse east of Amalthea, then the lake from the southern posthouse. Where it spells a place differently, this page keeps the written spelling and notes the variant."}
          </p>
        </section>
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; second walkthrough
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                The same quest from a second channel
              </h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-200">Lucca</span> &middot;{" "}
              <span className="font-mono">IOlzIenQe5o</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed videoId="IOlzIenQe5o" title="Lost Goddesses Found: Fortune’s Weave Sculptor Quest" />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {"A four minute tour on a small channel, transcribed on 2026-09-30. It is short on route detail but long on the two facts that matter: it repeats the backpack icon at the temple node, and it records the reward as five thousand gold, a hundred Renown and manuals that unlock skill options, which makes it the third source on a reward the written walkthroughs disagree about."}
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What the two video walkthroughs add
          </h2>
          <p>{guide.creatorNotes.intro}</p>
          <ol className="space-y-2 text-gray-700 dark:text-gray-300">
            {guide.creatorNotes.routeAnchors.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
          <p className="font-semibold text-gray-900 dark:text-gray-100">Corroborated by the videos</p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            {guide.creatorNotes.corroborated.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="font-semibold text-gray-900 dark:text-gray-100">Still open</p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            {guide.creatorNotes.stillOpen.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Frequently asked questions
          </h2>
          <dl className="space-y-5">
            {guide.faqs.map((item) => (
              <div key={item.question}>
                <dt className="font-semibold text-gray-900 dark:text-gray-100">{item.question}</dt>
                <dd className="mt-1 text-gray-700 dark:text-gray-300">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Sources and open questions
          </h2>
          <p>
            {"Every place on this page comes from the sources below, all read or transcribed on " + guide.asOf + ", and the four statue locations match between all of them. The quest giver and the exact reward are the parts where the sources do not line up, which is why they are flagged rather than smoothed over. Two of the four sources are video walkthroughs whose English captions were transcribed on the same day, and the paragraph under each video says what that video added."}
          </p>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {sources.map((source) => (
              <li key={source.url}>
                <a
                  className="font-medium text-[#8a6d2f] underline decoration-dotted dark:text-[#d3b475]"
                  href={source.url}
                  rel="nofollow noopener"
                  target="_blank"
                >
                  {source.label}
                </a>
                <span className="text-gray-500 dark:text-gray-400">{" checked " + source.date}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {"Row grade: " + gradeLabel + ". Quests with a single source stay on the deadline list instead of getting a page."}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Where to go next</h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <Link className="font-medium text-[#8a6d2f] underline decoration-dotted dark:text-[#d3b475]" href="/sidequests/">
                All recorded subquests and the dates they expire
              </Link>
            </li>
            <li>
              <Link className="font-medium text-[#8a6d2f] underline decoration-dotted dark:text-[#d3b475]" href="/materials/">
                Paradise Fish and the other items the search points drop
              </Link>
            </li>
            <li>
              <Link className="font-medium text-[#8a6d2f] underline decoration-dotted dark:text-[#d3b475]" href="/deities/">
                The Dagdan goddesses named on the statues
              </Link>
            </li>
            <li>
              <Link className="font-medium text-[#8a6d2f] underline decoration-dotted dark:text-[#d3b475]" href="/map/">
                The schematic map used to plan the four crossings
              </Link>
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}