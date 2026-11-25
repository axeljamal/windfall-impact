import type { Metadata } from 'next';
import { SampleTag } from '@/components/SampleTag';
import { SAMPLE_SOURCE_COMMIT } from '@/data/sample';
import { getImpact } from '@/lib/impact';

export const metadata: Metadata = {
  title: 'How these numbers are made',
  description: 'Where each number on the Windfall Impact dashboard comes from, and what is not counted yet.',
};

const code = 'rounded bg-tint px-1 py-0.5 font-mono text-[13px]';

export default function Method() {
  const d = getImpact();
  const h = d.headline;
  const rows: { metric: string; value: string; from: string; how: string }[] = [
    { metric: 'Suppers on the table', value: String(h.suppersListed), from: 'SUPPERS in src/data.ts, DEMO_SLOTS in src/lib/tables.ts', how: 'Count of home suppers plus count of venue tables.' },
    { metric: 'Chairs offered', value: String(h.chairsOffered), from: 'seats on each supper and each table', how: 'Sum of seats.' },
    { metric: 'Chairs filled at home suppers', value: `${h.homeChairsTaken} of ${h.homeChairsOffered}`, from: 'takenSeats on each supper', how: 'Taken chairs, the host’s chair 0 included, over seats. Venue tables carry no bookings in the demo, so they are left out.' },
    { metric: 'Guests booked', value: String(h.guestsBooked), from: 'takenSeats on each supper', how: 'Taken chairs other than chair 0.' },
    { metric: 'Suppers hosted to date', value: String(h.hostsSuppersToDate), from: 'hostSub on each supper, e.g. “6 suppers · 4.9★”', how: 'Sum of the three hosts’ supper counts.' },
    { metric: 'Mean host rating', value: `${h.meanHostRating}★`, from: 'hostSub on each supper', how: 'Plain mean of the three ratings; the demo gives no rating counts to weight by.' },
    { metric: 'Neighbourhoods', value: String(h.areas), from: 'nbhd on each supper and table', how: 'Distinct neighbourhoods.' },
    { metric: 'Where the surplus comes from', value: d.sources.map((s) => `${s.pct}%`).join(', '), from: 'SOURCES in src/data.ts', how: 'Shown as given. They are shares, with no weights behind them.' },
    { metric: 'One neighbour’s suppers over time', value: `${d.timeline.length} suppers`, from: 'LEDGER in src/data.ts with DEMO_PAST in src/lib/history.ts', how: 'Running count by date. The dates have no year; only the gaps between them are used.' },
    { metric: 'How people chip in', value: d.fees.map((f) => `${f.count} ${f.label.toLowerCase()}`).join(', '), from: 'fee on each supper, pricePence on each table', how: 'A table at 0p is free; any other price, and a home supper’s “£5 or swap”, is a set price.' },
    { metric: 'Requests from people already on Windfall', value: `${d.returning.returning} of ${d.returning.asked}`, from: 'GUEST_REQUESTS in src/data.ts', how: 'Read from each request’s line: “New to Windfall” or “Hosted 2 suppers”.' },
    { metric: 'Vegan dishes', value: `${d.dishes.vegan} of ${d.dishes.total}`, from: 'menu on each supper and table', how: 'Dishes tagged vegan, over all dishes.' },
  ];

  return (
    <article className="flex max-w-3xl flex-col gap-6 text-base leading-6">
      <header className="flex flex-col gap-3">
        <p className="kicker">Method</p>
        <h1 className="text-[34px] font-bold leading-[38px] tracking-[-0.6px]">How these numbers are made</h1>
        <SampleTag />
        <p>
          Windfall has no live totals yet, so this dashboard counts the records the Windfall app ships for its demo: three home suppers, four venue
          tables, the pilot&apos;s surplus sources and one neighbour&apos;s own supper history. They were copied by hand, value for value, from the Windfall
          app at commit <code className={code}>{SAMPLE_SOURCE_COMMIT}</code> into <code className={code}>src/data/sample.ts</code>, with the file each value
          came from noted beside it. Nothing is estimated or made up; where Windfall gives words rather than numbers, the words are shown.
        </p>
      </header>

      <section aria-labelledby="each" className="flex flex-col gap-3">
        <h2 id="each" className="text-[26px] font-bold leading-[30px] tracking-[-0.4px]">
          Each number
        </h2>
        <p className="text-sm leading-5">File paths are in the Windfall app&apos;s repository.</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm leading-5">
            <caption className="sr-only">Where each dashboard number comes from</caption>
            <thead>
              <tr>
                {['Number', 'Value', 'From', 'Worked out as'].map((c) => (
                  <th key={c} scope="col" className="border-b border-line py-2 pr-3 align-bottom font-semibold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.metric} className="align-top">
                  <th scope="row" className="border-b border-rule py-2 pr-3 font-normal">
                    {r.metric}
                  </th>
                  <td className="border-b border-rule py-2 pr-3 tabular-nums">{r.value}</td>
                  <td className="border-b border-rule py-2 pr-3">{r.from}</td>
                  <td className="border-b border-rule py-2 pr-3">{r.how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="not" className="flex flex-col gap-3">
        <h2 id="not" className="text-[26px] font-bold leading-[30px] tracking-[-0.4px]">
          What isn&apos;t counted, and why
        </h2>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>
            <strong className="font-semibold">Neighbours fed.</strong> The demo knows who booked a chair, not who turned up. Chairs filled is the closest
            honest number.
          </li>
          <li>
            <strong className="font-semibold">Food saved, in kilos.</strong> Hosts write “a glut of” or “two crates of”. Only one listing gives a count (14
            loaves), so there is no total.
          </li>
          <li>
            <strong className="font-semibold">Return rate over time.</strong> There is one dated history, the demo neighbour&apos;s own. The time chart shows
            that one record and says so.
          </li>
          <li>
            <strong className="font-semibold">Weighted ratings.</strong> Host profiles give an average but not how many guests rated, so the mean treats
            each host equally.
          </li>
        </ul>
      </section>

      <section aria-labelledby="live" className="flex flex-col gap-3">
        <h2 id="live" className="text-[26px] font-bold leading-[30px] tracking-[-0.4px]">
          Moving to live numbers
        </h2>
        <p>
          Every chart reads one typed function, <code className={code}>getImpact()</code> in <code className={code}>src/lib/impact.ts</code>. A later version
          swaps its body for an aggregate from Windfall&apos;s Supabase database, fetched when the site is built, and the page stays the same. Live
          aggregates will only ever be counts across many suppers, never anyone&apos;s name or table.
        </p>
      </section>
    </article>
  );
}
