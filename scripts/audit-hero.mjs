// audit-hero — HERO SINGLE-SOURCE GATE (build-time hard gate)
//
// A hero must draw its title, its "Last updated" date and its numeric metric cards from a
// SINGLE SOURCE — never from hand-written literals.
//
// WHY THIS GATE EXISTS (2026-09-07 dungeonlootr incident — read before relaxing it):
// a site shipped `<AuthorBanner lastUpdated="September 5, 2026" />` plus Hero metric cards
// hard-coded as "15+" / "100%". The pipeline refreshed visits/favorites/CCU every run, but
// the homepage consumed none of it, so users saw a frozen site with fresh data underneath
// ("nothing changed after your update"). The old version of this gate only checked for a
// raw <h1> and EXEMPTED src/app/page.tsx entirely — the one page that always shows a date
// and live metrics had zero guardrails.
//
// Gates: G0 raw <h1>; G1 literal hero date; G2 hero ignores its live data source;
//        G3 legacy AuthorBanner/PageHeader drift.
import fs from 'fs';
import path from 'path';

const appDir = path.resolve('src/app');
const errors = [];
const warnings = [];

// WARNING: this exemption only waives G0. G1/G2/G3 still apply — exempting the homepage
// wholesale is exactly how the incident above slipped through.
const HERO_EXEMPT = new Set(['src/app/page.tsx']);
// 项目级豁免（2026-09-20 新增，避免每个项目手工 diff 这份脚本）：
// 在仓库根放 hero-exempt.json = { "exempt": ["src/app/xxx/page.tsx"], "reason": "..." }，
// 技能升级时只要覆盖脚本即可，项目自己的豁免不会丢。
try {
  const projExemptPath = path.resolve("hero-exempt.json");
  if (fs.existsSync(projExemptPath)) {
    const projCfg = JSON.parse(fs.readFileSync(projExemptPath, "utf8"));
    for (const f of projCfg.exempt || []) HERO_EXEMPT.add(String(f));
  }
} catch {
  /* 配置缺失或损坏时静默回退到内置豁免，绝不因此阻断构建 */
}

const MONTH_DATE =
  /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s*20\d{2}\b/;

const DATE_PROP_ASSIGN = new RegExp(
  '\\b(?:lastUpdated|updated|updatedAt|verifiedDate)\\s*[:=]\\s*[\'"]([^\'"]{4,40})[\'"]',
  'i',
);

const LAST_UPDATED_COPY =
  /Last\s+updated[^\n]{0,40}(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s*20\d{2}/i;

// Live data sources, plus the identifier proving a page really consumes them.
const DATA_SOURCES = [
  {
    file: 'src/data/gameStats.ts',
    consumer: /\bgameStats\b/,
    fields: /\b(visits|playing|favorites|playersOnline|ccu)\b/,
    label: 'visits / playing / favorites',
  },
  {
    file: 'src/data/steam.json',
    consumer: /\bsteam(?:Data|Stats|VerifiedAt)?\b/,
    fields: /\b(reviewScore|players|ccu|recommendations)\b/,
    label: 'reviews / players',
  },
  {
    file: 'src/data/game.config.json',
    consumer: /\b(gameConfig|GAME_CONFIG|getGameConfig)\b/,
    fields: /\b(stats|players|visits)\b/,
    label: 'game stats',
  },
];

// Blank out comments while PRESERVING line numbers, so documenting an old defect in a
// comment cannot trip the very gate that removes it. False positives get gates disabled.
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

function walk(dir) {
  let out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(p));
    else if (e.name === 'page.tsx') out.push(p);
  }
  return out;
}

function rel(p) {
  return path.relative(process.cwd(), p).replace(/\\/g, '/');
}

