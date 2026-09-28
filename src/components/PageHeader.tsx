import AuthorBanner from '@/components/AuthorBanner';

interface PageHeaderProps {
  /** Page title (rendered as the H1). */
  title: React.ReactNode;
  /** Optional centered intro paragraph (standard content pages). */
  description?: React.ReactNode;
  /** Page path for the AuthorBanner "Last updated" badge. Omit to hide it. */
  path?: string;
  /** Optional left media (detail pages, e.g. emoji avatar). */
  media?: React.ReactNode;
  /** Optional right hero media for split two-column hero layout (e.g. homepage hero image). */
  heroMedia?: React.ReactNode;
  /** Optional action buttons rendered under AuthorBanner in split hero layout. */
  actions?: React.ReactNode;
  /** Optional node rendered inline next to the title (e.g. TierBadge). */
  badge?: React.ReactNode;
  /** Optional subtitle line under the title (detail pages). */
  subtitle?: React.ReactNode;
  /** Theme accent for the hero gradient (detail pages). Defaults to orange. */
  accent?: Accent;
  /** Optional breadcrumb rendered at the top of the hero (detail pages). */
  breadcrumb?: React.ReactNode;
  /** Optional eyebrow pill rendered above the title (feature pages). */
  eyebrow?: React.ReactNode;
}

// Literal class strings so Tailwind's purge keeps them.
const ACCENT_FROM: Record<Accent, string> = {
  orange: 'from-orange-50 dark:from-orange-950/20',
  purple: 'from-purple-50 dark:from-purple-950/20',
  emerald: 'from-emerald-50 dark:from-emerald-950/20',
  pink: 'from-pink-50 dark:from-pink-950/20',
  yellow: 'from-yellow-50 dark:from-yellow-950/20',
  red: 'from-red-50 dark:from-red-950/20',
  gold: 'from-amber-50 dark:from-[#d3b475]/10',
};

/**
 * SINGLE SOURCE OF TRUTH for every page hero.
 *
 * Encodes the alignment invariant (title / description / author badge are
 * always consistent) so individual pages can never drift into the
 * left-title vs centered-subtitle misalignment that copy-pasted heroes cause.
 * Every content page MUST render its H1 through this component — the
 * audit-hero.mjs build gate enforces it (no raw <h1> in page.tsx).
 *
 * Variants:
 *  - split (Homepage): <PageHeader eyebrow title description path actions heroMedia />
 *  - standard:         <PageHeader title description path />
 *  - feature:          add eyebrow + a gradient title node
 *  - detail:           add media (avatar) / badge (TierBadge) / subtitle / accent
 */
export default function PageHeader({
  title,
  description,
  path,
  media,
  heroMedia,
  actions,
  badge,
  subtitle,
  accent = 'orange',
  breadcrumb,
  eyebrow,
}: PageHeaderProps) {
  const sectionClass = `border-b border-white/[0.08] bg-gradient-to-b from-[#1b2130] via-[#121824] to-[#000000] text-[#f5f1eb]`;

  if (heroMedia) {
    return (
      <section data-hero="true" data-ad-ignore="true" className={`${sectionClass} page-header`}>
        <div className="container-site py-10 sm:py-14 lg:py-16">
          {breadcrumb}
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Left Content Column */}
            <div className="flex flex-col items-start lg:col-span-6">
              {eyebrow && <div className="mb-4">{eyebrow}</div>}
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-[#f5f1eb] sm:text-4xl lg:text-5xl">
                  {title}
                </h1>
                {badge}
              </div>
              {subtitle && (
                <p className="mt-2 text-sm font-medium text-[#d3b475] sm:text-base">
                  {subtitle}
                </p>
              )}
              {description && (
                <p className="mt-4 text-sm leading-relaxed text-[#bbc1cf] sm:text-base">
                  {description}
                </p>
              )}
              {path && <AuthorBanner path={path} className="mt-5" />}
              {actions && (
                <div className="mt-6 w-full max-w-lg">
                  {/* Actions: Recommend using a balanced grid (grid-cols-1 sm:grid-cols-2 gap-3) to ban sawtooth wraps */}
                  {actions}
                </div>
              )}
            </div>

            {/* Right Media Column: Top-aligned and balanced against left column */}
            <div className="flex w-full flex-col justify-start lg:col-span-6">
              {heroMedia}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (media) {
    return (
      <section data-hero="true" data-ad-ignore="true" className={`${sectionClass} page-header`}>
        <div className="container-site py-10 sm:py-14">
          {breadcrumb}
          <div className="flex items-center gap-4">
            {media}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-[#f5f1eb] sm:text-4xl">
                  {title}
                </h1>
                {badge}
              </div>
              {subtitle && (
                <p className="mt-1 text-sm font-medium text-[#d3b475]">
                  {subtitle}
                </p>
              )}
              {path && <AuthorBanner path={path} className="mt-3" />}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section data-hero="true" data-ad-ignore="true" className={`${sectionClass} page-header`}>
      <div className="container-site py-12 sm:py-16">
        {breadcrumb}
        {eyebrow && <div className="mb-4 flex justify-center">{eyebrow}</div>}
        <h1 className="text-center text-3xl font-extrabold tracking-tight text-[#f5f1eb] sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-[#bbc1cf] sm:text-base">
            {description}
          </p>
        )}
        {path && (
          <div className="mt-5 flex justify-center">
            <AuthorBanner path={path} />
          </div>
        )}
      </div>
    </section>
  );
}

type Accent = 'orange' | 'purple' | 'emerald' | 'pink' | 'yellow' | 'red' | 'gold';
