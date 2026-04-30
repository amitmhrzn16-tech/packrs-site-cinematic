import { motion } from 'framer-motion';
import { unlockAudio } from './SoundManager.js';

const CLIENT_LOGIN_URL = import.meta.env.VITE_CLIENT_LOGIN_URL || '#client-login';

export default function Header() {
  return (
    <motion.header
      className="fixed top-0 inset-x-0 z-30 px-5 md:px-10 py-4 flex items-center justify-between glass-soft mx-3 mt-3 rounded-2xl"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-packrs-ember shadow-glow flex items-center justify-center font-display text-white">
          P
        </div>
        <div className="leading-tight">
          <div className="font-display text-lg tracking-wide">PACKRS</div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/50">Carrying Happiness</div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-5 text-sm text-white/80">
        <a href="tel:9801367205" className="flex items-center gap-2 hover:text-white">
          <span className="text-packrs-orange">📞</span>9801367205
        </a>
        <a href="mailto:packrs24@gmail.com" className="flex items-center gap-2 hover:text-white">
          <span className="text-packrs-orange">✉</span>packrs24@gmail.com
        </a>
      </div>

      <a
        href={CLIENT_LOGIN_URL}
        onClick={unlockAudio}
        className="btn-glow text-sm"
        target="_blank"
        rel="noreferrer"
      >
        Client Login
      </a>
    </motion.header>
  );
}
