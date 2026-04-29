import { useEffect, useState } from 'react';
import ZoneOverlay from '../components/ZoneOverlay.jsx';
import ScrollPages from '../components/ScrollPages.jsx';
import ScrollTriggerController from '../components/ScrollTriggerController.jsx';
import BackgroundVideo from '../components/BackgroundVideo.jsx';
import DynamicSeo from '../components/site/DynamicSeo.jsx';
import { api, fallbackStats } from '../lib/api.js';
import { unlockAudio } from '../components/SoundManager.js';

export default function HomePage() {
  const [stats, setStats] = useState(fallbackStats);

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    const unlock = () => { unlockAudio(); window.removeEventListener('pointerdown', unlock); };
    window.addEventListener('pointerdown', unlock);
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  return (
    <>
      <DynamicSeo
        page="home"
        title="Packrs Courier — Same-day delivery across Kathmandu Valley"
        description="AI-empowered same-day parcel delivery from Hadigaun to all 77 districts of Nepal. COD, tracking, and 4–6 hour valley promise."
      />
      <BackgroundVideo />
      <ZoneOverlay stats={stats} />
      <ScrollPages />
      <ScrollTriggerController totalZones={5} />
    </>
  );
}
