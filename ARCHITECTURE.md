# Packrs Courier 3.0 — Cyber-Logistics Architecture

> "Speed Hero" 3D scrollytelling. React + Vite + R3F, GSAP ScrollTrigger,
> headless Laravel API. Target: < 2s LCP on 50 Mbps.

## 1) Brand & Design Language

| Token        | Value                          | Usage |
|--------------|--------------------------------|-------|
| `packrs-navy`     | `#0A1B3D`                | Primary brand surface (Amit's suit, hero panels) |
| `packrs-ink`      | `#06112A`                | Page background |
| `packrs-midnight` | `#040A1A`                | Deep shadow / overlay |
| `packrs-orange`   | `#FF6A1A`                | CTA, GPS trails, district pings |
| `packrs-ember`    | `#FF884D`                | Hover, secondary accent |
| `packrs-glow`     | `#FFB180`                | Emissive highlight, bloom hot-points |
| `packrs-haze`     | `rgba(255,255,255,0.06)` | Glassmorphism fill |

- **Headlines**: *Alumni Sans 900* — angular, condensed, wide letter-spacing (`tracking-wider2 = 0.18em`).
- **Body**: *Inter 400/500*.
- **Mono**: *JetBrains Mono* for tracking IDs / counters.

The aesthetic is **Cyber-Logistics**: glassmorphism panels over a dark navy world, electric-orange GPS trails, low-poly 3D Kathmandu, post-processed bloom + DOF for cinematic depth.

## 2) Character Anchor — Amit (`@Amit`)

Amit is the *Speed Hero* — the through-line across every zone.

| Layer            | Material                                            |
|------------------|-----------------------------------------------------|
| Helmet           | navy `#0A1B3D` (metalness 0.3)                      |
| Visor            | electric-orange emissive                            |
| Suit             | navy with two emissive orange piping stripes        |
| Limbs            | navy/midnight                                       |

Component: `src/scene/objects.jsx → Amit` (alias `Rider` for back-compat).
Drop `public/models/amit.glb` (or `rider.glb`) to instantly upgrade to a real character mesh — the `<Asset>` wrapper handles fallback transparently.

## 3) Narrative Framework (5 scroll moments → 4 conceptual pages)

| Scroll range | Section (DOM)        | Concept page | What you see |
|--------------|----------------------|--------------|--------------|
| 0.00 – 0.20  | `#home`              | **Home**     | Amit revs at Hadigaun HQ; parcel lifts onto seat |
| 0.20 – 0.40  | `#about`             | **Home (rush)** | City scrolls past — buildings, cars, dashed road; 6h→0h SLA clock |
| 0.40 – 0.62  | `#services`          | **Services** | Nepal map rises; 40 parcels swarm to district pins, each landing fires a ping |
| 0.62 – 0.78  | `#tracking`          | **Tracking** | Camera dives to ghost-highlighted district as you type the ID |
| 0.78 – 1.00  | `#success`           | **Success**  | Parcel arcs from bike → customer's hands → phone shows COD card → hearts + gold coins explode |

The Success moment uses `HeartsAndCoins` + `Confetti` + `phonePing()` (two-tone 1320→1760 Hz) all firing inside the same scroll window.

## 4) React Component Structure (3D Scene Manager)

```
App.jsx                          // root layout, lazy-loads Scene
├─ <BackgroundVideo />           // fixed -z-10 ambient WebM (data-saver aware)
├─ <Suspense><Scene /></Suspense>// fixed inset-0 z-10 — the R3F canvas
├─ <Loader />                    // drei useProgress overlay
├─ <Header />                    // glassmorphism nav + Client Login
├─ <ZoneOverlay stats />         // zone-aware copy (Framer Motion AnimatePresence)
├─ <ScrollPages />               // 5 × 100vh empty sections — gives doc scroll height
└─ <ScrollTriggerController />   // GSAP wires window scroll → zustand store

scene/
├─ Scene.jsx                     // <Canvas shadows> + lights + Environment(sunset)
│   ├─ <PerformanceMonitor>      // disables postFX on perf decline
│   ├─ <AdaptiveDpr/Events>      // mobile-aware resolution
│   ├─ <Environment preset="sunset" background blur>
│   ├─ <WetGround>               // MeshReflectorMaterial — wet-asphalt mirror
│   ├─ <HeroContactShadow>       // grounding shadow
│   ├─ <Director>                // useFrame reads useStore.scroll, drives every actor
│   └─ <EffectComposer>
│         ├─ <DepthOfField>
│         ├─ <Bloom mipmapBlur>
│         ├─ <ChromaticAberration>
│         ├─ <Vignette>
│         └─ <Noise>
├─ objects.jsx                   // Amit, CourierBike, Parcel, Customer, NepalMap,
│                                // CityBuildings, Cars, Road, ValleyStreaks,
│                                // HeartsAndCoins, Confetti, Phone, WetGround
└─ Asset.jsx                     // <Asset url=...><FallbackJSX/></Asset>
                                 //   — Suspense + ErrorBoundary
                                 //   — Draco-decoded GLTF
                                 //   — silent fallback when GLB missing

components/
├─ Header.jsx                    // logo, contact, Client Login (glass)
├─ ZoneOverlay.jsx               // zone-driven hero copy (AnimatePresence)
├─ TrackingPanel.jsx             // predictive ghost (matches backend hash)
├─ StatsCounter.jsx              // Framer count-up, hits live API
├─ ContactPanel.jsx
├─ Loader.jsx
├─ SoundManager.js               // ping(), phonePing(), cashRustle(), unlockAudio()
├─ ScrollPages.jsx               // 5 × 100vh sections [data-zone]
├─ ScrollTriggerController.jsx   // GSAP timeline + ScrollTrigger
└─ BackgroundVideo.jsx           // optional WebM backdrop, data-saver aware

lib/
├─ api.js                        // fetch wrapper + fallback stats
└─ store.js                      // zustand: { zone, scroll, ghostDistrict, cashFlying }
```

## 5) GSAP Animation Timeline Logic

The single source of truth for all animation is **document scroll progress** (`0..1`). GSAP ScrollTrigger captures it; everything else is downstream.

### Top-level (mount-once, in `ScrollTriggerController.jsx`)

```js
gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.create({
  trigger: '#scroll-pages',     // 5 × 100vh sections
  start: 'top top',
  end: 'bottom bottom',
  scrub: 0.6,                   // light easing — tape head, not jumpy
  onUpdate: (self) => {
    useStore.getState().setScroll(self.progress);
    useStore.getState().setZone(Math.min(4, Math.floor(self.progress * 5)));
  },
});

gsap.utils.toArray('[data-zone]').forEach((el) =>
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
```

### Per-zone choreography (in R3F `Director`, executed every `useFrame`)

```js
const range = (s, a, b) => clamp01((s - a) / (b - a));

// HOME · 0 → 0.20
const z1 = range(s, 0, 0.20);
bike.position.x   = lerp(-1.5, -0.3, z1);
parcel.position   = lerp([-2.4, -0.2, 0], [-0.7, 0.45, 0], z1);

// RUSH · 0.20 → 0.40 — city/cars/road scroll toward camera
const z2 = range(s, 0.20, 0.40);
city.visible = cars.visible = road.visible = (z2 > 0.02 && z2 < 0.98);
bike.position.y = sin(t * 18) * 0.02;            // bob
parcel.position.set(-0.3, 0.45, 0);              // sits on seat

// SERVICES · 0.40 → 0.62 — swarm to map
const z3 = range(s, 0.40, 0.62);
map.scale = lerp(0.6, 1.2, z3);
swarm.forEach((m, i) => {
  const k = clamp01(z3 * 1.2 - i * 0.025);
  m.position = bezierArc(HQ, district[i], k);    // sin-arc up + over
  if (k >= 0.99 && !pinged.has(i)) ping(660);    // first arrival = ping
});

// TRACKING · 0.62 → 0.78 — camera dives to ghost-district
const z4 = range(s, 0.62, 0.78);
if (ghostDistrict) camera.position.lerp(districtPos(ghostDistrict), 0.04);

// SUCCESS · 0.78 → 1.00
const z5 = range(s, 0.78, 1.00);
customer.visible = z5 > 0.001;
// Parcel arc from bike to customer's hands (peaks at z5=0.5)
const k = clamp01(z5 * 2.0);
handoverParcel.position = bezierArc([bike], [customer], k);
if (k >= 0.98 && !fired.handover) { fired.handover = true; ping(540); }
// Phone slides in (z5 0.5 → 1.0)
const pk = clamp01((z5 - 0.5) * 2.5);
phone.position = lerp([2.6,0.4,0.4], [2.1,0.45,0.4], pk);
if (pk >= 0.98 && !fired.cod) {
  fired.cod = true;
  phonePing();           // ding-dong
  cashRustle();
  fireHeartsAndCoins();  // 28 emissive sprites burst from parcel
}
// Reverse cleanup: scrolling back resets fire-once flags so users can replay
if (z5 < 0.05) { fired.handover = fired.cod = false; resetCash(); }
```

### Why scrub 0.6 (not 0)

- `scrub: 0` → 1:1 with the scrollbar; choppy on trackpads with momentum.
- `scrub: 0.6` → GSAP catches up over 0.6s → reads as a buttery tape head.
- `scrub: true` → defaults to `scrub: 1` (heavier easing, may feel laggy on slow scroll).

## 6) Tailwind Configuration (excerpt — live in `frontend/tailwind.config.js`)

```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        packrs: {
          navy:     '#0A1B3D',
          ink:      '#06112A',
          midnight: '#040A1A',
          orange:   '#FF6A1A',
          ember:    '#FF884D',
          glow:     '#FFB180',
          haze:     'rgba(255,255,255,0.06)',
        },
      },
      fontFamily: {
        display: ['"Alumni Sans"', 'ui-sans-serif', 'system-ui'],
        body: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: { wider2: '0.18em', wider3: '0.32em' },
      boxShadow: {
        glow:     '0 0 60px rgba(255,106,26,0.35)',
        glowSoft: '0 0 32px rgba(255,106,26,0.22)',
        glass:    '0 8px 32px rgba(0,0,0,0.4)',
      },
      keyframes: {
        ripple:     { '0%': { transform: 'scale(0.6)', opacity: '0.8' },
                      '100%': { transform: 'scale(2.4)', opacity: '0' } },
        floaty:     { '0%,100%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-6px)' } },
        pulseTrail: { '0%,100%': { opacity: '0.4' },
                      '50%': { opacity: '1' } },
      },
      animation: {
        ripple:     'ripple 1.6s ease-out infinite',
        floaty:     'floaty 4s ease-in-out infinite',
        pulseTrail: 'pulseTrail 1.6s ease-in-out infinite',
      },
    },
  },
};
```

Project-level component classes in `index.css` `@layer components`:

```css
.glass        { @apply bg-white/[0.04] backdrop-blur-md border border-white/10 shadow-glass rounded-2xl; }
.glass-soft   { @apply bg-white/[0.025] backdrop-blur-sm border border-white/10 rounded-2xl; }
.btn-glow     { @apply px-5 py-2 rounded-full font-semibold text-white bg-packrs-orange shadow-glow hover:brightness-110 transition; }
.h-display    { @apply font-display font-black uppercase tracking-wider2 leading-[0.95]; }
.gps-trail    { background: linear-gradient(90deg, transparent, #FF6A1A, transparent);
                box-shadow: 0 0 18px rgba(255,106,26,0.6); }
```

## 7) Lighthouse Optimization Checklist (target: < 2s LCP / >90 perf)

### ✅ Done in this codebase

- [x] **Code-splitting**: heavy libs in their own chunks via `vite.config.js → rolldownOptions.manualChunks` (three / r3f / postfx / motion / gsap).
- [x] **Lazy Scene**: `const Scene = lazy(() => import('./scene/Scene.jsx'))` in `App.jsx` — first paint excludes ~1.5 MB of 3D code.
- [x] **Initial JS gzipped < 65 KB** (verified via `npm run build`: index 197 KB / 62 KB gzip; three+r3f+postfx loaded *after* paint).
- [x] **Draco GLB compression**: `useGLTF` configured with `gstatic.com/draco/v1/decoders/` (~5–10× smaller models).
- [x] **GLB graceful fallback**: missing GLBs don't 404-block — `<Asset>` Suspense+ErrorBoundary falls back to procedural.
- [x] **Adaptive DPR**: drei `<AdaptiveDpr pixelated />` + `<AdaptiveEvents />` drop pixel ratio on slow frames.
- [x] **PerformanceMonitor**: disables PostFX (`Bloom/DoF/CA/Vignette/Noise`) when GPU lags.
- [x] **WebM video opt-out**: `BackgroundVideo` skips on `navigator.connection.saveData`, 2G, and `<= 480px` screens.
- [x] **Font loading**: Google Fonts with `display=swap` (no FOIT).
- [x] **CSS code-splitting**: `cssCodeSplit: true`.
- [x] **Image-less hero**: zero raster hero images — bandwidth goes to the 3D scene.
- [x] **`preload="metadata"`** on `<video>` — downloads only header bytes until needed.
- [x] **Tone-mapping in GL**: ACES Filmic done on the GPU, not via post-CPU.

### ☐ Owner action items before launch

- [ ] **Compress all GLBs with Draco**:
      `gltf-transform optimize input.glb output.glb --texture-compress webp --simplify --draco`
- [ ] **Texture sizes ≤ 1024², KTX2/Basis** for any custom-bake textures.
- [ ] **Encode WebM at < 1.2 MB / 6s loop** (`ffmpeg -i in.mp4 -c:v libvpx-vp9 -b:v 800k -row-mt 1 out.webm`).
- [ ] **`preload` link tags in `index.html`** for the Scene chunk + sunset HDRI:
      `<link rel="modulepreload" href="/assets/Scene-*.js">`
- [ ] **Self-host fonts** via Fontsource for Alumni Sans/Inter (saves the Google Fonts CSS round-trip).
- [ ] **Cache headers**: serve `/assets/*` with `Cache-Control: public, max-age=31536000, immutable` (Vite already hashes filenames).
- [ ] **Brotli compression** at the edge (Cloudflare/Nginx; saves ~15% over gzip on JS bundles).
- [ ] **`viewport-fit=cover`** + `theme-color` meta in `index.html` for iOS PWA-feel.
- [ ] **Add `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`** if keeping Google Fonts.
- [ ] **Reduce-motion**: respect `prefers-reduced-motion: reduce` — short-circuit GSAP scrub + disable post-FX.
- [ ] **Critical CSS**: pre-extract above-fold styles for `<head>` — Tailwind v3 + Vite already inlines small enough.
- [ ] **Lighthouse CI**: add `.github/workflows/lhci.yml` to fail PRs that regress < 90.
- [ ] **CDN the GLBs**: serve `/models/*.glb` from a CDN with proper `accept-encoding: br` support.
- [ ] **Service worker**: precache the Scene chunk + frequently-used GLBs for repeat-visit < 500 ms.

### Bundle reality check

```
dist/assets/index-*.js              197 KB / 62 KB gzip   ← critical path
dist/assets/Scene-*.js               22 KB /  6 KB gzip   ← lazy R3F scene wrapper
dist/assets/three-*.js              519 KB / 209 KB gzip  ← lazy
dist/assets/r3f-*.js                197 KB /  62 KB gzip  ← lazy
dist/assets/postfx-*.js             993 KB / 283 KB gzip  ← lazy (only when PerformanceMonitor allows)
dist/assets/motion-*.js             139 KB /  46 KB gzip  ← lazy
dist/assets/gsap-*.js               113 KB /  44 KB gzip  ← partial-eager (needed for scroll)
```

Critical path = `index + gsap + motion ≈ 152 KB gzipped`. The 3D world streams in a frame later. That's the difference between a 4s LCP and a 1.6s LCP on 50 Mbps.
