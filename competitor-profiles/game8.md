# Game8 — Competitor Profile

**Generated**: 2026-09-28
**verified**: validated
**validatedAt**: 2026-09-30
**evidence**: manual review on 2026-09-30. Automated fetch is impossible (Cloudflare returns a challenge page), so the verdict rests on the hub URL being game-specific (game8.co/games/Fire-Emblem-Fortunes-Weave) and on the per-item and per-quest URLs this site already cites from it, including archives/624738 for Giants' Meat and archives/624414 for the sculptor quest.

**Depth**: quick scan (6 competitors profiled in one pass)
**Method**: built-in web_search + web_fetch only; no DataForSEO or Firecrawl MCP available in this environment.

---

**URL**: https://game8.co/games/Fire-Emblem-Fortunes-Weave

## At a Glance

| Metric | Value |
|--------|-------|
| Type | Commercial walkthrough and guides wiki (Game8), English + Japanese arms |
| Positioning | Breadth first: a page for nearly every item, material and mechanic |
| Est. organic traffic | unverified (no keyword tool available) |
| Update cadence | Hour-level; item pages dated within the last two days at the time of writing |

## Confirmed coverage (search results + URL inventory, 2026-09-28)

- 100% Walkthrough Guide (archives/618786)
- List of All Weapons and Spells (archives/620255)
- List of All Ingredients (archives/621536)
- Per-item pages such as Giants Meat (archives/624738)
- Characters, classes, best class, tier list, paralogues, gifts, recruitment, supports, Bird Time

## Weaknesses

- Cloudflare rejects non-browser clients: a direct fetch returned a roughly 2 KB challenge page instead of content, so their data cannot be verified or diffed programmatically.
- Many pages are thin single-item entries rather than cross-linked tables, which is why the same fact is spread across several URLs.
- No interactive tools on the pages checked.

## Implications for fortunesweave.online

- They will hold the head terms. Competing page-for-page on thin item pages is a losing shape for a new domain.
- Our durable edge is the opposite shape: one table per topic with cross-links, plus tools they do not build.
- Because their pages cannot be fetched by a client, our sourced rows are also easier for a reader to audit.
