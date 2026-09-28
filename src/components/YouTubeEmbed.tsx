"use client";

import { useState } from "react";

type YouTubeEmbedProps = {
  videoId: string;
  title?: string;
  className?: string;
};

export default function YouTubeEmbed({
  videoId,
  title,
  className = "",
}: YouTubeEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-white/10 bg-black/60 shadow-xl transition-all duration-300 hover:border-[#d3b475]/40 ${
        loaded ? "" : "cursor-pointer"
      } ${className}`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        {loaded ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title ?? "YouTube video player"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <>
            {/* Local-First WebP Thumbnail */}
            <img
              src={`/images/yt/${videoId}.webp`}
              alt={title ?? "Video thumbnail"}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              width={480}
              height={270}
              onError={(e) => {
                const target = e.currentTarget;
                target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
              }}
            />
            {/* Play Button Facade */}
            <button
              type="button"
              onClick={() => setLoaded(true)}
              aria-label={`Play video: ${title ?? "YouTube video"}`}
              className="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors group-hover:bg-black/20"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d3b475] text-black shadow-lg shadow-black/50 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#e2c78f]">
                <svg
                  viewBox="0 0 24 24"
                  className="ml-0.5 h-6 w-6 fill-current"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
