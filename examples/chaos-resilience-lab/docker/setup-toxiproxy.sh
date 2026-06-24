#!/usr/bin/env sh
set -eu

# Register payment-api behind Toxiproxy (run after docker compose up).
curl -sf -X POST http://localhost:8474/proxies \
  -H 'Content-Type: application/json' \
  -d '{"name":"payment","listen":"0.0.0.0:20001","upstream":"payment-api:3001","enabled":true}'

echo "Toxiproxy route payment (localhost:20001) → payment-api:3001"
