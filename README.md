# Lara Castelli — web app

Primeira versão funcional da área de membros. Interface em português, responsiva, com identidade verde/creme/lima. Destino: VPS do projeto, separado da página de vendas.

## Rodar no computador

Requer Node 22.20 ou superior.

```bash
npm ci
npm start
```

Abra http://localhost:5190 e clique em **Explorar demonstração**. A demonstração funciona sem conta e salva apenas dados de teste no navegador. Não envia publicações nem mensagens a outras pessoas. Não use dados sensíveis de pessoas reais na demonstração.

## O que está implementado

- Login com senha derivada por scrypt, sessão opaca em cookie HttpOnly, proteção de origem e limites de requisições. Cadastro de alunas pela administração, suspensão de acesso e redefinição de senha.
- Painel com semana, treinos concluídos, registro de água, conteúdos iniciais e acesso ao registro de evolução.
- Biblioteca de treinos por mês; calendário com objetivo, nível, frequência de 3 a 6 dias, navegação por semanas, distribuição de aulas e edição manual por dia. Distribuição organiza horários, não prescreve carga ou intensidade.
- Ficha com exercícios, orientações por nível, marcação individual, vídeo, velocidade, retomada, cronômetro configurável e conclusão com histórico. Os campos de nível precisam ser preenchidos pela equipe.
- Upload de MP4 pela administração (até 500 MB), armazenamento no volume da VPS e reprodução com autenticação e suporte a intervalos HTTP. URLs HTTPS externas também são aceitas; sua proteção depende do provedor externo.
- Receitas, favoritos, lista de compras, diário alimentar e soma dos valores inseridos manualmente de calorias, proteína, carboidratos e fibras. Área de plano alimentar, publicada como orientação na categoria `Plano alimentar`.
- Peso, cintura, quadril, disposição, observações, gráfico e fotos pessoais privadas (JPEG/PNG/WebP, até 4 MB e 100 fotos por conta).
- Registro manual de aplicações/dose prescrita/próxima data; sintomas com intensidade e observações; lembretes de hábitos e cuidados.
- Comunidade com publicações, comentários, curtidas e remoção de publicações por autor ou administrador. Mensagens privadas de acompanhamento com resposta da equipe.
- Avisos, busca, perfil, exportação JSON dos registros textuais e preferências.
- Administração de aulas, receitas, orientações, avisos, alunas e atendimento. Rascunhos não aparecem para membros. Publicar treino, receita ou orientação exige identificação do responsável pela revisão. Esse campo registra a declaração da equipe; o sistema não verifica credenciais profissionais.

## O que ainda depende da operação do produto

- Gravação e cadastro das aulas completas, séries, repetições, adaptações e planejamento mensal. Os quatro clipes existentes são **prévias**, não aulas completas.
- Aprovação e preenchimento das dietas, receitas e orientações clínicas pelos profissionais responsáveis. Não há recomendações de dose nem prescrição automática.
- Confirmação do subdomínio, configuração DNS/HTTPS e execução da instalação na VPS. Nada foi instalado remotamente nesta etapa.
- Checkout e liberação automática após pagamento. Nesta versão a equipe cria os acessos manualmente.
- Envio de e-mail para recuperação de senha, notificações push, WhatsApp, e-mails e alertas com o navegador fechado. Os lembretes atuais aparecem dentro do app.
- Termos de uso, política de privacidade, processo operacional de atendimento a pedidos de acesso/exclusão, consentimentos aplicáveis e rotina de backup antes de receber dados reais de saúde. Os dados no disco não têm criptografia própria da aplicação; proteja o servidor e os backups.
- Geração de receitas, análise de refeições por foto e chat com IA/Ollama. Nenhum serviço de IA foi conectado nem exposto. A integração futura deve ocorrer somente pelo servidor.
- Notas de carga/repetições por série, vídeo alternativo simultâneo para iniciante e biblioteca de planos profissionais não estão prontos. A ficha suporta texto por nível e o player reproduz um vídeo por aula; alternativas simultâneas exigem gravação/edição ou extensão do player.
- Exportação de fotos: o JSON exporta os registros textuais; baixe suas fotos separadamente. Backup administrativo inclui as fotos no banco.

## Banco e arquitetura

Node + Express + SQLite (`node:sqlite`), com WAL, chaves estrangeiras, consultas parametrizadas e arquivo em `data/lara.sqlite`. Tabelas: users, sessions, member_state, content, posts, likes, comments, tickets, photos. Fotos são blobs privados no banco; vídeos ficam em `data/media/`. Estado individual inclui agenda, refeições, sintomas, aplicações, progresso e preferências, separado por user_id. Nenhuma chave de API no cliente.

SQLite foi escolhido para a primeira instalação em uma única VPS: persistência real, sem expor porta de banco e operação simples. Não é PostgreSQL. Para múltiplas réplicas ou maior concorrência, planejar migração para PostgreSQL antes de escalar horizontalmente. O Node 22.20 ainda emite aviso experimental para sua API SQLite; essa é a versão testada. Não executar múltiplas instâncias escrevendo em cópias distintas do arquivo.

Produção usa cookie Secure e exige `APP_ORIGIN` HTTPS exato, sem barra final. Não disponibilize a porta 5190 diretamente na internet. O Compose publica apenas em 127.0.0.1 para um proxy local. Prévia e produção usam bancos independentes.

## Instalação na VPS

Siga [deploy/INSTALACAO.md](deploy/INSTALACAO.md). O Docker Compose não altera a página de vendas, Nginx existente ou Ollama. Não execute `docker compose down -v`: isso apaga o volume de dados.

## Verificação

```bash
npm test
```

Testes com banco temporário: login, proteção de origem, permissões, isolamento, conteúdo rascunho/publicado, revisão obrigatória, comunidade, atendimento, fotos privadas, upload e reprodução autenticada de vídeo, suspensão e logout, datas de calendário. O teste de upload usa um cabeçalho mínimo para validar transporte e autorização, não decodificação de mídia; os clipes reais foram verificados na interface.

Em desenvolvimento, http://localhost:5190/qa executa auditoria de largura em 8 páginas × 7 larguras (320–1440 px), mais fluxos de persistência em demonstração. Restaura os registros textuais de demonstração anteriores ao terminar. Não abrir simultaneamente com edição de dados de demonstração em outra aba. Essa rota não existe em produção.

Testes não equivalem a auditoria completa de segurança, acessibilidade ou dispositivos físicos. Docker Compose foi validado como configuração; a imagem/container não foi executada localmente porque o Docker Desktop estava parado. A instalação Linux e o proxy precisam de verificação na VPS.

## Referências e escopo

Identidade e contexto: código e decisões da página de vendas, conversas “Estruturar oferta pós-emagrecimento” e “Criar vídeo vertical da Lara”. Referência visual: seis imagens do ProFit fornecidas pelo usuário. Não foram copiados marca, materiais privados ou identidade do ProFit.

Instagram analisado no navegador do Codex: https://www.instagram.com/p/DeZB8I4gw0p/ — confirmados na publicação e em telas do vídeo: calorias, plano alimentar, receitas, evolução em gráfico/foto, peso/medidas, aplicações/próxima data, sintomas/intensidade e assistente de IA. IA ficou fora desta etapa. O link da Play Store não pôde ser lido pelo buscador; não há afirmação de inspeção completa do app ProFit.
