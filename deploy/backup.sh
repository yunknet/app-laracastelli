#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
umask 077
mkdir -p backups
LARA_BACKUP_STAMP=$(date -u +%Y%m%dT%H%M%SZ)
docker compose exec -T app node server/backup.mjs
LARA_CONTAINER=$(docker compose ps -q app)
docker cp "$LARA_CONTAINER:/app/data/backup.sqlite" "backups/lara-$LARA_BACKUP_STAMP.sqlite"
printf 'Banco salvo em backups/lara-%s.sqlite. Copie tambem as midias conforme o README.\n' "$LARA_BACKUP_STAMP"
