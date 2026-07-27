// DHL Express (international) rate reference for Packrs Courier.
//
// Published-tariff reference data, NOT the admin-editable domestic `rates`
// table. The domestic table models from→to base+per-kg pricing and can't
// express zone/weight-slab tables, so international rates live here as a
// static module that the /rates/international calculator reads directly.
//
// Source: Eagle Traders DHL rate sheet, cost rates effective 1 April 2026.
// Every figure below is a SELLING rate — cost + 20% margin, rounded to the
// nearest NPR 10. Supplier cost rates are deliberately not in this file.
// All amounts are in NPR.
//
// Two things in the source card that look like bugs here but aren't:
//
//  1. WPX 1.5 kg to Zone 7 is 12,030, not a round number like its neighbours.
//     The cost sheet prints 10,022 where 10,200 would fit the curve. Left as
//     printed rather than guessed at — worth confirming with the supplier.
//
//  2. An 11 kg parcel is cheaper than a 10.5 kg one in zones 1-6, by up to
//     NPR 5,760. The per-kg band opens below where the slab table ends. That
//     is how the card is written, so it is how it is quoted.

export const INTL_META = {
  service: 'DHL Express Nepal · Packrs Courier',
  currency: 'NPR',
  markupApplied: '20%',
  markupNote: 'All rates are selling rates: supplier cost plus 20% margin.',
  rounding: 'Nearest NPR 10',
  effectiveFrom: '1 April 2026',
};

