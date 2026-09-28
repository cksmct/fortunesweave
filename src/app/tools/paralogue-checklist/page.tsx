"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import paraloguesData from "@/data/paralogues.json";
import windowsData from "@/data/paralogue-windows.json";

const STORAGE_KEY = "fw:paralogue-checklist:v1";
const ROUTES = ["all", "Cai", "Dietrich", "Theodora", "Leda"];

const paralogues = paraloguesData.paralogues;
const windows = windowsData.windows;

/**
 * 首渲染一律用空状态，进度在 useEffect 里从 localStorage 读入。
 * 严禁把 localStorage 读取写进 useState 初始值 —— SSR 预渲染与客户端首帧不一致会造成 hydration mismatch。
 */
export default function ParalogueChecklistPage() {
  const [route, setRoute] = useState("all");
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
      /* storage unavailable: the checklist still works for this session */
    }
  }, [done, loaded]);

  const visible = paralogues.filter(
    (paralogue) => route === "all" || paralogue.routeLocks.includes(route)
  );
  const ticked = visible.filter((paralogue) => done[paralogue.id]).length;
  const windowFor = (name: string) => windows.find((w) => w.route === name);

  return (
    <>
      <PageHeader
        title="Paralogue Checklist"
        description="Filter by route, tick what you have cleared, and see which windows are still open. Progress stays in your browser."
        path="/tools/paralogue-checklist/"
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
            Showing {visible.length} of {paralogues.length} paralogues. {ticked} ticked in this view.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Checklist</h2>
          <ul className="space-y-2">
            {visible.map((paralogue) => (
              <li
                key={paralogue.id}
                className="rounded-lg border border-gray-200 dark:border-gray-800"
              >
                <label className="flex cursor-pointer items-start gap-3 p-4">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={Boolean(done[paralogue.id])}
                    onChange={() =>
                      setDone((previous) => ({
                        ...previous,
                        [paralogue.id]: !previous[paralogue.id],
                      }))
                    }
                  />
                  <span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {paralogue.name}
                    </span>
                    <span className="mt-1 block text-sm text-gray-700 dark:text-gray-300">
                      Owner: {paralogue.ownerCharacter} | Routes: {paralogue.routeLocks.join(", ")}
                    </span>
                    <span className="mt-1 block text-xs text-gray-600 dark:text-gray-400">
                      Closes permanently once its window passes
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Route windows</h2>
          {windows.map((window) => (
            <div
              key={window.id}
              className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {window.route}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {window.paralogueCount} paralogues | {window.monthWindow}
                </span>
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
                {window.keyDates.map((date) => (
                  <li key={date}>{date}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{window.plan}</p>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How to use this checklist
          </h2>
          <p>
            Pick the route you are playing and the list narrows to the paralogues that route can
            actually reach, because route locks decide availability as much as the calendar does. Tick
            a paralogue once it is finished. Ticks are saved in your browser under a single local
            storage key, so nothing is uploaded and no account is needed. Clearing your browser data
            for this site resets the list.
          </p>
          <p>
            Because route locks overlap, a checklist filtered to one route will still show paralogues
            that other routes share. That is intentional: the question the list answers is
            whether you can reach a paralogue on the path you are on right now, not which route owns it
            conceptually.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Why the dates matter more than the order
          </h2>
          <p>
            Paralogues are not chapters in a sequence. They open on a date, stay open for a window, and
            close whether or not you noticed. Chapter select technically allows a return trip, but the
            distance back can be several chapters of progress, so the useful habit is to treat the
            windows as deadlines and plan free time around them rather than to improvise.
          </p>
          <p>
            Two practical rules follow. First, stop map exploration and auto-activity time progression
            when a window is approaching, since passing time is exactly what closes a door. Second,
            travel back to Dagsion before the date rather than on it; the trigger is a conversation in
            the city, and being somewhere else on a deadline day is the same as missing it.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What the two evidence tiers mean here
          </h2>
          <p>
            The paralogue list itself is cross-checked: the series wiki records which routes each
            paralogue is locked to, and the resulting per-route counts match the counts reported by
            launch-week guide coverage exactly, which is a strong independent agreement between a wiki
            listing and a hands-on walkthrough.
          </p>
          <p>
            The day-level windows are source-reported. They come from one detailed walkthrough that
            tracks the calendar date by date, and until a second source tracks the same dates, they are
            presented as one report rather than as settled fact. Where the game itself disagrees with
            the reported deadline, both figures are shown side by side.
          </p>
        </section>
      </main>
    </>
  );
}
