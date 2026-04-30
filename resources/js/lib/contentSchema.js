// Single source of truth for the editable content on every public page.
// - The keys here drive the admin "Pages & Modules" editor (admin shows ALL of
//   them, even before they exist in the DB).
// - Public pages call `useSiteContent(slug, defaults(slug))` to merge admin
//   overrides with these defaults.
//
// Keep keys snake_case + descriptive. Adding a key here + using it in the
// matching page component is enough — no migration needed.

export const CONTENT_SCHEMA = {
  home: {
    label: 'Home (cinematic)',
    fields: [
      // Zone 0 — Hadigaun start
      { key: 'z0_eyebrow',         label: 'Z0 — Eyebrow',           type: 'text', default: 'Home · The Valley Rush' },
      { key: 'z0_title_line1',     label: 'Z0 — Title line 1',      type: 'text', default: 'KTM VALLEY.' },
      { key: 'z0_title_line2',     label: 'Z0 — Title line 2 (accent)', type: 'text', default: '4–6 HOUR PROMISE.' },
      { key: 'z0_subtitle',        label: 'Z0 — Subtitle',          type: 'text', default: "From Hadigaun HQ to your customer's doorstep — every parcel carrying happiness." },

      // Zone 1 — Valley rush
      { key: 'z1_eyebrow',         label: 'Z1 — Eyebrow',           type: 'text', default: 'About Us · The Rush' },
      { key: 'z1_title_line1',     label: 'Z1 — Title line 1',      type: 'text', default: 'AI-EMPOWERED' },
      { key: 'z1_title_line2',     label: 'Z1 — Title line 2 (accent)', type: 'text', default: 'HAPPINESS.' },
      { key: 'z1_big_number',      label: 'Z1 — Big number badge',  type: 'text', default: '30M+' },
      { key: 'z1_big_number_label',label: 'Z1 — Big number label',  type: 'text', default: 'Parcels Delivered' },
      { key: 'z1_sla_label',       label: 'Z1 — SLA chip label',    type: 'text', default: 'SLA' },

      // Zone 2 — National coverage
      { key: 'z2_eyebrow',         label: 'Z2 — Eyebrow',           type: 'text', default: 'Services Zone' },
      { key: 'z2_title_line1',     label: 'Z2 — Title line 1',      type: 'text', default: '556 LOCATIONS.' },
      { key: 'z2_title_line2',     label: 'Z2 — Title line 2 (accent)', type: 'text', default: 'NATIONAL COVERAGE.' },
      { key: 'z2_subtitle',        label: 'Z2 — Subtitle',          type: 'text', default: 'From Kathmandu to all 77 districts — every PING! is a parcel landing.' },

      // Zone 3 — Tracking
      { key: 'z3_eyebrow',         label: 'Z3 — Eyebrow',           type: 'text', default: 'Tracking · Predictive Ghosting' },
      { key: 'z3_title_line1',     label: 'Z3 — Title line 1',      type: 'text', default: 'PREDICTING YOUR' },
      { key: 'z3_title_line2',     label: 'Z3 — Title line 2 (accent)', type: 'text', default: 'PACKAGE…' },

      // Zone 4 — Delivery / COD success
      { key: 'z4_eyebrow',         label: 'Z4 — Eyebrow',           type: 'text', default: 'Delivery Zone' },
      { key: 'z4_title_line1',     label: 'Z4 — Title line 1',      type: 'text', default: '30 MILLION' },
      { key: 'z4_title_line2',     label: 'Z4 — Title line 2',      type: 'text', default: 'SMILES' },
      { key: 'z4_title_line3',     label: 'Z4 — Title line 3 (accent)', type: 'text', default: 'DELIVERED.' },
      { key: 'z4_subtitle',        label: 'Z4 — Subtitle',          type: 'text', default: 'Cash-on-delivery, reconciled the second the rider hands the parcel over. Listen for the ping.' },
    ],
  },

  about: {
    label: 'About',
    fields: [
      { key: 'eyebrow',           label: 'Eyebrow',                 type: 'text', default: 'About' },
      { key: 'title',             label: 'Page title',              type: 'text', default: 'Logistics built for Nepal, by Nepal.' },
      { key: 'description',       label: 'Hero description',        type: 'text', default: "Packrs Courier was founded on a simple idea: same-day delivery inside the Kathmandu Valley shouldn't be a luxury. It should be the default." },
      { key: 'body_paragraph_1',  label: 'Body paragraph 1',        type: 'text', default: "We started Packrs because Nepali e-commerce sellers were spending more time worrying about delivery than growing their business. Orders lost in transit. COD amounts delayed for weeks. Customers calling to ask where their parcel was. Riders who couldn't find the right gali." },
      { key: 'body_paragraph_2',  label: 'Body paragraph 2',        type: 'text', default: "So we built a courier service designed around the valley's actual geography, its actual payment habits, and its actual sellers. Same-day as a standard, not a premium. COD remittance on a fixed schedule you can plan around. Riders who know every back road from Kalanki to Suryabinayak." },
      { key: 'body_paragraph_3',  label: 'Body paragraph 3',        type: 'text', default: "Today Packrs Courier delivers across Kathmandu, Lalitpur, Bhaktapur, Kirtipur, and Madhyapur Thimi — and we're expanding. Whether you're a one-person Instagram boutique or a full-scale Daraz reseller, we'll treat every parcel like it matters. Because to your customer, it does." },
      { key: 'pillar_1_title',    label: 'Pillar 1 — Title',        type: 'text', default: 'Valley' },
      { key: 'pillar_1_body',     label: 'Pillar 1 — Body',         type: 'text', default: 'Built exclusively for Kathmandu Valley logistics' },
      { key: 'pillar_2_title',    label: 'Pillar 2 — Title',        type: 'text', default: 'Same-day' },
      { key: 'pillar_2_body',     label: 'Pillar 2 — Body',         type: 'text', default: 'Our default speed, not a premium add-on' },
      { key: 'pillar_3_title',    label: 'Pillar 3 — Title',        type: 'text', default: 'Transparent' },
      { key: 'pillar_3_body',     label: 'Pillar 3 — Body',         type: 'text', default: 'Flat per-parcel pricing, no hidden fees' },
      { key: 'cta_label',         label: 'CTA button label',        type: 'text', default: 'Get in touch' },
    ],
  },

  services: {
    label: 'Services index',
    fields: [
      { key: 'eyebrow',     label: 'Eyebrow',     type: 'text', default: 'Services' },
      { key: 'title',       label: 'Page title',  type: 'text', default: 'Everything we deliver.' },
      { key: 'description', label: 'Description', type: 'text', default: 'Five core services covering every common parcel-logistics need across the Kathmandu Valley.' },
    ],
  },

  coverage: {
    label: 'Coverage',
    fields: [
      { key: 'eyebrow',          label: 'Eyebrow',          type: 'text', default: 'Coverage Area' },
      { key: 'title',            label: 'Page title',       type: 'text', default: 'We deliver across the entire Kathmandu Valley.' },
      { key: 'description',      label: 'Description',      type: 'text', default: "Five municipalities, dozens of neighborhoods, one call. If you're inside the valley, we can almost certainly reach you today." },
      { key: 'no_area_heading',  label: '"Don\'t see your area" heading', type: 'text', default: "Don't see your area?" },
      { key: 'no_area_body',     label: '"Don\'t see your area" body',    type: 'text', default: "Coverage is constantly expanding. Call us and we'll tell you right away whether we can pick up from your address." },
    ],
  },

  rates: {
    label: 'Rates',
    fields: [
      { key: 'eyebrow',         label: 'Eyebrow',                 type: 'text', default: 'Rates' },
      { key: 'title',           label: 'Page title',              type: 'text', default: 'What will it cost?' },
      { key: 'description',     label: 'Description',             type: 'text', default: 'Pick a service type and weight to see your delivery price instantly. The same formula our CRM and riders use — no hidden fees.' },
      { key: 'custom_heading',  label: '"Custom rate?" heading',  type: 'text', default: 'Need a custom rate?' },
      { key: 'custom_body',     label: '"Custom rate?" body',     type: 'text', default: "Bulk volumes, recurring deliveries, or destinations not listed here — call us and we'll quote you a tailored rate within minutes." },
    ],
  },

  book: {
    label: 'Book a Pickup',
    fields: [
      { key: 'eyebrow',     label: 'Eyebrow',     type: 'text', default: 'Book a pickup' },
      { key: 'title',       label: 'Page title',  type: 'text', default: 'Tell us about your business.' },
      { key: 'description', label: 'Description', type: 'text', default: "Set up a Packrs pickup partnership — we'll match you with the right pricing, COD schedule, and rider zone. Need a quick price first? Try the rate calculator." },
    ],
  },

  track: {
    label: 'Track',
    fields: [
      { key: 'eyebrow',     label: 'Eyebrow',     type: 'text', default: 'Track shipment' },
      { key: 'title',       label: 'Page title',  type: 'text', default: "Where's my parcel?" },
      { key: 'description', label: 'Description', type: 'text', default: "Enter your tracking ID to see the latest status. Don't have an ID? Call us and we'll look it up." },
    ],
  },

  contact: {
    label: 'Contact',
    fields: [
      { key: 'eyebrow',           label: 'Eyebrow',           type: 'text', default: 'Contact' },
      { key: 'title',             label: 'Page title',        type: 'text', default: 'Talk to a human.' },
      { key: 'description',       label: 'Description',       type: 'text', default: 'We answer calls and messages seven days a week. For urgent pickups, calling is fastest.' },
      { key: 'business_heading',  label: 'Business CTA heading', type: 'text', default: 'Have a business or bulk enquiry?' },
      { key: 'business_body',     label: 'Business CTA body',    type: 'text', default: 'E-commerce sellers, bulk senders, and recurring-delivery clients — email us for a tailored plan and volume-friendly pricing.' },
    ],
  },
};

export const PAGES = Object.entries(CONTENT_SCHEMA).map(([slug, def]) => ({ slug, label: def.label }));

/** Build a defaults object for a page slug — feed into useSiteContent(slug, defaults). */
export function defaultsFor(slug) {
  const fields = CONTENT_SCHEMA[slug]?.fields ?? [];
  return Object.fromEntries(fields.map((f) => [f.key, f.default]));
}
