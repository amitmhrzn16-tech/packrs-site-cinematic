// Tall wrapper of empty 100vh sections so the document gets scroll height for
// GSAP ScrollTrigger. The actual scene + overlay UI is fixed behind/in front.
const ZONES = [
  { id: 'home',     label: 'Home — Valley Rush' },
  { id: 'about',    label: 'About — Speed Hero' },
  { id: 'services', label: 'Services — National Coverage' },
  { id: 'tracking', label: 'Tracking — Predictive Ghosting' },
  { id: 'success',  label: 'Success — Happiness Handover' },
];

export default function ScrollPages() {
  return (
    <div id="scroll-pages" className="relative pointer-events-none">
      {ZONES.map((z, i) => (
        <section
          key={z.id}
          id={z.id}
          data-zone={i}
          className="h-screen w-full"
          aria-label={z.label}
        />
      ))}
    </div>
  );
}
