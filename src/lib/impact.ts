// Every number on the dashboard is worked out here, from the records in src/data/sample.ts.
// The page only ever calls getImpact(); swap its body for a live Supabase aggregate later and nothing else changes.

import {
  GUEST_REQUESTS,
  HOME_SUPPERS,
  LEDGER,
  PARTNER_VENUES,
  SAMPLE_LABEL,
  SOURCES,
  VENUE_TABLES,
  type GuestRequest,
  type HomeSupper,
  type LedgerEntry,
  type Source,
  type VenueTable,
} from '@/data/sample';

export type SupperKind = 'home' | 'venue';

export type ChairsBySupper = { id: string; label: string; host: string; seats: number; taken: number; open: number };
export type AreaRow = { area: string; home: number; venue: number; total: number };
export type FeeRow = { key: 'free' | 'fixed' | 'pwyc'; label: string; count: number };
export type HostRow = { host: string; suppers: number; rating: number };
export type TimelinePoint = { label: string; dayOffset: number; cumulative: number; what: string; hosted: boolean };
export type FoodRow = { food: string; qty: string | null; where: string; kind: SupperKind };

export type Impact = {
  label: string;
  /** When the numbers were taken. For sample data, the Windfall commit they were copied from. */
  asOf: string;
  headline: {
    suppersListed: number;
    homeSuppers: number;
    venueTables: number;
    chairsOffered: number;
    homeChairsOffered: number;
    homeChairsTaken: number;
    homeFillRate: number;
    guestsBooked: number;
    hostsSuppersToDate: number;
    meanHostRating: number;
    areas: number;
    partnerVenues: number;
  };
  chairsBySupper: ChairsBySupper[];
  areas: AreaRow[];
  /** The same rows for each filter on the area chart. */
  areasByKind: Record<SupperKind | 'all', AreaRow[]>;
  sources: Source[];
  fees: FeeRow[];
  hosts: HostRow[];
  timeline: TimelinePoint[];
  food: FoodRow[];
  ratings: { givenByGuest: number[]; hostedAverage: number | null; hostedRatings: number };
  returning: { returning: number; asked: number };
  dishes: { total: number; vegan: number };
};

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** Taken chairs include the host's own (chair 0). */
export const chairsTaken = (s: HomeSupper) => s.takenSeats.length;
/** Guests booked: taken chairs other than the host's. */
export const guestsBooked = (s: HomeSupper) => s.takenSeats.filter((c) => c !== 0).length;

export function chairsBySupper(suppers: HomeSupper[]): ChairsBySupper[] {
  return suppers.map((s) => {
    const taken = chairsTaken(s);
    return { id: s.id, label: s.title, host: s.host, seats: s.seats, taken, open: s.seats - taken };
  });
}

/** Share of chairs taken across home suppers, 0 to 1. Venue tables carry no bookings in the sample, so they are left out. */
export function fillRate(suppers: HomeSupper[]): number {
  const seats = sum(suppers.map((s) => s.seats));
  return seats === 0 ? 0 : sum(suppers.map(chairsTaken)) / seats;
}

/** Chairs offered per neighbourhood, split by home supper and venue table, largest first. */
export function chairsByArea(suppers: HomeSupper[], tables: VenueTable[], kind: SupperKind | 'all' = 'all'): AreaRow[] {
  const rows = new Map<string, AreaRow>();
  const row = (area: string) => rows.get(area) ?? rows.set(area, { area, home: 0, venue: 0, total: 0 }).get(area)!;
  if (kind !== 'venue') for (const s of suppers) row(s.nbhd).home += s.seats;
  if (kind !== 'home') for (const t of tables) row(t.nbhd).venue += t.seats;
  return [...rows.values()]
    .map((r) => ({ ...r, total: r.home + r.venue }))
    .sort((a, b) => b.total - a.total || a.area.localeCompare(b.area));
}

/** How each listing asks people to chip in. A venue table at 0p is free; any other price is fixed. */
export function feeMix(suppers: HomeSupper[], tables: VenueTable[]): FeeRow[] {
  const count = { free: 0, fixed: 0, pwyc: 0 };
  for (const s of suppers) count[s.fee === 'pay' ? 'fixed' : s.fee]++;
  for (const t of tables) count[t.pricePence === 0 ? 'free' : 'fixed']++;
  return [
    { key: 'free', label: 'Free', count: count.free },
    { key: 'fixed', label: 'Set price', count: count.fixed },
    { key: 'pwyc', label: 'Pay what you can', count: count.pwyc },
  ];
}

