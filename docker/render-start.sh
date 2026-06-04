#!/bin/bash
set -e

cd /var/www/html

if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:" ]; then
    php artisan key:generate --force
fi

php artisan config:clear
php artisan migrate --force

if [ "${RUN_SEED:-false}" = "true" ]; then
    php artisan db:seed --force || true
fi

exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
