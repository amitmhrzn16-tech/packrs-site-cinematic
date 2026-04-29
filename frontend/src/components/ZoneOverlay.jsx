import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../lib/store.js';
import StatsCounter from './StatsCounter.jsx';
import TrackingPanel from './TrackingPanel.jsx';
import ContactPanel from './ContactPanel.jsx';
import { useSiteContent } from '../lib/useSiteContent.js';
import { defaultsFor } from '../lib/contentSchema.js';

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.5 },
};

export default function ZoneOverlay({ stats }) {
  const zone = useStore((s) => s.zone);
  const scroll = useStore((s) => s.scroll);
  const t = useSiteContent('home', defaultsFor('home'));

  // 6h → 0h clock for zone 2
  const clock = Math.max(0, 6 - Math.min(1, Math.max(0, (scroll - 0.2) / 0.2)) * 6);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 px-5 md:px-12 pt-28 pb-10 flex flex-col">
      <AnimatePresence mode="wait">
        {zone === 0 && (
          <motion.section key="z0" {...fade} className="pointer-events-auto max-w-2xl">
            <p className="text-packrs-orange text-xs uppercase tracking-[0.3em]">{t.z0_eyebrow}</p>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] mt-3">
              {t.z0_title_line1}<br/><span className="text-packrs-orange">{t.z0_title_line2}</span>
            </h1>
            <p className="text-white/70 mt-4 text-base md:text-lg max-w-xl">{t.z0_subtitle}</p>
            <div className="mt-8 flex gap-3 items-center">
              <span className="text-xs text-white/50 uppercase tracking-[0.2em]">Scroll ↓</span>
              <div className="w-px h-8 bg-white/20" />
              <span className="text-xs text-white/40">5 zones · live API</span>
            </div>
          </motion.section>
        )}

        {zone === 1 && (
          <motion.section key="z1" {...fade} className="pointer-events-auto max-w-xl">
            <p className="text-packrs-ember text-xs uppercase tracking-[0.3em]">{t.z1_eyebrow}</p>
            <h2 className="font-display text-5xl md:text-6xl mt-2 leading-[1.05]">
              {t.z1_title_line1}<br/><span className="text-packrs-orange">{t.z1_title_line2}</span>
            </h2>
            <div className="mt-6 flex items-end gap-6">
              <div>
                <div className="font-display text-6xl md:text-7xl text-packrs-orange drop-shadow-[0_0_20px_rgba(244,180,0,0.5)] tabular-nums">
                  {t.z1_big_number}
                </div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/60 mt-1">{t.z1_big_number_label}</div>
              </div>
              <div className="glass px-5 py-4">
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/50">{t.z1_sla_label}</div>
                <div className="font-display text-3xl text-white tabular-nums">{clock.toFixed(1)}h</div>
              </div>
            </div>
          </motion.section>
        )}

        {zone === 2 && (
          <motion.section key="z2" {...fade} className="pointer-events-auto max-w-3xl">
            <p className="text-packrs-orange text-xs uppercase tracking-[0.3em]">{t.z2_eyebrow}</p>
            <h2 className="font-display text-5xl md:text-6xl mt-2 leading-[1.05]">
              {t.z2_title_line1}<br/><span className="text-packrs-orange">{t.z2_title_line2}</span>
            </h2>
            <p className="text-white/70 mt-3 max-w-xl">{t.z2_subtitle}</p>
            <div className="mt-6">
              <StatsCounter stats={stats} />
            </div>
          </motion.section>
        )}

        {zone === 3 && (
          <motion.section key="z3" {...fade} className="pointer-events-auto max-w-md ml-auto">
            <p className="text-packrs-ember text-xs uppercase tracking-[0.3em]">{t.z3_eyebrow}</p>
            <h2 className="font-display text-4xl md:text-5xl mt-2 leading-[1.05]">
              {t.z3_title_line1}<br/><span className="text-packrs-orange">{t.z3_title_line2}</span>
            </h2>
            <div className="mt-6">
              <TrackingPanel />
            </div>
          </motion.section>
        )}

        {zone === 4 && (
          <motion.section key="z4" {...fade} className="pointer-events-auto max-w-xl">
            <p className="text-packrs-orange text-xs uppercase tracking-[0.3em]">{t.z4_eyebrow}</p>
            <h2 className="font-display text-5xl md:text-6xl mt-2 leading-[1.05]">
              {t.z4_title_line1}<br/>{t.z4_title_line2}<br/><span className="text-packrs-orange">{t.z4_title_line3}</span>
            </h2>
            <p className="text-white/70 mt-3 max-w-md">{t.z4_subtitle}</p>
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
