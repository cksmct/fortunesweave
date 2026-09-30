import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import NativeBannerAd from "@/components/NativeBannerAd";
import { JsonLd } from "@/components/JsonLd";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import deitiesData from "@/data/deities.json";

const deities = deitiesData.deities;
const mechanics = deitiesData._mechanics as Record<string, string>;
const gaps = deitiesData._openGaps;

const withDomain = deities.filter((deity) => deity.domain !== "Not recorded");
const blessers = deities.filter((deity) => deity.hasBlessingDiscount);

const FAQS = [
  {
    question: "Who are the gods in Fortune\u0027s Weave?",
    answer:
      "Twelve deities are named for Dagda: Sothis the Progenitor, Fortuna the goddess of fate, Aurora, Mars the god of military prowess, Kalla the goddess of hunting and the arts, Balor the god of the underworld, plus Smyrnos, Jurah, Credna, Yu Phas, Solel and Dagda himself.",
  },
  {
    question: "Who is the villain?",
    answer:
      "Balor, the god of the underworld, is the central antagonist of the game rather than a background name, which is why his name turns up in the Part III location list as the Temple of Balor.",
  },
  {
    question: "Why does Fortuna matter?",
    answer:
      "Because the game is named after her. Fortuna is the goddess of fate, and Fortuna\u0027s Temple appears on the world map as the location of a Chapter 7 subquest, so the name is in the world rather than only in the title.",
  },
  {
    question: "Which gods give you something in gameplay?",
    answer:
      "Six of the twelve appear in the Shrine of Causality shop as blessings whose discounts can be bought with Karma Shards: Aurora, Mars, Smyrnos, Jurah, Kalla and Credna. Smyrnos also names the shrine where Combat Arts are strengthened.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Deities of Dagda",
  description:
    "The twelve named gods of Fire Emblem: Fortune\u0027s Weave, their domains, the six whose blessings the Shrine of Causality sells, and Balor as the antagonist.",
  path: "/deities/",
});

