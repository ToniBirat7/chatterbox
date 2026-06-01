#!/bin/sh
set -e
npx prisma migrate deploy
exec node --max-old-space-size=150 dist/server.js
