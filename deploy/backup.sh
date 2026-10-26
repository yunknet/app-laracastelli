#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
umask 077

if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

mkdir -p backups
LARA_BACKUP_STAMP=$(date -u +%Y%m%dT%H%M%SZ)

# Backup PostgreSQL via pg_dump se o serviço db do compose estiver rodando
if docker compose ps -q db > /dev/null 2>&1 && [ -n "$(docker compose ps -q db 2>/dev/null)" ]; then
  docker compose exec -T db pg_dump -U "${POSTGRES_USER:-lara}" "${POSTGRES_DB:-lara}" > "backups/lara-pg-$LARA_BACKUP_STAMP.sql"
  printf 'Banco PostgreSQL salvo em backups/lara-pg-%s.sql.\n' "$LARA_BACKUP_STAMP"
fi

# Snapshot via aplicação (JSON export direto na pasta backups compartilhada)
if docker compose ps -q app > /dev/null 2>&1 && [ -n "$(docker compose ps -q app 2>/dev/null)" ]; then
  docker compose exec -T app node server/backup.mjs
fi

# Backup de mídias
if docker compose ps -q app > /dev/null 2>&1 && [ -n "$(docker compose ps -q app 2>/dev/null)" ]; then
  LARA_CONTAINER=$(docker compose ps -q app)
  docker cp "$LARA_CONTAINER:/app/data/media" "backups/media-$LARA_BACKUP_STAMP" 2>/dev/null || true
  printf 'Mídias salvas em backups/media-%s.\n' "$LARA_BACKUP_STAMP"
fi
