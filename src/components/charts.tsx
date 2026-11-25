// Hand-built SVG charts. No chart library: each is a few rects, arcs or a path, sized by the numbers it is given.
// Labels are HTML beside the SVG so they stay readable at phone width; the SVG stretches to fill its row.
// Every mark is focusable and carries a `data-tip` for ChartCard's tooltip and an aria-label for screen readers.

export type Series = { key: string; label: string; color: string; dashed?: boolean };

const GAP = 0.6; // ground-coloured gap between stacked segments, in viewBox units (of 100)

/** Where each segment starts, given their sizes: a running total, worked out without mutating during render. */
export const starts = (sizes: number[]) => sizes.map((_, i) => sizes.slice(0, i).reduce((a, b) => a + b, 0));

export function Legend({ series }: { series: Series[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-label="Key">
      {series.map((s) => (
        <li key={s.key} className="inline-flex items-center gap-2">
          <svg width="14" height="14" aria-hidden>
            <rect
              x="1"
              y="1"
              width="12"
              height="12"
              rx="3"
              fill={s.dashed ? 'none' : s.color}
              stroke={s.dashed ? s.color : 'none'}
              strokeWidth="1.5"
              strokeDasharray={s.dashed ? '3 2' : undefined}
            />
          </svg>
          {s.label}
        </li>
      ))}
    </ul>
  );
}

export type StackRow = { label: string; note?: string; values: Record<string, number>; tips: Record<string, string> };

/** Horizontal bars, one per row, each split into the series in order. */
export function StackedBars({ rows, series, max, unit }: { rows: StackRow[]; series: Series[]; max?: number; unit: string }) {
  const top = max ?? Math.max(1, ...rows.map((r) => series.reduce((a, s) => a + (r.values[s.key] ?? 0), 0)));
  return (
    <div className="flex flex-col gap-3">
      <Legend series={series} />
      <ul className="flex flex-col gap-3">
        {rows.map((r, i) => {
          const total = series.reduce((a, s) => a + (r.values[s.key] ?? 0), 0);
          const widths = series.map((s) => ((r.values[s.key] ?? 0) / top) * 100);
          const xs = starts(widths);
          return (
            <li key={r.label} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-3 text-sm leading-5">
                <span>
                  {r.label}
                  {r.note && <span className="text-dim"> · {r.note}</span>}
                </span>
                <span className="shrink-0 tabular-nums">
                  {total} {unit}
                </span>
              </div>
              <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="h-5 w-full overflow-visible" aria-hidden={false}>
                {series.map((s, j) => {
                  if (!r.values[s.key]) return null;
                  const w = widths[j];
                  const x = xs[j];
                  return (
                    <rect
                      key={s.key}
                      className="mark grow-x"
                      style={{ animationDelay: `${i * 60}ms` }}
                      x={x + (x > 0 ? GAP / 2 : 0)}
                      y={s.dashed ? 0.75 : 0}
                      width={Math.max(0.5, w - (x > 0 ? GAP / 2 : 0))}
                      height={s.dashed ? 8.5 : 10}
                      fill={s.dashed ? 'transparent' : s.color}
                      stroke={s.dashed ? s.color : 'none'}
                      strokeWidth={s.dashed ? 1.5 : 0}
                      strokeDasharray={s.dashed ? '4 3' : undefined}
                      vectorEffect="non-scaling-stroke"
                      tabIndex={0}
                      role="img"
                      aria-label={r.tips[s.key]}
                      data-tip={r.tips[s.key]}
                    />
                  );
                })}
              </svg>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** One bar split into parts of a whole, with the parts named underneath. */
export function PartsBar({ parts, unit }: { parts: { key: string; label: string; value: number; color: string }[]; unit: string }) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  const widths = parts.map((p) => (p.value / total) * 100);
  const xs = starts(widths);
  return (
    <div className="flex flex-col gap-3">
      <svg viewBox="0 0 100 12" preserveAspectRatio="none" className="h-8 w-full">
        {parts.map((p, i) => {
          if (!p.value) return null;
          const w = widths[i];
          const x = xs[i];
          const tip = `${p.label}: ${p.value} ${unit}`;
          return (
            <rect
              key={p.key}
              className="mark grow-x"
              style={{ animationDelay: `${i * 80}ms` }}
              x={x + (x > 0 ? GAP / 2 : 0)}
              width={w - (x > 0 ? GAP / 2 : 0)}
              height="12"
              fill={p.color}
              vectorEffect="non-scaling-stroke"
              tabIndex={0}
              role="img"
              aria-label={tip}
              data-tip={tip}
            />
          );
        })}
      </svg>
      <ul className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-3">
        {parts.map((p) => (
          <li key={p.key} className="inline-flex items-center gap-2">
            <span aria-hidden className="inline-block size-3 rounded-[3px]" style={{ background: p.color }} />
            {p.label}: <span className="tabular-nums">{p.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1}`;
};

/** A ring of shares, largest first from twelve o'clock, labelled in the key beside it. */
export function Donut({ parts, centre, centreSub }: { parts: { label: string; pct: number; color: string }[]; centre: string; centreSub: string }) {
  const total = parts.reduce((a, p) => a + p.pct, 0) || 1;
  const gap = 0.035; // radians, a ground-coloured gap between segments
  const sweeps = parts.map((p) => (p.pct / total) * Math.PI * 2);
  const a0s = starts(sweeps);
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="relative size-44 shrink-0">
        <svg viewBox="0 0 120 120" className="size-full">
          {parts.map((p, i) => {
            const a0 = a0s[i];
            const a1 = a0 + sweeps[i];
            const tip = `${p.label}: ${p.pct}%`;
            return (
              <path
                key={p.label}
                className="mark fade-in"
                style={{ animationDelay: `${i * 90}ms` }}
                d={arc(60, 60, 46, a0 + gap / 2, a1 - gap / 2)}
                fill="none"
                stroke={p.color}
                strokeWidth="20"
                tabIndex={0}
                role="img"
                aria-label={tip}
                data-tip={tip}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tracking-[-0.4px]">{centre}</span>
          <span className="text-xs leading-4">{centreSub}</span>
        </div>
      </div>
      <ul className="flex w-full flex-col gap-2 text-sm leading-5">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center justify-between gap-3 border-b border-rule pb-2">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="inline-block size-3 shrink-0 rounded-[3px]" style={{ background: p.color }} />
              {p.label}
            </span>
            <span className="tabular-nums">{p.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A running count over time, drawn as steps (the count only changes on the day a supper happens), with the area
 * under it washed in. x is days since the first record.
 */
export function StepArea({ points, color, yLabel }: { points: { x: number; y: number; label: string; tip: string }[]; color: string; yLabel: string }) {
  const W = 100;
  const H = 50;
  const maxX = Math.max(1, ...points.map((p) => p.x));
  const maxY = Math.max(1, ...points.map((p) => p.y));
  const sx = (x: number) => 4 + (x / maxX) * (W - 8);
  const sy = (y: number) => H - (y / maxY) * (H - 6);
  const steps = points.flatMap((p, i) => (i === 0 ? [`M ${sx(p.x)} ${sy(p.y)}`] : [`H ${sx(p.x)}`, `V ${sy(p.y)}`])).join(' ');
  const last = points[points.length - 1];
  const area = points.length ? `${steps} H ${sx(last.x)} V ${H} H ${sx(points[0].x)} Z` : '';
  const ticks = Array.from({ length: maxY + 1 }, (_, i) => i);

  return (
    <div className="flex gap-2">
      <div className="relative h-44 w-6 shrink-0 text-xs leading-4 tabular-nums" aria-hidden>
        {ticks.map((t) => (
          <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: `${(sy(t) / H) * 100}%` }}>
            {t}
          </span>
        ))}
      </div>
      <div className="flex-1">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-44 w-full overflow-visible">
          <title>{yLabel}</title>
          {ticks.map((t) => (
            <line key={t} x1="0" x2={W} y1={sy(t)} y2={sy(t)} stroke="var(--rule)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={area} fill={color} opacity="0.18" className="fade-in" />
          <path d={steps} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" pathLength={1} className="draw-line" />
          {points.map((p) => (
            <line
              key={p.label}
              className="mark"
              x1={sx(p.x)}
              x2={sx(p.x)}
              y1={sy(p.y)}
              y2={sy(p.y)}
              stroke={color}
              strokeWidth="14"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              tabIndex={0}
              role="img"
              aria-label={p.tip}
              data-tip={p.tip}
            />
          ))}
        </svg>
        <div className="relative mt-2 h-5 text-xs leading-4" aria-hidden>
          {points.map((p) => (
            <span key={p.label} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${(sx(p.x) / W) * 100}%` }}>
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
