// Cinematic backplate driven by Higgsfield-generated clips.
// Place files in /public/video/ — the player auto-picks .webm if present, otherwise .mp4.
// Auto-skipped on data-saver / 2G / sub-480px screens to protect Lighthouse.
import { useEffect, useRef, useState } from 'react';
import { useStore } from '../lib/store.js';

// Three slots — one per narrative beat. Drop files matching these basenames.
// (e.g. /public/video/ktm-day.webm OR /public/video/ktm-day.mp4)
const SLOTS = {
  day:   '/video/ktm-day',     // zones 0–1 (Home + Rush)
  city:  '/video/ktm-city',    // zone 2  (Services)
  night: '/video/ktm-night',   // zones 3–4 (Tracking + Success)
};

function shouldSkipVideo() {
  if (typeof navigator === 'undefined') return false;
  const conn = navigator.connection;
  const saveData = conn?.saveData;
  const slow = conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType);
  // Small screens used to be skipped — but the video is the entire visual now,
  // so we serve it everywhere except actual data-saver / 2G.
  return Boolean(saveData || slow);
}

export default function BackgroundVideo() {
  const zone = useStore((s) => s.zone);
  const [skip, setSkip] = useState(true);
  const [errored, setErrored] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setSkip(shouldSkipVideo());
  }, []);

  // Reset error state when the source slot changes.
  useEffect(() => { setErrored(false); }, [zone]);

  if (skip || errored) return null;

  const base = zone <= 1 ? SLOTS.day : zone === 2 ? SLOTS.city : SLOTS.night;

  return (
    <video
      ref={ref}
      key={base}
      className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      onError={() => setErrored(true)}
    >
      {/* .mp4 first — universal support, and avoids Vite's SPA fallback handing
          us index.html for a non-existent .webm. Add a .webm in /public/video
          and swap the order if you want WebM-first delivery. */}
      <source src={`${base}.mp4`} type="video/mp4" />
    </video>
  );
}
