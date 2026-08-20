// Economy (air-consolidator) international rate reference for Packrs Courier.
//
// Companion to `internationalRates.js` (DHL Express). Same page, two service
// levels: Express is DHL, Economy is the cheaper consolidator network. As of
// the August 2026 card BOTH are priced in NPR — Economy no longer quotes in
// USD, so there is no exchange-rate step between the quote and the invoice.
//
// Source: consolidator rate list effective 01/08/2026 (Eagle Logistic Pvt.
// Ltd., Kathmandu). Every figure below is a SELLING rate:
//
//   * per-shipment slabs (0.5 – 9.5 kg): supplier cost + 20% margin
//   * per-kg bands (10 kg and above):    supplier cost + 10% margin
//
// both rounded UP to the nearest NPR 10. Supplier cost rates are deliberately
// not in this file. Surcharges are the supplier's own and are passed through
// at cost — no margin is added to them.
//
// Like the DHL module this is published-tariff reference data, NOT the
// admin-editable domestic `rates` table.
//
// Three things in the source card that look like typos here but are not:
//
//  1. Dubai gets CHEAPER at 5 kg (4,390) than at 4.5 kg (5,370), and again at
//     6.5 kg (5,360) after 6 kg (5,400). The cost sheet has the same kink, so
//     it is reproduced rather than smoothed.
//  2. Qatar 5.5 kg (7,710) is NPR 10 below Qatar 5 kg (7,720) — same story.
//  3. The per-kg bands skip 60 – 70.5 kg. A shipment landing in that gap is
//     billed at the 70.5 – 99.5 kg rate, which is identical to the 50 – 60 kg
//     rate on every lane except Oman.
//
// The remote-area surcharge is printed as EUR 600 — see the note on it below.

export const ECON_META = {
  service: 'Packrs Economy · Export from Nepal',
  currency: 'NPR',
  effectiveFrom: '1 August 2026',
  markupApplied: '20% per shipment · 10% per kg',
  rounding: 'Rounded up to the nearest NPR 10',
};

// Weight slabs, in kg. Below 10 kg a shipment is billed at the next slab up.
export const ECON_SLABS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5];

// From 10 kg the card switches to per-kg pricing. Tiers align 1:1 with
// ECON_ROUTES.perKg. `max` is the highest billed weight the band covers; the
// card's printed 60 – 70.5 kg gap is closed by letting the 99.5 band absorb it.
export const ECON_TIERS = [
  { label: '10 – 19 kg', max: 19 },
  { label: '20 – 30 kg', max: 30 },
  { label: '31 – 40 kg', max: 40 },
  { label: '41 – 50 kg', max: 50 },
  { label: '51 – 60 kg', max: 60 },
  { label: '61 – 99.5 kg', max: 99.5 },
  { label: '100 kg +', max: Infinity },
];

export const ECON_MAX_KG = 500;
export const ECON_SLAB_MAX_KG = 9.5;
export const ECON_PER_KG_MIN_KG = 10;

