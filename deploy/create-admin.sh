#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
read -r -p 'Nome do administrador (padrão: miva): ' LARA_ADMIN_NAME
LARA_ADMIN_NAME="${LARA_ADMIN_NAME:-miva}"
read -r -p 'E-mail do administrador (padrão: sistemasmivaia@gmail.com): ' LARA_ADMIN_EMAIL
LARA_ADMIN_EMAIL="${LARA_ADMIN_EMAIL:-sistemasmivaia@gmail.com}"
read -r -s -p 'Senha (mínimo 6 caracteres): ' LARA_ADMIN_PASSWORD
printf '\n'
read -r -s -p 'Repita a senha: ' LARA_ADMIN_CONFIRM
printf '\n'
[[ "$LARA_ADMIN_PASSWORD" == "$LARA_ADMIN_CONFIRM" ]] || { printf 'As senhas diferem.\n'; exit 1; }
docker compose exec -T app node server/create-admin.mjs "$LARA_ADMIN_EMAIL" "$LARA_ADMIN_PASSWORD" "$LARA_ADMIN_NAME"