/** Plain mean of the hosts' profile ratings (Windfall's sample gives no rating counts to weight by). */
export function meanRating(ratings: number[]): number {
  return ratings.length === 0 ? 0 : Math.round((sum(ratings) / ratings.length) * 10) / 10;
}

// The sample's dates have no year. A fixed non-leap reference year turns day and month into a day count;
// it is never shown.
const dayNumber = (e: Pick<LedgerEntry, 'day' | 'month'>) => Date.UTC(2001, e.month - 1, e.day) / 864e5;

/** Running count of suppers in the demo neighbour's record, oldest first, with days since the first one. */
export function cumulativeTimeline(entries: LedgerEntry[]): TimelinePoint[] {
  const sorted = [...entries].sort((a, b) => dayNumber(a) - dayNumber(b));
  const start = sorted.length ? dayNumber(sorted[0]) : 0;
  return sorted.map((e, i) => ({ label: e.label, dayOffset: dayNumber(e) - start, cumulative: i + 1, what: e.what, hosted: e.hosted }));
}

/** What food each listing rescues. A quantity is kept only where Windfall states one; nothing is summed. */
export function foodRescued(suppers: HomeSupper[], tables: VenueTable[]): FoodRow[] {
  return [
    ...suppers.map((s) => ({ food: s.food, qty: s.qty, where: s.place, kind: 'home' as const })),
    ...tables.flatMap((t) => t.surplus.map((food) => ({ food, qty: null, where: t.venue, kind: 'venue' as const }))),
  ];
}

export function returningShare(requests: GuestRequest[]) {
  return { returning: requests.filter((r) => r.returning).length, asked: requests.length };
}

export function getImpact(): Impact {
  const homeChairsOffered = sum(HOME_SUPPERS.map((s) => s.seats));
  const homeChairsTaken = sum(HOME_SUPPERS.map(chairsTaken));
  const areas = chairsByArea(HOME_SUPPERS, VENUE_TABLES);
  const dishes = [...HOME_SUPPERS, ...VENUE_TABLES].flatMap((x) => x.menu);
  const ledgerStars = LEDGER.map((e) => e.myStars).filter((s): s is number => s != null);
  const hosted = LEDGER.find((e) => e.hosted && e.average != null);

  return {
    label: SAMPLE_LABEL,
    asOf: 'Windfall demo data, commit f36dd81',
    headline: {
      suppersListed: HOME_SUPPERS.length + VENUE_TABLES.length,
      homeSuppers: HOME_SUPPERS.length,
      venueTables: VENUE_TABLES.length,
      chairsOffered: homeChairsOffered + sum(VENUE_TABLES.map((t) => t.seats)),
      homeChairsOffered,
      homeChairsTaken,
      homeFillRate: fillRate(HOME_SUPPERS),
      guestsBooked: sum(HOME_SUPPERS.map(guestsBooked)),
      hostsSuppersToDate: sum(HOME_SUPPERS.map((s) => s.hostSuppers)),
      meanHostRating: meanRating(HOME_SUPPERS.map((s) => s.hostRating)),
      areas: areas.length,
      partnerVenues: PARTNER_VENUES.length,
    },
    chairsBySupper: chairsBySupper(HOME_SUPPERS),
    areas,
    areasByKind: { all: areas, home: chairsByArea(HOME_SUPPERS, VENUE_TABLES, 'home'), venue: chairsByArea(HOME_SUPPERS, VENUE_TABLES, 'venue') },
    sources: SOURCES,
    fees: feeMix(HOME_SUPPERS, VENUE_TABLES),
    hosts: HOME_SUPPERS.map((s) => ({ host: s.host, suppers: s.hostSuppers, rating: s.hostRating })).sort((a, b) => b.suppers - a.suppers),
    timeline: cumulativeTimeline(LEDGER),
    food: foodRescued(HOME_SUPPERS, VENUE_TABLES),
    ratings: { givenByGuest: ledgerStars, hostedAverage: hosted?.average ?? null, hostedRatings: hosted?.ratings ?? 0 },
    returning: returningShare(GUEST_REQUESTS),
    dishes: { total: dishes.length, vegan: dishes.filter((d) => d.tags.includes('vegan')).length },
  };
}
