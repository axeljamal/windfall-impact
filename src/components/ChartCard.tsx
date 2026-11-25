'use client';

import { useId, useRef, useState, type FocusEvent, type PointerEvent, type ReactNode } from 'react';
import { SampleTag } from './SampleTag';

export type TableData = { caption: string; columns: string[]; rows: (string | number)[][] };

type Tip = { text: string; x: number; y: number } | null;

/**
 * The frame every chart sits in: a title, a one-line text summary, the chart, and a button that shows the same
 * numbers as a table. Any mark with a `data-tip` attribute shows a tooltip on hover or keyboard focus.
 */
export function ChartCard({ title, summary, table, children, controls }: { title: string; summary: string; table: TableData; children: ReactNode; controls?: ReactNode }) {
  const id = useId();
  const [showTable, setShowTable] = useState(false);
  const [tip, setTip] = useState<Tip>(null);
  const box = useRef<HTMLDivElement>(null);

  const place = (el: Element | null, x?: number, y?: number) => {
    const mark = el?.closest<HTMLElement | SVGElement>('[data-tip]');
    const frame = box.current?.getBoundingClientRect();
    if (!mark || !frame) return setTip(null);
    const r = mark.getBoundingClientRect();
    setTip({ text: mark.dataset.tip ?? '', x: (x ?? r.left + r.width / 2) - frame.left, y: (y ?? r.top) - frame.top });
  };
  const onMove = (e: PointerEvent) => place(e.target as Element, e.clientX, e.clientY);
  const onFocus = (e: FocusEvent) => place(e.target as Element);

  return (
    <section aria-labelledby={`${id}-t`} className="card flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 id={`${id}-t`} className="text-xl font-semibold leading-6 tracking-[-0.2px]">
          {title}
        </h2>
        {controls}
      </div>
      <p id={`${id}-s`} className="text-sm leading-5">
        {summary}
      </p>
      <div
        ref={box}
        className="relative"
        role="group"
        aria-labelledby={`${id}-t`}
        aria-describedby={`${id}-s`}
        onPointerMove={onMove}
        onPointerLeave={() => setTip(null)}
        onFocus={onFocus}
        onBlur={() => setTip(null)}
      >
        {children}
        {tip && (
          <div
            aria-hidden
            className="pointer-events-none absolute z-10 max-w-56 -translate-x-1/2 -translate-y-full rounded-[10px] border border-line bg-ground px-3 py-2 text-sm leading-5 text-ink shadow-[0_8px_12px_rgba(46,43,37,0.14)]"
            style={{ left: Math.max(60, tip.x), top: tip.y - 8 }}
          >
            {tip.text}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-rule pt-3">
        <SampleTag />
        <button
          type="button"
          aria-expanded={showTable}
          aria-controls={`${id}-d`}
          onClick={() => setShowTable((s) => !s)}
          className="min-h-11 rounded-full border border-line px-4 text-sm font-semibold"
        >
          {showTable ? 'Hide data table' : 'Show data table'}
        </button>
      </div>
      <div id={`${id}-d`} hidden={!showTable} className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="mb-2 text-left text-sm">{table.caption}</caption>
          <thead>
            <tr>
              {table.columns.map((c) => (
                <th key={c} scope="col" className="border-b border-line py-2 pr-3 font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((r, i) => (
              <tr key={i}>
                {r.map((cell, j) =>
                  j === 0 ? (
                    <th key={j} scope="row" className="border-b border-rule py-2 pr-3 font-normal">
                      {cell}
                    </th>
                  ) : (
                    <td key={j} className="border-b border-rule py-2 pr-3 tabular-nums">
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
