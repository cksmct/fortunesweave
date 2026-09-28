import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import tiersData from "@/data/class-tiers.json";
import classesData from "@/data/classes.json";

const tiers = tiersData.tiers;
const classes = classesData.classes;

const FAQS = [
  {
    question: "How do you change class in Fortune\u0027s Weave?",
    answer:
      "Exams are taken from the exam proctor in Dagsion. Beginner, specialty and advanced exams sit behind separate tabs, and each tier opens up as you progress, reportedly at Renown level 4 for specialty and Renown level 8 for advanced.",
  },
  {
    question: "Do class bonuses stay after you change class again?",
    answer:
      "Mastery abilities do. Each class has a mastery ability, such as Defence Basics or Magic Basics, and mastering the class before moving on keeps that bonus. Class-specific growth additions apply while you are in that class, which is why beginner classes are worth mastering rather than skipping.",
  },
  {
    question: "Are some classes locked to one route?",
    answer:
      "Yes. Ranger, Troubadour, Caladrias, Dragoon and Blacksmith are all reported as route-specific, and the Drink Recipe quest chain grants access to Ranger and Troubadour regardless of which route choices you made, which makes it the one side quest with a class reward.",
  },
  {
    question: "Why do some class entries say not recorded?",
    answer:
      "Because class data for this game cannot be read out of the files; it is measured by playing. Fields that a source has not reported are left explicitly empty rather than filled with a plausible number, and the class planner shows the same honesty in its output.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Classes and Certification Exams",
  description:
    "The Fire Emblem: Fortune\u0027s Weave class tiers, the exam proctor in Dagsion, Renown gates, and every route-specific class recorded so far.",
  path: "/classes/",
});

export default function ClassesPage() {
  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Classes", item: "/classes/" },
  ]);

  return (
    <>
      <JsonLd data={[breadcrumb, generateFAQSchema(FAQS)]} />
      <PageHeader
        title="Classes and Certification Exams"
        description="Every recorded tier, the five beginner classes worth mastering, and the route-locked options that change what a unit can become. Here is the system and where it opens up."
        path="/classes/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How the class system works
          </h2>
          <p>
            Classes are organised into tiers. Base holds the two starting classes, Beginner, Specialty, Advanced and Master form the normal climb, and Divine and Enemy Only sit outside it. Changing
            class is not automatic; you take an exam from the proctor in Dagsion, and the exam list is
            split into tabs by tier. The higher tabs open as the run progresses, reportedly at Renown
            level 4 for specialty exams and Renown level 8 for advanced ones.
          </p>
          <p>
            Two things make the system deeper than a simple upgrade ladder. First, growth rates depend
            on the class and the character together, so the same unit trains differently depending on
            where you park it. Second, each class carries base stat modifiers and a mastery ability; a
            beginner class you master before moving on leaves you with a permanent ability, which is
            why the low tiers are worth finishing rather than skipping.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The recorded tiers
          </h2>
          <div className="space-y-4">
            {tiers.map((tier) => (
              <article
                key={tier.id}
                className="rounded-lg border border-gray-200 p-5 dark:border-gray-800"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {tier.name}
                  </h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {classes.filter((entry) => entry.tier === tier.name.replace(" Classes", "")).length + " classes recorded"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{tier.unlock}</p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{tier.notes}</p>
                {tier.conflict ? (
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">{tier.conflict}</p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Recorded classes
          </h2>
          <p>
            Every class recorded so far, with its weapon set, movement type, mastery ability and any
            route restriction. Fields a source has not reported are marked rather than estimated.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                  <th className="py-2 pr-4">Class</th>
                  <th className="py-2 pr-4">Tier</th>
                  <th className="py-2 pr-4">Weapons</th>
                  <th className="py-2 pr-4">Movement</th>
                  <th className="py-2 pr-4">Mastery</th>
                  <th className="py-2">Routes</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-gray-200 align-top dark:border-gray-800"
                  >
                    <td className="py-3 pr-4 font-semibold text-gray-900 dark:text-gray-100">
                      {entry.name}
                    </td>
                    <td className="py-3 pr-4">{entry.tier}</td>
                    <td className="py-3 pr-4">{entry.weapons}</td>
                    <td className="py-3 pr-4">{entry.movement}</td>
                    <td className="py-3 pr-4">{entry.mastery}</td>
                    <td className="py-3">{entry.routes ? entry.routes.join(", ") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Route-specific classes
          </h2>
          <p>
            Some classes only exist for certain routes, and they are the reason two players running
            different Flame Lords end up with genuinely different rosters. Ranger is reported as
            Leda&apos;s route-specific option and is described as dancer-like; Troubadour appears on
            more than one route; Caladrias and Dragoon are reported as Cai&apos;s extras; Blacksmith is
            reported for Dietrich. Finishing the Leaf and Drink Recipe chain grants Ranger and
            Troubadour as well, which makes that side quest the one chain with a class reward attached.
          </p>
          <p>
            Class names taken from spoken walkthroughs can be mangled by auto-captions, so names that
            have not been cross-checked carry a note saying so instead of being quietly normalised.
            Where a class is listed without stats, that means the sources checked have not reported the
            numbers yet.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How growth rates and modifiers interact
          </h2>
          <p>
            Class growth additions apply while you are in the class, and they stack onto the
            character&apos;s own growths. Gladiator is the clearest example: it adds ten points of HP
            growth and ten points of Strength growth and nothing else, which makes it a class you sit
            in while you want physical growth rather than one you stay in for utility. Diviner takes
            the opposite approach, reducing Strength while raising magic, and its mastery ability adds
            both Magic and Resistance.
          </p>
          <p>
            Base stat modifiers are separate from growth. They apply immediately to the unit&apos;s
            stats, which is why a class with a single modifier can be worth a temporary exam: Hunter
            adds one point of Speed, and Speed is what decides whether a unit doubles, so a small
            number in the right place changes the arithmetic of a fight.
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
There is no single answer to which are the Fire Emblem: Fortune&apos;s Weave best classes, because the certification climb is about which weapon types a unit can carry rather than one optimal pick. The Fire Emblem: Fortune&apos;s Weave classes are ordered below by what each tier unlocks rather than by a score.
          </p>
        </section>
      </main>
    </>
  );
}
