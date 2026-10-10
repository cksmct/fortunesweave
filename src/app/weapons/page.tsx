import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import NativeBannerAd from "@/components/NativeBannerAd";
import { JsonLd } from "@/components/JsonLd";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import Link from "next/link";
import weaponsData from "@/data/weapons.json";

const weapons = weaponsData.weapons;
const columns = weaponsData._columns;

const types = Array.from(new Set(weapons.map((entry) => entry.weaponType))).filter(
  (type) => type !== "" && type !== "?"
);
const unclassified = weapons.filter((entry) => entry.weaponType === "" || entry.weaponType === "?");
const withEffects = weapons.filter((entry) => entry.effects !== "");
const label = (type: string) => (type === "" || type === "?" ? "Not recorded" : type);
const spells = weapons.filter((entry) => entry.weaponType.toLowerCase().indexOf("magic") >= 0);
const spellSchools = Array.from(new Set(spells.map((entry) => entry.weaponType)));
const spellsOf = (school: string) => spells.filter((entry) => entry.weaponType === school);

const FAQS = [
  {
    question: "How many weapons are in Fortune\u0027s Weave?",
    answer:
      "The weapon and spell table checked lists " + weapons.length + " entries across swords, spears, axes, bows, gauntlets, black magic, dark magic and white magic, with a handful whose type is not recorded yet.",
  },
  {
    question: "What does the Curse column mean?",
    answer:
      "Curse is a stat specific to this game. Ordinary weapons leave it blank and cursed weapons are what fill it in, which is why the cursed objects on the equipment page are worth reading alongside this table.",
  },
  {
    question: "Which weapon type should a unit carry?",
    answer:
      "That depends on the class, because classes lock weapon types rather than the triangle deciding it: there is no weapon triangle in this game, and each type instead has its own baseline mechanic such as spears beating cavalry and bows beating fliers.",
  },
  {
    question: "What do Might, Hit and Uses mean here?",
    answer:
      "Might is base attack power, Hit is base accuracy, and Uses is durability, so a weapon with high Might and low Uses is a burst option rather than a workhorse. Weight matters separately because it decides whether the wielder can follow up.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "Weapons and Spells List",
  description:
    "All " + weapons.length + " recorded Fire Emblem: Fortune\u0027s Weave weapons and spells, with type, level, might, hit, critical, range, uses and worth.",
  path: "/weapons/",
});

