// Economy (air-consolidator) international rate reference for Packrs Courier.
//
// Companion to `internationalRates.js` (DHL Express). Same page, two service
// levels: Express is DHL, Economy is the cheaper consolidator network. As of
// the August 2026 card BOTH are priced in NPR — Economy no longer quotes in
// USD, so there is no exchange-rate step between the quote and the invoice.
//
// Source: consolidator rate list effective 20/09/2026 (Eagle Logistic Group,
// Kathmandu). Every figure below is a SELLING rate:
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
// Things in the source card that look like typos here but are reproduced as
// printed, because the cost sheet has the same shape:
//
//  1. Dubai gets CHEAPER at 5 kg (4,390) than at 4.5 kg (5,370), and again at
//     6.5 kg (5,360) after 6 kg (5,400).
//  2. Qatar 5.5 kg (7,710) is NPR 10 below Qatar 5 kg (7,720).
//  3. USA / Canada (FedEx) 6 kg and 6.5 kg repeat the 5 kg and 5.5 kg prices,
//     so 6 kg (9,710) is cheaper than 5.5 kg (10,230).
//  4. Norway / Switzerland per-shipment slabs are identical to Cyprus / Malta
//     (the per-kg bands differ). On the August card they were far cheaper.
//  5. The per-kg bands skip 60 – 70.5 kg. A shipment landing in that gap is
//     billed at the 70.5 – 99.5 kg rate.
//
// USA (DDP via JFK) has no price below 5 kg. From 5 to 9.5 kg the card prints
// a per-kg rate (NPR 2,000/kg cost); it is expanded here into flat slabs of
// slab weight x (cost + 20%), so it follows the same 20% rule as every other
// sub-10 kg price.

