import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import groupsData from "@/data/gift-groups.json";
import preferencesData from "@/data/gift-preferences.json";

const groups = groupsData.groups;
const preferences = preferencesData.preferences;

const FAQS = [
  {
    question: "How do you know which gift a character likes?",
    answer:
      "Open the unit information page in the roster. It lists each character stated likes and dislikes, and gift effectiveness follows those interests: a gift whose tooltip says it is enjoyed by lovers of sweets tends to land well with a character who likes sweet things.",
  },
  {
    question: "Do all gifts of a matching type work equally?",
    answer:
      "Not always. Characters can merely tolerate a gift of the right type while really liking a specific one inside it, and the differences are visible in the reaction you get rather than in a number. Treating the type as a baseline and the reaction as the answer is the reliable approach.",
  },
  {
    question: "Where do gifts come from?",
    answer:
      "Gifts are found in five places: random gold-glowing spots on the ground in Dagsion that replenish between chapters, treasure chests in dungeons, quest rewards, the Market Vendor in the Midtown Arcade, the Gift Vendor in the Lowtown Tavern, and the individual settlements you can visit during Free Time.",
  },
  {
    question: "Is every gift listed here?",
    answer:
      "Around 120 gift items exist. They are grouped here by tooltip category, which is the part that actually guides a decision, and the character interests list covers every character with a recorded preference. Where a source marks its own coverage as in progress, the rows say so.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Gifts and Character Likes",
  description:
    "All Fire Emblem: Fortune\u0027s Weave gift categories, where each gift comes from, and every character\u0027s recorded likes and dislikes in one table.",
  path: "/gifts/",
});

export default function GiftsPage() {
  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Gifts", item: "/gifts/" },
  ]);

  return (
    <>
      <JsonLd data={[breadcrumb, generateFAQSchema(FAQS)]} />
      <PageHeader
        title="Gifts and Character Likes"
        description="Roughly 120 gifts, grouped by what they are actually for, plus the interests list that tells you who will react well to what."
        path="/gifts/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How gifting works
          </h2>
          <p>
            Gifts raise support with the character you hand them to, and the size of the gain depends
            on whether the gift matches that character&apos;s interests. Every character has a stated
            likes and dislikes list on their unit information page, and the gift tooltips classify
            items by the same idea: a gift marked as enjoyed by lovers of sweets is aimed at a
            character who likes sweet things.
          </p>
          <p>
            The mapping is a baseline rather than a guarantee. Characters can accept a gift of the
            right category while reacting far better to one specific item inside it, so the practical
            method is to use the interests list to pick a category, then watch the reaction to find the
            standout item.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Where gifts come from</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              Random spots on the ground in Dagsion, marked by a gold glow, which tend to replenish
              each chapter.
            </li>
            <li>Treasure chests inside dungeons.</li>
            <li>Rewards for quests given out by the people of Dagsion.</li>
            <li>
              The Market Vendor in the Midtown Arcade, whose stock does not replenish but gains a few
              new gifts every chapter or so.
            </li>
            <li>
              The Gift Vendor in the Lowtown Tavern, which offers a wider selection of drinks and food
              that replenishes each chapter, at lower quality and a lower chance of a really liked
              reaction.
            </li>
            <li>
              Settlements and towns across the empire, each with gifts that are often unique to the
              region.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Gift categories and what is inside each one
          </h2>
          <p>
            Every known gift, grouped by the tooltip category the game assigns it. Use the category to
            pick a direction, then confirm against the character interests table below.
          </p>
          <div className="space-y-4">
            {groups.map((group) => (
              <article
                key={group.id}
                className="rounded-lg border border-gray-200 p-5 dark:border-gray-800"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {group.name}
                </h3>
                {group.recommendedCharacters.length > 0 ? (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Recommended for: {group.recommendedCharacters.join(", ")}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{group.giftList}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Character likes and dislikes
          </h2>
          <p>
            The interests recorded on each unit information page. These are not a gift list; they are
            the reason a gift works, and they are what to read when a character reacts badly to
            something that looked generous.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                  <th className="py-2 pr-4">Character</th>
                  <th className="py-2 pr-4">Likes and interests</th>
                  <th className="py-2">Dislikes</th>
                </tr>
              </thead>
              <tbody>
                {preferences.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 align-top dark:border-gray-800"
                  >
                    <td className="py-3 pr-4 font-semibold text-gray-900 dark:text-gray-100">
                      {row.character}
                    </td>
                    <td className="py-3 pr-4">{row.likes}</td>
                    <td className="py-3">{row.dislikes ? row.dislikes : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Categories: {groups.length}. Characters with recorded interests: {preferences.length}.
            Rows carry the date they were last checked, and the gift finder tool searches both tables
            without sending anything anywhere.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quick answers</h2>
          <p>
The Fire Emblem: Fortune&apos;s Weave gifts on this page are grouped by how you obtain them, which is the fastest way into a Fire Emblem: Fortune&apos;s Weave gift guide: find the source you already have access to, then read across to who likes it.
          </p>
        </section>
      </main>
    </>
  );
}
