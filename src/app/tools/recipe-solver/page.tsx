"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import materialsData from "@/data/materials.json";
import recipesData from "@/data/drink-recipes.json";

const STORAGE_KEY = "fw:leaf-gathering:v1";

const materials = materialsData.materials;
const recipes = recipesData.recipes;

/** 首渲染用 null（SSR 与客户端一致），选中项在 effect 里落到第一个条目。 */
export default function RecipeSolverPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [got, setGot] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setGot(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      setGot({});
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(got));
    } catch {
      /* storage unavailable: gathering list still works for this session */
    }
  }, [got, loaded]);

  const selected = materials.find((material) => material.id === selectedId) ?? materials[0];
  const recipeFor = (leafName: string) => recipes.find((recipe) => recipe.leafRequired === leafName);
  const selectedRecipe = recipeFor(selected.name);
  const gathered = materials.filter((material) => got[material.id]).length;

  return (
    <>
      <PageHeader
        title="Drink Recipe Solver"
        description="Choose a leaf to see the best Search point, the alternates, and exactly what the matching quest pays out. Tick what you have already gathered."
        path="/tools/recipe-solver/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Choose a leaf</h2>
          <div className="flex flex-wrap gap-2">
            {materials.map((material) => (
              <button
                key={material.id}
                type="button"
                onClick={() => setSelectedId(material.id)}
                className={
                  "rounded-lg border px-4 py-2 text-sm font-semibold " +
                  (selected.id === material.id
                    ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                    : "border-gray-300 text-gray-900 dark:border-gray-700 dark:text-gray-100")
                }
              >
                {material.name}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {gathered} of {materials.length} leaves ticked as gathered.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-gray-200 p-5 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {selected.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Needed for {selected.usedInQuests.join(", ")}
            </p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {selected.locations.map((location) => (
                <li key={location.area}>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {location.area}
                  </span>{" "}
                  - {location.spot} (method: {location.method})
                </li>
              ))}
            </ul>
            <label className="flex items-center gap-2 pt-2 text-sm text-gray-900 dark:text-gray-100">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={Boolean(got[selected.id])}
                onChange={() =>
                  setGot((previous) => ({ ...previous, [selected.id]: !previous[selected.id] }))
                }
              />
              Already gathered at least one
            </label>
          </div>

          <div className="space-y-3 rounded-lg border border-gray-200 p-5 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Quest payout</h2>
            {selectedRecipe ? (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Step {selectedRecipe.order}: {selectedRecipe.name}
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
                  {selectedRecipe.rewards.map((reward) => (
                    <li key={reward}>{reward}</li>
                  ))}
                </ul>
                {selectedRecipe.renownRequirement ? (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Requires Renown {selectedRecipe.renownRequirement} to take on.
                  </p>
                ) : null}
                {selectedRecipe.deadline ? (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Deadline reported at {selectedRecipe.deadline}.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                No drink recipe step is recorded for this material yet.
              </p>
            )}
            {selected.note ? (
              <p className="text-xs text-gray-600 dark:text-gray-400">{selected.note}</p>
            ) : null}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How to use this solver
          </h2>
          <p>
            Pick the leaf you are short of and the panel shows where it grows: the best single Search
            point first, then the alternates in case you are already near one of them. The checkbox
            records that you are holding at least one, which matters because the chain asks for the
            leaves one at a time and spending one early can stall a later step.
          </p>
          <p>
            Ticks are stored in your browser under a single local storage key. Nothing is uploaded and
            the tool works with no account. Clearing site data resets the list.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Where the chain is handed in, and why the last step matters
          </h2>
          <p>
            Every request is delivered at the Tavern in Dagsion, and the chain runs in sequence: the
            next request appears as you progress both the story and your Renown, so a leaf you cannot
            use yet is still worth carrying. The final step is the one to protect, because Elegant
            Drink Recipes hands out the Song of Angels Blaze Art, Renown, and two advanced classes,
            Ranger and Troubadour.
          </p>
          <p>
            That last detail is why the leaf chain is worth finishing even if drinks do not interest
            you. Ranger is a route-specific class on Leda, and Troubadour is reachable on more than one
            route, so classes unlocked through a side quest chain widen what your units can certify
            into. A quest that grants class access rather than a one-off item keeps paying for the rest
            of the run, which is the opposite of the usual side quest reward pattern.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Why the Wonder Leaves entry looks different
          </h2>
          <p>
            Most materials here have one obvious answer. Wonder Leaves do not. Two sources describe
            Mahapira Garden, in the far south of the Ogmios region, as a Search node; a third reports
            that searching the overworld yields nothing and that the Chapter 11 Dance for Benetnasch
            quest is the only source. Rather than pick a favourite and quietly drop the rest, the tool
            shows both routes and dates the disagreement, so you can decide based on where you are in
            the story.
          </p>
          <p>
            That is the same rule applied everywhere on this site: where sources conflict, the
            disagreement is part of the answer. A single averaged value would be wrong in a way you
            could not detect, which is far worse than knowing that two reports exist.
          </p>
        </section>
      </main>
    </>
  );
}
