#!/usr/bin/env bash
set -euo pipefail

if [ ! -f .env ]; then
  echo "ERROR: .env is missing at $(pwd). Create it on the server before deploying."
  exit 1
fi

echo "==> Ensure Laravel writable directories"
mkdir -p storage/framework/{cache/data,sessions,views,testing} storage/logs bootstrap/cache

echo "==> Composer install"
composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader

echo "==> Node install/build"
npm ci
npm run build

echo "==> Laravel optimize clear"
php artisan optimize:clear

echo "==> Laravel storage link"
php artisan storage:link || true

echo "==> Database migrate + seed"
php artisan migrate --force
php artisan db:seed --force

echo "==> Deployment complete"
