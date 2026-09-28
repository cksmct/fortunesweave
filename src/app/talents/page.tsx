import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import talentsData from "@/data/talents.json";

const talents = talentsData.talents;
const mechanics = talentsData._mechanics as Record<string, string>;
const gaps = talentsData._openGaps;

const FAQS = [
  {
    question: "Does every character have a hero talent?",
    answer:
      "No. Route talents belong to the four Flame Lords only, and no source checked records a talent for any other character. That is why the table here has exactly four rows rather than one per recruitable unit.",
  },
  {
    question: "Can you use another lord\u0027s talent?",
    answer:
      "No. Each talent works only on its owner\u0027s own path, which is a large part of why the four Part I routes play differently: Cai cannot farm on Dietrich\u0027s route and Theodora cannot recruit battalions on Leda\u0027s.",
  },
  {
    question: "What should I do with a talent I do not care about?",
    answer:
      "Check whether it feeds Renown, because Renown is account-wide and gates recruitment, battalions, farming plots and the Renown perks elsewhere. Dietrich\u0027s hidden-enemy hunt and Leda\u0027s performances both pay Renown directly, so even a talent you do not enjoy buying into compounds across the account.",
  },
  {
    question: "Which talent is the strongest?",
    answer:
      "No source publishes a ranking, and the honest answer is that the four do different jobs rather than competing: one generates Renown from combat, one produces battalions, one produces crops and mounts, and one produces gold and Spellsong upgrades. Pick by which system you want to engage with rather than by a tier list.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Hero Talents and Route Abilities",
  description:
    "The four Fire Emblem: Fortune\u0027s Weave route talents: Dietrich\u0027s Answerer\u0027s Cry, Theodora\u0027s battalions, Cai\u0027s mounts and farming, and Leda\u0027s performances.",
  path: "/talents/",
});

export default function TalentsPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Talents", item: "/talents/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Hero Talents and Route Abilities"
        description="One exclusive world map talent per Flame Lord, and why the four of them are the real difference between the Part I paths."
        path="/talents/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Four talents, four different games
          </h2>
          <p>
            A route talent is a world map ability that only functions on its owner&apos;s own path. That
            single rule does more to separate the four Part I routes than the chapter lists do, because it
            decides what kind of upkeep you spend your free time on: hunting hidden enemies for Renown,
            staffing settlements with battalions, running a farm, or playing the tavern.
          </p>
          <p>{mechanics.scope}</p>
          <p>{mechanics.exclusivity}</p>
          <p>{mechanics.crossLinks}</p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The four route talents
          </h2>
          {talents.map((talent) => (
            <article key={talent.id} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {talent.owner} - {talent.name}
              </h3>
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Unlock: </span>
                {talent.unlock}
              </p>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">What it does: </span>
                {talent.effect}
              </p>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Why it pays: </span>
                {talent.reward}
              </p>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Limit: </span>
                {talent.limit}
              </p>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Also: </span>
                {talent.bonus}
                {talent.bonusVerified ? null : (
                  <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
                    (source marks this unverified)
                  </span>
                )}
              </p>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">{talent.army}</p>
            </article>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reading the four together
          </h2>
          <p>
            Renown is the thread that ties them. It is account-wide, it gates recruitment rows, battalion
            quality and deployment, the number of farming plots you can run, and every
            &quot;improves after a route completion&quot; step in the post-game. Dietrich&apos;s hidden-enemy
            hunt pays Renown per skirmish and Leda&apos;s performances pay Renown directly, so on those two
            paths the talent is really a Renown engine with a minigame attached.
          </p>
          <p>
            Cai&apos;s pair of mechanics is the opposite trade: crops and mounts pay in materials rather than
            in account progress, and those materials then buy weapons and accessories from the Vandahl
            merchants, pay Rest Spot healing inside dungeons and feed the Pale Raven weekly. Theodora sits
            in between, converting gold and town visits into combat strength through battalions that also
            gather materials unattended.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            None of the four is a small bonus, which is worth saying because that is the assumption a lot
            of players arrive with. Pick a path by which of these four loops you are willing to run weekly
            for the length of a Part I route.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What no source has recorded
          </h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            {gaps.map((gap: string) => (
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
            Each of these four feeds a page of its own: battalions, crop farming, mounts, and the activities
            section for the Pale Raven routines.
          </p>
        </section>
      </main>
    </>
  );
}
