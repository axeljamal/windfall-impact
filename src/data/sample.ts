// Sample data from the Windfall pilot demo.
//
// Written by hand from Windfall's demo-mode data (repo ~/Apps/windfall, read at commit f36dd81, 24 Nov 2026).
// Nothing here is invented: every value is copied from the file named above it, and anything Windfall only
// gives as words (a "glut of" beans) stays as words. When Windfall's sample data changes, update this file by
// hand, or replace getImpact() in src/lib/impact.ts with a live source (see README).

export const SAMPLE_LABEL = 'Sample data from the pilot demo';
export const SAMPLE_SOURCE_COMMIT = 'f36dd81';

export type Fee = 'pay' | 'free' | 'pwyc';

/** A supper in someone's home or a community space. From SUPPERS in windfall/src/data.ts. */
export type HomeSupper = {
  id: string;
  title: string;
  host: string;
  nbhd: string;
  place: string;
  seats: number;
  /** Chairs taken or on hold, chair 0 being the host's (Supper.takenSeats). */
  takenSeats: number[];
  fee: Fee;
  feeLabel: string;
  food: string;
  /** The quantity exactly as Windfall words it, e.g. "14 loaves of". */
  qty: string;
  /** The host's profile line: how many suppers they have hosted and their rating. */
  hostSuppers: number;
  hostRating: number;
  menu: { item: string; tags: string[] }[];
};

/** A quiet table offered by a venue. From DEMO_SLOTS in windfall/src/lib/tables.ts. */
export type VenueTable = {
  id: string;
  venue: string;
  kind: 'cafe' | 'restaurant' | 'pub' | 'bakery' | 'community';
  nbhd: string;
  seats: number;
  /** Per head, in pence. 0 is a free table. */
  pricePence: number;
  surplus: string[];
  hygiene: number | null;
  menu: { item: string; tags: string[] }[];
};

/** One dated supper in the demo neighbour's own record. From LEDGER in windfall/src/data.ts and DEMO_PAST in windfall/src/lib/history.ts. */
export type LedgerEntry = {
  what: string;
  /** Day and month as Windfall gives them ("12 Sep"); the sample has no year. */
  day: number;
  month: number;
  label: string;
  how: string;
  hosted: boolean;
  /** Stars the demo neighbour gave as a guest, if any. */
  myStars: number | null;
  /** For a supper they hosted: the guests' average and how many rated. */
  average: number | null;
  ratings: number;
};

export type Source = { label: string; pct: number };

export type GuestRequest = { name: string; meta: string; returning: boolean };

// windfall/src/data.ts, SUPPERS. hostSuppers and hostRating come from each hostSub line,
// e.g. "Weald Allotments plot-holder · 6 suppers · 4.9★".
export const HOME_SUPPERS: HomeSupper[] = [
  {
    id: 'weald',
    title: 'Root Veg & Runner Bean Stew',
    host: 'June',
    nbhd: 'Woodingdean',
    place: 'Home kitchen, Woodingdean',
    seats: 6,
    takenSeats: [0, 1, 2],
    fee: 'pay',
    feeLabel: '£5 or swap',
    food: 'Runner beans',
    qty: 'A glut of',
    hostSuppers: 6,
    hostRating: 4.9,
    menu: [
      { item: 'Root veg & runner bean stew', tags: ['vegan'] },
      { item: 'Beetroot & feta salad', tags: ['milk'] },
      { item: 'Sourdough from the Open Market fridge', tags: ['gluten'] },
    ],
  },
  {
    id: 'bread',
    title: "Yesterday's Loaves, Today's Panzanella",
    host: 'Maren',
    nbhd: 'Brighton (Central)',
    place: 'Open Market, London Road',
    seats: 8,
    takenSeats: [0, 1],
    fee: 'free',
    feeLabel: 'Free',
    food: 'Day-old bread',
    qty: '14 loaves of',
    hostSuppers: 11,
    hostRating: 4.8,
    menu: [
      { item: 'Panzanella', tags: ['gluten'] },
      { item: 'Roasted tomato soup', tags: ['vegan'] },
      { item: 'Herb focaccia', tags: ['gluten', 'milk'] },
    ],
  },
  {
    id: 'bridge',
    title: 'Community Bridge Supper',
    host: 'Deshi',
    nbhd: 'Whitehawk',
    place: 'Whitehawk Inn',
    seats: 8,
    takenSeats: [0, 1, 2, 3, 4],
    fee: 'pwyc',
    feeLabel: 'Pay what you can',
    food: 'Spinach & squash',
    qty: 'Two crates of',
    hostSuppers: 9,
    hostRating: 5.0,
    menu: [
      { item: 'Saag & squash curry', tags: ['milk'] },
      { item: 'Rice & dal', tags: ['vegan'] },
    ],
  },
];