export const ECON_META = {
  service: 'Packrs Economy · Export from Nepal',
  currency: 'NPR',
  effectiveFrom: '20 September 2026',
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

// 19 lanes. `rates` maps 1:1 onto ECON_SLABS, `perKg` onto ECON_TIERS. NPR.
// `rates: null` means the lane has no per-shipment pricing at all and is only
// quotable from 10 kg — that is how the card prints USA / Canada (DDP
// express). A `null` inside `rates` means that slab is not priced; the lane is
// quotable from its first priced slab.
export const ECON_ROUTES = {
  USCAFDX: {
    name: 'USA / Canada (DDP, FedEx)',
    covers: 'United States, Canada — duty prepaid',
    rates: [4200, 4990, 5900, 6690, 7220, 7740, 8260, 8660, 9180, 9710, 10230, 9710, 10230, 10890, 11410, 12070, 12850, 13110, 14160],
    perKg: [1430, 1290, 1290, 1270, 1270, 1210, 1210],
  },
  USCADDP: {
    name: 'USA / Canada (DDP express)',
    covers: 'United States, Canada — duty prepaid, from 10 kg',
    rates: null,
    perKg: [1490, 1300, 1300, 1300, 1300, 1300, 1300],
  },
  USJFK: {
    name: 'USA (DDP via JFK)',
    covers: 'United States — duty prepaid, food items accepted, from 5 kg',
    rates: [null, null, null, null, null, null, null, null, null, 12000, 13200, 14400, 15600, 16800, 18000, 19200, 20400, 21600, 22800],
    perKg: [1620, 1380, 1380, 1380, 1380, 1380, 1370],
  },
  AUNF: {
    name: 'Australia / NF',
    covers: 'Australia, Norfolk Island',
    rates: [3310, 3970, 4630, 5290, 5960, 6620, 7280, 7940, 8440, 9100, 9760, 10420, 11070, 11710, 12360, 13000, 13640, 14280, 14930],
    perKg: [1010, 870, 870, 870, 870, 870, 870],
  },
  UK: {
    name: 'UK',
    covers: 'United Kingdom',
    rates: [2320, 2820, 3310, 3640, 3970, 4470, 4960, 5290, 5790, 6450, 6780, 7110, 7610, 7940, 8270, 8600, 9100, 9430, 9760],
    perKg: [750, 660, 660, 660, 660, 660, 660],
  },
  EUA: {
    name: 'EU Zone A',
    covers: 'Western & Central Europe — 23 countries',
    rates: [3810, 4300, 4960, 5460, 5790, 6290, 6780, 7440, 7940, 8440, 9100, 9590, 10250, 10580, 10910, 11580, 12070, 12400, 12730],
    perKg: [1050, 910, 910, 910, 910, 910, 910],
  },
  EUB: {
    name: 'EU Zone B',
    covers: 'Bulgaria, Croatia, Greece',
    rates: [5130, 5460, 6120, 6620, 6950, 7440, 7940, 8600, 9100, 9590, 10250, 10750, 11410, 11740, 12070, 12730, 13230, 13560, 13890],
    perKg: [1100, 920, 920, 920, 920, 920, 920],
  },
  CYMT: {
    name: 'Cyprus / Malta',
    covers: 'Cyprus, Malta',
    rates: [10120, 10390, 10660, 10930, 11200, 11760, 12330, 12890, 13450, 14020, 14580, 15140, 15710, 16270, 16830, 17390, 17960, 18520, 19080],
    perKg: [1740, 1460, 1460, 1380, 1380, 1380, 1380],
  },
  NOCH: {
    name: 'Norway / Switzerland',
    covers: 'Norway, Switzerland',
    rates: [10120, 10390, 10660, 10930, 11200, 11760, 12330, 12890, 13450, 14020, 14580, 15140, 15710, 16270, 16830, 17390, 17960, 18520, 19080],
    perKg: [1490, 1270, 1270, 1270, 1270, 1270, 1210],
  },
  SIN: {
    name: 'Singapore',
    covers: 'Singapore',
    rates: [1660, 2320, 2820, 3640, 3970, 4300, 5130, 5460, 5790, 6620, 6950, 7280, 8100, 8440, 8770, 9590, 9920, 10250, 11080],
    perKg: [880, 690, 750, 720, 690, 690, 690],
  },
  SAU: {
    name: 'Saudi Arabia',
    covers: 'Saudi Arabia',
    rates: [2820, 3040, 3360, 3680, 4000, 4320, 4570, 4820, 5080, 5720, 5860, 6390, 6540, 7040, 7210, 7690, 7880, 8340, 8530],
    perKg: [850, 700, 680, 650, 640, 640, 640],
  },
  KWI: {
    name: 'Kuwait',
    covers: 'Kuwait',
    rates: [4570, 5760, 6300, 6850, 7400, 7950, 8500, 9040, 9590, 10140, 10690, 11230, 11780, 12330, 12880, 13420, 13970, 14520, 15070],
    perKg: [830, 730, 680, 650, 640, 640, 640],
  },
  OMN: {
    name: 'Oman',
    covers: 'Oman',
    rates: [2310, 2710, 3400, 4060, 4450, 4930, 5370, 5720, 5980, 6630, 6900, 7530, 7830, 8430, 8760, 9340, 9670, 10240, 10580],
    perKg: [1040, 920, 810, 770, 730, 730, 730],
  },
  QAT: {
    name: 'Qatar',
    covers: 'Qatar',
    rates: [2520, 3400, 4370, 5170, 5970, 6580, 6800, 6990, 7170, 7720, 7710, 8410, 8480, 9130, 9220, 9840, 9970, 10560, 11180],
    perKg: [990, 720, 720, 720, 720, 720, 720],
  },
  DXB: {
    name: 'Dubai (UAE)',
    covers: 'United Arab Emirates',
    rates: [1510, 1640, 2070, 2510, 3140, 3770, 4170, 4770, 5370, 4390, 4950, 5400, 5360, 5770, 5880, 6270, 6520, 6900, 7150],
    perKg: [500, 440, 420, 390, 390, 390, 390],
  },
  UAEMY: {
    name: 'UAE / Malaysia',
    covers: 'United Arab Emirates, Malaysia',
    rates: [3000, 3600, 4200, 4500, 4800, 5100, 5400, 5700, 6000, 6300, 6600, 6900, 7200, 7500, 7800, 8100, 8400, 8700, 9000],
    perKg: [610, 550, 550, 550, 500, 440, 440],
  },
  KOR: {
    name: 'Korea',
    covers: 'South Korea',
    rates: [1800, 2040, 2400, 2760, 3000, 3360, 3720, 3960, 4320, 4680, 5040, 5400, 5640, 5880, 6120, 6420, 6720, 7080, 7440],
    perKg: [770, 640, 640, 640, 640, 640, 640],
  },
  JPN: {
    name: 'Japan',
    covers: 'Japan',
    rates: [1800, 2280, 2760, 3240, 3720, 4080, 4320, 4920, 5400, 5880, 6360, 6840, 7560, 7920, 8400, 8880, 9360, 9840, 10200],
    perKg: [880, 660, 660, 660, 660, 660, 660],
  },
  JPNDAP: {
    name: 'Japan (express DAP)',
    covers: 'Japan — duty payable on arrival',
    rates: [2400, 3600, 4200, 4800, 5400, 6000, 6600, 7200, 7800, 8400, 9000, 9600, 10200, 10800, 11400, 12000, 12600, 13200, 13800],
    perKg: [1050, 740, 740, 740, 660, 660, 660],
  },
};

// Destination country -> available lanes, preferred lane first. Only the
// destinations the September 2026 card actually prices are listed; anything not
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
      Japan: ['JPN', 'JPNDAP'], Kuwait: ['KWI'], Malaysia: ['UAEMY'], Oman: ['OMN'],
      Qatar: ['QAT'], 'Saudi Arabia': ['SAU'], Singapore: ['SIN'], 'South Korea': ['KOR'],
      'United Arab Emirates': ['DXB', 'UAEMY'],
    },
  },
  {
    group: 'Americas',
    countries: {
      Canada: ['USCAFDX', 'USCADDP'], USA: ['USCAFDX', 'USCADDP', 'USJFK'],
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
  nepalCustomsPerBoxNpr: 350,
  tiaPerKgNpr: 7,
  // Printed as "EUR 545" on the card. Steep next to the EUR 25 bad-address fee,
  // but reproduced as printed rather than assumed to be a typo — confirm with
  // the supplier before quoting it to a customer.
  remoteAreaEur: 545,
  remoteAreaApplies: 'DPD / UPS service to EU Zone A and B',
  badAddressEur: 25,
  woodenBoxEur: 7,
  dryMeatPerKgNpr: 300,
  dryMeatApplies: 'UK and Europe',
  fraSurchargeUsd: 7,
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
    if (route.rates[idx] == null) {
      const from = ECON_SLABS[route.rates.findIndex((r) => r != null)];
      return { error: `${route.name} is priced from ${from} kg. Pick another route for lighter shipments.` };
    }
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