export default function WeaponsPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Weapons", item: "/weapons/" },
          ]),
          generateFAQSchema(FAQS),
        ]}
      />
      <PageHeader
        title="Weapons and Spells List"
        description="The full weapon and spell table with the numbers that decide a fight: might, weight, hit, critical, range, uses and worth."
        path="/weapons/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Why the numbers matter more than the names
          </h2>
          <p>
            {"A weapon list is only useful if it carries the numbers, because this game removed the weapon triangle and left each type to stand on its own mechanics. That makes the table below a planning tool rather than a shopping list: " +
              weapons.length +
              " entries, of which " +
              withEffects.length +
              " carry a written effect that changes what the weapon does."}
          </p>
          <p>
            Weight and Uses are the two columns players skip and then regret. Weight decides whether a
            unit still follows up after attacking, which quietly decides more fights than raw might does,
            and Uses is durability, so the heaviest hitting weapon in a row is often a burst pick rather
            than the one you leave equipped. Curse is the odd column out: ordinary weapons leave it blank
            and cursed weapons fill it in, which is where the equipment page picks the story up.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <tbody>
                {Object.keys(columns).map((key) => (
                  <tr key={key} className="border-b border-gray-200 dark:border-gray-800">
                    <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">{key}</td>
                    <td className="py-2 text-gray-700 dark:text-gray-300">
                      {(columns as Record<string, string>)[key]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 黄金次屏 Adsterra 原生信息流广告位 */}
        <NativeBannerAd />

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Every recorded weapon and spell
          </h2>
          {types.map((type) => (
            <article key={type} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {type}
                <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                  {weapons.filter((entry) => entry.weaponType === type).length} recorded
                </span>
              </h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                      <th className="py-2 pr-3">Weapon</th>
                      <th className="py-2 pr-3">Lv</th>
                      <th className="py-2 pr-3">Mgt</th>
                      <th className="py-2 pr-3">Wt</th>
                      <th className="py-2 pr-3">Hit</th>
                      <th className="py-2 pr-3">Crit</th>
                      <th className="py-2 pr-3">Rng</th>
                      <th className="py-2 pr-3">Uses</th>
                      <th className="py-2 pr-3">Worth</th>
                      <th className="py-2">Effects</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weapons
                      .filter((entry) => entry.weaponType === type)
                      .map((entry) => (
                        <tr key={entry.id} className="border-b border-gray-200 dark:border-gray-800">
                          <td className="py-2 pr-3 font-medium text-gray-900 dark:text-gray-100">
                            {entry.name}
                          </td>
                          <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{entry.level}</td>
                          <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{entry.might}</td>
                          <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{entry.weight}</td>
                          <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{entry.hit}</td>
                          <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{entry.critical}</td>
                          <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{entry.range}</td>
                          <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{entry.uses}</td>
                          <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{entry.worth}</td>
                          <td className="py-2 text-gray-700 dark:text-gray-300">{entry.effects}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
          {unclassified.length > 0 ? (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {"The remaining " + unclassified.length + " entries are listed in the source with a type that is not recorded yet, so they are named here without being assigned to a table: " +
                unclassified.map((entry) => entry.name).join(", ") + "."}
            </p>
          ) : null}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The spell list, school by school
          </h2>
          <p>
            {"The Fire Emblem: Fortune's Weave spell list is " + spells.length + " entries, and every one of them sits in the table above with its school attached rather than being buried inside a class page. Black magic is the largest school, white magic follows it, and dark magic is the smallest of the three by a wide margin."}
          </p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            {spellSchools.map((school) => (
              <li key={school}>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{school + ": "}</span>
                {spellsOf(school).map((entry) => entry.name).join(", ")}
                <span className="text-gray-500 dark:text-gray-400">{" (" + spellsOf(school).length + " recorded)"}</span>
              </li>
            ))}
          </ul>
          <p>
            {"Casting does not work like a sword swing. A spell carries a use count instead of a durability bar, nearly every entry reaches further than melee at a range of one to two tiles, and that extra tile is the reason a mage can stand behind a front line. Where the source leaves a might or a hit value blank for a spell, this page leaves it blank too rather than filling in a plausible number."}
          </p>
          <p>
            {"Which class gets to cast them is a separate question. The "}
            <Link className="font-medium text-[#8a6d2f] underline decoration-dotted dark:text-[#d3b475]" href="/classes/">
              classes page
            </Link>
            {" lists the magical certifications and the mastery abilities that add Magic, and the cursed objects on the equipment page are what push a caster past its printed numbers."}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How to read a row quickly
          </h2>
          <p>
            Read Might against Weight first, because that pair decides whether a weapon hits hard once or
            hits adequately twice, and follow up attacks are what most damage maths actually turns on.
            Then check Uses: a 10-use weapon with high might behaves like a consumable, so buying it early
            in a chapter and replacing it mid-map is normal rather than wasteful. Level tells you who can
            equip it at all, and because classes lock weapon types, a unit with no axe proficiency will
            never see use out of the best axe in the table.
          </p>
          <p>
            Range is the quiet outlier in this game: bows cannot counter at melee range, so a bow with
            excellent numbers still leaves its wielder exposed next to an enemy, and a thrown weapon with
            mediocre numbers can be the safer pick in a corridor. Critical rate is the last column to
            weigh, since a critical build usually needs a skill or a cursed weapon behind it rather than
            the base rate alone.
          </p>
        </section>

        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; how the spells arrive
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                Farming weapon and magic experience on purpose
              </h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-200">Jay Dunna</span> &middot;{" "}
              <span className="font-mono">llhH-IBpenM</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed videoId="llhH-IBpenM" title="How to FARM WEAPON & MAGIC XP in Fire Emblem: Fortune's Weave" />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {"Its English captions were transcribed on 2026-09-30, and it answers the question the spell list raises: a spell is reached through the weapon experience of the class that casts it. The method is a clash fight, the weakest weapon in the inventory, a single landed attack, then Retreat back to the map, repeated; a recovery link on the same trip trains white magic, and the extra weapon experience is what brings spells such as Physic forward. It is a grind, and the creator says so, but it beats waiting for chapters to hand out the experience."}
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What sits next to this table
          </h2>
          <p>
            Two other pages complete the gear picture. The equipment page covers cursed objects, which is
            where the Curse column above comes from and where the Blaze Art gauge rules live, and the
            classes page records which weapon types each class can actually carry at each tier. Between
            the three, the question of what to equip stops being a guess.
          </p>
          <p>
            {"Where a value is blank in the source, the table leaves it blank rather than filling in a plausible number, and the " +
              unclassified.length +
              " untyped entries above are named without being sorted into a category that the source does not give them."}
          </p>
        </section>

        {/* Durability Video Intel */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Verified Video Intel &middot; Audio Transcript
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                What Actually Burns the Uses Column
              </h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">The Game Looters</span> &middot;
              Verified English Captions &middot; <span className="font-mono">b4puAn2x5m0</span>
            </div>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="b4puAn2x5m0"
              title="Fire Emblem: Fortune's Weave - STOP Repairing Your Weapons! Do THIS Instead"
            />
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The Uses column above is the one this page cannot explain on its own, because how a weapon loses
            durability is a rule rather than a number. The creator here tested it directly and reports a rule
            the game does not surface clearly, which is why it is recorded as a section of its own: the
            distinction changes what a low-durability weapon is actually worth, and it is what turns the
            blacksmith into a sequencing decision.
          </p>

          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                01 &middot; The Rule
              </span>
              <h3 className="text-sm font-semibold text-white">Ordinary attacks are free</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Normal attacks do not consume durability; combat arts do. That single distinction rewrites how
                the table above should be read, because a strong weapon with a small Uses value is not a
                fragile weapon, it is a weapon with a limited number of combat arts in it. The creator&apos;s
                practice is to attack with the base action when the extra damage would be wasted and reserve
                the arts for the turns that need them.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                02 &middot; The Sequence
              </span>
              <h3 className="text-sm font-semibold text-white">Refine before you repair</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The blacksmith offers repair and refinement side by side, and the tested result is that
                refining a worn weapon returns it to full durability as part of the upgrade. Repairing first
                and refining afterwards therefore pays the material cost twice for the same outcome. If a
                refinement was going to happen anyway, the order is refine then repair, never the reverse.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-[#d3b475] uppercase tracking-wider">
                03 &middot; The Exception
              </span>
              <h3 className="text-sm font-semibold text-white">When repairing is still right</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Repair remains the correct call for a weapon you have no intention of refining, or when the
                materials for the refinement are not in hand yet. In that second case the creator suggests
                leaving the weapon and running an alternative rather than sinking materials into a repair that
                an upgrade will overwrite later, which matters most in the early game when materials are the
                binding constraint.
              </p>
            </div>
          </div>
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
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quick answers</h2>
          <p>
            Fire Emblem: Fortune&apos;s Weave weapons are locked to classes rather than balanced by a triangle, so the Fortune&apos;s Weave weapons list above is best read together with the classes page: the question is rarely which sword is strongest, it is which of your units can hold it. Cursed weapons are the exception the Curse column marks, and those belong with the cursed objects on the equipment page because they are what feed the Blaze Art gauge.
          </p>
        </section>
      
        {/* Video intel - LinkKing7 - verified English captions - transcribed 2026-10-01 */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; creator walkthrough
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                These Weapons are OVERPOWERED! COMPLETE Weapon Forging Guide for Fire Emblem: Fortune's Weave
              </h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-200">LinkKing7</span> &middot;{" "}
              <span className="font-mono">0Bn0V-28gXU</span>
            </div>
          </div>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed
              videoId="0Bn0V-28gXU"
              title="These Weapons are OVERPOWERED! COMPLETE Weapon Forging Guide for Fire Emblem: Fortune's Weave"
            />
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            A full forging guide covering every forgeable weapon in Fortune's Weave, including how the forge and weapon upgrade materials work.
          </p>
        </section>

        {/* Video intel: 9NBy5IJIVug — Jay Dunna — verified English captions — transcribed 2026-10-10 */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#1b2130]/70 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d3b475] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#d3b475] animate-pulse" />
                Video intel &middot; verified English captions
              </span>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">A tier list of all 54 weapons</h2>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Coverage by <span className="font-medium text-zinc-200">Jay Dunna</span> &middot;{" "}
              <span className="font-mono">9NBy5IJIVug</span>
            </div>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl">
            <YouTubeEmbed videoId="9NBy5IJIVug" title="BEST WEAPONS Tier List in Fire Emblem: Fortune's Weave" />
          </div>

          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Jay Dunna ranks the game&apos;s weapons from best to worst. The counter-intuitive takeaway is that cheap, highly-upgradeable wooden swords punch above their weight because of low weight (higher attack speed for units that normally cannot double), and that Demina-brand swords add a flat hit bonus to combat arts, upgradeable further on the relevant road. The Cleansing Blade lands in the top tier for ignoring the undead boon, and specialist weapons are valued for the enemy types they counter.
          </p>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#d3b475]">Caption highlights</p>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-zinc-300">
              <li>Wooden swords are among the best weapons once upgraded: low weight means higher attack speed for units that usually cannot double.</li>
              <li>Demina-brand swords add a hit bonus to combat arts, and that bonus can be increased further at the relevant upgrade location.</li>
              <li>The Cleansing Blade ignores the undead boon, making it a top-tier pick against those foes.</li>
              <li>Specialist weapons (anti-cavalry, anti-armor) are rated by how common those enemy types are, not by raw damage.</li>
            </ul>
            <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">Drawn from the video&apos;s auto-generated English captions (community-reported; not verified in-game).</p>
          </div>
        </section>

      </main>
    </>
  );
}
