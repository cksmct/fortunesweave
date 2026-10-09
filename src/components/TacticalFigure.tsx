'use client';

import { useState, useEffect, ReactNode } from 'react';

export interface TacticalFigureProps {
  src: string;
  srcSm?: string;
  alt: string;
  badge?: string;
  title?: string;
  caption?: ReactNode;
  priority?: boolean;
}

export default function TacticalFigure({
  src,
  srcSm,
  alt,
  badge,
  title,
  caption,
  priority = false,
}: TacticalFigureProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <figure className="group relative my-6 w-full overflow-hidden rounded-xl border border-white/10 bg-[#121824] shadow-lg transition-all hover:border-[#d3b475]/40">
        <div className="relative aspect-video w-full overflow-hidden bg-[#0d121c]">
          <picture>
            {srcSm && <source media="(max-width: 640px)" srcSet={srcSm} type="image/webp" />}
            <img
              src={src}
              alt={alt}
              width={1280}
              height={720}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={priority ? 'high' : 'auto'}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
          </picture>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

          {badge && (
            <div className="absolute top-3 left-3 z-10">
              <span className="tag-brass shadow-md">
                <span className="glow-dot-gold" />
                <span>{badge}</span>
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-[#d3b475] backdrop-blur-md border border-white/10 opacity-80 transition-all hover:scale-110 hover:bg-[#d3b475] hover:text-black hover:opacity-100"
            aria-label="Enlarge image"
            title="Click to view full image"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
        </div>

        {(title || caption) && (
          <figcaption className="border-t border-white/[0.08] bg-[#161c28] p-4 text-xs leading-relaxed text-[#bbc1cf]">
            {title && (
              <div className="mb-1 font-bold tracking-tight text-[#f5f1eb] text-sm">
                {title}
              </div>
            )}
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Lightbox Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-xl border border-white/20 bg-[#121824] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all hover:bg-[#d3b475] hover:text-black"
              aria-label="Close modal"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <img
              src={src}
              alt={alt}
              className="max-h-[80vh] w-auto max-w-full object-contain"
            />
            {title && (
              <div className="border-t border-white/10 bg-[#161c28] p-3 text-center text-xs font-semibold text-[#f5f1eb]">
                {title}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
