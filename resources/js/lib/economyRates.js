// Economy (air-consolidator) international rate reference for Packrs Courier.
//
// Companion to `internationalRates.js` (DHL Express). Same page, two service
// levels: Express is fast and priced in NPR; Economy is the cheaper
// consolidator network, published in USD and billed in NPR at the NRB daily
// rate. Source: supplier rate chart effective 05.04.2026, 20%-inclusive
// (base tariff + 20% Packrs margin already applied to every figure below).
//
// Like the DHL module this is published-tariff reference data, NOT the
// admin-editable domestic `rates` table.

export const ECON_META = {
  service: 'Packrs Economy · Export from Nepal',
  currency: 'USD',
  effectiveFrom: '05.04.2026',
  markupApplied: '20%',
  billingNote: 'Billed in NPR at the NRB daily exchange rate.',
};

// Weight slabs, in kg. Below 10 kg a shipment is billed at the next slab up.
export const ECON_SLABS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5];

// From 10 kg the chart switches to per-kg pricing. Tiers align with ECON_ROUTES.perKg.
export const ECON_TIERS = [
  { label: '10 - 20 kg', max: 20 },
  { label: '21 - 30 kg', max: 30 },
  { label: '31 - 45 kg', max: 45 },
  { label: '46 - 70 kg', max: 70 },
  { label: '71 - 99 kg', max: 99 },
  { label: '100 kg +', max: Infinity },
];

export const ECON_MAX_KG = 500;
export const ECON_SLAB_MAX_KG = 9.5;

