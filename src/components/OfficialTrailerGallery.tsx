'use client';

import { useState } from 'react';

interface TrailerItem {
  videoId: string;
  title: string;
  category: string;
  description: string;
}

const TRAILERS: TrailerItem[] = [
  {
    videoId: 'kmF38S_0vPs',
    title: 'Fire Emblem: Fortune’s Weave — Launch Trailer — Nintendo Switch 2',
    category: 'Launch Trailer',
    description: 'Official release celebration and opening cinematic for Nintendo Switch 2.',
  },
  {
    videoId: 'L1gvaBYKFy8',
    title: 'Fire Emblem: Fortune’s Weave — Overview Trailer — Nintendo Switch 2',
    category: 'Overview Reel',
    description: 'Deep dive into the four Flame Lords, tactical grid warfare, and Clash dungeons.',
  },
  {
    videoId: 'Rl5_C4sc5zk',
    title: 'Fire Emblem: Fortune’s Weave – Nintendo Direct 6.9.2026',
    category: 'Nintendo Direct',
    description: 'World premiere announcement broadcast showcasing the Heroic Games in Dagsion.',
  },
  {
    videoId: 'NtAijhTAAxo',
    title: 'Fire Emblem: Fortune’s Weave – Commercial 3 | Nintendo Switch 2 (SEA)',
    category: 'Commercial 3',
    description: 'Official television broadcast showcasing Flame Lord Cai and explosive Blaze Arts.',
  },
  {
    videoId: 'BWvcXleNxtc',
    title: 'Fire Emblem: Fortune’s Weave – Commercial 2 | Nintendo Switch 2 (SEA)',
    category: 'Commercial 2',
    description: 'Official spot spotlighting Dietrich and defensive battle line formations.',
  },
  {
    videoId: 'wPTS3TJVF18',
    title: 'Fire Emblem: Fortune’s Weave – Commercial 1 | Nintendo Switch 2 (SEA)',
    category: 'Commercial 1',
    description: 'Official broadcast spotlighting Theodora and Leda’s arcane weave powers.',
  },
];

export default function OfficialTrailerGallery() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TRAILERS.map((trailer) => (
          <div
            key={trailer.videoId}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[#121824] shadow-md transition-all duration-300 hover:border-[#d3b475]/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
          >
            {/* Video Thumbnail Facade */}
            <div className="relative aspect-video w-full overflow-hidden bg-[#0a0d14]">
              {activeVideo === trailer.videoId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${trailer.videoId}?autoplay=1&rel=0&modestbranding=1`}
                  title={trailer.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              ) : (
                <div
                  className="relative h-full w-full cursor-pointer"
                  onClick={() => setActiveVideo(trailer.videoId)}
                >
                  <img
                    src={`/images/yt/${trailer.videoId}.webp`}
                    alt={trailer.title}
                    width={480}
                    height={270}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                  {/* Top-Left Badge */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="tag-brass text-[10px] shadow-sm">
                      <span className="glow-dot-gold" />
                      <span>{trailer.category}</span>
                    </span>
                  </div>

                  {/* Play Button Facade */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-[#d3b475] backdrop-blur-md border border-[#d3b475]/40 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#d3b475] group-hover:text-black">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="translate-x-0.5"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video Meta */}
            <div className="flex flex-1 flex-col justify-between p-4">
              <div>
                <h3 className="line-clamp-1 text-sm font-bold text-[#f5f1eb] group-hover:text-[#d3b475] transition-colors">
                  {trailer.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#bbc1cf]">
                  {trailer.description}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px] font-medium text-[#bbc1cf]">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                  Official Reel
                </span>
                <span className="text-[#d3b475]">Nintendo Switch 2</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
