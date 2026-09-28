# Fire Emblem: Fortune's Weave Wiki

## Mission
Create implementation-ready, token-driven UI guidance for Fire Emblem: Fortune's Weave Wiki that is optimized for consistency, accessibility, and fast delivery across documentation site.

## Brand
- Product/brand: Fire Emblem: Fortune's Weave Wiki
- URL: https://fortunesweave.wiki/
- Audience: developers and technical teams
- Product surface: documentation site

## Style Foundations
- Visual style: structured, tokenized, content-first
- Main font style: `font.family.primary=Arial`, `font.family.stack=Arial, Helvetica, sans-serif`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=25.6px`
- Typography scale: `font.size.xs=10px`, `font.size.sm=11px`, `font.size.md=12px`, `font.size.lg=13px`, `font.size.xl=14px`, `font.size.2xl=15px`, `font.size.3xl=16px`, `font.size.4xl=17px`
- Color palette: `color.text.primary=#f5f1eb`, `color.text.secondary=#bbc1cf`, `color.text.tertiary=#f2f0eb`, `color.text.inverse=#adb5c4`, `color.surface.base=#000000`, `color.surface.muted=#d3b475`, `color.surface.raised=#1b2130`, `color.surface.strong=#1a2333`
- Spacing scale: `space.1=3px`, `space.2=4px`, `space.3=5px`, `space.4=6px`, `space.5=7px`, `space.6=8px`, `space.7=9px`, `space.8=10px`
- Radius/shadow/motion tokens: `radius.xs=5px` | `shadow.1=rgba(255, 255, 255, 0.533) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.2) 0px 5px 16px 0px` | `motion.duration.instant=180ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: links (53), cards (14), buttons (6), navigation (3), tables (1).

- Extraction diagnostics: Audience and product surface inference confidence is low; verify generated brand context.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
