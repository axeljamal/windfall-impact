import { SAMPLE_LABEL } from '@/data/sample';

/** The label that sits on every number: these are the demo's sample records, not live pilot figures. */
export function SampleTag() {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-accent px-3 py-1 text-xs leading-4">
      <span aria-hidden className="inline-block size-2 rounded-full bg-accent" />
      {SAMPLE_LABEL}
    </p>
  );
}
