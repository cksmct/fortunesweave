import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import chaptersData from "@/data/chapters.json";

const chapters = chaptersData.chapters;
const paralogueChapters = chaptersData.paralogueChapters;

const groupOrder: string[] = [];
for (const chapter of chapters) {
  if (!groupOrder.includes(chapter.part)) groupOrder.push(chapter.part);
}
const partCounts = chaptersData._parts as Record<string, number>;
const untitled = chapters.filter((chapter) => chapter.name === "").length;

const FAQS = [
  {
    question: "How many chapters does Fortune\u0027s Weave have?",
    answer:
      "There are sixty-two numbered chapters: a two-chapter prologue, twelve chapters for each of the four Part I paths, six in Part II and six in Part III. Nine further paralogues sit outside that numbering.",
  },
  {
    question: "Which path should you play first?",
    answer:
      "The prologue is shared, then Part I splits four ways. Cai, Dietrich, Theodora and Leda each lead an Obelisk army - Fox, Lion, Wolf and Eagle respectively - and those armies meet again in Part II and Part III, so none of the four paths is a side story.",
  },
  {
    question: "What are the paralogues and why do they matter?",
    answer:
      "Paralogues are unnumbered side chapters with their own cast. At least one character from a paralogue cast has to be in your army during Part 1, and each one can be missed once the story moves past its window, so they are checked against the paralogue checklist rather than the chapter list.",
  },
  {
    question: "Why are some paralogues unavailable on my path?",
    answer:
      "Because several are locked to particular paths. Diversionary Tactics is Lion and Wolf only, Missing Brave-Warrior Statue is Lion only, and Sealed-Off Past is Wolf and Eagle only, so no single playthrough can see all nine.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Walkthrough and Chapter List",
  description:
    "Every Fire Emblem: Fortune\u0027s Weave chapter in order, path by path, plus the nine paralogues and the routes each one is locked to.",
  path: "/walkthrough/",
});

export default function WalkthroughPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Walkthrough", item: "/walkthrough/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Walkthrough and Chapter List"
        description="The full chapter list in order, because the four Part I paths are not side stories and the paralogues can be missed."
        path="/walkthrough/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How the story is laid out
          </h2>
          <p>
            {"Fortune\u0027s Weave runs on " + chapters.length +
              " numbered chapters split into a shared opening and a branching middle. The prologue covers two chapters, then Part I splits into four twelve-chapter paths, one per Flame Lord, before Part II gathers them into six chapters and Part III closes with six more. Nine paralogues sit outside the numbering entirely."}
          </p>
          <p>
            The reason to keep the whole list in view rather than play one path blind is that the four
            paths are not alternatives in the sense of mutually exclusive content. Cai, Dietrich,
            Theodora and Leda each lead an Obelisk army, and those armies reconvene in Part II under the
            Strife Obelisk banner, so what changes between playthroughs is who you command and which
            paralogues are reachable rather than what the story is.
          </p>
          <p>
            Chapter order also decides what is still available. Paralogues expire, recruitment windows
            close, and a bond that waits on Part 3 cannot be finished during Part 1 no matter how many
            battles two units share. Treating the chapter list as a schedule rather than a contents page
            is the difference between a clean run and a second playthrough to collect what expired.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            All {chapters.length} chapters in order
          </h2>
          {groupOrder.map((part) => (
            <article key={part} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {part}
                <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                  {partCounts[part]} chapters
                </span>
              </h3>
              <ol className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {chapters
                  .filter((chapter) => chapter.part === part)
                  .map((chapter) => (
                    <li key={chapter.id} className="flex items-start gap-2">
                      <span className="min-w-16 text-gray-600 dark:text-gray-400">
                        {"Chapter " + chapter.number}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {chapter.name === "" ? "Title not yet recorded" : chapter.name}
                      </span>
                    </li>
                  ))}
              </ol>
              {part.startsWith("Part I:") ? (
                <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                  {"Leads the " + chapters.find((chapter) => chapter.part === part)?.army + "."}
                </p>
              ) : null}
            </article>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The {paralogueChapters.length} paralogues and their route locks
          </h2>
          <p>
            Paralogues are numbered by nothing, which is exactly what makes them missable. Each one has a
            cast, and at least one member of that cast has to be in your army during Part 1 for the
            paralogue to open at all. The route column below is the other half of the puzzle: several are
            locked to particular Obelisk paths, so a single playthrough tops out well below nine.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                  <th className="py-2 pr-4">Paralogue</th>
                  <th className="py-2 pr-4">Cast anchor</th>
                  <th className="py-2">Route restriction</th>
                </tr>
              </thead>
              <tbody>
                {paralogueChapters.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                      {entry.name}
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{entry.owner}</td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">{entry.routeRestriction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            {"Unlock windows, rewards and the deadline for each of these sit on the paralogue list, and the " +
              (untitled === 1
                ? "single chapter the source records by number alone is left labelled as such here rather than given an invented title."
                : "chapter titles are complete on this page.")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How to use this list
          </h2>
          <p>
            Before starting a path, note which two paralogues that path cannot reach and whether any of
            them matter to the team you want. During a run, check the chapter you are about to enter
            against the paralogue checklist, because a paralogue window closes silently: the game does not
            warn you that a side chapter has just become unreachable.
          </p>
          <p>
            What this page deliberately does not do is narrate every battle. Chapter-by-chapter tactical
            prose ages badly and duplicates what the roster, class and recruitment data already answer
            better as structured tables. The useful shape for this game is a schedule plus checkable
            lists, and that is what the walkthrough section is built as.
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
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quick answers</h2>
          <p>
The Fire Emblem: Fortune&apos;s Weave chapters run to sixty-two numbered entries plus nine paralogues, and keeping them in this order matters because several windows close before the next part begins.
          </p>
        </section>
      </main>
    </>
  );
}
