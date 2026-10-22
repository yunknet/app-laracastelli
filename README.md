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

Node + Express + PostgreSQL (via `pg`), com pool de conexões assíncrono, consultas parametrizadas, chaves estrangeiras e índices. Tabelas: `users`, `sessions`, `member_state`, `content`, `posts`, `likes`, `comments`, `tickets`, `photos`. Fotos são salvas como binários privados (`BYTEA`) no banco; vídeos enviados ficam no volume `/app/data/media`. O estado individual do membro inclui agenda, refeições, sintomas, aplicações, progresso e preferências, isolado por `user_id`. Nenhuma chave de API no cliente.

Configurado nativamente para PostgreSQL via `DATABASE_URL` (padrão de produção, Docker Compose e Easypanel) com fallback automático para SQLite em desenvolvimento/testes locais isolados sem PostgreSQL ativo.

Produção usa cookie Secure e exige `APP_ORIGIN` HTTPS exato, sem barra final. Não disponibilize a porta 5190 diretamente na internet aberta. O Compose publica em 127.0.0.1 para proxy reverso ou roda via Easypanel gerenciando o roteamento com Traefik/Nginx e SSL automático.

## Instalação na VPS

Siga [deploy/INSTALACAO.md](deploy/INSTALACAO.md) para instruções completas tanto via interface visual do **Easypanel** quanto via **SSH / Docker Compose**.

## Verificação

```bash
npm test
```

Testes automatizados cobrem: autenticação, cookies seguros, proteção de origem, permissões por cargo, isolamento de dados entre alunas, rascunhos e publicação revisada, comunidade (posts, curtidas, comentários), suporte privado, fotos criptografadas/validadas, upload e streaming de vídeo MP4 por faixas (range requests), e revogação de sessões.

## Referências e escopo

Identidade e contexto: código e decisões da página de vendas, conversas “Estruturar oferta pós-emagrecimento” e “Criar vídeo vertical da Lara”. Referência visual: seis imagens do ProFit fornecidas pelo usuário. Não foram copiados marca, materiais privados ou identidade do ProFit.

Instagram analisado no navegador do Codex: https://www.instagram.com/p/DeZB8I4gw0p/ — confirmados na publicação e em telas do vídeo: calorias, plano alimentar, receitas, evolução em gráfico/foto, peso/medidas, aplicações/próxima data, sintomas/intensidade e assistente de IA. IA ficou fora desta etapa. O link da Play Store não pôde ser lido pelo buscador; não há afirmação de inspeção completa do app ProFit.
