#!/usr/bin/env bash
set -euo pipefail

if [ ! -f .env ]; then
  echo "ERROR: .env is missing at $(pwd). Create it on the server before deploying."
  exit 1
fi

echo "==> Select PHP (>= 8.3)"
# The plain `php` on the server can stay on an older version after 8.3 is
# installed alongside it, and a non-interactive SSH session does not load the
# shell profile that might fix that. Pick the first binary that is new enough
# (PHP_BIN in the environment wins) and put it first on PATH, so composer's
# `#!/usr/bin/env php` and `php artisan` both run on it.
php_ok() { [ -x "$1" ] && "$1" -r 'exit(PHP_VERSION_ID >= 80300 ? 0 : 1);' >/dev/null 2>&1; }
PHP_SELECTED=""
for cand in "${PHP_BIN:-}" \
    "$(command -v php8.4 || true)" "$(command -v php8.3 || true)" "$(command -v php || true)" \
    /usr/bin/php8.4 /usr/bin/php8.3 /usr/local/bin/php \
    /opt/cpanel/ea-php84/root/usr/bin/php /opt/cpanel/ea-php83/root/usr/bin/php \
    /opt/alt/php84/usr/bin/php /opt/alt/php83/usr/bin/php \
    /opt/plesk/php/8.4/bin/php /opt/plesk/php/8.3/bin/php; do
  if [ -n "$cand" ] && php_ok "$cand"; then PHP_SELECTED="$cand"; break; fi
done
if [ -z "$PHP_SELECTED" ]; then
  echo "ERROR: no PHP >= 8.3 found. Default php is: $(php -r 'echo PHP_VERSION;' 2>/dev/null || echo 'missing')"
  echo "Install PHP 8.3, or set PHP_BIN to its full path."
  exit 1
fi
PHP_SHIM_DIR="$(mktemp -d)"
trap 'rm -rf "$PHP_SHIM_DIR"' EXIT
ln -s "$PHP_SELECTED" "$PHP_SHIM_DIR/php"
export PATH="$PHP_SHIM_DIR:$PATH"
hash -r
echo "Using $PHP_SELECTED ($(php -r 'echo PHP_VERSION;'))"

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