// 22 routes. `rates` maps 1:1 onto ECON_SLABS, `perKg` onto ECON_TIERS. USD.
export const ECON_ROUTES = {
  EUA: {
    name: 'EU UPS A',
    covers: 'Netherlands',
    rates: [29.98, 34.39, 37.88, 42.31, 40.84, 50.21, 53.69, 58.97, 61.6, 66.01, 69.49, 73.91, 77.4, 81.82, 85.3, 87.91, 93.2, 95.04, 97.75],
    perKg: [9, 7.68, 7.68, 7.68, 7.68, 7.68],
  },
  EUB: {
    name: 'EU UPS B',
    covers: 'Germany, Belgium',
    rates: [26.12, 29.6, 34.03, 38.45, 36.98, 46.36, 49.84, 54.25, 57.73, 62.94, 65.64, 70.07, 73.55, 77.96, 81.44, 85.87, 89.35, 92.05, 95.42],
    perKg: [9, 7.68, 7.68, 7.68, 7.68, 7.68],
  },
  EUC: {
    name: 'EU UPS C',
    covers: 'Denmark, France, Italy, Monaco',
    rates: [35.6, 40.8, 43.5, 47.93, 46.46, 55.82, 59.32, 63.74, 67.21, 71.59, 75.12, 79.54, 83.02, 87.44, 90.92, 94.5, 98.82, 101.5, 105.35],
    perKg: [9.6, 7.68, 7.68, 7.68, 7.68, 7.68],
  },
  EUD: {
    name: 'EU UPS D',
    covers: 'Finland, Ireland, Austria, Portugal, Spain, Sweden',
    rates: [41.3, 45.72, 49.21, 53.64, 52.16, 61.54, 65.02, 69.44, 72.91, 77.34, 80.82, 85.24, 88.72, 93.14, 96.62, 100.88, 104.53, 109.45, 111.49],
    perKg: [9.6, 7.68, 7.68, 7.68, 7.68, 7.68],
  },
  EUE: {
    name: 'EU UPS E',
    covers: 'Andorra, Norway, Switzerland, Iceland',
    rates: [58.9, 63.31, 66.79, 71.21, 69.74, 79.13, 82.6, 86.9, 90.5, 94.93, 98.41, 103.6, 106.31, 110.69, 114.22, 118.63, 122.11, 124.81, 127.01],
    perKg: [11.4, 8.88, 8.88, 8.88, 8.88, 8.88],
  },
  EUF: {
    name: 'EU UPS F',
    covers: 'Poland, Czech Republic',
    rates: [36.05, 40.46, 43.94, 48.37, 46.9, 56.27, 59.75, 64.18, 67.66, 72.23, 75.56, 79.99, 83.46, 87.89, 91.37, 95.78, 99.26, 101.99, 104.7],
    perKg: [9, 7.68, 7.68, 7.68, 7.68, 7.68],
  },
  EUG: {
    name: 'EU UPS G',
    covers: 'Malta, Cyprus',
    rates: [92.51, 96.61, 100.66, 101.32, 103.86, 113.06, 116.95, 121.72, 125.1, 128.81, 133.25, 137.34, 141.4, 145.85, 149.53, 153.95, 157.68, 162.13, 164.66],
    perKg: [14.4, 11.4, 10.5, 10.5, 10.5, 10.5],
  },
  EUH: {
    name: 'EU UPS H',
    covers: 'Bulgaria, Estonia, Greece, Hungary, Croatia, Latvia, Lithuania, Romania, Slovenia, Slovakia',
    rates: [42.41, 43.4, 50.32, 51.3, 53.27, 62.72, 66.12, 71.14, 74.02, 78.1, 81.92, 86.51, 89.82, 94.26, 97.73, 102.16, 105.64, 109.54, 111.58],
    perKg: [10.2, 8.4, 8.28, 8.28, 8.28, 8.28],
  },
  Z10: {
    name: 'Zone 10 UPS',
    covers: 'Asia, Middle East & Eastern Europe',
    rates: [87.53, 90.82, 94.12, 97.42, 95.77, 104.02, 107.32, 110.62, 113.92, 117.22, 120.52, 123.82, 127.1, 130.4, 133.7, 137, 140.3, 143.6, 146.9],
    perKg: [12.6, 9.3, 9.18, 9.18, 9.18, 9.18],
  },
  Z11: {
    name: 'Zone 11 UPS',
    covers: 'USA, Australia, NZ, Canada, Mexico, Japan — normal items',
    rates: [73.88, 76.49, 79.1, 81.72, 79.38, 86.95, 89.57, 92.17, 94.79, 97.4, 100.02, 102.64, 105.24, 107.86, 110.47, 113.09, 115.7, 118.31, 120.92],
    perKg: [10.8, 8.7, 8.7, 8.7, 8.7, 8.7],
  },
  YYZ: {
    name: 'YYZ DDP',
    covers: 'Canada — Yukon (YT), duty paid',
    rates: [30.67, 37.15, 43.62, 50.1, 49.97, 63.05, 69.52, 75.98, 86.39, 89.94, 97.42, 104.89, 112.37, 119.84, 127.32, 134.8, 142.27, 149.75, 161.81],
    perKg: [13.5, 11.7, 11.7, 11.7, 11.7, 11.7],
  },
  DXB: {
    name: 'DXB',
    covers: 'United Arab Emirates',
    rates: [12.24, 14.33, 16.4, 18.49, 20.58, 22.67, 24.76, 26.83, 28.92, 31.01, 33.66, 35.99, 38.94, 40.94, 42.58, 45.92, 47.72, 50.9, 53.14],
    perKg: [5.04, 4.2, 4.2, 3.6, 3.6, 3.6],
  },
  JFKDDU: {
    name: 'JFK DDU',
    covers: 'USA duties unpaid — except Hawaii & Alaska',
    rates: [27.84, 35.08, 42.31, 46.73, 50.17, 64.01, 71.24, 79.42, 84.78, 91.07, 97.37, 107.41, 115.58, 123.76, 130.06, 136.34, 144.52, 149.88, 156.18],
    perKg: [13.2, 11.7, 11.7, 11.7, 11.7, 11.7],
  },
  JFKDDP: {
    name: 'JFK DDP',
    covers: 'USA duties prepaid — except Hawaii & Alaska',
    rates: [28.31, 36, 43.69, 48.58, 52.49, 66.78, 74.47, 83.11, 88.93, 95.69, 102.44, 112.96, 121.58, 130.21, 136.98, 143.74, 152.36, 158.18, 164.94],
    perKg: [13.5, 12.3, 12.3, 12.3, 12.3, 12.3],
  },
  AKL: {
    name: 'AKL',
    covers: 'New Zealand — except islands',
    rates: [30.74, 38.39, 48.6, 56.24, 62.24, 71.53, 79.18, 86.82, 94.48, 102.12, 109.76, 117.41, 125.05, 132.7, 140.34, 147.98, 155.63, 163.28, 170.93],
    perKg: [12.9, 9.96, 9.96, 9.96, 9.96, 9.96],
  },
  ICN: {
    name: 'ICN',
    covers: 'South Korea direct',
    rates: [21.23, 24, 26.77, 29.54, 32.3, 35.08, 37.85, 40.62, 48, 49.85, 52.62, 55.38, 58.15, 65.54, 68.3, 70.15, 72.92, 75.7, 68.81],
    perKg: [5.7, 5.7, 5.7, 5.7, 5.7, 5.7],
  },
  NPPOST: {
    name: 'NP Post',
    covers: 'Japan — food items',
    rates: [22.02, 25.54, 29.04, 32.56, 36.06, 39.58, 43.08, 46.6, 50.1, 53.62, 57.12, 60.64, 64.14, 67.66, 71.16, 74.68, 78.18, 81.7, 85.2],
    perKg: [7.56, 5.7, 5.7, 5.7, 5.7, 5.7],
  },
  SAGAWA: {
    name: 'Sagawa',
    covers: 'Japan',
    rates: [32.11, 32.93, 34.74, 36.7, 38.66, 42.6, 46.54, 49.15, 53.09, 56.36, 64.02, 69.96, 72.6, 75.24, 77.88, 80.52, 83.16, 88.44, 91.08],
    perKg: [9.3, 5.7, 5.7, 5.7, 5.7, 5.7],
  },
  SELF: {
    name: 'Self',
    covers: 'Hong Kong',
    rates: [4.62, 7.62, 9.58, 11.54, 14.62, 16.38, 18.34, 20.3, 22.26, 24.11, 28.85, 31.58, 32.77, 34.73, 36.7, 38.65, 40.62, 42.58, 44.54],
    perKg: [3.78, 5.7, 5.7, 5.7, 5.7, 5.7],
  },
  SYDMEL: {
    name: 'SYD/MEL',
    covers: 'Australia — except 6215–6797 postcodes',
    rates: [24.65, 26.82, 33.19, 38.64, 43.38, 51.41, 57.79, 64.18, 70.55, 73.19, 79.57, 85.96, 91.4, 97.78, 103.22, 106.8, 111.12, 115.81, 121.73],
    perKg: [9.3, 8.1, 8.1, 8.1, 8.1, 8.1],
  },
  LHR: {
    name: 'LHR DPD',
    covers: 'UK — except Scotland & N. Ireland',
    rates: [36.06, 38.54, 41.02, 43.49, 45.96, 49.2, 53.02, 56.83, 61.42, 64.44, 68.64, 72.84, 77, 81.2, 85.38, 89.57, 93.74, 97.94, 102.11],
    perKg: [6.18, 5.7, 5.7, 5.7, 5.7, 5.7],
  },
  J1000: {
    name: '1000 Japan',
    covers: 'Japan via Sagawa — no medicine & seeds',
    rates: [22.2, 24.6, 25.8, 28.2, 30.6, 33, 34.2, 36.6, 37.8, 41.4, 43.8, 45, 47.4, 49.8, 53.4, 54.6, 57, 59.4, 61.8],
    perKg: [6, 5.7, 5.7, 5.4, 4.68, 4.44],
  },
};

