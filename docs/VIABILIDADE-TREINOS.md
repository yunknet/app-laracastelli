# Integração inicial do pacote de treinos

Base analisada: `origin/main` em `4a7ff8d`. Desenvolvimento isolado na branch `codex/integracao-treinos-12-semanas`. O patch antigo do ZIP não foi aplicado sobre o aplicativo atual.

## Implementação

- Catálogo separado com 48 treinos, casa e academia, três fases de quatro semanas, frequência de dois a cinco dias e instruções de execução.
- Preferências em `profile.trainingProgram`, preservando a ficha anterior, seus IDs e os registros existentes. Nenhuma migração de banco é necessária.
- Próxima sessão calculada pela data de início, sem mudar ao navegar em outro mês. Semanas 4, 8 e 12 reduzem séries por nível; o ciclo termina após 12 semanas.
- Conclusão de aulas e exercícios reutiliza o estado individual existente, com IDs distintos para o programa.
- Conteúdo publicado pela API administrativa pode substituir as aulas do programa; rascunhos as ocultam. Esses registros não entram no catálogo antigo.
- Funcionalidades que o proprietário decidiu remover não foram restauradas. Autenticação, vendas e webhooks continuam no fluxo existente.

## Ativação e retorno

O padrão é `LARA_TRAINING_PROGRAM_ENABLED=0`. Com `1` e sem `LARA_TRAINING_PROGRAM_REVIEWER`, somente administradores acessam a prévia. Para liberar às alunas, é necessário cadastrar o responsável pela revisão nessa segunda variável e reiniciar o serviço. Não preencher esse campo antes de revisar o conteúdo.

Voltar a flag para `0` oculta a entrada e bloqueia o catálogo opcional, preservando os dados gravados e a experiência anterior. As variáveis também foram previstas no Compose.

## Limites desta entrega

O ZIP não contém os vídeos nem as demonstrações dos exercícios; a interface informa que estão em preparação. A biblioteca precisa de revisão profissional antes de ser oferecida como orientação de treino, especialmente no contexto de uso de medicamentos. Não foi criada prescrição clínica ou integração com Ollama.

Nenhuma alteração foi implantada na VPS. A compatibilidade usa a camada PostgreSQL existente, mas a conexão real e a implantação na VPS ainda precisam ser verificadas no ambiente do servidor. Testes locais usam SQLite descartável e não acessam o banco de produção.

O commit base corrige ordenação de eventos de venda, validação de webhook e progressão da ficha. A rotina de backup existente ainda contém permissões amplas e tolerância silenciosa a falhas; isso não foi alterado nesta integração.

## Verificação

- `npm test`: 32 testes aprovados, incluindo os 21 anteriores e testes do catálogo, datas, progressão, isolamento e controle de acesso.
- Navegador: configuração do programa, navegação entre fases, próxima sessão, instruções sem marcar exercício e conclusão na base local.
- Correção responsiva do player existente: conclusão em linha própria no celular, cronômetro e descanso lado a lado, textos e contador ajustados.
- `/qa-player.html` (apenas desenvolvimento): 44 verificações de limites dos controles e contadores em 11 larguras, de 320 a 1440 px. Usa demonstração e restaura a seleção de modo ao terminar.

O resultado é uma integração inicial revisável. A ativação para alunas, os vídeos e a implantação são etapas posteriores.
