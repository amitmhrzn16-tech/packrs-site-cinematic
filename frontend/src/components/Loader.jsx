import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

export default function Loader() {
  const { progress, active } = useProgress();
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-packrs-ink"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-20 h-20">
              <motion.div
                className="absolute inset-0 rounded-lg bg-packrs-orange/90 shadow-glow"
                animate={{ rotateY: 360, rotateX: 360 }}
                transition={{ repeat: Infinity, duration: 2.4, ease: 'linear' }}
                style={{ transformStyle: 'preserve-3d' }}
              />
              <div className="absolute inset-0 rounded-lg border-2 border-dashed border-white/30" />
            </div>
            <div className="font-display text-xl tracking-widest text-white/90">
              PACKRS — CARRYING HAPPINESS
            </div>
            <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-packrs-orange"
                animate={{ width: `${progress.toFixed(0)}%` }}
                transition={{ ease: 'easeOut', duration: 0.2 }}
              />
            </div>
            <div className="text-xs text-white/60">{progress.toFixed(0)}%</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
