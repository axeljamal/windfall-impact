// The Three-to-One Rule from Windfall's DESIGN.md, applied to this site's own tokens: text at 4.5:1 or better and
// chart marks and borders at 3:1 or better on the ground, in both schemes. Reads the colours straight from
// globals.css so the test and the page can't drift apart.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

function tokens(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start));
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
}

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const schemes = { day: tokens(':root {'), night: tokens(':root[data-theme="dark"] {') };

describe.each(Object.entries(schemes))('%s scheme', (_, t) => {
  it('has its tokens', () => {
    expect(t.ground).toBeDefined();
    expect(t['mark-4']).toBeDefined();
  });

  const grounds = [t.ground, t.surface];
  it.each(['ink', 'dim', 'accent-text', 'sage-text'])('text %s reads at 4.5:1', (k) => {
    for (const g of grounds) expect(contrast(t[k], g)).toBeGreaterThanOrEqual(4.5);
  });
  it.each(['line', 'quiet', 'accent', 'mark-1', 'mark-2', 'mark-3', 'mark-4', 'mark-open'])('mark or border %s reads at 3:1', (k) => {
    for (const g of grounds) expect(contrast(t[k], g)).toBeGreaterThanOrEqual(3);
  });
  it('ink reads on the tint used behind code', () => {
    expect(contrast(t.ink, t.tint)).toBeGreaterThanOrEqual(4.5);
  });
});

it('the system dark block matches the explicit dark block', () => {
  expect(tokens(':root:not([data-theme="light"]) {')).toEqual(schemes.night);
});
