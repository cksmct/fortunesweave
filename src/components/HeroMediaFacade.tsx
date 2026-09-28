'use client';

import { useState } from 'react';

interface HeroMediaFacadeProps {
  videoId?: string;
  title?: string;
}

export default function HeroMediaFacade({
  videoId = '4eAmLCXvqRQ',
  title = "Fire Emblem: Fortune's Weave Official Reveal Trailer",
}: HeroMediaFacadeProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bezel-shell relative overflow-hidden group w-full">
      <div className="bezel-core relative overflow-hidden aspect-video w-full bg-[#121824]">
        {isPlaying ? (
          <div className="relative h-full w-full">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
            />
            <button
              type="button"
              onClick={() => setIsPlaying(false)}
              className="absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1 text-xs font-semibold text-[#f5f1eb] backdrop-blur-md border border-white/20 hover:bg-[#d3b475] hover:text-black transition-colors"
              aria-label="Close video player"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>Close</span>
            </button>
          </div>
        ) : (
          <div className="relative h-full w-full">
            {/* LCP Responsive WebP Image (Bans picture tag per og-hero-image-audit) */}
            <img
              srcSet="/images/trailer-final-sm.webp 384w, /images/trailer-final-mobile.webp 480w, /images/trailer-final-md.webp 720w, /images/trailer-final.webp 1080w"
              sizes="(max-width: 480px) 384px, (max-width: 640px) 480px, (max-width: 1024px) 50vw, 560px"
              src="/images/trailer-final-sm.webp"
              alt="Fire Emblem: Fortune's Weave Official Reveal Key Artwork"
              width={1080}
              height={608}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />

            {/* Subtle Vignette & Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

            {/* Top-Left Pill Badge */}
            <div className="absolute top-3 left-3 z-10">
              <span className="tag-brass shadow-md">
                <span className="glow-dot-gold" />
                <span>OFFICIAL TRAILER</span>
              </span>
            </div>

            {/* Center Interactive Play Button Facade */}
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-opacity"
              aria-label="Play official trailer video"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-[#d3b475]/70 text-[#d3b475] shadow-[0_0_24px_rgba(211,180,117,0.4)] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#d3b475] group-hover:text-zinc-950 group-hover:shadow-[0_0_32px_rgba(211,180,117,0.7)]">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="translate-x-0.5"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <span className="rounded-full bg-black/70 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#f5f1eb] backdrop-blur-md border border-white/10 group-hover:border-[#d3b475]/50 group-hover:text-[#d3b475] transition-colors">
                Watch Reveal Trailer
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