export default function DeitiesPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Deities", item: "/deities/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Deities of Dagda"
        description="The twelve named gods behind the place names, the blessings and the antagonist, and which six of them actually pay out in gameplay."
        path="/deities/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Twelve names, and they are everywhere
          </h2>
          <p>
            {"Dagda names " + deities.length +
              " deities, and the reason to learn them is that they are load-bearing: the continent, the pantheon, the imperial capital of Dagsion and a shelf of shrines and temples all borrow these words. A name encountered in a quest title is usually a god rather than a place."}
          </p>
          <p>{mechanics.what}</p>
          <p>{mechanics.antagonist}</p>
          <p>{mechanics.naming}</p>
          <p className="text-gray-700 dark:text-gray-300">{mechanics.overlap}</p>
        </section>

        {/* 黄金次屏 Adsterra 原生信息流广告位 */}
        <NativeBannerAd />

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The full pantheon
          </h2>
          <p>
            {"Only " + withDomain.length + " of the " + deities.length +
              " carry a domain in the record. The rest are listed by name with no role attached, which is stated here rather than smoothed over with a plausible-sounding invention."}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                  <th className="py-2 pr-4">Deity</th>
                  <th className="py-2 pr-4">Domain</th>
                  <th className="py-2">What else is recorded</th>
                </tr>
              </thead>
              <tbody>
                {deities.map((deity) => (
                  <tr key={deity.id} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                      {deity.name}
                      {deity.hasBlessingDiscount ? (
                        <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
                          (blessing sold)
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">{deity.domain}</td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">{deity.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The six that pay out
          </h2>
          <p>
            {"The other half of the pantheon matters because it is purchasable: " + blessers.map((deity) => deity.name).join(", ") +
              " each have a blessing whose discount sits in the Shrine of Causality shop, bought with Karma Shards earned from Notable Deeds. Buying them is a permanent, account-wide upgrade rather than a route choice."}
          </p>
          <p>
            Smyrnos is the one to watch, because the name does double duty: the shrine where Combat Arts are
            strengthened carries it, and the crown of Smyrnos is the Dagdan name of Macuil&apos;s Diadem. That
            tie between a god, a shrine and a crest is the clearest single clue to how religion is wired into the
            systems rather than painted on top of them.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Balor gets a location too, in the Temple of Balor, which is worth knowing before Part III: the
            antagonist&apos;s name on a dungeon usually means something is waiting there.
          </p>
        </section>

        {/* Temple Row Video Intel */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Verified Video Intel &middot; Audio Transcript
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                Temple Row and What Each God Pays Out
              </h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">Lucky Crit</span> &middot; Verified
              English Captions &middot; <span className="font-mono">CLWyypxDWZo</span>
            </div>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="CLWyypxDWZo"
              title="Blessings Guide & The Gods of Dagda EXPLAINED"
            />
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The table above lists the pantheon by name and domain. This captioned gods-and-blessings guide
            supplies what the tables could not: where each god is housed in the capital, which ones you can
            actually serve, and the shape of the battlefield benefit each one grants. It is recorded here as
            video-reported detail rather than as settled fact: it rests on one creator&apos;s read of the
            game, so it is written below as his account, and the numeric tiers he quotes are deliberately
            left out because captions are not a reliable source for values.
          </p>

          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                01 &middot; The Street Itself
              </span>
              <h3 className="text-sm font-semibold text-white">Nine temples, six you can serve</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Temple Row is a two-tier street. The upper level holds the temples of Jurah, Solel, Mars and
                Smyrnos; the lower level holds Credna, Kalla, Yu Phas and Aurora, with the temple of Dagda the
                Great standing above them all. Of the nine only six accept a volunteer, and the creator reads
                the closed ones as a story signal rather than a bug: Yu Phas is worshipped in a temple whose
                cult is frowned upon, and Solel has moved into Dagda&apos;s own house.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                02 &middot; The Loop
              </span>
              <h3 className="text-sm font-semibold text-white">Serve to unlock, spend to use</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                A blessing has two separate costs, which is the part easy to miss. Serving at a temple unlocks
                the blessing in the first place, and the service activity is god-specific: Aurora&apos;s is
                upkeep of the temple interior, Kalla&apos;s is singing hymns, Smyrnos&apos;s is petting cats.
                Once unlocked, using it in battle spends Divine Sand rather than the service currency, which
                makes the resource a battle-tempo decision rather than a permanent upgrade.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                03 &middot; Defence
              </span>
              <h3 className="text-sm font-semibold text-white">Aurora and Jurah</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Aurora covers damage prevention: the tiers step from halving physical damage for a turn, to
                halving magical damage, to stripping the Underworld Boon from a foe. Jurah covers protection
                of one specific unit instead, stepping from multi-target attacks, to follow-up attacks, to
                critical hits. The creator notes the fit between Jurah and the Fraldarius line, whose relic in
                the earlier game was a shield.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                04 &middot; Offence
              </span>
              <h3 className="text-sm font-semibold text-white">Kalla and Mars</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Kalla is the agility blessing and the one he rates highest in practice: avoidance first, then
                speed, then extra movement, all for a single turn, which he uses to walk a turn the army
                should have lost. Mars is the direct counterpart for physical units, stepping from accuracy on
                physical attacks, to restoring health when a foe goes down, to a strength increase. Kalla is
                also the god of the arts, which is why her temple is the one Leda&apos;s group keeps returning
                to.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                05 &middot; Magic
              </span>
              <h3 className="text-sm font-semibold text-white">Smyrnos, Credna and Fortuna</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Smyrnos&apos;s tiers are magic-only and run accuracy, then magic range, then magic power, which
                explains why the shrine carrying his name is the one that strengthens Combat Arts. Credna was
                the one god whose blessing he had not seen in footage, so his engineering focus is inference
                rather than observation. Fortuna has no temple at all: her single effect is the rewind, it
                arrives through the story, and the creator reports it is free on Normal difficulty.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                06 &middot; The People
              </span>
              <h3 className="text-sm font-semibold text-white">Who is standing in which temple</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The gods are residents of Dagsion rather than distant myths, and the temples are staffed, in
                places by characters you can recruit. The staff named in the video: Olympia serves as a
                priestess of Kalla, Alexandra serves in Jurah&apos;s temple, and temple guardians and law
                enforcement are called Vulkans. Aurora&apos;s blue temple and Kalla&apos;s red one are the two
                the story routes keep returning to.
              </p>
            </div>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Two of the creator&apos;s readings stay labelled as readings: the idea that each Flame Lord is
            attached to a patron god, and the closed-temple explanation above. Both are consistent with the
            story so far but neither is stated anywhere in the game text, so they are recorded here as
            interpretation and will be promoted only if a second independent source says the same thing.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What no source records
          </h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            {gaps.map((gap: string) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
          <p className="text-gray-700 dark:text-gray-300">
            {"This page exists because of one of those gaps. The blessing shop lists six divine names, which is enough to place them in gameplay but not enough to explain them, and a pantheon page that guessed at the missing six roles would be worse than a table that admits the gap. The temple layout and the shape of each blessing now come from the captioned guide above rather than from a guess, so they are published with their source attached and with the creator's own inferences marked as inferences."}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Frequently asked questions
          </h2>
          <dl className="space-y-5">
            {FAQS.map((item) => (
              <div key={item.question}>
                <dt className="font-semibold text-gray-900 dark:text-gray-100">{item.question}</dt>
                <dd className="mt-1 text-gray-700 dark:text-gray-300">{item.answer}</dd>
              </div>
            ))}
          </dl>
          <p className="text-gray-700 dark:text-gray-300">
            The blessings themselves and what their discounts cost are on the boons page, the crest named after
            Smyrnos is on the crests page, and the temple location comes up in the subquest list.
          </p>
        </section>
      </main>
    </>
  );
}
