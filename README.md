# Packrs Courier 3.0 — Interactive 3D Ecosystem

Cinematic logistics landing page for **Packrs Courier** (Hadigaun, KTM). **Laravel 13** serves the **React + React Three Fiber** app and the JSON API from a single project root.

## Quick start

### 1) Dependencies

```bash
composer install
npm install
```

### 2) Environment

```bash
cp .env.example .env
php artisan key:generate
```

Create a MySQL database named **`packrs_site`** (e.g. in phpMyAdmin). In `.env`, set `DB_*` to match MAMP (port is often `3306` or `8889`). Defaults in `.env.example` use `root` / `root`.

`VITE_API_URL=/api/v1` keeps the browser on the same origin as `php artisan serve`.

### 3) Database

```bash
php artisan migrate
```

### 4) Run (development)

Terminal 1 — PHP + queue + logs (from [composer.json](composer.json) `dev` script):

```bash
composer run dev
```

This starts `php artisan serve`, the queue worker, Pail, and the Vite dev server together. Open **http://127.0.0.1:8000** (or the host shown in the terminal).

Alternatively, run Vite and Artisan yourself:

```bash
php artisan serve
npm run dev
```

### Production assets

```bash
npm run build
```

## Layout

- `app/`, `routes/`, `config/`, `database/` — Laravel API (e.g. `/api/v1/...`).
- `resources/js/` — React app (Vite entry `main.jsx`).
- `public/` — web root (merged static assets for the 3D site).

## API overview

Public JSON routes live under `/api/v1` (see `routes/api.php`). CORS uses `APP_URL` / `FRONTEND_URL` in `config/cors.php`.

## The Happiness Journey — 5 scroll zones

`resources/js/scene/Scene.jsx` drives a single `ScrollControls` canvas. See the original product notes in `ARCHITECTURE.md` for zone breakdowns and performance notes.

## Client login

Set `VITE_CLIENT_LOGIN_URL` in `.env` for the header CTA to your client portal.

## Auto deploy on push

This repo includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.
On every push to `main`, it:

- builds assets (`npm run build`),
- deploys files via rsync over SSH,
- runs `php artisan migrate --force`,
- runs `php artisan db:seed --force`.

Set these repository secrets in GitHub before using it:

- `DEPLOY_HOST` - server hostname/IP
- `DEPLOY_PORT` - SSH port (for example `22`)
- `DEPLOY_USER` - SSH username
- `DEPLOY_SSH_KEY` - private SSH key (PEM/OpenSSH)
- `DEPLOY_PATH` - absolute project path on server
