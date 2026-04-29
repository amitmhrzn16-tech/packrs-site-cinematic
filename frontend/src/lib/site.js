// Site-wide config — adapted from the reference Next.js project.
export const site = {
  name: 'Packrs Courier',
  legalName: 'Packrs Courier',
  tagline: 'Same-day parcel delivery across the Kathmandu Valley',
  description:
    "Packrs Courier is Nepal's trusted same-day parcel delivery service across Kathmandu, Lalitpur, and Bhaktapur. Cash-on-delivery, e-commerce fulfillment, and door-to-door pickup.",
  url: 'https://packrscourier.com.np',
  phone: '+977-9801367205',
  phoneDisplay: '+977 9801 367 205',
  email: 'packrs24@gmail.com',
  address: {
    street: 'Hadigaun, Kathmandu Valley',
    locality: 'Kathmandu',
    region: 'Bagmati Province',
    country: 'NP',
    postalCode: '44600',
  },
  coords: { lat: 27.7172, lng: 85.324 },
  hours: 'Mo-Su 08:00-20:00',
  coverage: ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kirtipur', 'Madhyapur Thimi'],
  nav: [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/coverage', label: 'Coverage' },
    { href: '/rates', label: 'Rates' },
    { href: '/book', label: 'Book Pickup' },
    { href: '/track', label: 'Track' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ],
  services: [
    {
      slug: 'same-day-delivery',
      name: 'Same-Day Delivery',
      short: 'Pick up and deliver within the Kathmandu Valley the same day.',
      description:
        'Urgent parcels picked up from your door and delivered across Kathmandu, Lalitpur, or Bhaktapur on the same day — most orders placed before 2 PM arrive by evening.',
    },
    {
      slug: 'cash-on-delivery',
      name: 'Cash on Delivery (COD)',
      short: 'Collect cash from your customers at the doorstep.',
      description:
        'We collect payment on your behalf at the point of delivery and remit it to you on a fixed schedule — built for Nepali e-commerce sellers who need cash flow that actually flows.',
    },
    {
      slug: 'ecommerce-fulfillment',
      name: 'E-commerce Fulfillment',
      short: 'Pick, pack, and ship orders from your storefront.',
      description:
        'From Daraz resellers to Instagram boutiques — we handle order pickup, packing, and last-mile delivery so you can focus on sales instead of logistics.',
    },
    {
      slug: 'door-to-door-pickup',
      name: 'Door-to-Door Pickup',
      short: 'Schedule a pickup from any address in the valley.',
      description:
        'Book a pickup online and our rider arrives at your doorstep. No trip to a drop-off center, no waiting in line.',
    },
    {
      slug: 'intra-valley-transport',
      name: 'Intra-Valley Transport',
      short: 'Bulk and fragile parcels moved safely within the valley.',
      description:
        'Larger shipments, documents, and fragile items transported between any two points inside the Kathmandu Valley with careful handling.',
    },
  ],
};