// Display-only grouping of destinations by zone.
export const ZONES = {
  1: ['India'],
  2: ['Bahrain', 'Bangladesh', 'Bhutan', 'Jordan', 'Oman', 'Pakistan', 'Qatar', 'Saudi Arabia', 'Sri Lanka', 'United Arab Emirates'],
  3: ['Brunei', 'China', 'Hong Kong', 'Indonesia', 'Laos', 'Macau', 'Malaysia', 'Philippines', 'Singapore', 'South Korea', 'Taiwan', 'Thailand', 'Vietnam'],
  4: ['Australia', 'Japan', 'New Zealand'],
  5: ['Austria', 'Belgium', 'Bulgaria', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Israel', 'Italy', 'Latvia', 'Lithuania', 'Malta', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'United Kingdom', 'Vatican City'],
  6: ['Canada', 'Mexico', 'USA'],
  7: ['Afghanistan', 'Bahamas', 'Belarus', 'Brazil', 'Canary Islands', 'Egypt', 'Ghana', 'Haiti', 'Iceland', 'Iran', 'Iraq', 'Kenya', 'Lebanon', 'Mauritius', 'Mongolia', 'Namibia', 'Nigeria', 'Panama', 'Paraguay', 'Peru', 'Puerto Rico', 'Reunion', 'Senegal', 'Seychelles', 'South Africa', 'Syria', 'Tunisia', 'Uganda', 'Ukraine', 'Uruguay', 'Virgin Islands', 'Yemen', 'Zambia'],
};

// Country → zone. Derived from ZONES above (single source of truth).
export const COUNTRIES = (() => {
  const out = {};
  for (const [zone, names] of Object.entries(ZONES)) {
    for (const name of names) out[name] = { zone: Number(zone) };
  }
  return out;
})();

// ── Documents (DOC), up to 2 kg ───────────────────────────────────────────
// The card prices a 0.5 kg base plus a flat add per additional 500 g, rather
// than listing each slab. Inclusive of Emergency Charge, TIA charge and VAT.
export const DOCUMENT_BASE = { zone1: 3600, zone2: 5160, zone3: 5040, zone4: 5820, zone5: 5400, zone6: 5820, zone7: 6600 };
export const DOCUMENT_ADD_PER_500G = { zone1: 930, zone2: 1200, zone3: 1200, zone4: 1440, zone5: 1200, zone6: 1800, zone7: 1610 };

// ── Non-documents (WPX), 0.5 kg to 10.5 kg ────────────────────────────────
export const PARCEL_RATES = [
  { weight_kg: 0.5, zone1: 4320, zone2: 5290, zone3: 4920, zone4: 4800, zone5: 4800, zone6: 5520, zone7: 8880 },
  { weight_kg: 1, zone1: 5040, zone2: 6480, zone3: 6000, zone4: 5880, zone5: 5880, zone6: 6600, zone7: 10320 },
  { weight_kg: 1.5, zone1: 6000, zone2: 7680, zone3: 7080, zone4: 6960, zone5: 6720, zone6: 7440, zone7: 12030 },
  { weight_kg: 2, zone1: 6840, zone2: 8880, zone3: 8280, zone4: 7920, zone5: 7680, zone6: 8520, zone7: 13440 },
  { weight_kg: 2.5, zone1: 7680, zone2: 10080, zone3: 9360, zone4: 9000, zone5: 8640, zone6: 9720, zone7: 15840 },
  { weight_kg: 3, zone1: 8520, zone2: 11400, zone3: 10560, zone4: 10080, zone5: 9600, zone6: 10440, zone7: 17400 },
  { weight_kg: 3.5, zone1: 9360, zone2: 12600, zone3: 11640, zone4: 11040, zone5: 10440, zone6: 11640, zone7: 19200 },
  { weight_kg: 4, zone1: 10200, zone2: 13800, zone3: 12960, zone4: 12000, zone5: 11400, zone6: 12960, zone7: 20760 },
  { weight_kg: 4.5, zone1: 11040, zone2: 15120, zone3: 13800, zone4: 13080, zone5: 12240, zone6: 14160, zone7: 22440 },
  { weight_kg: 5, zone1: 11760, zone2: 16200, zone3: 15000, zone4: 13920, zone5: 13440, zone6: 15360, zone7: 24000 },
  { weight_kg: 5.5, zone1: 12360, zone2: 17160, zone3: 15840, zone4: 14760, zone5: 14400, zone6: 16320, zone7: 25320 },
  { weight_kg: 6, zone1: 13200, zone2: 18360, zone3: 17040, zone4: 15960, zone5: 15360, zone6: 17520, zone7: 27000 },
  { weight_kg: 6.5, zone1: 14040, zone2: 19440, zone3: 18000, zone4: 17040, zone5: 16320, zone6: 18720, zone7: 28560 },
  { weight_kg: 7, zone1: 14880, zone2: 20760, zone3: 19200, zone4: 18000, zone5: 17400, zone6: 20040, zone7: 30120 },
  { weight_kg: 7.5, zone1: 15600, zone2: 21840, zone3: 20160, zone4: 18960, zone5: 18240, zone6: 21120, zone7: 31800 },
  { weight_kg: 8, zone1: 16440, zone2: 23040, zone3: 21240, zone4: 20040, zone5: 19440, zone6: 21720, zone7: 33360 },
  { weight_kg: 8.5, zone1: 17400, zone2: 24360, zone3: 22440, zone4: 21240, zone5: 20580, zone6: 22920, zone7: 35040 },
  { weight_kg: 9, zone1: 18000, zone2: 25440, zone3: 23400, zone4: 22200, zone5: 21600, zone6: 24000, zone7: 36480 },
  { weight_kg: 9.5, zone1: 18720, zone2: 26400, zone3: 24360, zone4: 23040, zone5: 22320, zone6: 24960, zone7: 37920 },
  { weight_kg: 10, zone1: 19320, zone2: 27360, zone3: 25200, zone4: 24000, zone5: 23160, zone6: 26520, zone7: 39360 },
  { weight_kg: 10.5, zone1: 20400, zone2: 28200, zone3: 26160, zone4: 24600, zone5: 24000, zone6: 27720, zone7: 40320 },
];

// ── Non-documents (WPX), 11 kg and above: rate PER KG ─────────────────────
// Total = per-kg rate × chargeable weight, not a base + add-on.
export const PER_KG_TIERS = [
  { label: '11 – 15.5 kg', max: 15.5, zone1: 1470, zone2: 2040, zone3: 1860, zone4: 1800, zone5: 1890, zone6: 2220, zone7: 3840 },
  { label: '16 – 20.5 kg', max: 20.5, zone1: 1440, zone2: 1990, zone3: 1830, zone4: 1770, zone5: 1860, zone6: 2150, zone7: 3840 },
  { label: '21 – 30 kg', max: 30, zone1: 1380, zone2: 1860, zone3: 1740, zone4: 1710, zone5: 1800, zone6: 2030, zone7: 3780 },
];

export const DOC_MAX_KG = 2;
export const PARCEL_SLAB_MAX_KG = 10.5;
export const MAX_WEIGHT_KG = 30;

// Surcharges, quoted at the same margin as the rates above.
export const SURCHARGES = {
  customsPerBoxAbove10kg: 900,
  badAddressPerShipment: 3000,
  remoteArea: 3840,
  overweightAbove70kg: 18000,
};

export const DELIVERY_TERMS = {
  freePacking: true,
  deliveryTime: '3–5 working days',
  ...SURCHARGES,
};

/**
 * Mirror of the published tariff arithmetic:
 *  - Document ≤ 2 kg: 0.5 kg base, then one ADD per extra 500 g.
 *  - Parcel ≤ 10.5 kg: billed at the next 0.5 kg slab.
 *  - Parcel 11–30 kg: per-kg pricing on the weight rounded up to the next
 *    0.5 kg, with the per-kg band chosen by that billed weight.
 *
 * Chargeable weight is the higher of actual and volumetric weight; the caller
 * passes whichever applies.
 */
export function calcIntlRate(country, weightKg, service) {
  const entry = COUNTRIES[country];
  if (!entry) return { error: 'Country not supported.' };

  const weight = Number(weightKg);
  if (!weight || weight <= 0) return { error: 'Enter a valid weight.' };

  const zone = entry.zone;
  const zoneKey = `zone${zone}`;

  if (service === 'Document') {
    if (weight > DOC_MAX_KG) {
      return { error: 'Document service is limited to 2 kg. Switch to Parcel for heavier shipments.' };
    }
    const slab = Math.ceil(weight * 2) / 2;
    const steps = Math.round((slab - 0.5) / 0.5);
    const rate = DOCUMENT_BASE[zoneKey] + steps * DOCUMENT_ADD_PER_500G[zoneKey];
    return { rate, slab, zone, mode: 'slab' };
  }

  // Parcel
  if (weight <= PARCEL_SLAB_MAX_KG) {
    const slab = PARCEL_RATES.find((r) => r.weight_kg >= weight - 1e-9);
    if (!slab) return { error: 'Weight out of range.' };
    return { rate: slab[zoneKey], slab: slab.weight_kg, zone, mode: 'slab' };
  }

  if (weight <= MAX_WEIGHT_KG) {
    const billedKg = Math.ceil(weight * 2) / 2;
    const tier = PER_KG_TIERS.find((t) => billedKg <= t.max);
    const perKg = tier[zoneKey];
    return { rate: Math.round(perKg * billedKg), slab: billedKg, zone, mode: 'perkg', perKg, billedKg, tier: tier.label };
  }

  return { error: `Rates are published to ${MAX_WEIGHT_KG} kg. Please contact us for a quote on heavier shipments.` };
}
