"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import groupsData from "@/data/gift-groups.json";
import preferencesData from "@/data/gift-preferences.json";

const groups = groupsData.groups;
const preferences = preferencesData.preferences;

const SUGGESTIONS = ["sweets", "coffee", "books", "hunting", "training", "fish"];

export default function GiftFinderPage() {
  const [query, setQuery] = useState("");

  const needle = query.trim().toLowerCase();

  const matchedGroups = needle
    ? groups.filter(
        (group) =>
          group.name.toLowerCase().includes(needle) || group.giftList.toLowerCase().includes(needle)
      )
    : groups;

  const matchedCharacters = needle
    ? preferences.filter(
        (row) =>
          row.character.toLowerCase().includes(needle) ||
          row.likes.toLowerCase().includes(needle) ||
          row.dislikes.toLowerCase().includes(needle)
      )
    : preferences;

  return (
    <>
      <PageHeader
        title="Gift Finder"
        description="Type a gift name to see its category, or type an interest such as coffee, hunting or sweets to see every character who wants it."
        path="/tools/gift-finder/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Search gifts and interests</h2>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. coffee, pastries, hunting"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setQuery(suggestion)}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-900 dark:border-gray-700 dark:text-gray-100"
              >
                {suggestion}
              </button>
            ))}
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-900 dark:border-gray-700 dark:text-gray-100"
              >
                Clear
              </button>
            ) : null}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {matchedGroups.length} of {groups.length} gift categories and {matchedCharacters.length} of{" "}
            {preferences.length} characters match.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Matching categories</h2>
          {matchedGroups.length === 0 ? (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Nothing matched in the category table. Try a broader term such as sweets, drinks or
              training.
            </p>
          ) : (
            <div className="space-y-3">
              {matchedGroups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{group.name}</h3>
                  {group.recommendedCharacters.length > 0 ? (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Recommended for: {group.recommendedCharacters.join(", ")}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{group.giftList}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Matching characters
          </h2>
          {matchedCharacters.length === 0 ? (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              No character interests matched. Interest wording follows the unit information page, so
              try the in-game phrasing, for example reading, cooking or hunting.
            </p>
          ) : (
            <ul className="space-y-3">
              {matchedCharacters.map((row) => (
                <li
                  key={row.id}
                  className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
                >
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {row.character}
                  </span>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    Likes: {row.likes}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Dislikes: {row.dislikes ? row.dislikes : "not recorded"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How to use this finder
          </h2>
          <p>
            The search reads both tables at once, so one query answers both directions of the question.
            Type a gift or a category and you get the category it belongs to plus everyone that
            category is aimed at. Type an interest, such as coffee or hunting, and you get every
            character who lists it, together with the things they dislike, which is often the more
            useful half because a badly chosen gift wastes a turn.
          </p>
          <p>
            Nothing is uploaded. The search runs in your browser against the same data files the
            gift reference page renders, so a result here and a row there can never disagree.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reading a gift category correctly
          </h2>
          <p>
            The game labels gifts by intent rather than by effect: a gift is for children, lovers of
            sweets, cooks, lovers of fermented drinks, lovers of coffee, vegetables, meat, fish, books,
            training, crafting, weapons, martial achievements, fashion, board games or flowers. That
            label is the fastest signal available, because it is the same vocabulary the character
            interest lists use.
          </p>
          <p>
            Two characters can share an interest and still prefer different items inside the matching
            category, so treat a hit here as a strong candidate rather than a guaranteed result. The
            reaction you get in game is the final authority, which is why the interest list matters
            more than any single recommended item.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Where the coverage currently stands
          </h2>
          <p>
            Every gift category is recorded with its full item list, and {preferences.length}{" "}
            characters have their likes and dislikes entered from their unit information pages. The
            per-character recommended gift lists are only partially published by the sources checked,
            so those rows are added as they are corroborated rather than invented to fill the grid.
          </p>
        </section>
      </main>
    </>
  );
}
