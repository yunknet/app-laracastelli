# Instalação na VPS (Easypanel ou Docker Compose)

Destino: VPS Ubuntu `77.37.41.211`.
Banco de Dados: **PostgreSQL**.

Você pode publicar o aplicativo de duas formas práticas:
1. **Pelo Easypanel** (interface visual que você já utiliza na VPS).
2. **Direto via terminal SSH com Docker Compose**.

---

## Opção A: Publicação pelo Easypanel (Recomendado)

### 1. Criar o Banco PostgreSQL no Easypanel
1. No seu projeto do Easypanel (ex: `lara` ou `mivaia`), clique em **+ Service** (ou **Adicionar Serviço**).
2. Selecione **Database** → **PostgreSQL**.
3. Defina o nome do serviço (ex: `postgres` ou `lara-db`).
4. Ao criar, copie a URL de conexão interna gerada pelo Easypanel (formato: `postgresql://postgres:SENHA@postgres:5432/postgres`).

### 2. Criar a Aplicação Web
1. No mesmo projeto, clique em **+ Service** → **App**.
2. Na aba **General**:
   - Nome: `app-laracastelli` (ou `lara-app`).
3. Na aba **Source**:
   - Selecione **GitHub**.
   - Repositório: `yunknet/app-laracastelli`.
   - Branch: `main`.
   - Build Type: **Dockerfile**.
4. Na aba **Environment** (Variáveis de ambiente):
   - `NODE_ENV`: `production`
   - `APP_ORIGIN`: `https://app.laracastelli.mivaia.com` (ou o subdomínio HTTPS que configurou, **sem barra no final**)
   - `DATABASE_URL`: cole a URL de conexão do PostgreSQL criado no passo 1
   - `TRUST_PROXY`: `1`
   - `PORT`: `5190`
   - `MEDIA_ROOT`: `/app/data/media`
5. Na aba **Domains**:
   - Adicione seu subdomínio (ex: `app.laracastelli.mivaia.com`).
   - Aponte para a porta interna: `5190`.
   - Habilite HTTPS / Certificado SSL automático.
6. Na aba **Volumes** (para persistir vídeos enviados pela administração):
   - Host path / Volume name: `lara-media`
   - Mount path: `/app/data/media`
7. Clique em **Save** e depois em **Deploy**.

### 3. Criar a Conta Administradora
1. Após a conclusão do deploy, abra a aba **Console** (terminal) do serviço `app-laracastelli` no Easypanel.
2. Execute:
   ```bash
   node server/create-admin.mjs
   ```
   E envie o JSON com as credenciais, por exemplo:
   ```bash
   echo '{"name":"Lara Admin","email":"admin@laracastelli.mivaia.com","password":"SuaSenhaForte123!"}' | node server/create-admin.mjs
   ```
3. Pronto! Acesse `https://app.laracastelli.mivaia.com` e faça login com a conta criada.

---

## Opção B: Instalação via SSH com Docker Compose

### 1. Apontar o DNS
No seu provedor de DNS (ex: Cloudflare), crie um registro **A**:
- Nome: `app.laracastelli` (ou o prefixo desejado).
- IPv4: `77.37.41.211`.
- Proxy: ativado se usar Cloudflare ou direto.

### 2. Acessar a VPS via SSH
No PowerShell:
```powershell
ssh root@77.37.41.211
```

### 3. Clonar e configurar o projeto
```bash
sudo mkdir -p /opt/lara
cd /opt/lara
git clone https://github.com/yunknet/app-laracastelli.git web-app
cd /opt/lara/web-app
cp .env.example .env
nano .env
```

Configure no `.env`:
```env
APP_ORIGIN=https://app.laracastelli.mivaia.com
POSTGRES_DB=lara
POSTGRES_USER=lara
POSTGRES_PASSWORD=defina_uma_senha_forte_aqui
DATABASE_URL=postgresql://lara:defina_uma_senha_forte_aqui@db:5432/lara
```

### 4. Subir os containers (PostgreSQL + App)
```bash
docker compose up -d --build
docker compose ps
curl -f http://127.0.0.1:5190/api/health
```

### 5. Criar o primeiro Administrador
```bash
bash deploy/create-admin.sh
```
Digite o nome, e-mail e senha de administração.

### 6. Configurar Proxy Reverso (se usar Nginx no host)
Se o servidor usar Nginx no host para encaminhar o subdomínio:
```bash
sed "s/APP_DOMAIN/app.laracastelli.mivaia.com/g" deploy/nginx.conf.example | sudo tee /etc/nginx/sites-available/lara-webapp > /dev/null
sudo ln -s /etc/nginx/sites-available/lara-webapp /etc/nginx/sites-enabled/lara-webapp
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d app.laracastelli.mivaia.com
```

---

## Rotina de Backup e Atualizações

### Backup
```bash
cd /opt/lara/web-app
bash deploy/backup.sh
```
O script gera um dump completo do PostgreSQL (`backups/lara-pg-*.sql`) e cópia das mídias enviadas.

### Atualização
Quando subir novas alterações no repositório GitHub:
```bash
cd /opt/lara/web-app
git pull --ff-only
docker compose up -d --build
```
(No Easypanel, basta clicar em **Deploy** ou habilitar **Auto Deploy** com Webhook do GitHub).