function readSafe(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

const pageFiles = walk(appDir);
const h1Re = /<h1[\s>]/;

// G0 + G1: hero rendering and derived freshness date.
for (const file of pageFiles) {
  const r = rel(file);
  const raw = readSafe(file);
  if (!raw) continue;

  // A page may legitimately ship a custom hero: what matters is that its freshness date is
  // derived from the pageDates single source (getContentDate / pageDateIso / liveDateIso).
  // A raw h1 on a page that never touches that source is still a defect, so the gate fires.
  const derivedHero =
    /getContentDate\s*\(|pageDateIso\s*\(|pageDateFormatted\s*\(|liveDateIso\s*\(\s*\)/.test(raw);
  if (!HERO_EXEMPT.has(r) && h1Re.test(raw) && !derivedHero) {
    errors.push(
      `${r}: raw <h1> found — render the hero via <PageHeader title=... /> instead. ` +
        `If intentionally custom, add it to HERO_EXEMPT with a justification.`,
    );
  }

  stripComments(raw)
    .split('\n')
    .forEach((line, i) => {
      const at = `${r}:${i + 1}`;
      if (LAST_UPDATED_COPY.test(line)) {
        errors.push(
          `${at}: "Last updated" copy contains a literal date. Derive it from the content-date ` +
            `source (pageDateIso(path) / pageDateFormatted(path)) instead of writing it by hand.`,
        );
        return;
      }
      const m = line.match(DATE_PROP_ASSIGN);
      if (m && MONTH_DATE.test(m[1])) {
        errors.push(
          `${at}: hero received a hard-coded display date "${m[1]}". Pass a route path (or omit ` +
            `the prop) so the date resolves from the pageDates single source.`,
        );
      }
    });
}

// G2: if the project owns a live data source, the homepage hero must actually read it.
const homePage = pageFiles.find((f) => rel(f) === 'src/app/page.tsx');
const homeSrc = homePage ? readSafe(homePage) : '';

// IMPORTANT: must test the page body WITHOUT import lines. An early version matched the
// bare word `gameStats`, which the import statement itself satisfies — so a homepage that
// imported the source and never rendered a single value passed the gate. That is precisely
// the failure mode this gate exists to catch, so imports are stripped before matching.
const homeBody = homeSrc
  .split('\n')
  .filter((line) => !/^\s*import\s/.test(line))
  .join('\n');

for (const s of DATA_SOURCES) {
  if (!homePage || !fs.existsSync(s.file)) continue;
  if (!s.fields.test(readSafe(s.file))) continue; // no live metrics — gate not applicable
  if (!s.consumer.test(homeBody)) {
    errors.push(
      `${rel(homePage)}: a live data source exists at ${s.file} (${s.label}) but the homepage ` +
        `hero never actually renders any value from it (it is imported without being used, or ` +
        `not imported at all). Bind the hero metric cards to that source so refreshes are visible.`,
    );
  }
}

// Soft companion to G2: literal-looking metric figures detection might otherwise miss.
if (homePage) {
  const re =
    /<(?:div|p|span)[^>]*\btext-(?:2xl|3xl|4xl)\b[^>]*>\s*\d+(?:\.\d+)?\s*(?:\+|%|K|M)?\s*<\/(?:div|p|span)>/g;
  let hits = 0;
  while (re.exec(homeSrc) !== null) hits++;
  if (hits >= 2) {
    warnings.push(
      `${rel(homePage)}: ${hits} large metric figures look literal. Confirm they are bound to a ` +
        `data source, not decoration.`,
    );
  }
}

// G3: legacy AuthorBanner / PageHeader drift. Old scaffolds took `lastUpdated?: string`
// defaulting to a literal date, freezing every page that rendered them.
for (const relPath of ['src/components/AuthorBanner.tsx', 'src/components/PageHeader.tsx']) {
  if (!fs.existsSync(relPath)) continue;
  const clean = stripComments(readSafe(relPath));
  const takesLiteralDate =
    /lastUpdated\s*(?:\?)?:\s*string/.test(clean) ||
    /(?:lastUpdated|date)\s*=\s*['"][^'"]*\d{4}/.test(clean);
  const derives = /pageDate(?:Iso|Formatted)|liveDate(?:Iso|Formatted)|getContentDate/.test(clean);

  if (takesLiteralDate && !derives) {
    errors.push(
      `${relPath}: legacy template drift — takes a literal date and does NOT derive from the ` +
        `pageDates source. Replace with resources/components/AuthorBanner.tsx (path-based; ` +
        `date via pageDateIso/pageDateFormatted) and update call sites to ` +
        `<AuthorBanner path="/route" />.`,
    );
  }
}

for (const w of warnings) console.warn(`⚠️  audit-hero: ${w}`);
if (warnings.length) console.log('');

if (errors.length) {
  console.error('❌ audit-hero: hero must be single-sourced (title, freshness date, metrics)');
  console.error('');
  for (const e of errors) console.error('   - ' + e);
  console.error('');
  console.error('   Fix: 1) swap in the current AuthorBanner/PageHeader templates,');
  console.error('        2) drop every literal date from hero call sites,');
  console.error('        3) bind metric cards to the live data source.');
  process.exit(1);
}

console.log('✅ audit-hero: all heroes are single-sourced (PageHeader + derived date + bound metrics)');
