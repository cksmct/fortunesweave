import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import mealsData from "@/data/meals.json";

const mechanics = mealsData._mechanics;
const dishes = mealsData.dishes;
const gaps = mealsData._openGaps;

const lovers: Record<string, number> = {};
for (const dish of dishes) {
  for (const name of dish.lovedBy) lovers[name] = (lovers[name] || 0) + 1;
}
const universal = Object.keys(lovers).filter((name) => lovers[name] === dishes.length);
const broad = Object.keys(lovers)
  .filter((name) => lovers[name] >= 8)
  .sort((x, y) => lovers[y] - lovers[x]);
const charactersLoved = Object.keys(lovers).length;

const FAQS = [
  {
    question: "How do you raise Motivation in Fortune\u0027s Weave?",
    answer:
      "Dining at the inn with a character you have bonded with restores Motivation and raises their Support Level. A dish the character likes or loves restores two points instead of one, which is the entire reason to track who likes what.",
  },
  {
    question: "Why can I not invite someone to a meal yet?",
    answer:
      "Because a gift has to come first. Giving a gift forms a New Bond, and only then does the character become available to invite to a meal. The characters page covers where the gifts themselves come from.",
  },
  {
    question: "Does the inn menu change?",
    answer:
      "Yes, weekly. Each dish costs gold, each character can eat each dish once per week, and the menu refreshes when the week turns over. That refresh is why spreading gifts widely beats building one bond to the ceiling.",
  },
  {
    question: "What is the difference between dining and resting at the inn?",
    answer:
      "Dining is per character and restores Motivation. Resting is party-wide and fully restores Motivation, HP and spell uses, at the cost of gold plus one free-time turn, so it is the expensive option when you need everything topped up at once.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Meals and Dining",
  description:
    "Every recorded Fire Emblem: Fortune\u0027s Weave dish and the characters who love it, plus how dining raises Motivation and Support Level at the inn.",
  path: "/meals/",
});

export default function MealsPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Meals", item: "/meals/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Meals and Dining"
        description="Which dish restores two Motivation instead of one for which character, because the difference between a good week and a wasted one is knowing who loves what."
        path="/meals/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dining is a Motivation system, not a healing system
          </h2>
          <p>
            Meals look like a healing mechanic and are not one. Dining with a character you have already
            bonded with raises their Support Level and restores Motivation, and the size of that restore
            depends entirely on whether they like the dish: two points if they like or love it, one point
            otherwise. The party-wide HP, spell and Motivation refill people expect from cooking is what
            resting at the inn does, and that costs gold plus a free-time turn.
          </p>
          <p>
            Two rules decide how you spend a week. The first is that a gift has to come before a meal,
            because giving a gift forms the New Bond that makes the invitation possible at all. The second
            is that the inn menu refreshes weekly and each character can only eat each dish once per week,
            so a wide web of bonds beats one deep one if the goal is to keep restoring Motivation.
          </p>
          <p>
            The order of operations is where most players lose value: spend Motivation first on training,
            performances and shrine services, then restore it with a meal. Restoring a full bar wastes the
            two-point bonus, and the bonus is the whole reason to care which dish is on the menu.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Every recorded mechanic
          </h2>
          <table className="w-full border-collapse text-sm">
            <tbody>
              {mechanics.map((entry) => (
                <tr key={entry.key} className="border-b border-gray-200 dark:border-gray-800">
                  <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">{entry.key}</td>
                  <td className="py-2 text-gray-700 dark:text-gray-300">{entry.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Who loves which dish
          </h2>
          <p>
            {"The table records " + dishes.length + " dishes and the " + charactersLoved +
              " characters who love at least one of them. Anyone missing from a dish&apos;s list still gains one Motivation from it, so this is a table of bonuses rather than a table of what is allowed."}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                  <th className="py-2 pr-4">Dish</th>
                  <th className="py-2 pr-4">Loved by</th>
                  <th className="py-2">Count</th>
                </tr>
              </thead>
              <tbody>
                {dishes.map((dish) => (
                  <tr key={dish.id} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                      {dish.name}
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                      {dish.lovedBy.join(", ")}
                    </td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">{dish.lovedByCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            {"Two patterns fall out of the table. " +
              (universal.length > 0
                ? universal.join(", ") +
                  (universal.length === 1 ? " loves all " : " love all ") +
                  dishes.length +
                  " dishes, which makes that character a guaranteed two-point restore on any menu. "
                : "") +
              (broad.length > 0
                ? "Then come " +
                  broad.filter((name) => universal.indexOf(name) < 0).map((name) => name + " with " + lovers[name]).join(", ") +
                  ", who are close to unmissable across a week of rotating menus."
                : "")}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What this record does not contain
          </h2>
          <p>
            The dish list comes from one player&apos;s record on a single route with 46 characters
            recruited, so it is real but partial, and the shortcomings are worth naming rather than hiding
            behind a tidy table.
          </p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            {gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
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
            Feasts and crops meet in one place: the crop you grow on Cai&apos;s farm is the weekly food
            that starts Bird Time, and the farming page covers that loop, while the gifts page covers what
            you need to hand over before any of these meals can happen.
          </p>
        </section>
      </main>
    </>
  );
}
