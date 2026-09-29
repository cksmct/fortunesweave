import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import crestsData from "@/data/crests.json";
import YouTubeEmbed from "@/components/YouTubeEmbed";

const crests = crestsData.crests;
const mechanics = crestsData._mechanics as Record<string, string>;
const cursed = crestsData._cursedObjects;
const blaze = crestsData._blazeArts;
const arts = crestsData._combatArts;
const gaps = crestsData._openGaps;

const held = crests.filter((crest) => crest.bearerCount > 0);
const free = crests.filter((crest) => crest.bearerCount === 0);
const named = Array.from(new Set(crests.flatMap((crest) => crest.bearers))).sort((x, y) =>
  x.localeCompare(y)
);

const FAQS = [
  {
    question: "What is a Diadem in Fortune\u0027s Weave?",
    answer:
      "A Diadem is what crests are called in Dagdan culture, and the same thing is also called a Bloodmark or a Godmark. Twenty-two named crests exist across the series, and twelve of them have a bearer confirmed in this game.",
  },
  {
    question: "Why does my unit have a crest effect without holding the relic?",
    answer:
      "Because some bearers have the cursed object embedded in their body rather than in their hands. Cai and Theodora carry one that way, so they run the Gautier Diadem, Duality, with any weapon at all. Talimun\u0027s gait behaviour points the same way.",
  },
  {
    question: "How do crest effects trigger?",
    answer:
      "Every recorded crest effect is a chance on attack expressed as a percentage, from Blaiddyd at three percent for a 1.5x damage multiplier to Gautier at twenty-five percent for +3 Attack. A crest is a reliability curve rather than a flat stat, which is why a low trigger rate on a large multiplier is still worth planning around.",
  },
  {
    question: "What are Blaze Arts and do they cost anything?",
    answer:
      "Blaze Arts are the super-move class of action and they are paid for in HP. Every use fills a gauge, and once that gauge fills the unit\u0027s maximum HP is reduced permanently, which makes them a limited, high-risk resource rather than a rotation.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Crests, Diadems and Blaze Arts",
  description:
    "Every Fire Emblem: Fortune\u0027s Weave crest with its Dagdan Diadem name, bearer, trigger rate and relic, plus cursed objects and how Blaze Arts cost HP.",
  path: "/crests/",
});

export default function CrestsPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Crests", item: "/crests/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Crests, Diadems and Blaze Arts"
        description="All 22 named crests with their Dagdan names, the 12 with a bearer in this game, the trigger rate of each effect, and why Blaze Arts cost HP."
        path="/crests/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What a crest is in this game
          </h2>
          <p>
            {mechanics.naming}
          </p>
          <p>
            {mechanics.scope +
              " That split matters for reading the table: a crest with no bearer is still a real crest, and treating an empty row as a data gap would be wrong."}
          </p>
          <p>{mechanics.trigger}</p>
          <p>{mechanics.stigma}</p>
          <p>
            {mechanics.relics} {"Relics are named for all " + crests.length + " crests here, and not one of them has its effect recorded yet."}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The crest table
          </h2>
          <p>
            {"Twelve of the " + crests.length + " crests have a bearer in this game, and they belong to " + named.length +
              " named characters: " + named.join(", ") + ". The remaining " + free.length +
              " crests are recorded by lineage with no bearer here, because they belong to the wider series rather than to this cast."}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                  <th className="py-2 pr-4">Crest</th>
                  <th className="py-2 pr-4">Diadem</th>
                  <th className="py-2 pr-4">Bearer</th>
                  <th className="py-2 pr-4">Effect</th>
                  <th className="py-2 pr-4">Rate</th>
                  <th className="py-2">Relic</th>
                </tr>
              </thead>
              <tbody>
                {crests.map((crest) => (
                  <tr key={crest.id} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                      {crest.name}
                      {crest.unverified ? (
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">unverified</span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                      {crest.diadem === "" ? "Not recorded" : crest.diadem}
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                      {crest.bearerCount === 0 ? "No bearer in this game" : crest.bearers.join(", ")}
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                      {crest.effect === "" ? "Not recorded" : crest.effect}
                      {crest.note ? (
                        <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">
                          {crest.note}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                      {crest.triggerRate === null ? "Not recorded" : Math.round(crest.triggerRate * 100) + "%"}
                    </td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">{crest.relic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Cursed objects and the bodies they sit in
          </h2>
          <p>{cursed.summary}</p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            {cursed.carriers.map((line: string) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="text-gray-700 dark:text-gray-300">{cursed.naming}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Blaze Arts and Combat Arts
          </h2>
          <p>
            {"These two sit next to crests because both read as extensions of the bearer rather than as ordinary weapons. " +
              blaze.what +
              " " +
              blaze.gauge +
              " " +
              blaze.consequence}
          </p>
          <p>
            {"Combat Arts work the other way round: " + arts.what + " " + arts.inheritance}
          </p>
          <p className="text-gray-700 dark:text-gray-300">{blaze.gap}</p>
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
            The practical upshot for planning is that crests are a bonus you take what you get from rather than
            a system you build around: the trigger rates are fixed, the bearers are fixed, and no source
            describes a way to change either.
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
            Crests and the classes they sit in overlap on the classes page, and the relics that pair with them
            are recorded on the weapons page.
          </p>
        </section>
        {/* Video intel: A47qU4jrjuE */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; verified English captions
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Two personal abilities per unit</h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-200">BenFM</span> &middot;{" "}
              <span className="font-mono">A47qU4jrjuE</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed videoId="A47qU4jrjuE" title="Personal Skill and Crest/Bloodmark Guide (No Spoilers) - Fortune's Weave" />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">BenFM runs the whole roster's personal abilities alongside the crest and Bloodmark layer in one captioned video, which is the context the crest table above sits in.</p>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><span className="font-semibold text-zinc-200">The pattern.</span> Every unit starts with one personal ability and gains a second later in the run, and for most of the roster that second ability arrives at level 20.</li>
              <li><span className="font-semibold text-zinc-200">The upgrade.</span> Most personal abilities are then replaced by a stronger version at level 35, so the unit at 20 and the unit at 35 are not the same build.</li>
              <li><span className="font-semibold text-zinc-200">The lords differ.</span> The four Flame Lords gain their second personal ability earlier, and it never upgrades, which is why the creator keeps their kits separate from the rest of the roster.</li>
              <li><span className="font-semibold text-zinc-200">Blaze Art synergy.</span> He reads Cai's second ability as leaving him and his allies unharmed by the underworld flames his Blaze Arts create and halving damage taken inside them, which turns a hazard into a defensive tile.</li>
          </ul>
        </section>

      </main>
    </>
  );
}