// Destination country -> available routes, preferred route first.
export const ECON_COUNTRY_GROUPS = [
  {
    group: 'Europe & UK',
    countries: {
      Albania: ['Z10'], Andorra: ['EUE'], Austria: ['EUD'], Belgium: ['EUB'],
      Bulgaria: ['EUH'], Croatia: ['EUH'], Cyprus: ['EUG'], 'Czech Republic': ['EUF'],
      Denmark: ['EUC'], Estonia: ['EUH'], Finland: ['EUD'], France: ['EUC'],
      Germany: ['EUB'], Greece: ['EUH'], Hungary: ['EUH'], Iceland: ['EUE'],
      Ireland: ['EUD'], Italy: ['EUC'], Latvia: ['EUH'], Lithuania: ['EUH'],
      Malta: ['EUG'], Monaco: ['EUC'], Netherlands: ['EUA'], Norway: ['EUE'],
      Poland: ['EUF'], Portugal: ['EUD'], Romania: ['EUH'], Serbia: ['Z10'],
      Slovakia: ['EUH'], Slovenia: ['EUH'], Spain: ['EUD'], Sweden: ['EUD'],
      Switzerland: ['EUE'], Ukraine: ['Z10'], 'United Kingdom': ['LHR'],
    },
  },
  {
    group: 'Asia · Middle East · Africa',
    countries: {
      Bahrain: ['Z10'], China: ['Z10'], Egypt: ['Z10'], 'Hong Kong': ['SELF', 'Z10'],
      Indonesia: ['Z10'], Iraq: ['Z10'], Israel: ['Z10'], Japan: ['SAGAWA', 'NPPOST', 'J1000', 'Z11'],
      Jordan: ['Z10'], Kuwait: ['Z10'], Macau: ['Z10'], Malaysia: ['Z10'],
      Oman: ['Z10'], Philippines: ['Z10'], Qatar: ['Z10'], 'South Korea': ['ICN', 'Z10'],
      Thailand: ['Z10'], 'United Arab Emirates': ['DXB'], Vietnam: ['Z10'],
    },
  },
  {
    group: 'Americas',
    countries: {
      Canada: ['Z11', 'YYZ'], Mexico: ['Z11'], USA: ['JFKDDU', 'JFKDDP', 'Z11'],
    },
  },
  {
    group: 'Oceania',
    countries: {
      Australia: ['SYDMEL', 'Z11'], 'New Zealand': ['AKL', 'Z11'],
    },
  },
];

