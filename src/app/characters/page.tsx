import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import charactersData from "@/data/characters.json";
import recruitmentData from "@/data/recruitment.json";

const characters = charactersData.characters;
const factions = charactersData.factions;
const recruits = recruitmentData.recruits;

const permanent = characters.filter((character) => character.playable);
const guests = characters.filter((character) => character.guest);
const routeArmies = Array.from(
  new Set(permanent.filter((character) => character.kind === "route-army").map((character) => character.army))
);
const clans = Array.from(
  new Set(permanent.filter((character) => character.kind === "recruitable").map((character) => character.army))
);
const factionArmies = Array.from(new Set(factions.map((entry) => entry.faction)));

const FAQS = [
  {
    question: "How do you recruit characters in Fortune\u0027s Weave?",
    answer:
      "Recruitment requirements appear in the Character Info screen when you speak to a unit in Dagsion. They list a Bond Level and a Renown Level, and some units additionally end in a negotiation dialogue where the right choices have to be picked. If a unit shows no requirement list, that unit cannot be recruited.",
  },
  {
    question: "What is the difference between Bond Level and Renown Level?",
    answer:
      "Renown Level is the account-wide progression stat, raised by story missions, subquests and Flame Lord specific tasks. Bond Level measures how close your Flame Lord is to the unit being recruited, starts at level 1 for everyone, and is raised by gifts, meals, the Theater and time spent together.",
  },
  {
    question: "Why do the same characters cost different amounts on different routes?",
    answer:
      "Because the requirements are route-specific. Tialla, for example, needs Support Level 3 and Renown 8 with a Hard negotiation when you play Dietrich, but Support Level 3 and Renown 7 when you play Theodora. The table on this page is keyed by both the recruit and the Flame Lord you are playing.",
  },
  {
    question: "Which route can recruit the most units?",
    answer:
      "Going by the requirement rows published by the sources checked, Cai currently has the largest recorded set of recruitment entries, but that reflects how thoroughly each route has been written up rather than a claim that one path is better supplied. Every route army can also recruit the four unaffiliated clans.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Characters and Recruitment",
  description:
    "Every Fire Emblem: Fortune\u0027s Weave recruit, the route armies, the four Heroic Games clans, and the Bond and Renown requirements per route.",
  path: "/characters/",
});

