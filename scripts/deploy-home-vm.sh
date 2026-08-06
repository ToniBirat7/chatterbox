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
curl -sf "http://127.0.0.1:3002/" >/dev/null \
  && echo "OK: frontend responding on :3002" \
  || echo "WARN: frontend health check failed - check: docker compose logs"
curl -sf "http://127.0.0.1:3003/health" >/dev/null \
  && echo "OK: backend responding on :3003" \
  || echo "WARN: backend health check failed - check: docker compose logs"

echo "Deployed at $(date)"
