---
title: The "Lying Prose" Problem: Why We Built a Custom CI Linter to Stop Documentation from Contradicting Its Own Data
published: true
description: When your JSON datasets update but your Markdown and JSX prose still hardcodes old numbers, your documentation secretly lies to users. Here is how we built a custom static linter to catch Prose Data Drift in CI.
tags: webdev, javascript, architecture, nextjs
---

Have you ever visited a SaaS product page where the hero headline proclaims:  
> *"Get started with 10 team seats for just $29/month."*  

...and then you scroll down three viewports to the interactive pricing calculator, only to see:  
> *"Starter Tier: 5 seats included — $39/month."*  

Which one is true? You have no idea. You instantly lose confidence in the product, wonder if the checkout page will surprise you with a third number, and probably bounce.

We ran into this exact psychological trap while building [fortunesweave.online](https://fortunesweave.online) — an independent, data-heavy reference and interactive companion for *Fire Emblem: Fortune's Weave*. 

The site hosts over 1,500 structured data rows: stat growth curves, class mastery multipliers, calendar deadlines, and character recruitment thresholds across four sprawling story campaigns. Because modern console titles cannot be effortlessly datamined on day one, every single number on the site carries strict evidence tiers and verification dates.

We followed every architectural best practice. We built a clean Single Source of Truth (SSOT) using TypeScript schemas and structured JSON tables. Our interactive tools, like the [Class Certification & Stat Planner](https://fortunesweave.online/tools/class-planner/), dynamically ingested these datasets with zero hardcoded values.

And yet, our documentation was secretly lying to our readers.

---

### The Anatomy of "Prose Data Drift"

Here is how the bug actually happens in the wild.

An engineer or technical writer creates a gorgeous data table:

```tsx
// Inside components/RecruitRequirements.tsx
export function RecruitRequirements({ character }: { character: Character }) {
  return (
    <div className="rounded-lg border p-4">
      <span className="font-semibold">{character.name}</span>
      <p>Renown Required: {character.renownLevelRequired}</p>
      <p>Negotiation Difficulty: {character.negotiation}</p>
    </div>
  );
}
```

Everything here is pristine. If `character.renownLevelRequired` changes from `4` to `6` in your source JSON, the UI updates instantly.

However, great technical documentation doesn't just render naked tables. It provides context. Above that table, an author writes an editorial overview explaining the mechanic to humans:

```tsx
// Inside app/recruitment/page.tsx
<section>
  <h2>Early Recruitment Priority</h2>
  <p>
    Focus on unlocking Renown Level 4 as early as Month 9. Once you hit 
    Level 4, high-mobility units like Peter become available for recruitment 
    before the mid-game story lock.
  </p>
  <RecruitRequirements character={peter} />
</section>
```

Can you spot the ticking time bomb?

Two weeks later, the game developers release Patch 1.0.1. A balance adjustment alters the recruitment curve: Peter now unlocks at **Renown Level 5**, while the currency reward for Act 1 deeds is bumped from **5,000 to 6,500 Karma Shards**.

You do your job diligently. You update `src/data/recruitment.json` and `src/data/deeds.json`. You run `npm run build`. TypeScript compiles with zero errors. Your Jest unit tests pass. Your Playwright end-to-end assertions pass. 

**Yet the page is now broken.**

The rendered paragraph tells the reader they need **Renown Level 4**, while the official card directly underneath it demands **Renown Level 5**.

We call this **Prose Data Drift**. It is the silent, pervasive divergence between structured business datasets and the human prose written to explain them.

---

### Why Existing Linters and Tests Never Catch It

1. **TypeScript only cares about types, not semantic truth**: `"<p>Renown Level 4</p>"` is a valid `string`. TypeScript has no idea that the number `4` inside that string represents an un-interpolated business entity that contradicts your JSON.
2. **E2E tests verify DOM rendering, not editorial consistency**: Unless you explicitly write a test asserting that `"the third paragraph contains the exact string representation of recruit[0].renownLevelRequired"`, Cypress or Playwright will happily verify that the container rendered and move on.
3. **LLMs and human writers naturally hardcode numbers**: When humans (or AI assistants) write technical explanations, hardcoding concrete numbers makes prose punchy and readable. Nobody naturally writes:  
   *`"Once you hit Level {recruitmentData.thresholds.earlyGate}, units like..."`* in static Markdown prose.

We realized that if we wanted bulletproof reader trust, **we had to treat prose as untrusted state**.

---

### Building `audit-data-drift.mjs`

Instead of relying on human vigilance during code reviews, we wrote a custom static analysis script that runs during our CI `prebuild` step.

The algorithm works in three distinct phases:

#### Phase 1: Harvesting the "Interesting" Data Entities

First, we scan all authoritative JSON and TypeScript data files in `src/data/`. We extract every numerical value, its parent key, and its associated entity name:

```javascript
// scripts/audit-data-drift.mjs (Simplified excerpt)
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const dataFiles = walk(path.join(ROOT, 'src', 'data')).filter(
  (f) => !/(config|seo|nav|routes)/i.test(f) && /\.(ts|json)$/.test(f)
);

const NUM_RE = /(["']?)(\w+)\1\s*:\s*(-?\d+(?:\.\d+)?)/g;
const NAME_RE = /name["']?\s*:\s*["']([^"']+)["']/;

function interesting(valueStr) {
  const v = Number(valueStr);
  if (!Number.isFinite(v)) return false;
  
  // Filter out ubiquitous noise
  if (['0', '1', '100', '1000'].includes(valueStr)) return false;
  
  // Filter out calendar years (1900 - 2100)
  if (Number.isInteger(v) && v >= 1900 && v <= 2100) return false;
  
  // Filter out tiny loop indices
  if (Number.isInteger(v)) return Math.abs(v) >= 100;
  
  // Floating-point numbers: require at least 2 significant digits
  const sig = valueStr.replace(/^0\./, '').replace(/0+$/, '').replace('.', '');
  return sig.length >= 2;
}
```

Notice the crucial domain filters:
- **Trivial integers (`0`, `1`, `100`)**: If you flag the number `1` or `100`, you will get hundreds of false positives from CSS percentages and array indices.
- **Calendar years (`1900–2100`)**: Copyright notices (`© 2026`) and release dates are temporal metadata, not drifting gameplay values.
- **Layout dimensions and IDs**: We explicitly ignore fields matching `/(id|slug|width|height|order|chapter)$/i`. Early on, an image height of `coverHeight: 420` triggered a false positive against an unrelated `DEFAULT_MAX_CHARS = 420` text truncation helper!

#### Phase 2: Indexing Raw and Formatted Literals

Human copywriters format numbers differently than database engines. A JSON file stores `5000`, but a guide author writes `5,000`. 

Our indexer registers both:

```javascript
const index = new Map();

for (const file of dataFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = NUM_RE.exec(content)) !== null) {
    const field = m[2];
    const valueStr = m[3];
    if (!interesting(valueStr)) continue;

    // Register raw value ("5000")
    addLiteral(valueStr, { file, field });

    // Register comma-delimited locale formatting ("5,000")
    const comma = valueStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (comma !== valueStr) {
      addLiteral(comma, { file, field, isFormatted: true });
    }
  }
}
```

#### Phase 3: Scanning Prose & Catching Collisions

Next, we scan all `.tsx`, `.jsx`, and `.md` source files outside the data layer.

To prevent performance bottlenecks, we compile the regex once using word boundaries `\b`:

```javascript
const compiledLiterals = Array.from(index.entries()).map(([literal, infos]) => ({
  literal,
  infos,
  re: new RegExp(`\\b${escapeRegExp(literal)}\\b`, 'g'),
}));

for (const file of componentFiles) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  
  lines.forEach((line, i) => {
    // Fast short-circuit: skip lines without digits or already using dynamic bindings
    if (!/\d/.test(line)) return;
    if (/\{?\s*(data|deeds|stats|character)\b/.test(line)) return;

    for (const { literal, infos, re } of compiledLiterals) {
      re.lastIndex = 0;
      let match;
      while ((match = re.exec(line))) {
        // Ignore Tailwind class prefixes/suffixes (e.g., gap-2.5, px-1.5)
        const before = line[match.index - 1];
        const after = line[match.index + match[0].length];
        if (before === '-' || after === '-') continue;

        hits.push({
          file,
          line: i + 1,
          snippet: line.trim(),
          matchedValue: literal,
          source: infos[0],
        });
      }
    }
  });
}
```

If `hits.length > 0`, the script prints a rich diagnostic report and **exits with code 1**, blocking the build immediately.

---

### Real-World Incident: Catching a Drift at 9:00 PM

Just yesterday, while integrating new video breakdown transcripts for our [Paralogue & Schedule Matrix](https://fortunesweave.online/paralogues/), we updated our combat guide in `src/app/walkthrough/page.tsx`.

An author wrote:
```tsx
<p>
  Blaze Arts power up into enhanced hazard strikes after three triggers... 
  Complete Part 1 to earn 5,000 Karma Shards for permanent run-wide account upgrades.
</p>
```

When we ran `npm run build`, our prebuild pipeline immediately halted:

```text
--- 🔍 Data Drift Audit ---
Data files scanned: 30 | Tracked numeric entities: 8

⚠️  Suspected Data Drift Found (Prose hardcoded dynamic database value):

  📄 src/app/walkthrough/page.tsx:138
     Prose: "...Complete Part 1 to earn 5,000 Karma Shards for permanent run-wide..."
     Matched Value: 5,000  ←  Source: src/data/deeds.json → karmaShards

💡 Fix: Interpolate this value dynamically from the data module or rewrite prose to avoid hardcoded constants.
```

In `deeds.json`, the endgame currency reward was undergoing a balance audit. If this had shipped, the walkthrough would have instructed thousands of players that they'd receive `5,000` shards, while the deed tracker right next to it displayed the updated post-patch amount.

---

### The Two Remediation Strategies

When the linter catches a drift, you have two clean ways to resolve it:

#### Strategy 1: Dynamic Data Binding (For Precision Values)
If the exact number is essential to the sentence, bind it directly to the imported dataset:

```tsx
import deedsData from "@/data/deeds.json";

<p>
  Complete Part 1 to earn{" "}
  <strong className="font-semibold">
    {deedsData.karmaShards.toLocaleString()}
  </strong>{" "}
  Karma Shards for permanent upgrades.
</p>
```
Now, whenever the backend JSON updates, the prose updates synchronously.

#### Strategy 2: Semantic Generalization (For Explanatory Prose)
Often, editorial copy doesn't actually need the exact number if an adjacent component already provides it. 

Instead of writing:
> *"Earn 5,000 Karma Shards to purchase upgrades..."*

Write:
> *"Earn a substantial influx of Karma Shards to purchase run-wide upgrades (see the reward breakdown below)..."*

This keeps the prose naturally readable while delegating the burden of precision to the structured data table where it belongs.

---

### Why This Matters for Modern Web Engineering

In 2026, web developers spend hundreds of hours obsessing over sub-millisecond TTFB, bundling tricks, and Core Web Vitals. But we often forget that **data integrity is the ultimate UX metric**.

A page that loads in 40ms but tells your user two conflicting facts is infinitely worse than a page that loads in 150ms and tells the absolute truth.

By treating human prose as untrusted state and enforcing automated drift audits in CI:
1. **Your documentation never lies** after a dataset patch.
2. **Editors and developers can refactor datasets fearlessly**, knowing a background script has their back.
3. **User trust remains rock-solid**, because every number on the screen reflects the exact same reality.

If you are maintaining complex documentation, API portals, or gaming companions with hundreds of dynamic stats, stop relying on manual proofreading. Write a 100-line static analyzer, hook it into your `prebuild` script, and let your CI catch the drift before your users do.
