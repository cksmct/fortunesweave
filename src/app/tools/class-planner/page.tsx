"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import tiersData from "@/data/class-tiers.json";
import classesData from "@/data/classes.json";

const STORAGE_KEY = "fw:class-mastery:v1";
const ROUTES = ["all", "Cai", "Dietrich", "Theodora", "Leda"];

const tiers = tiersData.tiers;
const classes = classesData.classes;

/** 首渲染用空状态，掌握进度在 effect 里读入，避免 hydration mismatch。 */
export default function ClassPlannerPage() {
  const [route, setRoute] = useState("all");
  const [mastered, setMastered] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setMastered(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      setMastered({});
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mastered));
    } catch {
      /* storage unavailable: the planner still works for this session */
    }
  }, [mastered, loaded]);

  const available = classes.filter(
    (entry) => route === "all" || !entry.routes || entry.routes.includes(route)
  );
  const masteredCount = available.filter((entry) => mastered[entry.id]).length;

  return (
    <>
      <PageHeader
        title="Class Certification Planner"
        description="Pick a route to see which classes it can actually reach, then tick off the ones you have mastered so the growth bonuses you keep do not get forgotten."
        path="/tools/class-planner/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pick your route</h2>
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
                {option === "all" ? "All routes" : option}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {available.length} of {classes.length} recorded classes are reachable here. {masteredCount}{" "}
            ticked as mastered.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Exam gates</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
              >
                <span className="font-semibold text-gray-900 dark:text-gray-100">{tier.name}</span>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{tier.unlock}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Classes and mastery
          </h2>
          <ul className="space-y-2">
            {available.map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg border border-gray-200 dark:border-gray-800"
              >
                <label className="flex cursor-pointer items-start gap-3 p-4">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={Boolean(mastered[entry.id])}
                    onChange={() =>
                      setMastered((previous) => ({
                        ...previous,
                        [entry.id]: !previous[entry.id],
                      }))
                    }
                  />
                  <span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {entry.name}
                    </span>
                    <span className="mt-1 block text-sm text-gray-700 dark:text-gray-300">
                      {entry.tier} | Weapons: {entry.weapons} | Movement: {entry.movement}
                    </span>
                    <span className="mt-1 block text-sm text-gray-700 dark:text-gray-300">
                      Mastery: {entry.mastery}
                    </span>
                    {entry.routes ? (
                      <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">
                        Route-specific: {entry.routes.join(", ")}
                      </span>
                    ) : null}
                    {entry.note ? (
                      <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">
                        {entry.note}
                      </span>
                    ) : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How to use this planner
          </h2>
          <p>
            Choose your route and the list narrows to the classes that route can actually certify
            into. Route-specific entries are marked, so it is immediately clear which options are
            locked to another Flame Lord. Tick a class once you have mastered it: the tick is the
            record of a permanent ability, which is the part of the class system that survives
            changing class again.
          </p>
          <p>
            Progress is stored in your browser under a single local storage key. Nothing is uploaded
            and no account is needed; clearing site data for this domain resets the ticks.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reading the exam gates
          </h2>
          <p>
            The tier tabs are not cosmetic. Beginner exams are the ones you can take immediately,
            specialty exams are reported to open at Renown level 4, and advanced exams at Renown level
            8. That means Renown is not just a scoreboard for recruitment: it is the currency that
            widens your class options, and the reason an early Renown push pays off later in the run.
          </p>
          <p>
            Two well-placed beginner classes cover most of the early game. Gladiator converts a unit
            into a physical growth project by adding HP and Strength growth, while Diviner does the
            same for magic and hands over Magic Basics on mastery. Hunter is the odd recommendation
            that looks small and is not, because a single point of Speed modifier decides doubling
            thresholds.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Growth versus modifiers, in one paragraph
          </h2>
          <p>
            Class growth additions are statistics you accumulate slowly, and they leave when you leave
            the class. Class base modifiers are applied at once and also leave. Mastery abilities are
            the only part you keep forever. Plan accordingly: sit in a class long enough to master the
            ability you actually want, take the stat modifiers you need for the fight in front of you,
            and treat route-specific classes as planning constraints rather than optional extras,
            because on some routes they are the entire top end of the list.
          </p>
        </section>
      </main>
    </>
  );
}
