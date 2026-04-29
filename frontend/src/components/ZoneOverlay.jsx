import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../lib/store.js';
import StatsCounter from './StatsCounter.jsx';
import TrackingPanel from './TrackingPanel.jsx';
import ContactPanel from './ContactPanel.jsx';

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.5 },
};

export default function ZoneOverlay({ stats }) {
  const zone = useStore((s) => s.zone);
  const scroll = useStore((s) => s.scroll);

  // 6h → 0h clock for zone 2
  const clock = Math.max(0, 6 - Math.min(1, Math.max(0, (scroll - 0.2) / 0.2)) * 6);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 px-5 md:px-12 pt-28 pb-10 flex flex-col">
      <AnimatePresence mode="wait">
        {zone === 0 && (
          <motion.section key="z0" {...fade} className="pointer-events-auto max-w-2xl">
            <p className="text-packrs-orange text-xs uppercase tracking-[0.3em]">Home · The Valley Rush</p>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] mt-3">
              KTM VALLEY.<br/><span className="text-packrs-orange">4–6 HOUR PROMISE.</span>
            </h1>
            <p className="text-white/70 mt-4 text-base md:text-lg max-w-xl">
              From Hadigaun HQ to your customer's doorstep — every parcel carrying happiness.
            </p>
            <div className="mt-8 flex gap-3 items-center">
              <span className="text-xs text-white/50 uppercase tracking-[0.2em]">Scroll ↓</span>
              <div className="w-px h-8 bg-white/20" />
              <span className="text-xs text-white/40">5 zones · live API</span>
            </div>
          </motion.section>
        )}

        {zone === 1 && (
          <motion.section key="z1" {...fade} className="pointer-events-auto max-w-xl">
            <p className="text-packrs-ember text-xs uppercase tracking-[0.3em]">About Us · The Rush</p>
            <h2 className="font-display text-5xl md:text-6xl mt-2 leading-[1.05]">
              AI-EMPOWERED<br/><span className="text-packrs-orange">HAPPINESS.</span>
            </h2>
            <div className="mt-6 flex items-end gap-6">
              <div>
                <div className="font-display text-6xl md:text-7xl text-packrs-orange drop-shadow-[0_0_20px_rgba(244,180,0,0.5)] tabular-nums">
                  30M+
                </div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/60 mt-1">Parcels Delivered</div>
              </div>
              <div className="glass px-5 py-4">
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/50">SLA</div>
                <div className="font-display text-3xl text-white tabular-nums">{clock.toFixed(1)}h</div>
              </div>
            </div>
          </motion.section>
        )}

        {zone === 2 && (
          <motion.section key="z2" {...fade} className="pointer-events-auto max-w-3xl">
            <p className="text-packrs-orange text-xs uppercase tracking-[0.3em]">Services Zone</p>
            <h2 className="font-display text-5xl md:text-6xl mt-2 leading-[1.05]">
              556 LOCATIONS.<br/><span className="text-packrs-orange">NATIONAL COVERAGE.</span>
            </h2>
            <p className="text-white/70 mt-3 max-w-xl">
              From Kathmandu to all 77 districts — every <span className="text-packrs-ember font-semibold">PING!</span> is a parcel landing.
            </p>
            <div className="mt-6">
              <StatsCounter stats={stats} />
            </div>
          </motion.section>
        )}

        {zone === 3 && (
          <motion.section key="z3" {...fade} className="pointer-events-auto max-w-md ml-auto">
            <p className="text-packrs-ember text-xs uppercase tracking-[0.3em]">Tracking · Predictive Ghosting</p>
            <h2 className="font-display text-4xl md:text-5xl mt-2 leading-[1.05]">
              PREDICTING YOUR<br/><span className="text-packrs-orange">PACKAGE…</span>
            </h2>
            <div className="mt-6">
              <TrackingPanel />
            </div>
          </motion.section>
        )}

        {zone === 4 && (
          <motion.section key="z4" {...fade} className="pointer-events-auto max-w-xl">
            <p className="text-packrs-orange text-xs uppercase tracking-[0.3em]">Delivery Zone</p>
            <h2 className="font-display text-5xl md:text-6xl mt-2 leading-[1.05]">
              30 MILLION<br/>SMILES<br/><span className="text-packrs-orange">DELIVERED.</span>
            </h2>
            <p className="text-white/70 mt-3 max-w-md">
              Cash-on-delivery, reconciled the second the rider hands the parcel over. Listen for the ping.
            </p>
            <div className="mt-6">
              <ContactPanel />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* progress rail */}
      <div className="mt-auto self-center pointer-events-none">
        <div className="w-72 h-1 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-packrs-orange"
            animate={{ width: `${(scroll * 100).toFixed(0)}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <div className="flex justify-between text-[10px] uppercase tracking-[0.25em] text-white/40 mt-2 w-72">
          <span>Hadigaun</span>
          <span>Rush</span>
          <span>Map</span>
          <span>Track</span>
          <span>COD</span>
        </div>
      </div>
    </div>
  );
}
