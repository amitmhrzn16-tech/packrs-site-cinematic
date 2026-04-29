import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';

function useCountUp(target, inView) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration: 2.4,
      ease: 'easeOut',
      onUpdate: (v) => setVal(Math.floor(v)),
    });
    return () => controls.stop();
  }, [target, inView]);
  return val;
}

// Compact numerals so 30,000,000 fits as "30M" inside the card.
const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
function fmt(n, useCompact) {
  if (!useCompact) return n.toLocaleString();
  // Below 1,000 the compact form is identical to the plain form.
  return compact.format(n);
}

export default function StatsCounter({ stats }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.4, once: true });
  const parcels = useCountUp(stats.parcels_delivered, inView);
  const locations = useCountUp(stats.locations, inView);
  const districts = useCountUp(stats.districts, inView);
  const staff = useCountUp(stats.staff_current, inView);

  const Item = ({ value, label, suffix = '', useCompact = false }) => (
    <motion.div
      className="glass px-5 py-5 text-center overflow-hidden"
      whileHover={{ y: -3, boxShadow: '0 0 60px rgba(41,255,202,0.25)' }}
    >
      <div className="font-display text-2xl sm:text-3xl md:text-4xl text-packrs-teal tabular-nums leading-none truncate drop-shadow-[0_0_18px_rgba(41,255,202,0.45)]">
        {fmt(value, useCompact)}{suffix}
      </div>
      <div className="mt-2 text-[10px] sm:text-xs uppercase tracking-[0.18em] text-white/60 truncate">
        {label}
      </div>
    </motion.div>
  );

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Item value={parcels} label="Parcels Delivered" suffix="+" useCompact />
      <Item value={locations} label="Locations" />
      <Item value={districts} label="Districts" />
      <Item value={staff} label="Crew on road" />
    </div>
  );
}
