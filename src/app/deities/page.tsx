import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import deitiesData from "@/data/deities.json";

const deities = deitiesData.deities;
const mechanics = deitiesData._mechanics as Record<string, string>;
const gaps = deitiesData._openGaps;

const withDomain = deities.filter((deity) => deity.domain !== "Not recorded");
const blessers = deities.filter((deity) => deity.hasBlessingDiscount);

const FAQS = [
  {
    question: "Who are the gods in Fortune\u0027s Weave?",
    answer:
      "Twelve deities are named for Dagda: Sothis the Progenitor, Fortuna the goddess of fate, Aurora, Mars the god of military prowess, Kalla the goddess of hunting and the arts, Balor the god of the underworld, plus Smyrnos, Jurah, Credna, Yu Phas, Solel and Dagda himself.",
  },
  {
    question: "Who is the villain?",
    answer:
      "Balor, the god of the underworld, is the central antagonist of the game rather than a background name, which is why his name turns up in the Part III location list as the Temple of Balor.",
  },
  {
    question: "Why does Fortuna matter?",
    answer:
      "Because the game is named after her. Fortuna is the goddess of fate, and Fortuna\u0027s Temple appears on the world map as the location of a Chapter 7 subquest, so the name is in the world rather than only in the title.",
  },
  {
    question: "Which gods give you something in gameplay?",
    answer:
      "Six of the twelve appear in the Shrine of Causality shop as blessings whose discounts can be bought with Karma Shards: Aurora, Mars, Smyrnos, Jurah, Kalla and Credna. Smyrnos also names the shrine where Combat Arts are strengthened.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Deities of Dagda",
  description:
    "The twelve named gods of Fire Emblem: Fortune\u0027s Weave, their domains, the six whose blessings the Shrine of Causality sells, and Balor as the antagonist.",
  path: "/deities/",
});

export default function DeitiesPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Deities", item: "/deities/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Deities of Dagda"
        description="The twelve named gods behind the place names, the blessings and the antagonist, and which six of them actually pay out in gameplay."
        path="/deities/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Twelve names, and they are everywhere
          </h2>
          <p>
            {"Dagda names " + deities.length +
              " deities, and the reason to learn them is that they are load-bearing: the continent, the pantheon, the imperial capital of Dagsion and a shelf of shrines and temples all borrow these words. A name encountered in a quest title is usually a god rather than a place."}
          </p>
          <p>{mechanics.what}</p>
          <p>{mechanics.antagonist}</p>
          <p>{mechanics.naming}</p>
          <p className="text-gray-700 dark:text-gray-300">{mechanics.overlap}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The full pantheon
          </h2>
          <p>
            {"Only " + withDomain.length + " of the " + deities.length +
              " carry a domain in the record. The rest are listed by name with no role attached, which is stated here rather than smoothed over with a plausible-sounding invention."}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                  <th className="py-2 pr-4">Deity</th>
                  <th className="py-2 pr-4">Domain</th>
                  <th className="py-2">What else is recorded</th>
                </tr>
              </thead>
              <tbody>
                {deities.map((deity) => (
                  <tr key={deity.id} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                      {deity.name}
                      {deity.hasBlessingDiscount ? (
                        <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
                          (blessing sold)
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{deity.domain}</td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">{deity.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The six that pay out
          </h2>
          <p>
            {"The other half of the pantheon matters because it is purchasable: " + blessers.map((deity) => deity.name).join(", ") +
              " each have a blessing whose discount sits in the Shrine of Causality shop, bought with Karma Shards earned from Notable Deeds. Buying them is a permanent, account-wide upgrade rather than a route choice."}
          </p>
          <p>
            Smyrnos is the one to watch, because the name does double duty: the shrine where Combat Arts are
            strengthened carries it, and the crown of Smyrnos is the Dagdan name of Macuil&apos;s Diadem. That
            tie between a god, a shrine and a crest is the clearest single clue to how religion is wired into the
            systems rather than painted on top of them.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Balor gets a location too, in the Temple of Balor, which is worth knowing before Part III: the
            antagonist&apos;s name on a dungeon usually means something is waiting there.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What no source records
          </h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            {gaps.map((gap: string) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
          <p className="text-gray-700 dark:text-gray-300">
            {"This page exists because of one of those gaps. The blessing shop lists six divine names, which is enough to place them in gameplay but not enough to explain them, and a pantheon page that guessed at the missing six roles would be worse than a table that admits the gap."}
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
            The blessings themselves and what their discounts cost are on the boons page, the crest named after
            Smyrnos is on the crests page, and the temple location comes up in the subquest list.
          </p>
        </section>
      </main>
    </>
  );
}
