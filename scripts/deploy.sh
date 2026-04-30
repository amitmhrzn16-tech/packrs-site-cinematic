#!/usr/bin/env bash
set -euo pipefail

echo "==> Composer install"
composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader

echo "==> Node install/build"
npm ci
npm run build

echo "==> Laravel optimize clear"
php artisan optimize:clear

echo "==> Database migrate + seed"
php artisan migrate --force
php artisan db:seed --force

echo "==> Deployment complete"
