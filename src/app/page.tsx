import Link from 'next/link';
import { AreaChart } from '@/components/AreaChart';
import { ChartCard } from '@/components/ChartCard';
import { Donut, PartsBar, StackedBars, StepArea, type Series } from '@/components/charts';
import { SampleTag } from '@/components/SampleTag';
import { getImpact } from '@/lib/impact';

const pct = (x: number) => `${Math.round(x * 100)}%`;

const CHAIR_SERIES: Series[] = [
  { key: 'taken', label: 'Taken (host and guests)', color: 'var(--mark-1)' },
  { key: 'open', label: 'Still open', color: 'var(--mark-open)', dashed: true },
];
const SOURCE_COLOURS = ['var(--mark-1)', 'var(--mark-2)', 'var(--mark-3)', 'var(--mark-4)'];
const FEE_COLOURS = { free: 'var(--mark-1)', fixed: 'var(--mark-2)', pwyc: 'var(--mark-3)' } as const;

function Stat({ value, label, note }: { value: string; label: string; note: string }) {
  return (
    <div className="card flex flex-col gap-1 p-4">
      <dt className="order-2 text-sm font-semibold leading-5">{label}</dt>
      <dd className="order-1 text-[28px] font-bold leading-[32px] tracking-[-0.6px] tabular-nums sm:text-[34px] sm:leading-[38px]">{value}</dd>
      <dd className="order-3 text-sm leading-5 text-dim">{note}</dd>
    </div>
  );
}