export default function CharactersPage() {
  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Characters", item: "/characters/" },
  ]);

  return (
    <>
      <JsonLd data={[breadcrumb, generateFAQSchema(FAQS)]} />
      <PageHeader
        title="Characters and Recruitment"
        description="Route armies, four unaffiliated clans, and the Bond, Renown and negotiation requirements that decide who joins you on which path."
        path="/characters/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How recruitment works
          </h2>
          <p>
            Recruiting a unit in Fire Emblem: Fortune&apos;s Weave comes down to a requirements list
            shown in the Character Info screen when you speak to them in Dagsion. A typical list names a
            Bond Level, a Renown Level and sometimes a negotiation test. If the screen shows no
            requirements at all, that unit is not recruitable and there is nothing to grind towards.
          </p>
          <p>
            Renown Level is the account-wide progression stat. Story missions, subquests and the Flame
            Lord specific tasks raise it, which is why Leda&apos;s performances and Theodora&apos;s
            equivalent activities matter beyond flavour. Bond Level is different: it measures how close
            your Flame Lord is to that specific unit, every character starts at level 1, and gifts are
            what open the process. One gift is enough to begin, after which meals become available, and
            once Renown is high enough the Theater opens up as a second activity.
          </p>
          <p>
            Bond Level 2 arrives fairly quickly. Bond Level 3 is the wall: it costs time, money for
            meals and patience, and several units gate permanently behind it because their requirement
            list asks for Support Level 3 before any negotiation can start. Some units also show question
            marks instead of a number, which means the story has to move forward before the requirement
            becomes visible.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The roster at a glance
          </h2>
          <p>
            The roster splits three ways. There are {permanent.length} permanent recruits, made up of{" "}
            {permanent.filter((character) => character.kind === "route-army").length} units who belong
            to one of the four route armies and {permanent.filter((character) => character.kind === "recruitable").length}{" "}
            units who fight for one of the unaffiliated clans and can be picked up regardless of which
            Flame Lord you chose. Separately, {guests.length} characters appear as temporary Guest
            units, and {factions.length} further characters are recorded as members of named faction
            armies rather than as recruits.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The four route armies
          </h2>
          <p>
            Each Flame Lord leads an army that forms automatically at the start of their path, and a
            few members of each army can be pulled across to other paths later.
          </p>
          <div className="space-y-4">
            {routeArmies.map((army) => (
              <article
                key={army}
                className="rounded-lg border border-gray-200 p-5 dark:border-gray-800"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{army}</h3>
                <ul className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {permanent
                    .filter((character) => character.army === army)
                    .map((character) => (
                      <li key={character.id}>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {character.name}
                        </span>
                        {character.recruitableElsewhere
                          ? " - can also be recruited to another path"
                          : ""}
                      </li>
                    ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The four unaffiliated clans
          </h2>
          <p>
            These units compete in the Heroic Games and afterwards can be recruited by any Flame Lord,
            which makes them the most reliable way to fill a gap in a roster regardless of route.
          </p>
          <div className="space-y-4">
            {clans.map((clan) => (
              <article
                key={clan}
                className="rounded-lg border border-gray-200 p-5 dark:border-gray-800"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{clan}</h3>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {permanent
                    .filter((character) => character.army === clan)
                    .map((character) => character.name)
                    .join(", ")}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Recruitment requirements by route
          </h2>
          <p>
            The rows below are keyed by both the unit being recruited and the Flame Lord you are
            playing, because the same recruit costs different amounts on different paths. Only rows the
            sources label with an explicit route are listed; where a requirement is not recorded, that
            is stated rather than filled in.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                  <th className="py-2 pr-4">Recruit</th>
                  <th className="py-2 pr-4">Playing as</th>
                  <th className="py-2 pr-4">Support</th>
                  <th className="py-2 pr-4">Renown</th>
                  <th className="py-2">Negotiation</th>
                </tr>
              </thead>
              <tbody>
                {recruits.map((row) => (
                  <tr key={row.id} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                      {row.character}
                    </td>
                    <td className="py-2 pr-4">{row.playingAs}</td>
                    <td className="py-2 pr-4">
                      {row.supportLevelRequired === null ? "Not recorded" : row.supportLevelRequired}
                    </td>
                    <td className="py-2 pr-4">
                      {row.renownLevelRequired === null ? "Not recorded" : row.renownLevelRequired}
                    </td>
                    <td className="py-2">{row.negotiation || "Not recorded"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Named faction armies
          </h2>
          <p>
            The roster page also lists {factions.length} further named characters who serve a named army
            rather than appearing on the playable roster. The four Obelisk armies belong to the four
            Flame Lords - Fox to Cai, Lion to Dietrich, Wolf to Theodora and Eagle to Leda - while Strife
            is the Part II war army, which is why these names matter for placing who is on whose side
            rather than for recruitment.
          </p>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {factionArmies.map((army) => (
              <li key={army}>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {army}
                  {factions.find((entry) => entry.faction === army && entry.obeliskOwner !== "")
                    ? " (" +
                      factions.find((entry) => entry.faction === army && entry.obeliskOwner !== "")
                        ?.obeliskOwner +
                      ")"
                    : ""}
                </span>
                :{" "}
                {factions
                  .filter((entry) => entry.faction === army)
                  .map((entry) => entry.name)
                  .join(", ")}
              </li>
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
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quick answers</h2>
          <p>
The Fire Emblem: Fortune&apos;s Weave characters on this page are grouped by the army they join, and Fire Emblem: Fortune&apos;s Weave recruitment is keyed by the Flame Lord you are playing rather than by one universal price. Looking for a Fire Emblem: Fortune&apos;s Weave character tier list? That is a judgement call rather than a fact, so this page records roles and requirements instead of ranking them.
          </p>
        </section>
      </main>
    </>
  );
}
