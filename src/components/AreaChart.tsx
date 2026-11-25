'use client';

import { useState } from 'react';
import type { AreaRow, SupperKind } from '@/lib/impact';
import { ChartCard } from './ChartCard';
import { StackedBars, type Series } from './charts';

type Filter = SupperKind | 'all';
const FILTERS: { k: Filter; label: string }[] = [
  { k: 'all', label: 'All' },
  { k: 'home', label: 'Home suppers' },
  { k: 'venue', label: 'Venue tables' },
];

const SERIES: Series[] = [
  { key: 'home', label: 'Home suppers', color: 'var(--mark-1)' },
  { key: 'venue', label: 'Venue tables', color: 'var(--mark-2)' },
];

/** Chairs offered in each neighbourhood, with a filter for home suppers or venue tables. */
export function AreaChart({ byKind }: { byKind: Record<Filter, AreaRow[]> }) {
  const [filter, setFilter] = useState<Filter>('all');
  const rows = byKind[filter];
  const total = rows.reduce((a, r) => a + r.total, 0);
  const top = rows[0];
  const max = Math.max(...byKind.all.map((r) => r.total));
  const which = filter === 'all' ? 'chairs' : filter === 'home' ? 'chairs at home suppers' : 'chairs at venue tables';

  return (
    <ChartCard
      title="Chairs offered by neighbourhood"
      summary={`${total} ${which} across ${rows.length} neighbourhoods. ${top ? `${top.area} offers the most, with ${top.total}.` : ''}`}
      controls={
        <div role="radiogroup" aria-label="Show" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.k}
              type="button"
              role="radio"
              aria-checked={filter === f.k}
              onClick={() => setFilter(f.k)}
              className={`min-h-11 rounded-full px-4 text-sm font-semibold ${filter === f.k ? 'border-[1.5px] border-accent' : 'border border-quiet'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      }
      table={{
        caption: `Chairs offered by neighbourhood (${FILTERS.find((f) => f.k === filter)!.label.toLowerCase()})`,
        columns: ['Neighbourhood', 'Home suppers', 'Venue tables', 'Total'],
        rows: rows.map((r) => [r.area, r.home, r.venue, r.total]),
      }}
    >
      <StackedBars
        unit="chairs"
        max={max}
        series={SERIES.filter((s) => filter === 'all' || s.key === filter)}
        rows={rows.map((r) => ({
          label: r.area,
          values: { home: r.home, venue: r.venue },
          tips: { home: `${r.area}: ${r.home} chairs at home suppers`, venue: `${r.area}: ${r.venue} chairs at venue tables` },
        }))}
      />
    </ChartCard>
  );
}
