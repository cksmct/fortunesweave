import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import NativeBannerAd from "@/components/NativeBannerAd";
import { JsonLd } from "@/components/JsonLd";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import farmingData from "@/data/farming.json";

const mechanics = farmingData._mechanics;
const uses = farmingData.uses;
const gaps = farmingData._openGaps;

const confirmed = mechanics.filter((entry) => entry.grade === "cross-checked");
const plotGate = mechanics.find((entry) => entry.key === "plots");

const FAQS = [
  {
    question: "Who can farm crops in Fortune\u0027s Weave?",
    answer:
      "Cai. Crop farming is his world map mechanic and it opens when his Part I route reaches Chapter 6, at which point an empty unmarked pentagon-shaped tile appears on the map for you to plant in.",
  },
  {
    question: "How many plots can you farm at once?",
    answer:
      "How many crops grow at once is set by Renown rather than by story progress: one plot at Renown 6 or below, two from Renown 7, and three from Renown 9. Renown is the account-wide stat, so a low-Renown run stays at one plot no matter how far the story has moved.",
  },
  {
    question: "Where do seeds come from?",
    answer:
      "There are no separate seed items. You plant crops you already hold in your bag through the Farm option, and every source checked stops short of saying how the first crops are obtained, which is why this page states that gap rather than inventing a vendor.",
  },
  {
    question: "What are crops actually for?",
    answer:
      "Four things: quest item requests, trading with the Vandahl Trading Co. merchants for weapons and accessories, restoring HP and spell uses at dungeon Rest Spots, and feeding the Pale Raven each week to start Bird Time.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Crop Farming and Crops",
  description:
    "How crop farming works in Fire Emblem: Fortune\u0027s Weave: the Cai-only plots, the Renown gates, fertiliser from the stable and what crops are traded for.",
  path: "/farming/",
});

export default function FarmingPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Farming", item: "/farming/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Crop Farming and Crops"
        description="The Cai-only farming loop, the Renown gates that decide how many crops you can grow, and the four things crops are actually traded for."
        path="/farming/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            A five-minute loop with four different payoffs
          </h2>
          <p>
            Crop farming is Cai&apos;s world map mechanic and it arrives at Part I Chapter 6, when an
            empty pentagon-shaped tile appears on the map with nothing marking it as a farm. You plant a
            crop you already carry, pass turns, and come back to a full growth gauge and a harvest. The
            tile then regrows a few more times before it empties, which is what turns the mechanic from a
            novelty into a routine.
          </p>
          <p>
            The reason it matters beyond money is that crops feed three other systems at once. They pay
            quest item requests, they buy weapons and accessories from the Vandahl Trading Co. merchants,
            and inside dungeons they restore HP and spell uses at Rest Spots. Most importantly, a crop is
            the weekly food that starts Pale Raven Bird Time, so a farming habit is really a support
            habit for Eshmel.
          </p>
          <p>
            {"What holds the loop back is Renown rather than chapter count. " +
              (plotGate ? plotGate.value : "") +
              " Renown is the account-wide stat, so the plot count is a progression check that no amount of in-route grinding changes."}
          </p>
        </section>

        {/* 黄金次屏 Adsterra 原生信息流广告位 */}
        <NativeBannerAd />

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Every recorded mechanic
          </h2>
          <p>
            {"Each row carries its own confidence level, because the community write-up behind most of this states its figures are unverified and names its own source. " +
              confirmed.length +
              " of the " + mechanics.length +
              " rows are confirmed by a second, independent publication: the pentagon planting tile and the wait-then-harvest loop."}
          </p>
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
            What crops are spent on
          </h2>
          <div className="space-y-4">
            {uses.map((entry) => (
              <article key={entry.id} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{entry.purpose}</h3>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{entry.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What no source has recorded yet
          </h2>
          <p>
            These are gaps in the public record rather than in this page, and they are listed because a
            farming guide that quietly omits the crop names while promising yields would be worse than
            useless: it would look complete.
          </p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            {gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
          <p className="text-gray-700 dark:text-gray-300">
            Fertiliser is worth one extra sentence, since it is the part players ask about. It comes from
            the stable or from a failed animal capture, and applying it raises the odds of a rarer crop at
            harvest. Nobody has published how much it raises them by, so the honest advice is simply to
            use it rather than to hoard it.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Watch a farming walkthrough
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            A captioned, no-spoilers walkthrough of the Flame Lord&apos;s harvesting mechanic, transcribed
            from its English subtitles.
          </p>
          <div className="mx-auto max-w-3xl space-y-2 overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="2byl5NWP2xQ"
              title="Watch This Before You Start Farming in Fire Emblem: Fortune's Weave (No Spoilers, Gameplay Guide)"
            />
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Coverage by <span className="font-medium text-gray-800 dark:text-gray-200">Faerghast</span> &middot; Verified English Captions
            </div>
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
            <li>Plant any vegetable on a pentagon-marked plot; after a few map moves the crop is ready and is auto-harvested as you pass through the tile.</li>
            <li>Each harvest yields a stack of the planted crop, or occasionally a rare local variety, and a plot wears out after several harvests.</li>
            <li>Fertiliser (from the stable or a failed animal capture) raises the odds of a rare crop, but it replaces the planted crop with that rare variant rather than adding to it.</li>
            <li>The harvest is meant for barter with the Vandal Trading Company merchants spread across the map.</li>
          </ul>
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
            Farming sits next to two other Cai systems on this site: the mounts page covers the stable
            that produces the fertiliser, and the Bird Time page covers what the weekly crop is spent on.
          </p>
        </section>
      </main>
    </>
  );
}
