# Packrs Courier 3.0 — Interactive 3D Ecosystem

Cinematic logistics landing page for **Packrs Courier** (Hadigaun, KTM).
Headless **Laravel** API ⇆ **React + React Three Fiber** scroll narrative.

```
.
├── backend/    Laravel 13 (headless API) — stats, tracking, district pings
└── frontend/   Vite + React 19 + R3F + drei + framer-motion + Tailwind
```

## Quick start

### 1) Backend (Laravel)
```bash
cd backend
cp .env.example .env
php artisan key:generate
php artisan serve            # http://localhost:8000
```
Endpoints (under `/api/v1`):
- `GET  /stats`               — 30M+ parcels, locations, district count, SLA
- `GET  /districts`           — district list with lat/lng
- `GET  /track/{trackingId}`  — deterministic mock tracking + ETA
- `POST /ping`                — rider GPS ping (wire to Reverb when ready)

CORS is configured at `backend/config/cors.php` — set `FRONTEND_URL` in `.env`
to your frontend origin (default `http://localhost:5173`).

### 2) Frontend (Vite + R3F)
```bash
cd frontend
cp .env.example .env         # set VITE_API_URL + VITE_CLIENT_LOGIN_URL
npm run dev                  # http://localhost:5173
```

Frontend gracefully falls back to baked-in stats if the Laravel server is
offline, so the demo still runs standalone.

## The Happiness Journey — 5 scroll zones

`frontend/src/scene/Scene.jsx` drives a single `ScrollControls` canvas (5 pages):

| Zone | Range          | What happens |
|------|----------------|--------------|
| 1 — Hadigaun start  | 0.00–0.20 | Bike rolls in, parcel lifts onto seat |
| 2 — Valley rush     | 0.20–0.40 | 120 motion-blur streaks, 6h→0h clock HUD |
| 3 — Coverage swarm  | 0.40–0.62 | 40 parcels fly to district pins on a 3D Nepal map |
| 4 — Predictive track | 0.62–0.78 | Camera dives to the district your tracking ID hashes to |
| 5 — Happy handover  | 0.78–1.00 | Smily appears, COD cash flies into a phone |

Geometry is **fully procedural** — no `.glb` files required. Drop GLBs into
`frontend/public/` and swap the primitives in `scene/objects.jsx` if you want
custom assets.

## Key components

- `scene/Scene.jsx` — `Canvas`, `ScrollControls`, `Director` orchestrating zones via `useFrame`.
- `scene/objects.jsx` — `CourierBike`, `Parcel`, `NepalMap`, `Smily`, `Phone`, `CashSwarm`, `ValleyStreaks`.
- `components/Loader.jsx` — drei `useProgress` overlay with rotating parcel.
- `components/SoundManager.js` — WebAudio synth: `ping()` + `cashRustle()`. No audio assets.
- `components/StatsCounter.jsx` — Framer Motion holographic count-up.
- `components/TrackingPanel.jsx` — predictive ghost-highlight while typing (matches backend hash).
- `components/ZoneOverlay.jsx` — DOM overlay that reacts to zone via Zustand store.
- `lib/store.js` — Zustand state (zone, scroll, ghostDistrict, cashFlying).

## Performance

- `AdaptiveDpr` + `AdaptiveEvents` + `PerformanceMonitor` from drei.
- Bloom postprocessing disables itself if the device starts dropping frames.
- Star count scales down on weak devices.

## Realtime ridepings (optional)

`POST /api/v1/ping` is the hook. Add `laravel/reverb` and replace the commented
`broadcast(new RiderPing($data))` line in `ShipmentController@ping` to push
live GPS updates to the React map. The frontend can subscribe with
`@laravel/echo` + Pusher protocol.

## Client Login integration

Set `VITE_CLIENT_LOGIN_URL` in `frontend/.env` to your existing management
system URL — the glow button in `components/Header.jsx` opens it in a new tab.

## Contact (baked into the page)

- 9801367205 · packrs24@gmail.com
- HQ: Hadigaun · Kathmandu · Nepal
