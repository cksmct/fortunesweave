"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import recruitmentData from "@/data/recruitment.json";
import charactersData from "@/data/characters.json";

const STORAGE_KEY = "fw:recruitment-planner:v1";
const ROUTES = ["Cai", "Dietrich", "Theodora", "Leda"];

const recruits = recruitmentData.recruits;
const characters = charactersData.characters;
const likesFor = (name: string) => {
  const match = characters.find((character) => character.name === name);
  return match ? match.army : "";
};

/** 首渲染用空状态，勾选进度在 effect 里读入，避免 hydration mismatch。 */
export default function RecruitmentPlannerPage() {
  const [route, setRoute] = useState("Cai");
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setJoined(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      setJoined({});
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(joined));
    } catch {
      /* storage unavailable: the planner still works for this session */
    }
  }, [joined, loaded]);

  const rows = recruits
    .filter((row) => row.playingAs === route)
    .slice()
    .sort((a, b) => {
      const ra = a.renownLevelRequired === null ? 999 : a.renownLevelRequired;
      const rb = b.renownLevelRequired === null ? 999 : b.renownLevelRequired;
      if (ra !== rb) return ra - rb;
      return a.character.localeCompare(b.character);
    });
  const joinedCount = rows.filter((row) => joined[row.id]).length;
  const cheapest = rows.find((row) => row.renownLevelRequired !== null);
  const hardest = rows.filter((row) => row.negotiation === "Hard").length;

  return (
    <>
      <PageHeader
        title="Recruitment Planner"
        description="Choose the Flame Lord you are playing and the requirements sort themselves by Renown, so you can see which recruit is actually cheap on your route."
        path="/tools/recruitment-planner/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Choose your Flame Lord
          </h2>
          <div className="flex flex-wrap gap-2">
            {ROUTES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRoute(option)}
                className={
                  "rounded-lg border px-4 py-2 text-sm font-semibold " +
                  (route === option
                    ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                    : "border-gray-300 text-gray-900 dark:border-gray-700 dark:text-gray-100")
                }
              >
                {option}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {rows.length} recorded recruitment rows on this route. {joinedCount} ticked as recruited.
            {cheapest
              ? " Cheapest recorded target: " + cheapest.character + " at Renown " + cheapest.renownLevelRequired + "."
              : ""}{" "}
            {hardest > 0 ? hardest + " of them end in a Hard negotiation." : ""}
          </p>
        </section>

        {/* Tactical Video Guide & Field Breakdown */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Verified Video Intel &middot; Audio Transcript
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                Character Tier List &amp; Strategic Recruitment Priority
              </h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">Jay Dunna</span> &middot; Verified English Captions
            </div>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="w474XVj7-vg"
              title="BEST CHARACTERS in Fire Emblem: Fortune's Weave TIER LIST"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                01 &middot; S-Tier Anchors
              </span>
              <h3 className="text-sm font-semibold text-white">Sarraco, Kai &amp; Dietrich</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Kai commands +1 base move with mixed damage; Dietrich boasts unrivaled physical growths and free Moving Shadow spam; Sarraco acts as an immortal magic dodge-tank healing 5 HP after combat while packing Thoron, Excalibur, and Warp.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                02 &middot; Safe Ranged Sniping
              </span>
              <h3 className="text-sm font-semibold text-white">Peter (Bear) &amp; Steady Aim</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Peter pairs <em>Steady Aim</em> (+1 bow range on combat arts) with an extraordinary 80% Dexterity growth in Sniper. This allows him to safely chip lethal bosses and one-shot flyers from outside enemy counterattack ranges.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                03 &middot; High Scalers
              </span>
              <h3 className="text-sm font-semibold text-white">Moo &amp; Inoni Combat Roles</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Moo scales exponentially via <em>Signs of Growth</em> into an untouchable Pugilist brawler. Inoni dominates as a heavy archer with innate +3 Str, +4 Atk, and +10 Crit on bow arts, consistently deleting mages in Hard mode.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Requirements, cheapest first
          </h2>
          {rows.length === 0 ? (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              No labelled recruitment rows are recorded for this route yet. The other routes may have
              entries, and the characters page lists the full route-army rosters.
            </p>
          ) : (
            <ul className="space-y-2">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-800"
                >
                  <label className="flex cursor-pointer items-start gap-3 p-4">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={Boolean(joined[row.id])}
                      onChange={() =>
                        setJoined((previous) => ({ ...previous, [row.id]: !previous[row.id] }))
                      }
                    />
                    <span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {row.character}
                      </span>
                      <span className="mt-1 block text-sm text-gray-700 dark:text-gray-300">
                        Support Level {row.supportLevelRequired === null ? "not recorded" : row.supportLevelRequired} | Renown{" "}
                        {row.renownLevelRequired === null ? "not recorded" : row.renownLevelRequired} | Negotiation:{" "}
                        {row.negotiation || "not recorded"}
                      </span>
                      <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">
                        {likesFor(row.character) ? "Found in: " + likesFor(row.character) : "Army not recorded"}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How to use this planner
          </h2>
          <p>
            Pick the Flame Lord you are actually playing. The list re-sorts so the cheapest recorded
            requirement sits first, which is the question worth asking: not who is strongest, but who
            is reachable with the Renown you currently have. Renown is account-wide and rises from
            story missions, subquests and your Flame Lord specific activities, so a recruit that looks
            expensive now usually becomes affordable two or three chapters later.
          </p>
          <p>
            Tick a row once the unit has joined. Ticks are stored in your browser under a single local
            storage key, so nothing is uploaded and no account is needed. Clearing site data for this
            domain resets the list.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reading the three requirement columns
          </h2>
          <p>
            Support Level is the Bond Level your Flame Lord needs with that unit. Every character
            starts at level 1, and a gift is what starts the process at all; meals follow, and the
            Theater becomes available once Renown is high enough. Support Level 3 appears on almost
            every row here, which is the single biggest reason recruitment stalls: level 2 comes quickly
            and level 3 takes real investment.
          </p>
          <p>
            Renown is the account-wide gate. The negotiation column is the third layer and the least
            predictable: some recruits end in a dialogue test where the correct choices have to be
            picked, and a Hard negotiation on a row means the requirement list alone will not finish the
            job. Where a source has not recorded the difficulty, the row says so instead of guessing.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Why the route switch matters so much
          </h2>
          <p>
            The same character can cost different amounts depending on which Flame Lord you chose. A
            row that needs Renown 7 on one path can need Renown 10 on another, and the negotiation
            difficulty can change with it. That is why this planner is keyed by route rather than
            offering one universal price list: a universal number would be wrong for three of the four
            playthroughs.
          </p>
          <p>
            Rows are only published where the sources label the requirement with an explicit route. The
            remaining entries in those cross-tables cannot be mapped to a route with confidence once the
            tables are converted to text, so they are left out and the gap is stated on the page rather
            than filled with a plausible guess.
          </p>
        </section>
      </main>
    </>
  );
}
