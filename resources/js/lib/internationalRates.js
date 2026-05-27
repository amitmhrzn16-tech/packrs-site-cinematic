// DHL Express (international) rate reference for Packrs Courier.
//
// This is published-tariff reference data, NOT the admin-editable domestic
// `rates` table. The domestic table models from→to base+per-kg pricing and
// can't express zone/weight-slab tables, so international rates live here as a
// static module that the /rates/international calculator reads directly.
//
// All amounts are in NPR and already include the 15% Packrs markup.

export const INTL_META = {
  service: 'DHL Express Nepal · Packrs Courier',
  currency: 'NPR',
  markupApplied: '15%',
  rounding: 'Nearest whole NPR',
};

// Display-only grouping of destinations by zone.
export const ZONES = {
  2: ['Bangladesh', 'Bahrain', 'Bhutan', 'Jordan', 'Kuwait', 'Maldives', 'Oman', 'Pakistan', 'Qatar', 'Sri Lanka', 'Saudi Arabia', 'United Arab Emirates'],
  3: ['Brunei', 'Cambodia', 'Hong Kong SAR China', 'Laos', 'Indonesia', 'Korea, Rep. Of', 'Macau SAR China', 'Myanmar', 'Philippines', 'Thailand', 'Vietnam', 'Japan'],
  4: ['Australia', 'New Zealand'],
  5: ['Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Israel', 'Italy', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Monaco', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'San Marino', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'United Kingdom', 'Vatican City'],
  6: ['USA', 'Canada', 'Mexico'],
  7: ['Algeria', 'Angola', 'Antigua', 'Bonaire', 'Canary Islands', 'Cape Verde', 'Central African Republic', 'Comoros', 'Cuba', 'Curacao', 'Egypt', 'Eswatini', 'Falkland Islands', 'Guernsey', 'Iran', 'Iraq', 'Jersey', 'Kiribati'],
  8: ['Samoa', 'Sao Tome and Principe', 'Serbia', 'Sierra Leone', 'Solomon Islands', 'Somalia', 'Somaliland', 'South Sudan', 'St. Barthelemy', 'St. Eustatius', 'St. Kitts', 'St. Lucia', 'St. Maarten', 'St. Vincent', 'Sudan', 'Syria', 'Tahiti', 'Korea, D.P.R. Of', 'Kosovo', 'Lebanon', 'Libya', 'Mariana Islands', 'Mayotte', 'Montenegro', 'Nauru', 'Nevis', 'Niue', 'North Macedonia', 'Saint Helena', 'Tanzania', 'Timor-Leste', 'Togo', 'Tonga', 'Tuvalu', 'Uganda', 'Ukraine', 'Venezuela', 'Virgin Islands (British)', 'Virgin Islands (US)', 'Yemen', 'Zambia', 'Zimbabwe', 'Tajikistan'],
};

// Country → { iso, zone }. Derived from ZONES above (single source of truth).
export const COUNTRIES = (() => {
  const iso = {
    Bangladesh: 'BD', Bahrain: 'BH', Bhutan: 'BT', Jordan: 'JO', Kuwait: 'KW', Maldives: 'MV', Oman: 'OM', Pakistan: 'PK', Qatar: 'QA', 'Sri Lanka': 'LK', 'Saudi Arabia': 'SA', 'United Arab Emirates': 'AE',
    Brunei: 'BN', Cambodia: 'KH', 'Hong Kong SAR China': 'HK', Laos: 'LA', Indonesia: 'ID', 'Korea, Rep. Of': 'KR', 'Macau SAR China': 'MO', Myanmar: 'MM', Philippines: 'PH', Thailand: 'TH', Vietnam: 'VN', Japan: 'JP',
    Australia: 'AU', 'New Zealand': 'NZ',
    Austria: 'AT', Belgium: 'BE', Bulgaria: 'BG', Croatia: 'HR', Cyprus: 'CY', 'Czech Republic': 'CZ', Denmark: 'DK', Estonia: 'EE', Finland: 'FI', France: 'FR', Germany: 'DE', Greece: 'GR', Hungary: 'HU', Ireland: 'IE', Israel: 'IL', Italy: 'IT', Latvia: 'LV', Liechtenstein: 'LI', Lithuania: 'LT', Luxembourg: 'LU', Malta: 'MT', Monaco: 'MC', Netherlands: 'NL', Norway: 'NO', Poland: 'PL', Portugal: 'PT', Romania: 'RO', 'San Marino': 'SM', Slovakia: 'SK', Slovenia: 'SI', Spain: 'ES', Sweden: 'SE', Switzerland: 'CH', Turkey: 'TR', 'United Kingdom': 'GB', 'Vatican City': 'VA',
    USA: 'US', Canada: 'CA', Mexico: 'MX',
    Algeria: 'DZ', Angola: 'AO', Antigua: 'AG', Bonaire: 'XB', 'Canary Islands': 'IC', 'Cape Verde': 'CV', 'Central African Republic': 'CF', Comoros: 'KM', Cuba: 'CU', Curacao: 'XC', Egypt: 'EG', Eswatini: 'SZ', 'Falkland Islands': 'FK', Guernsey: 'GG', Iran: 'IR', Iraq: 'IQ', Jersey: 'JE', Kiribati: 'KI',
    Samoa: 'WS', 'Sao Tome and Principe': 'ST', Serbia: 'RS', 'Sierra Leone': 'SL', 'Solomon Islands': 'SB', Somalia: 'SO', Somaliland: 'XS', 'South Sudan': 'SS', 'St. Barthelemy': 'XY', 'St. Eustatius': 'XE', 'St. Kitts': 'KN', 'St. Lucia': 'LC', 'St. Maarten': 'XM', 'St. Vincent': 'VC', Sudan: 'SD', Syria: 'SY', Tahiti: 'PF', 'Korea, D.P.R. Of': 'KP', Kosovo: 'KV', Lebanon: 'LB', Libya: 'LY', 'Mariana Islands': 'MP', Mayotte: 'YT', Montenegro: 'ME', Nauru: 'NR', Nevis: 'XN', Niue: 'NU', 'North Macedonia': 'MK', 'Saint Helena': 'SH', Tanzania: 'TZ', 'Timor-Leste': 'TL', Togo: 'TG', Tonga: 'TO', Tuvalu: 'TV', Uganda: 'UG', Ukraine: 'UA', Venezuela: 'VE', 'Virgin Islands (British)': 'VG', 'Virgin Islands (US)': 'VI', Yemen: 'YE', Zambia: 'ZM', Zimbabwe: 'ZW', Tajikistan: 'TJ',
  };
  const out = {};
  for (const [zone, names] of Object.entries(ZONES)) {
    for (const name of names) out[name] = { iso: iso[name] || null, zone: Number(zone) };
  }
  return out;
})();

// Weight-slab tables. Each row: weight_kg + zone2…zone8 totals (NPR, markup in).
export const DOCUMENT_RATES = [
  { weight_kg: 0.5, zone2: 4600, zone3: 5175, zone4: 5290, zone5: 5750, zone6: 6210, zone7: 6440, zone8: 8625 },
  { weight_kg: 1.0, zone2: 5520, zone3: 6325, zone4: 6670, zone5: 7245, zone6: 7935, zone7: 8165, zone8: 10465 },
  { weight_kg: 1.5, zone2: 6440, zone3: 7475, zone4: 8050, zone5: 8740, zone6: 9660, zone7: 9890, zone8: 12305 },
  { weight_kg: 2.0, zone2: 7360, zone3: 8625, zone4: 9430, zone5: 10235, zone6: 11385, zone7: 11615, zone8: 14145 },
];

export const PARCEL_RATES = [
  { weight_kg: 0.5, zone2: 6670, zone3: 7302, zone4: 7302, zone5: 7705, zone6: 8165, zone7: 8395, zone8: 10925 },
  { weight_kg: 1.0, zone2: 7590, zone3: 8222, zone4: 8222, zone5: 8625, zone6: 9200, zone7: 9545, zone8: 12247 },
  { weight_kg: 1.5, zone2: 8694, zone3: 9326, zone4: 9326, zone5: 9832, zone6: 10592, zone7: 11098, zone8: 14007 },
  { weight_kg: 2.0, zone2: 9706, zone3: 10338, zone4: 10338, zone5: 10844, zone6: 11730, zone7: 12362, zone8: 15462 },
  { weight_kg: 2.5, zone2: 10718, zone3: 11350, zone4: 11350, zone5: 11856, zone6: 12868, zone7: 13627, zone8: 16916 },
  { weight_kg: 3.0, zone2: 11730, zone3: 12362, zone4: 12362, zone5: 12868, zone6: 14007, zone7: 14892, zone8: 18371 },
  { weight_kg: 3.5, zone2: 12742, zone3: 13374, zone4: 13374, zone5: 13880, zone6: 15145, zone7: 16157, zone8: 19826 },
  { weight_kg: 4.0, zone2: 13754, zone3: 14386, zone4: 14386, zone5: 14892, zone6: 16284, zone7: 17422, zone8: 21281 },
  { weight_kg: 4.5, zone2: 14766, zone3: 15398, zone4: 15398, zone5: 15904, zone6: 17422, zone7: 18688, zone8: 22736 },
  { weight_kg: 5.0, zone2: 15778, zone3: 16410, zone4: 16410, zone5: 16916, zone6: 18561, zone7: 19952, zone8: 24190 },
  { weight_kg: 5.5, zone2: 16790, zone3: 17422, zone4: 17422, zone5: 17928, zone6: 19700, zone7: 21218, zone8: 25645 },
  { weight_kg: 6.0, zone2: 17802, zone3: 18434, zone4: 18434, zone5: 18940, zone6: 20838, zone7: 22482, zone8: 27100 },
  { weight_kg: 6.5, zone2: 18814, zone3: 19446, zone4: 19446, zone5: 19952, zone6: 21976, zone7: 23747, zone8: 28554 },
  { weight_kg: 7.0, zone2: 19826, zone3: 20458, zone4: 20458, zone5: 20964, zone6: 23115, zone7: 25012, zone8: 30009 },
  { weight_kg: 7.5, zone2: 20838, zone3: 21470, zone4: 21470, zone5: 21976, zone6: 24253, zone7: 26277, zone8: 31464 },
  { weight_kg: 8.0, zone2: 21850, zone3: 22482, zone4: 22482, zone5: 22988, zone6: 25392, zone7: 27542, zone8: 32919 },
  { weight_kg: 8.5, zone2: 22862, zone3: 23494, zone4: 23494, zone5: 24000, zone6: 26530, zone7: 28807, zone8: 34374 },
  { weight_kg: 9.0, zone2: 23874, zone3: 24506, zone4: 24506, zone5: 25012, zone6: 27669, zone7: 30072, zone8: 35828 },
  { weight_kg: 9.5, zone2: 24886, zone3: 25518, zone4: 25518, zone5: 26024, zone6: 28807, zone7: 31337, zone8: 37283 },
  { weight_kg: 10.0, zone2: 26473, zone3: 27105, zone4: 27105, zone5: 27611, zone6: 30521, zone7: 33178, zone8: 39313 },
  { weight_kg: 10.5, zone2: 27485, zone3: 28117, zone4: 28117, zone5: 28623, zone6: 31659, zone7: 34442, zone8: 40768 },
  { weight_kg: 11.0, zone2: 28497, zone3: 29129, zone4: 29129, zone5: 29635, zone6: 32798, zone7: 35708, zone8: 42222 },
  { weight_kg: 11.5, zone2: 29509, zone3: 30141, zone4: 30141, zone5: 30647, zone6: 33936, zone7: 36972, zone8: 43677 },
  { weight_kg: 12.0, zone2: 30521, zone3: 31153, zone4: 31153, zone5: 31659, zone6: 35075, zone7: 38238, zone8: 45132 },
  { weight_kg: 12.5, zone2: 31533, zone3: 32165, zone4: 32165, zone5: 32671, zone6: 36214, zone7: 39502, zone8: 46586 },
  { weight_kg: 13.0, zone2: 32545, zone3: 33178, zone4: 33178, zone5: 33684, zone6: 37352, zone7: 40768, zone8: 48041 },
  { weight_kg: 13.5, zone2: 33557, zone3: 34190, zone4: 34190, zone5: 34696, zone6: 38490, zone7: 42032, zone8: 49496 },
  { weight_kg: 14.0, zone2: 34569, zone3: 35202, zone4: 35202, zone5: 35708, zone6: 39629, zone7: 43298, zone8: 50951 },
  { weight_kg: 14.5, zone2: 35581, zone3: 36214, zone4: 36214, zone5: 36720, zone6: 40768, zone7: 44562, zone8: 52405 },
  { weight_kg: 15.0, zone2: 36593, zone3: 37226, zone4: 37226, zone5: 37732, zone6: 41906, zone7: 45828, zone8: 53860 },
  { weight_kg: 15.5, zone2: 37605, zone3: 38238, zone4: 38238, zone5: 38744, zone6: 43044, zone7: 47092, zone8: 55315 },
  { weight_kg: 16.0, zone2: 38617, zone3: 39250, zone4: 39250, zone5: 39756, zone6: 44183, zone7: 48357, zone8: 56770 },
  { weight_kg: 16.5, zone2: 39629, zone3: 40262, zone4: 40262, zone5: 40768, zone6: 45322, zone7: 49622, zone8: 58224 },
  { weight_kg: 17.0, zone2: 40641, zone3: 41274, zone4: 41274, zone5: 41780, zone6: 46460, zone7: 50887, zone8: 59679 },
  { weight_kg: 17.5, zone2: 41653, zone3: 42286, zone4: 42286, zone5: 42792, zone6: 47598, zone7: 52152, zone8: 61134 },
  { weight_kg: 18.0, zone2: 42665, zone3: 43298, zone4: 43298, zone5: 43804, zone6: 48737, zone7: 53417, zone8: 62589 },
  { weight_kg: 18.5, zone2: 43677, zone3: 44310, zone4: 44310, zone5: 44816, zone6: 49875, zone7: 54682, zone8: 64043 },
  { weight_kg: 19.0, zone2: 44689, zone3: 45322, zone4: 45322, zone5: 45828, zone6: 51014, zone7: 55947, zone8: 65498 },
  { weight_kg: 19.5, zone2: 45701, zone3: 46334, zone4: 46334, zone5: 46840, zone6: 52152, zone7: 57212, zone8: 66953 },
  { weight_kg: 20.0, zone2: 46713, zone3: 47345, zone4: 47345, zone5: 47851, zone6: 53291, zone7: 58477, zone8: 68408 },
  { weight_kg: 20.5, zone2: 48300, zone3: 48932, zone4: 48932, zone5: 49438, zone6: 55004, zone7: 60317, zone8: 70438 },
  { weight_kg: 21.0, zone2: 49312, zone3: 49944, zone4: 49944, zone5: 50450, zone6: 56143, zone7: 61582, zone8: 71892 },
  { weight_kg: 21.5, zone2: 50324, zone3: 50956, zone4: 50956, zone5: 51462, zone6: 57281, zone7: 62847, zone8: 73347 },
  { weight_kg: 22.0, zone2: 51336, zone3: 51968, zone4: 51968, zone5: 52474, zone6: 58420, zone7: 64112, zone8: 74802 },
  { weight_kg: 22.5, zone2: 52348, zone3: 52980, zone4: 52980, zone5: 53486, zone6: 59558, zone7: 65377, zone8: 76256 },
  { weight_kg: 23.0, zone2: 53360, zone3: 53992, zone4: 53992, zone5: 54498, zone6: 60697, zone7: 66642, zone8: 77711 },
  { weight_kg: 23.5, zone2: 54372, zone3: 55004, zone4: 55004, zone5: 55510, zone6: 61835, zone7: 67908, zone8: 79166 },
  { weight_kg: 24.0, zone2: 55384, zone3: 56016, zone4: 56016, zone5: 56522, zone6: 62974, zone7: 69172, zone8: 80621 },
  { weight_kg: 24.5, zone2: 56396, zone3: 57028, zone4: 57028, zone5: 57534, zone6: 64112, zone7: 70438, zone8: 82076 },
  { weight_kg: 25.0, zone2: 57408, zone3: 58040, zone4: 58040, zone5: 58546, zone6: 65251, zone7: 71702, zone8: 83530 },
];

// Per-kg add-on rates for parcels over 25 kg (NPR per extra kg, markup in).
export const PER_KG_ABOVE_25 = {
  '25_30': { label: '25.1 – 30 kg', zone2: 1438, zone3: 1667, zone4: 1725, zone5: 1955, zone6: 1955, zone7: 2185, zone8: 2588 },
  '30_300': { label: '30.1 – 300 kg', zone2: 1438, zone3: 1725, zone4: 1667, zone5: 1897, zone6: 1897, zone7: 2128, zone8: 2472 },
};

export const MAX_WEIGHT_KG = 300;
export const DOC_MAX_KG = 2;

export const DELIVERY_TERMS = {
  freePacking: true,
  freeCustomsInNepal: true,
  deliveryTime: '3–5 working days',
  remoteAreaFeeNpr: 4500,
  woodenBoxOrTubeNpr: 4000,
  oversizePacket100cmNpr: 4000,
  heavy24_5to79_5Npr: 4000,
  heavyAbove79_5Npr: 9000,
  addressChangeNpr: 2500,
  warZoneNote: 'Please confirm with DHL before booking.',
};

/**
 * Mirror of the published DHL tariff arithmetic:
 *  - Document: ≤ 2 kg, billed at the next 0.5 kg slab.
 *  - Parcel ≤ 25 kg: billed at the next 0.5 kg slab.
 *  - Parcel 25–300 kg: 25 kg slab base + ceil(weight − 25) × per-kg rate
 *    (per-kg band depends on whether weight is ≤ 30 kg or above).
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
    const slab = DOCUMENT_RATES.find((r) => r.weight_kg >= weight);
    if (!slab) return { error: 'Weight out of range.' };
    return { rate: slab[zoneKey], slab: slab.weight_kg, zone, mode: 'slab' };
  }

  // Parcel
  if (weight <= 25) {
    const slab = PARCEL_RATES.find((r) => r.weight_kg >= weight);
    if (!slab) return { error: 'Weight out of range.' };
    return { rate: slab[zoneKey], slab: slab.weight_kg, zone, mode: 'slab' };
  }

  if (weight <= MAX_WEIGHT_KG) {
    const base = PARCEL_RATES[PARCEL_RATES.length - 1][zoneKey]; // 25 kg slab
    const band = weight <= 30 ? PER_KG_ABOVE_25['25_30'] : PER_KG_ABOVE_25['30_300'];
    const perKg = band[zoneKey];
    const extraKg = Math.ceil(weight - 25);
    const additional = extraKg * perKg;
    return { rate: base + additional, slab: weight, zone, mode: 'calculated', perKg, base, additional, extraKg };
  }

  return { error: 'Maximum supported weight is 300 kg. Please contact us for special shipments.' };
}