export default function Dashboard() {
  const d = getImpact();
  const h = d.headline;
  const sources = d.sources.map((s, i) => ({ ...s, color: SOURCE_COLOURS[i % SOURCE_COLOURS.length] }));
  const topSource = d.sources[0];
  const firstSupper = d.timeline[0];
  const lastSupper = d.timeline[d.timeline.length - 1];
  const busiest = d.hosts[0];
  const fees = d.fees.map((f) => ({ ...f, value: f.count, color: FEE_COLOURS[f.key] }));
  const mostFee = [...d.fees].sort((a, b) => b.count - a.count)[0];

  return (
    <>
      <section aria-labelledby="intro" className="flex flex-col gap-3">
        <p className="kicker">Brighton &amp; Hove pilot</p>
        <h1 id="intro" className="text-[34px] font-bold leading-[38px] tracking-[-0.6px]">
          What surplus food is turning into
        </h1>
        <p className="max-w-2xl text-base leading-6">
          Windfall matches food that is about to go over with neighbours who will cook it and neighbours who will eat it. These are the pilot demo&apos;s
          suppers, chairs and sources, counted the same way a live dashboard would count them.
        </p>
        <div className="flex flex-wrap items-center gap-3 rounded-[10px] border border-accent p-3 text-sm leading-5">
          <SampleTag />
          <span>
            Every number here is worked out from the records in Windfall&apos;s demo, not from live bookings.{' '}
            <Link href="/method" className="font-semibold text-accent-text underline underline-offset-2">
              How these numbers are made
            </Link>
          </span>
        </div>
      </section>

      <section aria-labelledby="headline">
        <h2 id="headline" className="sr-only">
          Headline numbers
        </h2>
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat value={String(h.suppersListed)} label="Suppers on the table" note={`${h.homeSuppers} home suppers and ${h.venueTables} venue tables`} />
          <Stat value={String(h.chairsOffered)} label="Chairs offered" note={`${h.homeChairsOffered} at home suppers, ${h.chairsOffered - h.homeChairsOffered} at venue tables`} />
          <Stat
            value={`${h.homeChairsTaken} of ${h.homeChairsOffered}`}
            label="Chairs filled at home suppers"
            note={`${pct(h.homeFillRate)} full: ${h.guestsBooked} guests booked plus ${h.homeSuppers} hosts`}
          />
          <Stat value={String(h.hostsSuppersToDate)} label="Suppers hosted to date" note={`By the ${h.homeSuppers} sample hosts, from their profiles`} />
          <Stat value={`${h.meanHostRating}★`} label="Mean host rating" note={`Across ${d.hosts.length} host profiles`} />
          <Stat value={String(h.areas)} label="Neighbourhoods" note="With at least one supper or table" />
          <Stat value={`${d.returning.returning} of ${d.returning.asked}`} label="Chair requests from people already on Windfall" note="At the demo host's table; the other is new" />
          <Stat value={`${d.dishes.vegan} of ${d.dishes.total}`} label="Dishes that are vegan" note="On the listed menus" />
        </dl>
      </section>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <ChartCard
          title="Chairs at each home supper"
          summary={`${h.homeChairsTaken} of ${h.homeChairsOffered} chairs are taken across ${h.homeSuppers} home suppers. Chair one is always the host's.`}
          table={{
            caption: 'Chairs at each home supper',
            columns: ['Supper', 'Host', 'Chairs', 'Taken', 'Open'],
            rows: d.chairsBySupper.map((s) => [s.label, s.host, s.seats, s.taken, s.open]),
          }}
        >
          <StackedBars
            unit="chairs"
            series={CHAIR_SERIES}
            rows={d.chairsBySupper.map((s) => ({
              label: s.label,
              note: s.host,
              values: { taken: s.taken, open: s.open },
              tips: { taken: `${s.label}: ${s.taken} of ${s.seats} taken`, open: `${s.label}: ${s.open} still open` },
            }))}
          />
        </ChartCard>

        <AreaChart byKind={d.areasByKind} />

        <ChartCard
          title="Where the surplus comes from"
          summary={`${topSource.label} give the largest share, ${topSource.pct}%. Windfall records shares, not weights, so there is no total in kilos yet.`}
          table={{ caption: 'Share of surplus by source', columns: ['Source', 'Share'], rows: d.sources.map((s) => [s.label, `${s.pct}%`]) }}
        >
          <Donut parts={sources} centre={`${d.sources.length}`} centreSub="sources" />
        </ChartCard>

        <ChartCard
          title="One neighbour's suppers over time"
          summary={`The demo neighbour's own record: ${d.timeline.length} suppers between ${firstSupper.label} and ${lastSupper.label}, ${lastSupper.dayOffset} days apart, one of them hosted.`}
          table={{
            caption: "The demo neighbour's suppers, oldest first",
            columns: ['Date', 'Supper', 'Hosted or ate', 'Running total'],
            rows: d.timeline.map((p) => [p.label, p.what, p.hosted ? 'Hosted' : 'Ate', p.cumulative]),
          }}
        >
          <StepArea
            yLabel="Running total of suppers"
            color="var(--mark-2)"
            points={d.timeline.map((p) => ({
              x: p.dayOffset,
              y: p.cumulative,
              label: p.label,
              tip: `${p.label}: ${p.what} (${p.hosted ? 'hosted' : 'ate'}), ${p.cumulative} so far`,
            }))}
          />
        </ChartCard>

        <ChartCard
          title="Suppers each host has run"
          summary={`${busiest.host} has hosted the most, ${busiest.suppers}. Between them the three sample hosts have run ${h.hostsSuppersToDate}, rated ${Math.min(...d.hosts.map((x) => x.rating)).toFixed(1)}★ to ${Math.max(...d.hosts.map((x) => x.rating)).toFixed(1)}★.`}
          table={{ caption: 'Suppers hosted and rating, from host profiles', columns: ['Host', 'Suppers hosted', 'Rating'], rows: d.hosts.map((x) => [x.host, x.suppers, `${x.rating.toFixed(1)}★`]) }}
        >
          <StackedBars
            unit="suppers"
            series={[{ key: 'suppers', label: 'Suppers hosted', color: 'var(--mark-1)' }]}
            rows={d.hosts.map((x) => ({
              label: x.host,
              note: `${x.rating.toFixed(1)}★`,
              values: { suppers: x.suppers },
              tips: { suppers: `${x.host}: ${x.suppers} suppers, ${x.rating.toFixed(1)}★` },
            }))}
          />
        </ChartCard>

        <ChartCard
          title="How people chip in"
          summary={`Of ${h.suppersListed} listings, ${mostFee.count} ask a set price; the rest are free or pay what you can. Swaps are offered at home suppers too.`}
          table={{ caption: 'Listings by how guests chip in', columns: ['Way to chip in', 'Listings'], rows: d.fees.map((f) => [f.label, f.count]) }}
        >
          <PartsBar parts={fees} unit="listings" />
        </ChartCard>
      </div>

      <section aria-labelledby="food" className="card flex flex-col gap-3 p-4 sm:p-5">
        <h2 id="food" className="text-xl font-semibold leading-6 tracking-[-0.2px]">
          What&apos;s being rescued
        </h2>
        <p className="text-sm leading-5">
          Hosts describe their surplus in words, so quantities are shown as they wrote them and not added up. Only one listing gives a count.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Surplus food on each listing</caption>
            <thead>
              <tr>
                <th scope="col" className="border-b border-line py-2 pr-3 font-semibold">
                  Food
                </th>
                <th scope="col" className="border-b border-line py-2 pr-3 font-semibold">
                  How much
                </th>
                <th scope="col" className="border-b border-line py-2 pr-3 font-semibold">
                  Where
                </th>
              </tr>
            </thead>
            <tbody>
              {d.food.map((f) => (
                <tr key={`${f.where}-${f.food}`}>
                  <th scope="row" className="border-b border-rule py-2 pr-3 font-normal">
                    {f.food}
                  </th>
                  <td className="border-b border-rule py-2 pr-3">{f.qty ? f.qty.replace(/ of$/, '') : 'Not stated'}</td>
                  <td className="border-b border-rule py-2 pr-3">
                    {f.where} <span className="text-dim">· {f.kind === 'home' ? 'home supper' : 'venue table'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-rule pt-3">
          <SampleTag />
        </div>
      </section>

      <section aria-labelledby="missing" className="card flex flex-col gap-2 border-quiet p-4 text-sm leading-5 sm:p-5">
        <h2 id="missing" className="text-xl font-semibold leading-6 tracking-[-0.2px]">
          Not counted yet
        </h2>
        <p>
          Neighbours fed, kilos of food saved and return rates over time need records the demo doesn&apos;t keep: who actually turned up, what the food
          weighed, and a dated history for every guest. They will appear here once live suppers are aggregated.
        </p>
      </section>
    </>
  );
}
