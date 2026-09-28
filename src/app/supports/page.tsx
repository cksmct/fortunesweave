import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import supportsData from "@/data/supports.json";

const supports = supportsData.supports;

const partnerCount = (name: string) =>
  supports.filter((pair) => pair.a === name || pair.b === name).length;
const tracked = Array.from(new Set(supports.flatMap((pair) => [pair.a, pair.b]))).sort(
  (x, y) => partnerCount(y) - partnerCount(x) || x.localeCompare(y)
);
const aRankPairs = supports.filter((pair) => pair.maxRank === "A");
const lockedPairs = supports.filter((pair) => pair.conditions.length > 0);
const eshmelPairs = supports.filter((pair) => pair.a === "Eshmel" || pair.b === "Eshmel");

const FAQS = [
  {
    question: "How do you raise supports in Fortune\u0027s Weave?",
    answer:
      "Support ratings rise when two units fight and work together, on and off the battlefield. Conversations are then read in Dagsion at the taverns near the colosseum and in Lowtown. Units without their own support conversations can still raise a support rating, which grants passive bonuses when the pair fights together.",
  },
  {
    question: "What do C, B and A rank mean here?",
    answer:
      "The tavern support list maps C, B and A conversations onto rating 2, 3 and 4. A padlock next to a row means an earlier condition has to be met first, such as reaching a later part of the story or recruiting the unit.",
  },
  {
    question: "How does romance and the Paired Ending work?",
    answer:
      "Only some characters can reach A rank, and many A ranks allow a Paired Ending in the epilogue, which is where romance sits. Eshmel is the exception that gets an S-rank scene: at a maximum rating of 5 you can choose a Paired Ending with that character.",
  },
  {
    question: "Why are only some characters listed?",
    answer:
      "Because the source set is still being written. The tables checked cover the characters published so far and those pages are themselves marked in progress, so this page publishes the documented pairs and leaves the rest out rather than filling gaps with plausible guesses.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Supports and Romance",
  description:
    "Fire Emblem: Fortune\u0027s Weave support pairs, the C, B and A rank map, lock conditions, and which bonds allow a Paired Ending.",
  path: "/supports/",
});

export default function SupportsPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Supports", item: "/supports/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Supports and Romance"
        description="Which characters can bond, how far each bond goes, what has to happen before a locked conversation opens, and where romance actually enters the game."
        path="/supports/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How supports and romance work
          </h2>
          <p>
            Supports in Fire Emblem: Fortune&apos;s Weave run on two layers that are easy to confuse.
            The first is the rating itself, which rises whenever two units fight and work together,
            on a battlefield or in the city between chapters. The second layer is the conversations:
            not every pairing has them, and a pairing without conversations still gains its rating and
            still collects the passive bonus applied while the two fight side by side.
          </p>
          <p>
            Conversations are read at the taverns in Dagsion, near the colosseum or in Lowtown. When you
            open a support list there, a locked row shows a padlock, which means an earlier condition has
            to be satisfied first. Those conditions are concrete rather than mysterious: the rows checked
            wait on reaching Part 2 or Part 3, on a specific chapter such as Chapter 7 or 9, on recruiting
            the unit at all, or in a few cases on an unnamed requirement the source itself renders as
            question marks.
          </p>
          <p>
            Romance arrives at the end rather than during the route. Only some characters can reach A
            rank, and many A ranks allow a Paired Ending in the epilogue. Eshmel holds the exception: at
            a maximum rating of 5 you can choose a Paired Ending with that character, which unlocks an
            S-rank scene. The source notes that every character Eshmel can reach A rank with is assumed,
            but not confirmed, to be eligible for that S scene, so the inference is labelled an
            assumption wherever it appears instead of being presented as a finished fact.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">The rank ladder</h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <span className="font-semibold text-gray-900 dark:text-gray-100">C conversation</span> -
              the rating 2 scene, and the first step of every recorded pairing that has conversations.
            </li>
            <li>
              <span className="font-semibold text-gray-900 dark:text-gray-100">B conversation</span> -
              rating 3. Several pairings in the tables start here rather than at C, which is why a row
              can show a B without a C.
            </li>
            <li>
              <span className="font-semibold text-gray-900 dark:text-gray-100">A conversation</span> -
              rating 4, the highest ordinary rank and the one that opens the door to a Paired Ending.
            </li>
            <li>
              <span className="font-semibold text-gray-900 dark:text-gray-100">S scene</span> - rating
              5, offered to Eshmel only, and read at the end of the game as the romance payoff.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Every recorded support pair
          </h2>
          <p>
            {"The tables checked record " + supports.length + " pairs across " + tracked.length +
              " characters. Each row names the pair, the conversations documented for it, the highest rank that pair can reach, and what has to happen before a locked row opens."}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                  <th className="py-2 pr-4">Character</th>
                  <th className="py-2 pr-4">Partner</th>
                  <th className="py-2 pr-4">Conversations</th>
                  <th className="py-2 pr-4">Highest</th>
                  <th className="py-2">Opens when</th>
                </tr>
              </thead>
              <tbody>
                {supports.map((pair) => (
                  <tr key={pair.id} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                      {pair.a}
                    </td>
                    <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                      {pair.b}
                    </td>
                    <td className="py-2 pr-4">{pair.ranks.join(", ")}</td>
                    <td className="py-2 pr-4">{pair.maxRank}</td>
                    <td className="py-2">
                      {pair.conditions.length > 0 ? pair.conditions.join("; ") : "No lock recorded"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            A rank pairs and the Paired Ending route
          </h2>
          <p>
            {"Only " + aRankPairs.length + " of the " + supports.length +
              " recorded pairs reach A rank in the tables checked. Those are the pairings that can carry into the epilogue, which is where a Paired Ending is decided."}
          </p>
          <ul className="space-y-1 text-gray-700 dark:text-gray-300">
            {aRankPairs.map((pair) => (
              <li key={pair.id}>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {pair.a} and {pair.b}
                </span>
                {" - reaches " + pair.maxRank + (pair.conditions.length > 0 ? ", " + pair.conditions.join("; ") : "")}
              </li>
            ))}
          </ul>
          <p>
            {"Eshmel stands apart: " + eshmelPairs.length +
              " pairs involving Eshmel are recorded, all of them reaching A rank in the tables. Eshmel is also the only character who can choose a Paired Ending outright at a maximum rating of 5, which is what turns an A rank friendship into an S rank scene."}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Coverage and open gaps
          </h2>
          <p>
            {"Of the recorded pairs, " + lockedPairs.length +
              " carry an unlock condition, which makes them the rows worth planning around: a pairing that waits on Part 3 cannot be finished during Part 1 no matter how many battles you fight together. The characters currently covered by those tables are " +
              tracked.join(", ") + "."}
          </p>
          <p>
            The support section of the source set is itself marked in progress, and further pairs are
            listed by name without any rank data. Those rows are counted but not published here, because
            an entry with no rank would look like a finished record while telling you nothing you can act
            on. As the tables fill in, the row count on this page moves with them rather than being
            restated by hand.
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
            Planning a run around one of these pairs? The support matrix lists every partner for a
            chosen character with the rank each bond can reach, and the characters page records who can
            be recruited on which path in the first place.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quick answers</h2>
          <p>
Fire Emblem: Fortune&apos;s Weave supports run on two different gates rather than one rating, and that is also where Fire Emblem: Fortune&apos;s Weave romance lives: the bond itself grows during the run, but a paired ending is only decided at the epilogue.
          </p>
        </section>
      </main>
    </>
  );
}