// windfall/src/lib/tables.ts, DEMO_SLOTS (start times there are relative to "now", so they are left out).
export const VENUE_TABLES: VenueTable[] = [
  {
    id: 'slot-sealane',
    venue: 'Sea Lane Coffee',
    kind: 'cafe',
    nbhd: 'Kemptown',
    seats: 6,
    pricePence: 400,
    surplus: ['This morning’s sourdough', 'Roasted squash'],
    hygiene: 5,
    menu: [
      { item: 'Squash soup', tags: ['celery'] },
      { item: 'Cheese toastie', tags: ['gluten', 'milk'] },
    ],
  },
  {
    id: 'slot-trafalgar',
    venue: 'The Trafalgar Arms',
    kind: 'pub',
    nbhd: 'North Laine',
    seats: 8,
    pricePence: 900,
    surplus: ['Sunday roast veg', 'Two trays of crumble'],
    hygiene: 5,
    menu: [
      { item: 'Roast veg plate', tags: ['vegan'] },
      { item: 'Apple crumble', tags: ['gluten', 'milk'] },
    ],
  },
  {
    id: 'slot-flour',
    venue: 'Flour Pot, Hove',
    kind: 'bakery',
    nbhd: 'Hove',
    seats: 4,
    pricePence: 0,
    surplus: ['End-of-day loaves', 'Pastries'],
    hygiene: 5,
    menu: [
      { item: 'End-of-day loaves', tags: ['gluten'] },
      { item: 'Pastries', tags: ['gluten', 'milk', 'eggs'] },
    ],
  },
  {
    id: 'slot-realjunk',
    venue: 'Real Junk Food Project',
    kind: 'community',
    nbhd: 'Hanover',
    seats: 8,
    pricePence: 500,
    surplus: ['Whatever the vans bring'],
    hygiene: 4,
    menu: [{ item: 'Whatever the vans bring', tags: ['gluten', 'milk', 'eggs', 'soya', 'celery'] }],
  },
];

// windfall/src/data.ts, SOURCES: where the pilot's surplus comes from, as shares (Windfall gives no weights).
export const SOURCES: Source[] = [
  { label: 'Weald & Woodingdean allotments', pct: 41 },
  { label: 'Open Market traders', pct: 27 },
  { label: 'Home kitchens, Hove & Seven Dials', pct: 22 },
  { label: 'Cafés & independents', pct: 10 },
];

// windfall/src/data.ts, LEDGER (dates and how they chipped in), joined by title order with
// windfall/src/lib/history.ts, DEMO_PAST (who hosted, stars). DEMO_PAST's "days ago" gaps (21, 13, 6)
// match the LEDGER dates (28 Aug, 5 Sep, 12 Sep).
export const LEDGER: LedgerEntry[] = [
  { what: 'Office curry rescue', day: 28, month: 8, label: '28 Aug', how: 'Free', hosted: true, myStars: null, average: 4.7, ratings: 3 },
  { what: 'Root veg stew, backyard table', day: 5, month: 9, label: '5 Sep', how: 'Brought a side', hosted: false, myStars: 5, average: null, ratings: 0 },
  { what: 'Panzanella supper, London Road', day: 12, month: 9, label: '12 Sep', how: 'Paid £8', hosted: false, myStars: null, average: null, ratings: 0 },
];

// windfall/src/data.ts, VENUES: the partner venues named in the pilot.
export const PARTNER_VENUES = [
  { name: 'Weald Community Fridge', meta: 'Woodingdean · Thu & Sun mornings' },
  { name: 'Open Market, London Road', meta: 'Community kitchen · open daily' },
  { name: 'Whitehawk Inn', meta: 'Community venue · Bridge partner' },
];

// windfall/src/data.ts, GUEST_REQUESTS: people asking for a chair at the demo host's table.
// "returning" is read from meta: Priya is "New to Windfall", Tom has "Hosted 2 suppers".
export const GUEST_REQUESTS: GuestRequest[] = [
  { name: 'Priya S.', meta: 'No peanuts · New to Windfall', returning: false },
  { name: 'Tom H.', meta: 'Vegetarian · Hosted 2 suppers', returning: true },
];
