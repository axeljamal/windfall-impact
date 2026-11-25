import { describe, expect, it } from 'vitest';
import { HOME_SUPPERS, LEDGER, VENUE_TABLES, type HomeSupper, type VenueTable } from '@/data/sample';
import { chairsByArea, chairsBySupper, cumulativeTimeline, feeMix, fillRate, foodRescued, getImpact, guestsBooked, meanRating, returningShare } from './impact';

const supper = (over: Partial<HomeSupper>): HomeSupper => ({
  id: 'x', title: 'X', host: 'H', nbhd: 'Hove', place: 'P', seats: 6, takenSeats: [0], fee: 'free', feeLabel: 'Free',
  food: 'Bread', qty: 'Some', hostSuppers: 1, hostRating: 5, menu: [], ...over,
});
const table = (over: Partial<VenueTable>): VenueTable => ({
  id: 't', venue: 'V', kind: 'cafe', nbhd: 'Hove', seats: 4, pricePence: 0, surplus: ['Loaves'], hygiene: 5, menu: [], ...over,
});

describe('chairs', () => {
  it('counts the host as a taken chair but not as a guest', () => {
    const s = supper({ seats: 8, takenSeats: [0, 1, 2] });
    expect(chairsBySupper([s])[0]).toMatchObject({ seats: 8, taken: 3, open: 5 });
    expect(guestsBooked(s)).toBe(2);
  });

  it('works out the fill rate across suppers, and 0 when there are none', () => {
    expect(fillRate([supper({ seats: 4, takenSeats: [0, 1] }), supper({ seats: 6, takenSeats: [0, 1, 2] })])).toBe(0.5);
    expect(fillRate([])).toBe(0);
  });
});

describe('chairsByArea', () => {
  const s = [supper({ nbhd: 'Hove', seats: 6 }), supper({ nbhd: 'Kemptown', seats: 8 })];
  const t = [table({ nbhd: 'Hove', seats: 4 })];

  it('adds home and venue chairs per neighbourhood, largest first', () => {
    expect(chairsByArea(s, t)).toEqual([
      { area: 'Hove', home: 6, venue: 4, total: 10 },
      { area: 'Kemptown', home: 8, venue: 0, total: 8 },
    ]);
  });

  it('filters to one kind of listing', () => {
    expect(chairsByArea(s, t, 'venue')).toEqual([{ area: 'Hove', home: 0, venue: 4, total: 4 }]);
    expect(chairsByArea(s, t, 'home').map((r) => r.total)).toEqual([8, 6]);
  });
});

describe('feeMix', () => {
  it('treats a priced table and a paid supper as set price, a 0p table as free', () => {
    const mix = feeMix([supper({ fee: 'pay' }), supper({ fee: 'pwyc' })], [table({ pricePence: 0 }), table({ pricePence: 500 })]);
    expect(Object.fromEntries(mix.map((f) => [f.key, f.count]))).toEqual({ free: 1, fixed: 2, pwyc: 1 });
  });
});

describe('cumulativeTimeline', () => {
  it('sorts by date, counts up, and measures days from the first record across a month end', () => {
    const points = cumulativeTimeline([...LEDGER].reverse());
    expect(points.map((p) => [p.label, p.dayOffset, p.cumulative])).toEqual([
      ['28 Aug', 0, 1],
      ['5 Sep', 8, 2],
      ['12 Sep', 15, 3],
    ]);
  });

  it('is empty for no records', () => {
    expect(cumulativeTimeline([])).toEqual([]);
  });
});

describe('small helpers', () => {
  it('rounds the mean rating to one place', () => {
    expect(meanRating([4.9, 4.8, 5])).toBe(4.9);
    expect(meanRating([])).toBe(0);
  });

  it('keeps stated quantities and never invents one for a venue', () => {
    const food = foodRescued([supper({ qty: '14 loaves of' })], [table({ surplus: ['Pastries', 'Loaves'] })]);
    expect(food.map((f) => f.qty)).toEqual(['14 loaves of', null, null]);
  });

  it('counts returning requests', () => {
    expect(returningShare([{ name: 'a', meta: '', returning: true }, { name: 'b', meta: '', returning: false }])).toEqual({ returning: 1, asked: 2 });
  });
});

describe('getImpact on the pilot sample', () => {
  const d = getImpact();

  it('labels itself as sample data', () => {
    expect(d.label).toBe('Sample data from the pilot demo');
  });

  it('matches the counts in Windfall’s demo records', () => {
    expect(d.headline).toMatchObject({
      suppersListed: 7,
      homeSuppers: 3,
      venueTables: 4,
      chairsOffered: 48,
      homeChairsOffered: 22,
      homeChairsTaken: 10,
      guestsBooked: 7,
      hostsSuppersToDate: 26,
      meanHostRating: 4.9,
      areas: 7,
      partnerVenues: 3,
    });
    expect(d.dishes).toEqual({ vegan: 4, total: 15 });
    expect(d.returning).toEqual({ returning: 1, asked: 2 });
  });

  it('keeps the totals consistent with the records', () => {
    const seats = [...HOME_SUPPERS, ...VENUE_TABLES].reduce((a, x) => a + x.seats, 0);
    expect(d.areas.reduce((a, r) => a + r.total, 0)).toBe(seats);
    expect(d.sources.reduce((a, s) => a + s.pct, 0)).toBe(100);
    expect(d.fees.reduce((a, f) => a + f.count, 0)).toBe(d.headline.suppersListed);
  });
});
