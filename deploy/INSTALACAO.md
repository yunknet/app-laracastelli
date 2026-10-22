# Instalar na VPS Ubuntu

Destino informado: `77.37.41.211`. Esta etapa será executada pelo proprietário, conforme combinado. A conexão por chave do agente foi recusada; nenhuma instalação remota foi realizada.

## 1. Preparar o endereço e conferir serviços existentes

Subdomínio sugerido: `app.laracastelli.mivaia.com`. Crie no seu DNS um registro A desse nome para `77.37.41.211` (ou use outro subdomínio que você controla). Não altere o registro da página de vendas.

No PowerShell:

```powershell
ssh root@77.37.41.211
```

No servidor, confira primeiro:

```bash
docker --version
docker compose version
sudo ss -ltnp | grep -E ':80 |:443 |:5190 '
```

Se já existe painel, Traefik, Caddy ou Nginx em container ocupando 80/443, use o proxy existente. **Não instale outro proxy nessas portas.** Configure nele o domínio HTTPS apontando para `http://127.0.0.1:5190` se ele roda no host. Um proxy dentro de container precisa de rede Docker compartilhada com `app:5190`, ou acesso explicitamente configurado ao host; o loopback de um container não é o host.

Se Docker/Compose não existem, instalar esses pré-requisitos é uma etapa separada. O pacote não remove nem substitui nenhum serviço existente. Não troque Docker do painel por outra instalação.

## 2. Baixar e iniciar o web app

```bash
sudo mkdir -p /opt/lara
cd /opt/lara
git clone https://github.com/yunknet/app-laracastelli.git web-app
cd /opt/lara/web-app
cp .env.example .env
nano .env
```

Em `.env`, deixe `APP_ORIGIN=https://SEU-SUBDOMINIO` com o endereço escolhido, sem barra ao final. O repositório privado pode exigir sua autenticação GitHub. Não coloque tokens na URL de clone nem no `.env`.

```bash
docker compose up -d --build
docker compose ps
curl -f http://127.0.0.1:5190/api/health
bash deploy/create-admin.sh
```

O último comando pede nome, e-mail e senha oculta, confirmada duas vezes. Cria a primeira conta administradora, sem gravar a senha em arquivo ou no histórico do shell.

O serviço só escuta publicamente por meio do proxy HTTPS. Antes de configurar o proxy, o login pelo domínio ainda não está pronto.

## 3. Se o proxy existente é Nginx instalado no host

Use estes comandos **somente nesse cenário**. Se usa um painel ou outro proxy, faça a mesma configuração na interface dele.

```bash
cd /opt/lara/web-app
read -r -p 'Subdominio completo do aplicativo: ' LARA_DOMAIN
[[ "$LARA_DOMAIN" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]] || { echo 'Dominio invalido'; exit 1; }
test ! -e /etc/nginx/sites-available/lara-webapp || { echo 'Configuracao ja existe. Revise antes de sobrescrever.'; exit 1; }
sed "s/APP_DOMAIN/$LARA_DOMAIN/g" deploy/nginx.conf.example | sudo tee /etc/nginx/sites-available/lara-webapp > /dev/null
sudo ln -s /etc/nginx/sites-available/lara-webapp /etc/nginx/sites-enabled/lara-webapp
sudo nginx -t && sudo systemctl reload nginx
```

Com DNS já apontado e Certbot instalado:

```bash
sudo certbot --nginx -d "$LARA_DOMAIN"
```

Se Certbot não existir e este for de fato um Nginx gerenciado no host, os pacotes do Ubuntu são `certbot python3-certbot-nginx`; instale com `sudo apt update && sudo apt install certbot python3-certbot-nginx`. Não aceite remoção/substituição do proxy do seu painel.

Confirme HTTPS e o endpoint público:

```bash
curl -f "https://$LARA_DOMAIN/api/health"
docker compose logs --tail=60 app
```

Abra o endereço HTTPS, entre como administrador e teste: criar aluna, criar rascunho, publicar conteúdo revisado, entrar como aluna e registrar progresso. Faça o teste com contas de teste antes da operação real.

## 4. Cadastrar o produto

- Administração → Conteúdos → Novo conteúdo.
- Treino: título, mês, duração, vídeo MP4, exercícios (nome | iniciante | intermediário | avançado), responsável pela revisão. Salve como rascunho até estar pronto.
- Receita: ingredientes e etapas, uma por linha.
- Plano alimentar: tipo Orientação, categoria exatamente `Plano alimentar`.
- Conteúdos sobre canetas: tipo Orientação, com revisão e autoria responsável. O app não recomenda doses.
- Aviso: tipo Aviso; aparece em Novidades e Notificações.
- Administração → Alunas: cadastre o acesso manualmente após sua liberação comercial.
- Administração → Atendimento: responda as dúvidas recebidas.

Vídeos próprios enviados pelo painel são protegidos pelo login; os clipes de demonstração em `/assets/` são públicos. Não coloque conteúdo pago em `public/assets/`. Vídeos externos devem ter controle de acesso no provedor; uma URL pública externa continua pública.

## 5. Backup e atualizações

```bash
cd /opt/lara/web-app
bash deploy/backup.sh
LARA_CONTAINER=$(docker compose ps -q app)
docker cp "$LARA_CONTAINER:/app/data/media" backups/media
```

O comando de mídias só é necessário depois do primeiro upload. Para backups subsequentes, use uma pasta nova com data para não misturar versões. Guarde banco e mídias em armazenamento seguro fora da VPS. O snapshot do banco inclui fotos; os MP4s ficam na pasta media. Faça o backup de mídias em janela sem uploads.

Atualizar:

```bash
cd /opt/lara/web-app
bash deploy/backup.sh
git pull --ff-only
docker compose up -d --build
docker compose ps
curl -f http://127.0.0.1:5190/api/health
```

O volume `lara_data` persiste. Nunca use `down -v`, não apague o volume nem copie apenas o arquivo SQLite aberto ignorando o WAL. `backup.sh` usa `VACUUM INTO` para gerar uma cópia consistente.

Restauração deve ser testada em ambiente separado: pare o app, copie o snapshot e as mídias para um volume novo com propriedade do usuário node (UID 1000), configure o novo volume e valide antes de trocar o volume de produção. Evite substituir arquivos de banco enquanto o serviço estiver rodando.

## Estado desta entrega

Código e testes locais prontos. Docker Compose validado sintaticamente. Container Linux, DNS, certificado, proxy e restauração ainda não executados na VPS. Nenhum acesso ao Ollama foi necessário; a integração de IA está reservada para outra etapa.
