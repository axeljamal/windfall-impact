'use client';

import { useSyncExternalStore } from 'react';
import { THEME_KEY as KEY } from '@/lib/theme';

type Choice = 'system' | 'light' | 'dark';
const ORDER: Choice[] = ['system', 'light', 'dark'];
const LABEL: Record<Choice, string> = { system: 'Match device', light: 'Day', dark: 'Night' };

const read = (): Choice => {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
};
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => (listeners.add(fn), () => listeners.delete(fn));

function apply(c: Choice) {
  try {
    if (c === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, c);
  } catch {}
  if (c === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = c;
  listeners.forEach((l) => l());
}

/** Day, night, or whatever the device says. Kept in this browser only. */
export function ThemeToggle() {
  const choice = useSyncExternalStore(subscribe, read, () => 'system' as Choice);
  const next = ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length];
  return (
    <button
      type="button"
      onClick={() => apply(next)}
      className="min-h-11 rounded-full border border-line px-4 text-sm font-semibold"
      aria-label={`Colours: ${LABEL[choice]}. Switch to ${LABEL[next]}`}
    >
      {LABEL[choice]}
    </button>
  );
}
