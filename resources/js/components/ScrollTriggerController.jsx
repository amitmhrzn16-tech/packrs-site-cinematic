import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStore } from '../lib/store.js';

gsap.registerPlugin(ScrollTrigger);

// Mount-once. Wires document scroll progress (0..1) into the zustand store.
// The Director inside the R3F scene reads `scroll` and drives every zone.
export default function ScrollTriggerController({ totalZones = 5 }) {
  useLayoutEffect(() => {
    document.body.classList.add('scroll-page');

    const setScroll = useStore.getState().setScroll;
    const setZone = useStore.getState().setZone;

    const trigger = ScrollTrigger.create({
      trigger: '#scroll-pages',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,                 // light easing — feels like a tape head, not jumpy
      onUpdate: (self) => {
        const p = self.progress;
        setScroll(p);
        const z = Math.min(totalZones - 1, Math.floor(p * totalZones));
        setZone(z);
      },
    });

    // Per-section pin highlights (optional — drives :data-active for a11y)
    const sections = gsap.utils.toArray('[data-zone]');
    const sectionTriggers = sections.map((el, i) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => el.setAttribute('data-active', 'true'),
        onLeave: () => el.removeAttribute('data-active'),
        onEnterBack: () => el.setAttribute('data-active', 'true'),
        onLeaveBack: () => el.removeAttribute('data-active'),
      })
    );

    return () => {
      trigger.kill();
      sectionTriggers.forEach((t) => t.kill());
      document.body.classList.remove('scroll-page');
    };
  }, [totalZones]);

  return null;
}
