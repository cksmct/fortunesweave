import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
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
      </main>
    </>
  );
}
