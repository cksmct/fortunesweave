import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumbSchema, generateFAQSchema, generateSEOMetadata } from "@/lib/seo";
import { getGameConfig } from "@/lib/data";
import paraloguesData from "@/data/paralogues.json";
import windowsData from "@/data/paralogue-windows.json";

const config = getGameConfig();
const paralogues = paraloguesData.paralogues;
const windows = windowsData.windows;

const FAQS = [
  {
    question: "How many paralogues are in Fire Emblem: Fortune\u0027s Weave?",
    answer:
      "Nine paralogues exist in total, and how many you can play depends on your route: Cai can reach four, Dietrich eight, Theodora seven and Leda four. Those per-route numbers come from the wiki route locks and match the counts reported by launch-week guide coverage exactly.",
  },
  {
    question: "How do you start a paralogue?",
    answer:
      "Speak with the character who owns the paralogue in Dagsion, and watch for the quest indicator on the Dagsion map. Each paralogue also needs at least one of its cast members in your army during Part I, which is why a paralogue can be unavailable on a route even when the date is right.",
  },
  {
    question: "Can you go back and do a paralogue you missed?",
    answer:
      "Chapter select lets you replay chapters, but rolling past a paralogue deadline and then playing far ahead can cost several chapters of progress to go back for it. The windows on this page exist so that you never have to find out the hard way.",
  },
  {
    question: "Are the deadlines in the game always accurate?",
    answer:
      "No. Two of the final Theodora paralogues are listed with a later deadline in game than the real cut-off of 10/24, so the calendar text and the actual deadline disagree there. Both figures are recorded rather than averaged.",
  },
];

export const metadata: Metadata = generateSEOMetadata({
  title: "All Paralogues and Windows",
  description:
    "Every paralogue in Fire Emblem: Fortune\u0027s Weave: which route unlocks each one, the month 9-10 windows, and the dates that close them permanently.",
  path: "/paralogues/",
});

export default function ParaloguesPage() {
  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Paralogues", item: "/paralogues/" },
  ]);

  return (
    <>
      <JsonLd data={[breadcrumb, generateFAQSchema(FAQS)]} />
      <PageHeader
        title="All Paralogues and Windows"
        description="Nine paralogues, four route-locked schedules, and a calendar that quietly closes doors. Here is what each route can reach and when it expires."
        path="/paralogues/"
      />
      <main className="container-site space-y-12 pb-16">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            What paralogues are
          </h2>
          <p>
            Paralogues in Fire Emblem: Fortune&apos;s Weave are optional chapters. They pay renown,
            gold and resources, they carry a large share of the game&apos;s character writing, and for
            some of the most wanted units they are the only way to get them at all.
          </p>
          <p>
            They are also not numbered. A paralogue appears, sits open for a window measured in days of
            the in-game calendar, and then closes. Chapter select can send you back, but replaying an
            old chapter after progressing far past it can cost several chapters of progress, so the
            practical answer is to catch them on the way through.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            How a paralogue starts
          </h2>
          <p>
            Two conditions have to line up. First, the date: every paralogue window in the game falls
            inside months 9 and 10 of the calendar. Second, the cast: each paralogue has a fixed set of
            characters, and at least one of them has to be in your army during Part I. Some paralogues
            are additionally locked to specific routes, which is why the counts differ so much.
          </p>
          <p>
            To open one, be in Dagsion and speak with the character who owns it, watching for the quest
            indicator on the Dagsion map. Because the windows are date-driven, the Inn matters: the
            Auto-Activities option passes time to an exact date, and a single hourglass can jump the
            clock to 6:00 am, when more shops and locations are open.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Route windows at a glance
          </h2>
          <p>
            The working windows for each route, with the dates that matter. Where the game and guide
            coverage disagree about a deadline, both figures are recorded instead of averaged.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-300 text-left dark:border-gray-700">
                  <th className="py-2 pr-4">Route</th>
                  <th className="py-2 pr-4">Available</th>
                  <th className="py-2 pr-4">Window</th>
                  <th className="py-2">Dates that matter</th>
                </tr>
              </thead>
              <tbody>
                {windows.map((window) => (
                  <tr
                    key={window.id}
                    className="border-b border-gray-200 align-top dark:border-gray-800"
                  >
                    <td className="py-3 pr-4 font-semibold text-gray-900 dark:text-gray-100">
                      {window.route}
                    </td>
                    <td className="py-3 pr-4">{window.paralogueCount}</td>
                    <td className="py-3 pr-4">{window.monthWindow}</td>
                    <td className="py-3">
                      <ul className="list-disc space-y-1 pl-4">
                        {window.keyDates.map((date) => (
                          <li key={date}>{date}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The nine paralogues and their route locks
          </h2>
          <p>
            Nine paralogues exist. The list below shows which routes can reach each one, derived from
            the route locks recorded by the series wiki. The derived counts per route match the
            counts reported by launch-week coverage, which is how these rows reached the cross-checked
            tier.
          </p>
          <ul className="space-y-3">
            {paralogues.map((paralogue) => (
              <li
                key={paralogue.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {paralogue.name}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Owner: {paralogue.ownerCharacter}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  Available on: {paralogue.routeLocks.join(", ")} ({paralogue.routeLocks.length} of 4
                  routes)
                </p>
              </li>
            ))}
          </ul>
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
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Written against version {config.game.currentVersion}. Every row on this page carries its
            own sources and check date; the checklist tool keeps your progress in your browser only.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quick answers</h2>
          <p>
The Fortune&apos;s Weave paralogues carry no chapter number at all, which is why the closing window matters more than the order they appear in. The Fire Emblem: Fortune&apos;s Weave paralogues listed above are each checked against that date, so the table doubles as a deadline sheet.
          </p>
        </section>
      </main>
    </>
  );
}