// 16 lanes. `rates` maps 1:1 onto ECON_SLABS, `perKg` onto ECON_TIERS. NPR.
// `rates: null` means the lane has no per-shipment pricing at all and is only
// quotable from 10 kg — that is how the card prints USA / Canada (DDP).
export const ECON_ROUTES = {
  USCA: {
    name: 'USA / Canada (DAP express)',
    covers: 'United States, Canada — duty payable on arrival',
    rates: [6240, 7440, 8160, 8880, 9600, 10320, 11040, 11760, 12480, 13200, 13200, 13800, 14400, 15000, 15600, 16200, 16800, 17400, 18000],
    perKg: [1380, 1140, 1140, 1140, 1140, 1140, 1140],
  },
  USCADDP: {
    name: 'USA / Canada (DDP)',
    covers: 'United States, Canada — duty prepaid, from 10 kg',
    rates: null,
    perKg: [1600, 1290, 1290, 1290, 1290, 1290, 1290],
  },
  AUNF: {
    name: 'Australia / NF',
    covers: 'Australia, Norfolk Island',
    rates: [3310, 3970, 4630, 5290, 5960, 6620, 7280, 7940, 8440, 9100, 9760, 10420, 11070, 11710, 12360, 13000, 13640, 14280, 14930],
    perKg: [1050, 860, 860, 860, 860, 860, 860],
  },
  UK: {
    name: 'UK',
    covers: 'United Kingdom',
    rates: [2320, 2820, 3310, 3640, 3970, 4470, 4960, 5290, 5790, 6450, 6780, 7110, 7610, 7940, 8270, 8600, 9100, 9430, 9760],
    perKg: [750, 680, 680, 680, 680, 680, 680],
  },
  EUA: {
    name: 'EU Zone A',
    covers: 'Western & Central Europe — 23 countries',
    rates: [3810, 4300, 4960, 5460, 5790, 6290, 6780, 7440, 7940, 8440, 9100, 9590, 10250, 10580, 10910, 11580, 12070, 12400, 12730],
    perKg: [1160, 930, 930, 930, 930, 930, 930],
  },
  EUB: {
    name: 'EU Zone B',
    covers: 'Bulgaria, Croatia, Greece',
    rates: [5130, 5460, 6120, 6620, 6950, 7440, 7940, 8600, 9100, 9590, 10250, 10750, 11410, 11740, 12070, 12730, 13230, 13560, 13890],
    perKg: [1160, 950, 950, 950, 950, 950, 950],
  },
  CYMT: {
    name: 'Cyprus / Malta',
    covers: 'Cyprus, Malta',
    rates: [10120, 10390, 10660, 10930, 11200, 11470, 11740, 12010, 12280, 12550, 12820, 13090, 13360, 13630, 13900, 14170, 14440, 14710, 14980],
    perKg: [1490, 1320, 1210, 1210, 1210, 1210, 1210],
  },
  NOCH: {
    name: 'Norway / Switzerland',
    covers: 'Norway, Switzerland',
    rates: [3970, 4570, 5760, 6750, 7540, 7740, 8140, 8340, 8930, 9720, 10120, 10520, 10720, 11110, 11310, 11710, 12100, 12500, 12900],
    perKg: [1600, 1490, 1490, 1490, 1320, 1320, 1320],
  },
  SIN: {
    name: 'Singapore',
    covers: 'Singapore',
    rates: [1660, 2320, 2820, 3640, 3970, 4300, 5130, 5460, 5790, 6620, 6950, 7280, 8100, 8440, 8770, 9590, 9920, 10250, 11080],
    perKg: [880, 610, 610, 610, 610, 610, 610],
  },
  SAU: {
    name: 'Saudi Arabia',
    covers: 'Saudi Arabia',
    rates: [2820, 3040, 3360, 3680, 4000, 4320, 4570, 4820, 5080, 5720, 5860, 6390, 6540, 7040, 7210, 7690, 7880, 8340, 8530],
    perKg: [850, 610, 610, 610, 610, 610, 610],
  },
  KWI: {
    name: 'Kuwait',
    covers: 'Kuwait',
    rates: [2310, 2910, 3800, 4040, 4280, 4530, 4770, 5010, 5260, 5760, 5880, 6420, 6570, 7070, 7240, 7720, 7910, 8370, 8550],
    perKg: [830, 730, 680, 650, 640, 640, 640],
  },
  OMN: {
    name: 'Oman',
    covers: 'Oman',
    rates: [2310, 2710, 3400, 4060, 4450, 4930, 5370, 5720, 5980, 6630, 6900, 7530, 7830, 8430, 8760, 9340, 9670, 10240, 10580],
    perKg: [1040, 920, 810, 770, 730, 680, 640],
  },
  QAT: {
    name: 'Qatar',
    covers: 'Qatar',
    rates: [2520, 3400, 4370, 5170, 5970, 6580, 6800, 6990, 7170, 7720, 7710, 8410, 8480, 9130, 9220, 9840, 9970, 10560, 11180],
    perKg: [1050, 660, 660, 660, 660, 660, 660],
  },
  DXB: {
    name: 'Dubai (UAE)',
    covers: 'United Arab Emirates',
    rates: [1510, 1640, 2070, 2510, 3140, 3770, 4170, 4770, 5370, 4390, 4950, 5400, 5360, 5770, 5880, 6270, 6520, 6900, 7150],
    perKg: [500, 440, 420, 390, 390, 390, 390],
  },
  KOR: {
    name: 'Korea',
    covers: 'South Korea',
    rates: [1800, 2040, 2400, 2760, 3000, 3360, 3720, 3960, 4320, 4680, 5040, 5400, 5640, 5880, 6120, 6420, 6720, 7080, 7440],
    perKg: [720, 580, 580, 580, 580, 580, 580],
  },
  JPN: {
    name: 'Japan',
    covers: 'Japan',
    rates: [1800, 2280, 2760, 3240, 3720, 4080, 4320, 4920, 5400, 5880, 6360, 6840, 7560, 7920, 8400, 8880, 9360, 9840, 10200],
    perKg: [830, 660, 660, 660, 660, 660, 660],
  },
};

