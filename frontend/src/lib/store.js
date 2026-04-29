import { create } from 'zustand';

export const useStore = create((set) => ({
  zone: 0,                 // 0..4 — which scroll zone is dominant
  scroll: 0,               // 0..1 — global scroll progress
  trackingQuery: '',
  ghostDistrict: null,     // {name, lat, lng} highlighted while typing
  cashFlying: false,
  setZone: (z) => set({ zone: z }),
  setScroll: (s) => set({ scroll: s }),
  setTrackingQuery: (q) => set({ trackingQuery: q }),
  setGhost: (d) => set({ ghostDistrict: d }),
  fireCash: () => set({ cashFlying: true }),
  resetCash: () => set({ cashFlying: false }),
}));
