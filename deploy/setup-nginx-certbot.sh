#!/usr/bin/env bash
set -Eeuo pipefail

readonly APP_DIR="/opt/apps/rcopt-next"
readonly DOMAIN="rcopt.rattanan.dev"
readonly SOURCE_CONFIG="$APP_DIR/deploy/nginx/$DOMAIN.conf"
readonly AVAILABLE_CONFIG="/etc/nginx/sites-available/$DOMAIN"
readonly ENABLED_CONFIG="/etc/nginx/sites-enabled/$DOMAIN"

if [[ $EUID -ne 0 ]]; then
  echo "Run this script with sudo." >&2
  exit 1
fi

curl --fail --silent --show-error --max-time 10 \
  http://127.0.0.1:3005/api/health >/dev/null

install -o root -g root -m 0644 "$SOURCE_CONFIG" "$AVAILABLE_CONFIG"
ln -sfn "$AVAILABLE_CONFIG" "$ENABLED_CONFIG"

nginx -t
systemctl reload nginx

certbot --nginx \
  --domain "$DOMAIN" \
  --non-interactive \
  --agree-tos \
  --redirect \
  --register-unsafely-without-email

nginx -t
systemctl reload nginx

echo "Nginx and HTTPS are ready for $DOMAIN."
