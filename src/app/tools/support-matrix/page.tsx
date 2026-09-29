"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import supportsData from "@/data/supports.json";
import YouTubeEmbed from "@/components/YouTubeEmbed";

const STORAGE_KEY = "fw:support-matrix:v1";
const supports = supportsData.supports;

const partnersOf = (name: string) =>
  supports
    .filter((pair) => pair.a === name || pair.b === name)
    .map((pair) => ({
      id: pair.id,
      partner: pair.a === name ? pair.b : pair.a,
      ranks: pair.ranks,
      maxRank: pair.maxRank,
      conditions: pair.conditions,
    }))
    .sort((x, y) => {
      const rankOrder = ["A", "B", "C"];
      const rx = rankOrder.indexOf(x.maxRank);
      const ry = rankOrder.indexOf(y.maxRank);
      if (rx !== ry) return rx - ry;
      return x.partner.localeCompare(y.partner);
    });

/** 首渲染用空状态，勾选进度在 effect 里读入，避免 hydration mismatch。 */
export default function SupportMatrixPage() {
  const characters = useMemo(
    () =>
      Array.from(new Set(supports.flatMap((pair) => [pair.a, pair.b]))).sort((x, y) =>
        x.localeCompare(y)
      ),
    []
  );
  const [character, setCharacter] = useState("Cai");
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      setDone({});
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
    } catch {
      /* storage unavailable: the matrix still works for this session */
    }
  }, [done, loaded]);

  const partners = partnersOf(character);
  const aRank = partners.filter((entry) => entry.maxRank === "A").length;
  const locked = partners.filter((entry) => entry.conditions.length > 0).length;
  const ticked = partners.filter((entry) => done[entry.id]).length;

  return (
    <>
      <PageHeader
        title="Support Matrix"
        description="Choose a character and the matrix lists every recorded partner, the highest conversation rank that bond can reach, and any lock standing in the way."
        path="/tools/support-matrix/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Choose a character</h2>
          <div className="flex flex-wrap gap-2">
            {characters.map((name) => (
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
            {"Recorded partners for " + character + ": " + partners.length + ". Reaching A rank: " +
              aRank + ". Carrying an unlock condition: " + locked + "."}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Partners, highest rank first
          </h2>
          {partners.length === 0 ? (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              No recorded support rows for this character yet. The supports page carries the full pair
              table as the source set fills in.
            </p>
          ) : (
            <ul className="space-y-2">
              {partners.map((entry) => (
                <li key={entry.id} className="rounded-lg border border-gray-200 dark:border-gray-800">
                  <label className="flex cursor-pointer items-start gap-3 p-4">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={Boolean(done[entry.id])}
                      onChange={() =>
                        setDone((previous) => ({ ...previous, [entry.id]: !previous[entry.id] }))
                      }
                    />
                    <span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {entry.partner}
                      </span>
                      <span className="mt-1 block text-sm text-gray-700 dark:text-gray-300">
                        {"Conversations: " + entry.ranks.join(", ") + " | Highest: " + entry.maxRank}
                      </span>
                      <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">
                        {entry.conditions.length > 0
                          ? "Opens when: " + entry.conditions.join("; ")
                          : "No lock recorded"}
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
            How to use this matrix
          </h2>
          <p>
            Pick the character you are curious about, or the one whose conversations you want to open
            next. The list sorts by the highest rank each bond can reach, so the pairings worth investing
            in sit at the top and the rows that never go past a C conversation fall to the bottom. That
            ordering is the whole point: support ratings are earned by fighting and working together, and
            time spent on a bond that cannot advance is time taken from one that can.
          </p>
          <p>
            Tick a row once the conversation has been read. Progress is stored in your browser under a
            single local storage key, so the matrix needs no account and uploads nothing. Clearing site
            data for this domain resets it.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Why some rows are locked
          </h2>
          <p>
            A padlock in the tavern support list means the game is withholding a conversation until
            something else happens first. The conditions recorded so far fall into four shapes: reaching
            a later part of the story, reaching a named chapter such as Chapter 7 or Chapter 9,
            recruiting the unit at all, or a requirement the source itself leaves as question marks.
          </p>
          <p>
            The practical consequence is that a locked row is not a bug and not something to grind at.
            If a bond waits on Part 3, no amount of shared combat will open it during Part 1. Checking
            the condition before investing meals, gifts and battle pairings is cheaper than discovering
            the lock two chapters later.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Planning a Paired Ending run
          </h2>
          <p>
            If the goal is a Paired Ending rather than a strong army, the useful filter is the A rank
            count. Only a minority of recorded pairs reach A rank, and it is the A rank that decides
            whether the epilogue can pair the two characters at all. Eshmel is the special case in the
            other direction: Eshmel can pick a Paired Ending outright at a maximum rating of 5, which
            turns the S rank scene into a choice rather than a threshold.
          </p>
          <p>
            Keep the roster in view while planning. A pair you cannot keep together because one of the
            two is locked to another route is a pair you cannot finish, and the characters page records
            which Flame Lord each unit belongs to and who can be pulled across to another path.
          </p>
          <p>
            Where the source tables are still being written, this matrix says so by leaving the row out
            rather than by inventing a rank. Rows appear as the tables fill in, which keeps every entry
            here checkable against the source it came from.
          </p>
        </section>
        {/* Video intel: pu_41dLLhso */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; verified English captions
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Turning orange dots green</h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-200">Joe Hammer Gaming</span> &middot;{" "}
              <span className="font-mono">pu_41dLLhso</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed videoId="pu_41dLLhso" title="How To Farm Support FOR FREE - Fire Emblem Fortune's Weave" />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">Joe Hammer Gaming's captioned method farms bond levels without spending gifts, and its first step is a map chore rather than a battle.</p>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><span className="font-semibold text-zinc-200">Step one.</span> Walk the map and talk to every orange dot until it turns green; each conversation adds that unit to the character list and makes them a teleport target.</li>
              <li><span className="font-semibold text-zinc-200">Step two.</span> With the list populated he farms bonds on the units he actually wants, instead of spreading gifts across the whole roster.</li>
              <li><span className="font-semibold text-zinc-200">Honest limit.</span> He states that this does not bypass the Renown level or the recruitment negotiations, so it cheapens the gate rather than removing it.</li>
          </ul>
        </section>

      </main>
    </>
  );
}
