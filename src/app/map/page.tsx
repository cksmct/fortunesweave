"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import NativeBannerAd from "@/components/NativeBannerAd";
import locationsData from "@/data/locations.json";
import YouTubeEmbed from "@/components/YouTubeEmbed";

const STORAGE_KEY = "fw:map-cleared:v1";
const dungeons = locationsData.dungeons;

const COLUMNS = 3;
const CELL_W = 320;
const CELL_H = 132;
const PADDING = 24;

const renownValue = (entry: (typeof dungeons)[number]) =>
  entry.renownRequired === "N/A" ? null : Number(entry.renownRequired);

/** 首渲染用空状态，清除进度在 effect 里读入，避免 hydration mismatch。 */
export default function MapPage() {
  const regions = useMemo(
    () => Array.from(new Set(dungeons.map((entry) => entry.region))).sort((x, y) => x.localeCompare(y)),
    []
  );
  const [cleared, setCleared] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setCleared(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      setCleared({});
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleared));
    } catch {
      /* storage unavailable: the checklist still works for this session */
    }
  }, [cleared, loaded]);

  const rows = Math.ceil(regions.length / COLUMNS);
  const width = PADDING * 2 + COLUMNS * CELL_W;
  const height = PADDING * 2 + rows * CELL_H;
  const clearedCount = dungeons.filter((entry) => cleared[entry.id]).length;

  const renownGroups = useMemo(() => {
    const values = Array.from(new Set(dungeons.map(renownValue).filter((value) => value !== null) as number[])).sort(
      (x, y) => x - y
    );
    return values.map((value) => ({
      value,
      entries: dungeons
        .filter((entry) => renownValue(entry) === value)
        .sort((x, y) => x.name.localeCompare(y.name)),
    }));
  }, []);
  const unrecorded = dungeons.filter((entry) => renownValue(entry) === null);

  return (
    <>
      <PageHeader
        title="Schematic Map"
        description="Every dungeon grouped by the region it sits in, with the Renown gate on each pin, so you can tick them off as you clear them."
        path="/map/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What this map is, and what it is not
          </h2>
          <p>
            {"This Fortune\u0027s Weave map is a schematic index rather than a drawn replica of the Dagdan Empire. Regions are placed in a reading order grid and dungeons sit inside their region box, because no officially licensed map art is reproduced here and a hand-traced copy of one would be both inaccurate and unnecessary. What the layout does give you is the grouping that matters in play: which dungeon belongs to which region, and what each one asks of you before it opens."}
          </p>
          <p>
            {"Every pin carries the dungeon name and its Renown gate, and clicking a pin ticks it as cleared. Progress is stored in your browser under a single local storage key, so nothing is uploaded and no account is needed. " +
              clearedCount + " of " + dungeons.length + " dungeons are currently ticked."}
          </p>
        </section>

        {/* 黄金次屏 Adsterra 原生信息流广告位 */}
        <NativeBannerAd />

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {regions.length} regions, {dungeons.length} dungeons
          </h2>
          <svg
            viewBox={"0 0 " + width + " " + height}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800"
            role="img"
            aria-label="Schematic index of dungeons by region"
          >
            {regions.map((region, index) => {
              const column = index % COLUMNS;
              const rowIndex = Math.floor(index / COLUMNS);
              const x = PADDING + column * CELL_W;
              const y = PADDING + rowIndex * CELL_H;
              const entries = dungeons
                .filter((entry) => entry.region === region)
                .sort((a, b) => {
                  const ra = renownValue(a);
                  const rb = renownValue(b);
                  return (ra === null ? 999 : ra) - (rb === null ? 999 : rb) || a.name.localeCompare(b.name);
                });
              return (
                <g key={region}>
                  <rect
                    x={x}
                    y={y}
                    width={CELL_W - 16}
                    height={CELL_H - 16}
                    rx={10}
                    className="fill-none stroke-gray-300 dark:stroke-gray-700"
                  />
                  <text x={x + 14} y={y + 26} className="fill-gray-900 text-[13px] font-semibold dark:fill-gray-100">
                    {region}
                  </text>
                  {entries.map((entry, pinIndex) => {
                    const pinX = x + 18 + (pinIndex % 2) * 148;
                    const pinY = y + 48 + Math.floor(pinIndex / 2) * 22;
                    const isCleared = Boolean(cleared[entry.id]);
                    return (
                      <g
                        key={entry.id}
                        className="cursor-pointer"
                        onClick={() =>
                          setCleared((previous) => ({ ...previous, [entry.id]: !previous[entry.id] }))
                        }
                      >
                        <title>
                          {entry.name +
                            " - Renown " +
                            (entry.renownRequired === "N/A" ? "not recorded" : entry.renownRequired) +
                            ", enemy level " +
                            entry.level}
                        </title>
                        <circle
                          cx={pinX}
                          cy={pinY - 4}
                          r={5}
                          className={isCleared ? "fill-emerald-500" : "fill-gray-400 dark:fill-gray-600"}
                        />
                        <text x={pinX + 10} y={pinY} className="fill-gray-700 text-[11px] dark:fill-gray-300">
                          {entry.name.length > 19 ? entry.name.slice(0, 18) + "." : entry.name}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Pins are ordered by Renown inside each region. A filled circle means you have ticked that
            dungeon as cleared; the tick is local to this browser.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What each Renown level opens
          </h2>
          <p>
            Renown is the account-wide gate, so it is the number that decides whether a pin on the map
            is a destination or a wall. Grouping the dungeons by it turns the map into a schedule: reach
            a new Renown level and a fresh set of chests becomes legally reachable.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {renownGroups.map((group) => (
              <div key={group.value} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {"Renown " + group.value}
                  <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                    {group.entries.length} dungeons
                  </span>
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {group.entries.map((entry) => (
                    <li key={entry.id}>
                      {entry.name + " - " + entry.region + " - level " + entry.level + " - " + entry.treasureCount + " recorded treasures"}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {unrecorded.length > 0 ? (
            <p className="text-gray-700 dark:text-gray-300">
              {"The " + unrecorded.length + " remaining dungeons are the ones recorded with no Renown number at all, both of them in seas rather than regions. They are listed on the dungeons page with their regions and levels instead of being slotted into a Renown tier."}
            </p>
          ) : null}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How to plan a dungeon sweep
          </h2>
          <p>
            Work down the Renown groups rather than around the map. The gate is the only hard filter, and
            once it opens the remaining question is whether the enemy level is survivable, which is why
            every pin shows both numbers. A Renown 6 dungeon holding level 14 enemies is a different
            afternoon from a Renown 6 dungeon holding level 30 ones, even though they unlock together.
          </p>
          <p>
            Tick as you go, and treat the ticks as provisional rather than permanent. Part 3 replenishes
            every dungeon with new chests and scales the enemies inside, so a ticked pin means the first
            pass is done, not that the dungeon is finished.
          </p>
          <p>
            If a recipe or a promotion is stalling, check the map before grinding the overworld.
            Manuals, gems and seals all sit in chests, and the two sea dungeons in particular hold
            rewards that are easy to miss because they need a specific path, or a later part of the
            story, to reach at all.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quick answers</h2>
          <p>
This Fire Emblem: Fortune&apos;s Weave world map is schematic rather than drawn to scale: regions sit in reading order and every dungeon is pinned inside the region it belongs to, with its Renown gate and enemy level attached.
          </p>
        </section>
        {/* Video intel: dL8zgj_M85k */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; verified English captions
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Unlocking the carriage line</h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-200">Gamers Heroes</span> &middot;{" "}
              <span className="font-mono">dL8zgj_M85k</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed videoId="dL8zgj_M85k" title="How To Unlock Posthouse Carriage Fast Travel For Cai In Fire Emblem Fortunes Weave" />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">Gamers Heroes walks the unlock itself in the captions: the carriage travel that opens Cai's posthouse routes is a Chapter 7 quest rather than a shop purchase.</p>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><span className="font-semibold text-zinc-200">Where it starts.</span> Reach Part I Chapter 7 and then look in the main city for an old man sitting beside a cart; his marker appears on the map like any other subquest.</li>
              <li><span className="font-semibold text-zinc-200">What it costs.</span> He sends you for one specific axle, and the shop charges five hundred gold for it, so the creator's advice is to carry cash or goods to sell before setting off.</li>
              <li><span className="font-semibold text-zinc-200">The route.</span> The creator tries the God Gate in the main city first and then heads south west; walking the long way round is the fallback if that route is not open for you yet.</li>
          </ul>
        </section>

      </main>
    </>
  );
}
