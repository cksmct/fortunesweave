import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import charactersData from "@/data/characters.json";
import YouTubeEmbed from "@/components/YouTubeEmbed";

const characters = charactersData.characters;
const factions = charactersData.factions;

const playable = characters.filter((entry) => entry.playable);
const routeArmies = Array.from(
  new Set(characters.filter((entry) => entry.kind === "route-army").map((entry) => entry.army))
);
const clans = Array.from(
  new Set(characters.filter((entry) => entry.kind === "recruitable").map((entry) => entry.army))
);
const factionArmies = Array.from(new Set(factions.map((entry) => entry.faction)));
const obeliskArmies = factionArmies.filter((army) => /Obelisk$/i.test(army));
const otherArmies = factionArmies.filter((army) => !/Obelisk$/i.test(army));

const ownerOf = (army: string) => {
  const match = factions.find((entry) => entry.faction === army && entry.obeliskOwner !== "");
  return match ? match.obeliskOwner : "";
};
const members = (army: string) => factions.filter((entry) => entry.faction === army).map((entry) => entry.name);

const FAQS = [
  {
    question: "How many factions are in Fortune\u0027s Weave?",
    answer:
      "The roster checked records " + (routeArmies.length + clans.length) + " playable groupings (the route armies plus the Promised One\u0027s Army party and six unaffiliated clans) and " + factionArmies.length + " further named armies that carry characters who are not on the playable roster.",
  },
  {
    question: "What is an Obelisk army?",
    answer:
      "Each Flame Lord leads an Obelisk: Fox is Cai, Lion is Dietrich, Wolf is Theodora and Eagle is Leda. Strife is the Part II war army, which is why the name appears with the largest roster of the five.",
  },
  {
    question: "Why do some factions have far more names than others?",
    answer:
      "Because the sizes differ in the game, not in the record. Mosa and the Strife Obelisk carry large named casts while the Eagle Obelisk lists four, and the counts here come from the roster rather than from an assumption that every army should be comparable.",
  },
  {
    question: "Are the unaffiliated clans available on every route?",
    answer:
      "Yes. The four Heroic Games clans compete independently of the path you choose, which is why they are the reliable way to fill a roster gap regardless of which Flame Lord you picked.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Factions and Armies",
  description:
    "Every Fire Emblem: Fortune\u0027s Weave faction: the four Obelisk route armies, the unaffiliated clans, and the named armies behind the playable roster.",
  path: "/factions/",
});

export default function FactionsPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Factions", item: "/factions/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Factions and Armies"
        description="Four Obelisk armies, six unaffiliated clans and the named armies that carry everyone else, with counts taken from the roster rather than from assumptions."
        path="/factions/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How the armies map to the paths
          </h2>
          <p>
            {"Fortune\u0027s Weave names ten playable groupings and ten further armies that appear in the story without joining you. The naming is the part worth learning: each Flame Lord leads an Obelisk, so Fox is Cai, Lion is Dietrich, Wolf is Theodora and Eagle is Leda, and those four banners are what the Part I chapter lists are grouped under. Strife is the Part II war army that gathers the four paths into one front."}
          </p>
          <p>
            {"Underneath that sit the unaffiliated clans who compete in the Heroic Games regardless of your route. That independence is practical rather than cosmetic: a clan unit can be recruited on any path, which makes them the reliable way to patch a roster hole created by your choice of Flame Lord."}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The route armies and the party
          </h2>
          <div className="space-y-4">
            {routeArmies.map((army) => (
              <article key={army} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {army}
                  <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                    {characters.filter((entry) => entry.army === army).length} recorded
                  </span>
                </h3>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {playable
                    .filter((entry) => entry.army === army)
                    .map((entry) => entry.name)
                    .join(", ")}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The unaffiliated clans
          </h2>
          <div className="space-y-4">
            {clans.map((clan) => (
              <article key={clan} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {clan}
                  <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                    {characters.filter((entry) => entry.army === clan).length} recorded
                  </span>
                </h3>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {playable
                    .filter((entry) => entry.army === clan)
                    .map((entry) => entry.name)
                    .join(", ")}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The named armies behind the roster
          </h2>
          <p>
            {"These armies carry characters who appear in the story but who are not recorded on the playable roster, which is why they are kept separate from recruits rather than mixed into them."}
          </p>
          <div className="space-y-4">
            {obeliskArmies.concat(otherArmies).map((army) => (
              <article key={army} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {army}
                  {ownerOf(army) ? (
                    <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                      {ownerOf(army)}
                    </span>
                  ) : null}
                  <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                    {members(army).length} recorded
                  </span>
                </h3>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {members(army).join(", ")}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reading the counts
          </h2>
          <p>
            {"Army sizes differ sharply rather than clustering, and that shape is worth noticing when planning a route: a large named army usually means a large cast to plan around, while a small one means the path leans harder on the units you recruit yourself. The counts here are derived from the roster rows rather than written into the page, so they move when the underlying data does."}
          </p>
          <p>
            {"Where a character appears under two banners, both are recorded: guests and cross-path recruits list the army they arrive with, and the characters page notes which units can be pulled to another path. Faction membership is a placement tool rather than a recruitment rule."}
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
            The characters page carries the roster side of this: who joins which army, what each recruit
            asks for, and which units can be pulled across paths.
          </p>
        </section>
        {/* Video intel: 8PwLFaicAkY */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; verified English captions
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Splitting the Part 1 roster four ways</h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-200">Nagapedia</span> &middot;{" "}
              <span className="font-mono">8PwLFaicAkY</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed videoId="8PwLFaicAkY" title="The Perfect Groups for Every Route in Fire Emblem: Fortune's Weave" />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">Nagapedia's captioned guide divides every unit recruitable in Part 1 across the four paths, which is the planning problem the route tables above describe.</p>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><span className="font-semibold text-zinc-200">Stated priority.</span> The creator's first rule is that no unit is left behind before the story leaves Part 1, and the whole division is optimised for that.</li>
              <li><span className="font-semibold text-zinc-200">Format.</span> It is built as a tier list template rather than a story video, so it can be read beside the route counts on this page.</li>
              <li><span className="font-semibold text-zinc-200">Why it is needed.</span> He notes that each path carries different requirements per unit, the same reason this page keeps the route column separate from the roster list.</li>
          </ul>
        </section>

      </main>
    </>
  );
}
