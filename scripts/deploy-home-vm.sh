#!/usr/bin/env bash
# Manual deploy on the home-server Docker stack. No CI/CD - run this by hand
# over SSH on the host itself after a git push:
#   bash scripts/deploy-home-vm.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "-- Pull latest --"
git stash push --include-untracked -m "pre-deploy-$(date +%s)" || true
git fetch origin
git pull --ff-only origin master

echo "-- Build + restart --"
docker compose build
docker compose up -d

echo "-- Prune dangling images --"
docker image prune -f

echo "-- Health check --"
sleep 3
FRONTEND_PORT="3002"
BACKEND_PORT="3003"
if [ -f .env ]; then
  ENV_FRONTEND_PORT="$(grep -E '^FRONTEND_HOST_PORT=' .env | cut -d= -f2)"
  ENV_BACKEND_PORT="$(grep -E '^BACKEND_HOST_PORT=' .env | cut -d= -f2)"
  [ -n "$ENV_FRONTEND_PORT" ] && FRONTEND_PORT="$ENV_FRONTEND_PORT"
  [ -n "$ENV_BACKEND_PORT" ] && BACKEND_PORT="$ENV_BACKEND_PORT"
fi
curl -sf "http://127.0.0.1:${FRONTEND_PORT}/" >/dev/null \
  && echo "OK: frontend responding on :${FRONTEND_PORT}" \
  || echo "WARN: frontend health check failed - check: docker compose logs"
curl -sf "http://127.0.0.1:${BACKEND_PORT}/health" >/dev/null \
  && echo "OK: backend responding on :${BACKEND_PORT}" \
  || echo "WARN: backend health check failed - check: docker compose logs"

echo "Deployed at $(date)"
