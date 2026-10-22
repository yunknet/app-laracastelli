#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
read -r -p 'Nome do administrador: ' LARA_ADMIN_NAME
read -r -p 'E-mail do administrador: ' LARA_ADMIN_EMAIL
read -r -s -p 'Senha (minimo 12 caracteres): ' LARA_ADMIN_PASSWORD
printf '\n'
read -r -s -p 'Repita a senha: ' LARA_ADMIN_CONFIRM
printf '\n'
[[ "$LARA_ADMIN_PASSWORD" == "$LARA_ADMIN_CONFIRM" ]] || { printf 'As senhas diferem.\n'; exit 1; }
export LARA_ADMIN_NAME LARA_ADMIN_EMAIL LARA_ADMIN_PASSWORD
python3 -c 'import os,json; print(json.dumps({"name":os.environ["LARA_ADMIN_NAME"],"email":os.environ["LARA_ADMIN_EMAIL"],"password":os.environ["LARA_ADMIN_PASSWORD"]}))' | docker compose exec -T app node server/create-admin.mjs
unset LARA_ADMIN_PASSWORD LARA_ADMIN_CONFIRM