// Destination country -> available lanes, preferred lane first. Only the
// destinations the August 2026 card actually prices are listed; anything not
// here is quoted by hand rather than guessed from a neighbouring lane.
export const ECON_COUNTRY_GROUPS = [
  {
    group: 'Europe & UK',
    countries: {
      Austria: ['EUA'], Belgium: ['EUA'], Bulgaria: ['EUB'], Croatia: ['EUB'],
      Cyprus: ['CYMT'], 'Czech Republic': ['EUA'], Denmark: ['EUA'], Estonia: ['EUA'],
      Finland: ['EUA'], France: ['EUA'], Germany: ['EUA'], Greece: ['EUB'],
      Hungary: ['EUA'], Ireland: ['EUA'], Italy: ['EUA'], Latvia: ['EUA'],
      Lithuania: ['EUA'], Luxembourg: ['EUA'], Malta: ['CYMT'], Monaco: ['EUA'],
      Netherlands: ['EUA'], Norway: ['NOCH'], Poland: ['EUA'], Portugal: ['EUA'],
      Romania: ['EUA'], Slovakia: ['EUA'], Slovenia: ['EUA'], Spain: ['EUA'],
      Sweden: ['EUA'], Switzerland: ['NOCH'], 'United Kingdom': ['UK'],
    },
  },
  {
    group: 'Asia & Middle East',
    countries: {
      Japan: ['JPN'], Kuwait: ['KWI'], Oman: ['OMN'], Qatar: ['QAT'],
      'Saudi Arabia': ['SAU'], Singapore: ['SIN'], 'South Korea': ['KOR'],
      'United Arab Emirates': ['DXB'],
    },
  },
  {
    group: 'Americas',
    countries: {
      Canada: ['USCA', 'USCADDP'], USA: ['USCA', 'USCADDP'],
    },
  },
  {
    group: 'Oceania',
    countries: {
      Australia: ['AUNF'], 'Norfolk Island': ['AUNF'],
    },
  },
];

export const ECON_COUNTRIES = Object.assign({}, ...ECON_COUNTRY_GROUPS.map((g) => g.countries));

// Zone definitions exactly as the card prints them. Kept separate from a lane's
// `covers` blurb because that string has to fit inside a <select> option.
export const ECON_ZONES = {
  'EU Zone A': ['Germany', 'Austria', 'Belgium', 'Denmark', 'Czech Republic', 'Finland', 'France', 'Monaco', 'Luxembourg', 'Netherlands', 'Hungary', 'Italy', 'Poland', 'Romania', 'Slovakia', 'Slovenia', 'Ireland', 'Portugal', 'Spain', 'Estonia', 'Lithuania', 'Latvia', 'Sweden'],
  'EU Zone B': ['Bulgaria', 'Croatia', 'Greece'],
};

// Surcharges, limits and terms as printed on the supplier's card. These carry
// no Packrs margin — they are billed exactly as the carrier charges them, and
// in the carrier's currency where the card quotes EUR or USD.
export const ECON_TERMS = {
  volumetricDivisor: 5000,
  nepalCustomsPerBoxNpr: 1500,
  tiaPerKgNpr: 12,
  // Printed as "EUR 600" on the card. Steep next to the EUR 50 bad-address fee,
  // but reproduced as printed rather than assumed to be a typo — confirm with
  // the supplier before quoting it to a customer.
  remoteAreaEur: 600,
  remoteAreaApplies: 'DPD / UPS service to EU Zone A and B',
  badAddressEur: 50,
  woodenBoxEur: 12,
  dryMeatPerKgNpr: 500,
  dryMeatApplies: 'UK and Europe',
  fraSurchargeUsd: 10,
  fraSurchargeApplies: '25 kg up to 31 kg',
  weightLimitEuropeKg: 28,
  weightLimitUsCanadaKg: 24,
  weightLimitAustraliaKg: 24,
  validity: 'Until further notice',
};

/**
 * Mirror of the published Economy tariff arithmetic:
 *  - Up to 9.5 kg: billed at the next 0.5 kg slab, at a flat per-shipment price.
 *  - From 10 kg: per-kg pricing on the weight rounded up to the next whole kg
 *    (total = per-kg rate x billed kg, not a base + add-on).
 * Chargeable weight is the higher of actual and volumetric weight; the caller
 * passes whichever applies.
 */
export function calcEconomyRate(country, weightKg, routeCode) {
  const routes = ECON_COUNTRIES[country];
  if (!routes) return { error: 'Country not supported on the Economy network.' };

  const code = routes.includes(routeCode) ? routeCode : routes[0];
  const route = ECON_ROUTES[code];
  if (!route) return { error: 'Select a route.' };

  const weight = Number(weightKg);
  if (!weight || weight <= 0) return { error: 'Enter a valid weight.' };

  if (weight <= ECON_SLAB_MAX_KG) {
    if (!route.rates) {
      return { error: `${route.name} is priced from ${ECON_PER_KG_MIN_KG} kg. Pick another route for lighter shipments.` };
    }
    const idx = ECON_SLABS.findIndex((s) => s >= weight - 1e-9);
    return { rate: route.rates[idx], slab: ECON_SLABS[idx], route: code, mode: 'slab' };
  }

  if (weight > ECON_MAX_KG) {
    return { error: `Maximum supported weight is ${ECON_MAX_KG} kg. Please contact us for a custom quote.` };
  }

  const billedKg = Math.ceil(weight);
  const tierIdx = ECON_TIERS.findIndex((t) => billedKg <= t.max);
  const perKg = route.perKg[tierIdx];
  return {
    rate: billedKg * perKg,
    perKg,
    billedKg,
    tier: ECON_TIERS[tierIdx].label,
    route: code,
    mode: 'perkg',
  };
}