export const ECON_COUNTRIES = Object.assign({}, ...ECON_COUNTRY_GROUPS.map((g) => g.countries));

// Pass-through charges from the supplier chart. Unlike the rates above these
// carry no Packrs margin, so they are quoted exactly as the carrier bills them.
export const ECON_TERMS = {
  volumetricDivisor: 5000,
  customsPerBoxOver10kgNpr: 15000,
  customsPerKgOver0_5kgNpr: 97,
  nepalPostPerConsignmentNpr: 700,
  nepalPostPerBoxNpr: 300,
  lostParcelCompensationUsd: 100,
  insuranceMaxUsd: 100,
  bottledGoodsPerBottleNpr: 1000,
  misdeclaredFoodEuropeEur: 300,
  latePaymentIncreasePct: 10,
  latePaymentAfterDays: 30,
  nzIslandUsd: 30,
  nzIslandPerKgUsd: 1.5,
  japanIslandDocUsd: 15,
  japanIslandBoxUsd: 25,
  remoteArea: 'USA $10 (JFK) or GBP 0.70/kg (LHR); Canada $25; Japan $25; UK GBP 25; Australia $40; New Zealand $6; Europe EUR 25 per box.',
  weightLimits: 'JFK USA 21 kg; LHR UPS 24 kg; LHR FedEx 25 kg; DXB UPS 24 kg; UK 29 kg; Canada 30 kg; Europe / NZ / Japan 25 kg; Australia 29 kg.',
};

/**
 * Mirror of the published Economy tariff arithmetic:
 *  - Up to 9.5 kg: billed at the next 0.5 kg slab.
 *  - Above 9.5 kg: per-kg pricing on the weight rounded up to the next whole kg
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
