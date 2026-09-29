"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import activitiesData from "@/data/activities.json";
import YouTubeEmbed from "@/components/YouTubeEmbed";

const prompts = activitiesData.prompts;
const characters = Array.from(new Set(prompts.map((row) => row.character))).sort((x, y) =>
  x.localeCompare(y)
);

const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

export default function BirdTimeLookupPage() {
  const [query, setQuery] = useState("");
  const [character, setCharacter] = useState("All");

  const matches = useMemo(() => {
    const needle = normalize(query);
    return prompts
      .filter((row) => character === "All" || row.character === character)
      .filter((row) => (needle ? normalize(row.prompt).includes(needle) : true))
      .slice(0, 60);
  }, [query, character]);

  const totalForCharacter = prompts.filter(
    (row) => character === "All" || row.character === character
  ).length;

  return (
    <>
      <PageHeader
        title="Bird Time Lookup"
        description="Type the line the raven just said and read the reaction that answers it, without scanning a long page mid-session."
        path="/tools/bird-time/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Find your prompt</h2>
          <label className="block">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Part of the line the raven said
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. fishing, hide-and-seek, feathers"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {["All"].concat(characters).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setCharacter(name)}
                className={
                  "rounded-lg border px-3 py-1 text-sm font-medium " +
                  (name === character
                    ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                    : "border-gray-300 text-gray-900 dark:border-gray-700 dark:text-gray-100")
                }
              >
                {name}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {"Showing " + matches.length + " of " + totalForCharacter +
              " prompts for this selection. Matching ignores punctuation and case, so a few words from the line are enough."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Correct reactions</h2>
          {matches.length === 0 ? (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              No prompt matched that search. Try a shorter fragment of the line, or clear the search and
              pick the character to see every recorded prompt for them.
            </p>
          ) : (
            <ul className="space-y-2">
              {matches.map((row) => (
                <li key={row.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <p className="text-gray-700 dark:text-gray-300">{row.prompt}</p>
                  <p className="mt-2 font-semibold text-gray-900 dark:text-gray-100">
                    {row.reaction}
                  </p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {row.character}
                    {row.reactionTier === "rarely" ? " - rarely correct reaction" : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How to use this lookup
          </h2>
          <p>
            Start the feeding, read the line the raven presents, then type a few words from it here. The
            matching ignores case and punctuation, so a fragment is enough: feathers, hide-and-seek, or
            whoever the line mentions. Narrow it further with the character buttons when you already know
            who you are feeding with, which is the faster path because each character only has around ten
            recorded prompts.
          </p>
          <p>
            There is no time limit on a prompt, so there is no penalty for looking the answer up. That is
            worth saying out loud because the weekly reset makes players treat the minigame as a timed
            test; it is not one. Take the moment, answer correctly, and the reward is the same either way.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Why the wrong answers cannot be listed
          </h2>
          <p>
            Each prompt offers three reactions and exactly one is correct, but the two wrong reactions are
            randomised every time. That is why this lookup pairs a prompt with the answer that works
            rather than presenting a full multiple-choice key: the distractors are different on your
            screen from the ones anyone else saw, so a key would be wrong more often than it was right.
          </p>
          <p>
            The practical consequence is that recognition beats recall. Read the correct reaction and
            pick it out of the three, and the randomised distractors stop mattering entirely.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            When a rarely correct reaction is the right one
          </h2>
          <p>
            Reactions such as Dance, Preen or Sing softly sit on the rarely correct list, and it is easy
            to read that as a list of traps. It is not. Those reactions are reserved for very contextual
            prompts, and a handful of the prompts recorded here are answered with one of them. This
            lookup flags those rows so that you can see the exception rather than assume the list is
            absolute.
          </p>
          <p>
            If a reaction you expected is missing from a row, the source for that row simply recorded the
            other answer. Where a prompt has no recorded answer at all, the row is left out rather than
            filled with a guess, which keeps every entry here traceable to the guide it came from.
          </p>
        </section>
        {/* Video intel: yfNwi8r8EdY */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; verified English captions
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Reading the prompt, not the character</h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-200">The Game Looters</span> &middot;{" "}
              <span className="font-mono">yfNwi8r8EdY</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed videoId="yfNwi8r8EdY" title="Fire Emblem: Fortune's Weave - NEVER Fail Perfect Bird Time Again!" />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">The Game Looters treat Bird Time as the game's oddest weekly mechanic and work through it in the captions, which is the framing this lookup uses too.</p>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><span className="font-semibold text-zinc-200">One per week.</span> There is a single Bird Time interaction each week, so a bad round costs a week of support rather than a retry.</li>
              <li><span className="font-semibold text-zinc-200">Three prompts.</span> After you pick the character and the item to offer, the raven gives three prompts, and the correct reaction follows the wording of each prompt.</li>
              <li><span className="font-semibold text-zinc-200">Worked example.</span> In the creator's Cai run the unwind prompt is answered by singing, the fishing invitation by spreading your wings, and the birdsong prompt by singing again.</li>
              <li><span className="font-semibold text-zinc-200">Personality fallback.</span> Where a prompt is ambiguous he falls back on the unit's motivation, reading Cai as a hero complex protagonist who looks up to his father and wants the invitation accepted.</li>
          </ul>
        </section>

      </main>
    </>
  );
}
