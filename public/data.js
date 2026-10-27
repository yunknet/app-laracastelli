export const demoContent = [
  // Treinos Mês 1 - Estruturados como no ProFit
  {
    id: 'w1',
    kind: 'workout',
    title: 'Treino A • Fullbody 1',
    category: 'Mês 01',
    month: 1,
    minutes: 32,
    level: 'Iniciante a Avançado',
    video: '/assets/treino-video-1.mp4',
    poster: '/assets/treino-poster-1.jpg',
    description: 'Treino completo focado em grandes grupos musculares, ativação metabólica e sustentação pós-emagrecimento. Acompanhe a execução guiada e ajuste as repetições de acordo com seu nível.',
    reviewer: 'Lara Castelli • Treinadora Especialista',
    instructions: 'Realize o aquecimento antes de iniciar. Respeite os intervalos de descanso indicados pelo cronômetro.',
    exercises: [
      { name: 'Aquecimento articular e mobilidade de quadril', detail: '2 séries de 30 segundos cada lado', beginner: '30s suave', intermediate: '45s com amplitude total', advanced: '60s com carga corporal' },
      { name: 'Agachamento livre adaptado', detail: '3 séries de 10 a 12 repetições', beginner: '10 reps com apoio na cadeira', intermediate: '12 reps sem apoio', advanced: '15 reps com cadência 3s de descida' },
      { name: 'Flexão de braços inclinada', detail: '3 séries de 8 a 10 repetições', beginner: '8 reps na parede', intermediate: '10 reps na bancada/sofá', advanced: '12 reps no solo' },
      { name: 'Ponte de glúteos com sustentação', detail: '3 séries de 12 repetições', beginner: '10 reps sustentando 1s', intermediate: '12 reps sustentando 2s', advanced: '15 reps unipodal' },
      { name: 'Prancha frontal com respiração diafragmática', detail: '3 séries de 20 a 40 segundos', beginner: '20 segundos apoiando joelhos', intermediate: '30 segundos apoio tradicional', advanced: '45 segundos com elevação alternada' }
    ]
  },
  {
    id: 'w2',
    kind: 'workout',
    title: 'Treino B • Inferiores & Glúteos',
    category: 'Mês 01',
    month: 1,
    minutes: 28,
    level: 'Iniciante a Avançado',
    video: '/assets/treino-video-2.mp4',
    poster: '/assets/treino-poster-2.jpg',
    description: 'Foco em membros inferiores, quadríceps, posteriores e firmeza de glúteos para recuperar o tônus muscular e sustentação da pele.',
    reviewer: 'Lara Castelli • Treinadora Especialista',
    instructions: 'Mantenha a postura ereta e contraia o abdômen em todas as repetições.',
    exercises: [
      { name: 'Afundo com recuo (Passada atrás)', detail: '3 séries de 10 reps por perna', beginner: '8 reps com apoio para equilíbrio', intermediate: '10 reps livres', advanced: '12 reps com halteres/garrafas' },
      { name: 'Elevação pélvica isométrica', detail: '3 séries de 12 repetições', beginner: '10 reps normais', intermediate: '12 reps com 3s no topo', advanced: '15 reps com peso no quadril' },
      { name: 'Abdução de quadril deitada', detail: '3 séries de 15 reps cada lado', beginner: '12 reps com amplitude confortável', intermediate: '15 reps com pausa no topo', advanced: '20 reps sem encostar a perna' }
    ]
  },
  {
    id: 'w3',
    kind: 'workout',
    title: 'Treino C • Fullbody 2 & Queima',
    category: 'Mês 01',
    month: 1,
    minutes: 30,
    level: 'Iniciante a Avançado',
    video: '/assets/treino-video-3.mp4',
    poster: '/assets/treino-poster-3.jpg',
    description: 'Estímulo cardiovascular e resistência muscular combinados, mantendo o metabolismo ativo e preservando massa magra.',
    reviewer: 'Lara Castelli • Treinadora Especialista',
    instructions: 'Mantenha um ritmo constante sem prender a respiração.',
    exercises: [
      { name: 'Polichinelo adaptado (sem impacto)', detail: '3 séries de 40 segundos', beginner: 'Passo lateral sem salto', intermediate: 'Salto leve e constante', advanced: 'Polichinelo com ritmo acelerado' },
      { name: 'Remada curvada unilateral', detail: '3 séries de 12 reps por lado', beginner: '10 reps com carga leve', intermediate: '12 reps cadenciadas', advanced: '15 reps com contração dorsal forte' },
      { name: 'Abdominal infra com joelhos flexionados', detail: '3 séries de 12 repetições', beginner: '10 reps apoiando os pés', intermediate: '12 reps sem tocar o chão', advanced: '15 reps pernas estendidas' }
    ]
  },
  {
    id: 'w4',
    kind: 'workout',
    title: 'Treino D • Superiores & Postura',
    category: 'Mês 01',
    month: 1,
    minutes: 25,
    level: 'Iniciante a Avançado',
    video: '/assets/treino-video-4.mp4',
    poster: '/assets/treino-poster-4.jpg',
    description: 'Trabalho de fortalecimento de costas, ombros e braços para alinhamento postural e firmeza corporal.',
    reviewer: 'Lara Castelli • Treinadora Especialista',
    instructions: 'Evite elevar os ombros em direção às orelhas durante os movimentos de puxada.',
    exercises: [
      { name: 'Desenvolvimento de ombros', detail: '3 séries de 12 repetições', beginner: '10 reps sem carga para padrão motor', intermediate: '12 reps com peso moderado', advanced: '15 reps com subida explosiva e descida em 3s' },
      { name: 'Tríceps no banco ou cadeira', detail: '3 séries de 10 repetições', beginner: '8 reps com joelhos dobrados a 90°', intermediate: '10 reps com pernas esticadas', advanced: '12 reps com pés elevados' },
      { name: 'Prancha lateral adaptada', detail: '3 séries de 20s por lado', beginner: 'Apoio de joelhos dobrados', intermediate: 'Apoio padrão nos pés', advanced: 'Com elevação da perna de cima' }
    ]
  },

  // Treinos Mês 2 - Construção & Firmeza
  {
    id: 'w2_1',
    kind: 'workout',
    title: 'Treino A • Inferiores & Glúteos Avançado',
    category: 'Mês 02',
    month: 2,
    minutes: 32,
    level: 'Intermediário',
    video: '/assets/treino-video-2.mp4',
    poster: '/assets/treino-poster-2.jpg',
    description: 'Evolução da sobrecarga muscular focada em sustentação da pele e firmeza de coxas e glúteos.',
    reviewer: 'Lara Castelli • Treinadora Especialista',
    instructions: 'Concentre-se na fase excêntrica (descida lenta de 3 segundos).',
    exercises: [
      { name: 'Afundo búlgaro com pé elevado', detail: '3 séries de 10 reps cada perna', beginner: 'Pé apoiado no chão sem elevação', intermediate: 'Pé em elevação baixa', advanced: 'Pé elevado com carga nas mãos' },
      { name: 'Elevação pélvica unilateral', detail: '3 séries de 12 repetições cada lado', beginner: 'Bilateral com pausa de 3s', intermediate: 'Unipodal suave', advanced: 'Unipodal com carga no quadril' },
      { name: 'Agachamento sumô com isometria', detail: '3 séries de 12 reps + 10s isometria', beginner: '10 reps sem isometria', intermediate: '12 reps com 5s isometria', advanced: '12 reps com 10s isometria final' }
    ]
  },
  {
    id: 'w2_2',
    kind: 'workout',
    title: 'Treino B • Superiores & Dorsal Esculpida',
    category: 'Mês 02',
    month: 2,
    minutes: 28,
    level: 'Intermediário',
    video: '/assets/treino-video-4.mp4',
    poster: '/assets/treino-poster-4.jpg',
    description: 'Fortalecimento da cadeia posterior para sustentação dos ombros e diminuição da flacidez no tríceps.',
    reviewer: 'Lara Castelli • Treinadora Especialista',
    instructions: 'Aperte as escápulas no ponto máximo da contração dorsal.',
    exercises: [
      { name: 'Remada curvada pronada', detail: '3 séries de 12 repetições', beginner: 'Com garrafas leves', intermediate: 'Com cadência 2-1-2', advanced: 'Pausa de 2s na contração máxima' },
      { name: 'Tríceps francês unilateral', detail: '3 séries de 12 reps por braço', beginner: 'Bilateral com apoio', intermediate: 'Unilateral com carga moderada', advanced: 'Com descida lenta e controlada' },
      { name: 'Elevação lateral com controle de descida', detail: '3 séries de 15 repetições', beginner: '10 reps leves', intermediate: '12 reps com 3s descida', advanced: '15 reps com pico de 2s' }
    ]
  },
  {
    id: 'w2_3',
    kind: 'workout',
    title: 'Treino C • Fullbody Densidade & Queima',
    category: 'Mês 02',
    month: 2,
    minutes: 34,
    level: 'Intermediário',
    video: '/assets/treino-video-1.mp4',
    poster: '/assets/treino-poster-1.jpg',
    description: 'Estímulo metabólico avançado combinando membros superiores e inferiores em cadeia fechada.',
    reviewer: 'Lara Castelli • Treinadora Especialista',
    instructions: 'Mantenha a frequência cardíaca controlada e beba pequenos goles de água nos intervalos.',
    exercises: [
      { name: 'Agachamento com desenvolvimento militar combinado', detail: '3 séries de 12 reps', beginner: 'Movimentos separados', intermediate: 'Movimento fluido contínuo', advanced: 'Com velocidade controlada' },
      { name: 'Stiff unilateral com equilíbrio', detail: '3 séries de 10 reps por lado', beginner: 'Apoio na parede', intermediate: 'Sem apoio corporal', advanced: 'Com haltere na mão oposta' },
      { name: 'Prancha dinâmica militar (sobe e desce)', detail: '3 séries de 30 segundos', beginner: 'Apoiando joelhos', intermediate: 'Padrão nos pés', advanced: 'Com ritmo constante acelerado' }
    ]
  },
  {
    id: 'w2_4',
    kind: 'workout',
    title: 'Treino D • Core, Postura & Cintura',
    category: 'Mês 02',
    month: 2,
    minutes: 25,
    level: 'Intermediário',
    video: '/assets/treino-video-3.mp4',
    poster: '/assets/treino-poster-3.jpg',
    description: 'Estabilização profunda da musculatura abdominal, afinamento da linha da cintura e prevenção de dores posturais.',
    reviewer: 'Lara Castelli • Treinadora Especialista',
    instructions: 'Ative a respiração diafragmática em todas as contrações.',
    exercises: [
      { name: 'Deadbug com ativação abdominal contínua', detail: '3 séries de 12 repetições alternadas', beginner: 'Com joelhos flexionados apoiando o calcanhar', intermediate: 'Pernas a 90 graus', advanced: 'Com extensão completa e halter leve' },
      { name: 'Perdigueiro cadenciado com isometria', detail: '3 séries de 10 reps por lado', beginner: 'Sem isometria', intermediate: 'Pausa de 2s no topo', advanced: 'Com sobrecarga no tornozelo' },
      { name: 'Prancha lateral com elevação de quadril', detail: '3 séries de 25 segundos cada lado', beginner: 'Apoiando joelho inferior', intermediate: 'Padrão estendido', advanced: 'Com elevação da perna superior' }
    ]
  },

  // Treinos Mês 3 - Definição & Tônus Máximo
  {
    id: 'w3_1',
    kind: 'workout',
    title: 'Treino A • Definição de Glúteos & Posterior',
    category: 'Mês 03',
    month: 3,
    minutes: 35,
    level: 'Avançado',
    video: '/assets/treino-video-2.mp4',
    poster: '/assets/treino-poster-2.jpg',
    description: 'Lapidação final das curvas, densidade e sustentação muscular profunda para resultado duradouro.',
    reviewer: 'Lara Castelli • Treinadora Especialista',
    instructions: 'Conexão mente-músculo: sinta cada fibra muscular recrutada em cada repetição.',
    exercises: [
      { name: 'Hip Thrust no banco / sofá com pico de contração', detail: '4 séries de 12 reps', beginner: 'No chão bilateral', intermediate: 'No banco com 2s pico', advanced: 'Com sobrecarga máxima e 3s pico' },
      { name: 'Passada com passada profunda contínua', detail: '3 séries de 20 passos totais', beginner: 'Passo parado', intermediate: 'Passada contínua', advanced: 'Com carga nos braços' },
      { name: 'Stiff bilateral com postura perfeita', detail: '4 séries de 12 repetições', beginner: 'Movimento sem peso', intermediate: 'Com carga moderada', advanced: 'Cadência lenta e amplitude profunda' }
    ]
  },
  {
    id: 'w3_2',
    kind: 'workout',
    title: 'Treino B • Ombros Lapidados & Braços Firmes',
    category: 'Mês 03',
    month: 3,
    minutes: 30,
    level: 'Avançado',
    video: '/assets/treino-video-4.mp4',
    poster: '/assets/treino-poster-4.jpg',
    description: 'Definição e alinhamento visual de ombros, tríceps e abdômen superior.',
    reviewer: 'Lara Castelli • Treinadora Especialista',
    instructions: 'Mantenha o tronco estável, evitando balanço lombar.',
    exercises: [
      { name: 'Desenvolvimento Arnold adaptado', detail: '3 séries de 12 repetições', beginner: 'Desenvolvimento padrão', intermediate: 'Arnold completo com halteres', advanced: 'Arnold com isometria no topo' },
      { name: 'Tríceps mergulho no banco com pernas estendidas', detail: '3 séries de 12 repetições', beginner: 'Joelhos flexionados', intermediate: 'Pernas esticadas', advanced: 'Pernas elevadas em apoio' },
      { name: 'Remada alta para trapézio e deltoides', detail: '3 séries de 15 repetições', beginner: 'Carga leve até altura do peito', intermediate: 'Cotovelos sempre acima das mãos', advanced: 'Com descida lenta de 4s' }
    ]
  },
  {
    id: 'w3_3',
    kind: 'workout',
    title: 'Treino C • Metabólico Intenso & Cintura Fina',
    category: 'Mês 03',
    month: 3,
    minutes: 32,
    level: 'Avançado',
    video: '/assets/treino-video-3.mp4',
    poster: '/assets/treino-poster-3.jpg',
    description: 'Sessão desenhada para acentuar a cintura e queimar os últimos depósitos de gordura residual.',
    reviewer: 'Lara Castelli • Treinadora Especialista',
    instructions: 'Concentre a expiração puxando o umbigo para dentro em cada esforço.',
    exercises: [
      { name: 'Sprawl adaptado sem impacto lombar', detail: '4 séries de 40 segundos', beginner: 'Passo a passo sem salto', intermediate: 'Ritmo contínuo com salto leve', advanced: 'Explosivo completo' },
      { name: 'Vacuum abdominal com ativação do transverso', detail: '4 ciclos de 20s em apnéia', beginner: 'Deitada com joelhos dobrados', intermediate: 'Em quatro apoios', advanced: 'Em pé com mãos nos joelhos' },
      { name: 'Prancha lateral dinâmica com elevação', detail: '3 séries de 30s cada lado', beginner: 'Com joelhos no chão', intermediate: 'Pés no chão', advanced: 'Com elevação da perna superior' }
    ]
  },
  {
    id: 'w3_4',
    kind: 'workout',
    title: 'Treino D • Abdômen Esculpido & Sustentação',
    category: 'Mês 03',
    month: 3,
    minutes: 26,
    level: 'Avançado',
    video: '/assets/treino-video-1.mp4',
    poster: '/assets/treino-poster-1.jpg',
    description: 'Protocolo de alta densidade muscular para modelar a parede abdominal e sustentar a região lombar.',
    reviewer: 'Lara Castelli • Treinadora Especialista',
    instructions: 'Mantenha o abdômen travado e execute movimentos lentos com amplitude máxima.',
    exercises: [
      { name: 'Abdominal infra com pernas estendidas', detail: '3 séries de 15 repetições', beginner: 'Com pernas flexionadas', intermediate: 'Com descida lenta de 3s', advanced: 'Sem encostar o calcanhar no solo' },
      { name: 'Prancha russa com rotação de tronco', detail: '3 séries de 20 giros totais', beginner: 'Com pés apoiados', intermediate: 'Pés suspensos', advanced: 'Com carga no peito' },
      { name: 'Elevação pélvica deitada com isometria final', detail: '3 séries de 15 reps + 15s isometria', beginner: '10 reps sem isometria', intermediate: '12 reps com 10s', advanced: '15 reps com 15s no pico' }
    ]
  },

  // Bônus - Categorias especiais estilo Netflix (Screenshot 2)
  {
    id: 'b1',
    kind: 'workout',
    title: 'Mobilidade & Liberação Articular',
    category: 'Bônus',
    month: 1,
    minutes: 18,
    level: 'Todos os níveis',
    video: '/assets/treino-video-1.mp4',
    poster: '/assets/treino-poster-1.jpg',
    description: 'Sessão suave para relaxamento muscular, melhora da postura, flexibilidade da coluna e alívio de tensões do dia a dia.',
    reviewer: 'Lara Castelli • Treinadora Especialista',
    exercises: [
      { name: 'Gato-Camelo para coluna', detail: '2 séries de 10 ciclos lentos', beginner: 'No seu limite confortável', intermediate: 'Respiração profunda e ampla', advanced: 'Com pausa de 2s em cada fase' },
      { name: 'Alongamento em 90/90 para quadril', detail: '2 séries de 45 segundos cada lado', beginner: 'Tronco reto apoiando mãos', intermediate: 'Leve inclinação à frente', advanced: 'Troca de lado dinâmica e fluida' }
    ]
  },
  {
    id: 'b2',
    kind: 'workout',
    title: 'HIIT Express Queima Rápida',
    category: 'Bônus',
    month: 1,
    minutes: 15,
    level: 'Intermediário / Avançado',
    video: '/assets/treino-video-3.mp4',
    poster: '/assets/treino-poster-3.jpg',
    description: 'Sessão curta e intensa de queima calórica sem comprometer a massa muscular conquistada.',
    reviewer: 'Lara Castelli • Treinadora Especialista',
    exercises: [
      { name: 'Escalador na bancada / chão', detail: '4 blocos de 30s ativo por 30s descanso', beginner: 'Na bancada sem pressa', intermediate: 'No chão com cadência constante', advanced: 'Aceleração máxima no chão' },
      { name: 'Agachamento com salto leve', detail: '4 blocos de 20s ativo por 40s descanso', beginner: 'Sem salto, subindo na ponta dos pés', intermediate: 'Salto suave amortecido', advanced: 'Salto explosivo' }
    ]
  },
  {
    id: 'b3',
    kind: 'workout',
    title: 'Cardio Regenerativo',
    category: 'Bônus',
    month: 1,
    minutes: 20,
    level: 'Iniciante a Avançado',
    video: '/assets/treino-video-2.mp4',
    poster: '/assets/treino-poster-2.jpg',
    description: 'Treino cardiovascular de baixa intensidade e regeneração ativa para acelerar a circulação sem causar fadiga extrema.',
    reviewer: 'Lara Castelli • Treinadora Especialista',
    exercises: [
      { name: 'Passo alternado com elevação de joelho', detail: '3 minutos contínuos', beginner: 'Ritmo suave', intermediate: 'Ritmo constante', advanced: 'Braços ativos acima da cabeça' },
      { name: 'Caminhada dinâmica no lugar', detail: '3 minutos contínuos', beginner: 'Pisos macios ou tênis amortecido', intermediate: 'Movimento de braços coordenado', advanced: 'Alternando elevação rápida' }
    ]
  },

  // Guias "Comece Aqui" (Screenshot 1)
  {
    id: 'g1',
    kind: 'guide',
    title: 'Que bom ter você aqui',
    category: 'Comece aqui',
    description: 'Boas-vindas ao seu espaço exclusivo! Aqui você encontra tudo sobre a sua nova fase: seus treinos planejados mês a mês, a ficha interativa adaptável ao seu objetivo, orientações sobre alimentação saudável e acompanhamento direto da sua rotina.',
    reviewer: 'Lara Castelli • Treinadora Especialista'
  },
  {
    id: 'g2',
    kind: 'guide',
    title: 'Conheça a metodologia pós-emagrecimento',
    category: 'Comece aqui',
    description: 'Após emagrecer ou usar canetas emagrecedoras, o objetivo principal muda: não é mais perder peso a qualquer custo, e sim proteger e reconstruir massa muscular, sustentar o tônus da pele e estabelecer um metabolismo forte e autônomo. Nossos treinos foram desenhados especificamente para essa meta.',
    reviewer: 'Lara Castelli • Treinadora Especialista'
  },
  {
    id: 'g3',
    kind: 'guide',
    title: 'Faça sua avaliação e monte sua ficha',
    category: 'Comece aqui',
    description: 'Na aba "Ficha", defina se o seu foco agora é definição/emagrecimento ou ganho de massa magra, escolha se treinará 3, 4, 5 ou 6 dias na semana e siga o cronograma sugerido. Você tem total controle sobre seus dias de treino e descanso.',
    reviewer: 'Equipe Lara Castelli'
  },
  {
    id: 'g4',
    kind: 'guide',
    title: 'Canetas emagrecedoras: dúvidas e cuidados',
    category: 'Seu cuidado',
    description: 'O uso de canetas deve ser sempre supervisionado pelo seu médico assistente. Neste aplicativo, você pode registrar as datas e dosagens prescritas pelo seu profissional para nunca esquecer a aplicação, além de acompanhar eventuais sintomas ou efeitos colaterais.',
    reviewer: 'Lara Castelli • Treinadora Especialista'
  },

  // Receitas Práticas
  {
    id: 'r1',
    kind: 'recipe',
    title: 'Bowl Proteico de Iogurte com Frutas',
    category: 'Café da manhã',
    minutes: 5,
    description: 'Café da manhã rápido, saboroso e rico em proteínas de alta absorção para começar o dia nutrindo os músculos.',
    ingredients: ['170g de iogurte grego natural ou desnatado', '1 colher (sopa) de sementes de chia ou aveia em flocos', '1/2 xícara de frutas vermelhas (morangos ou mirtilos)', '1 scoop de proteína isolada (opcional)'],
    steps: ['Coloque o iogurte em uma tigela.', 'Se for usar proteína em pó, misture bem com o iogurte até homogeneizar.', 'Adicione a aveia e finalize com as frutas cortadas.'],
    emoji: '🥣'
  },
  {
    id: 'r2',
    kind: 'recipe',
    title: 'Omelete Cremoso com Legumes e Queijo Branco',
    category: 'Almoço e jantar',
    minutes: 12,
    description: 'Refeição nutritiva, rica em colina e proteínas completas com baixo carboidrato.',
    ingredients: ['2 ovos inteiros + 1 clara', '1/2 xícara de espinafre ou abobrinha picada', '1 fatia de queijo branco (minas frescal ou ricota)', '1 colher (café) de azeite de oliva e orégano'],
    steps: ['Bata os ovos e a clara em um prato com garfo e tempere com sal e orégano.', 'Aqueça uma frigideira antiaderente com um fio de azeite.', 'Despeje a mistura, acrescente os legumes e o queijo, cozinhe em fogo baixo até firmar e dobre ao meio.'],
    emoji: '🍳'
  },
  {
    id: 'r3',
    kind: 'recipe',
    title: 'Salada Refrescante com Frango Desfiado e Grão-de-bico',
    category: 'Almoço e jantar',
    minutes: 10,
    description: 'Combinação perfeita de fibras, saciedade prolongada e proteína magra.',
    ingredients: ['120g de peito de frango cozido e desfiado', '3 colheres (sopa) de grão-de-bico cozido', 'Folhas verdes higienizadas (rúcula e alface)', 'Tomate cereja e pepino picado', 'Azeite de oliva, limão e sal a gosto'],
    steps: ['Monte uma cama de folhas verdes na tigela.', 'Acrescente o tomate cereja e o pepino.', 'Disponha o frango desfiado e o grão-de-bico.', 'Regue com azeite de oliva e suco de meio limão fresco.'],
    emoji: '🥗'
  },

  // Notificações / Avisos
  {
    id: 'a1',
    kind: 'announcement',
    title: 'Bem-vinda à sua plataforma de treinos!',
    description: 'Aqui você tem acesso a todos os módulos de treinos em vídeo, ficha interativa e comunidade. Aproveite cada etapa da sua jornada!'
  }
];

export const blankState = () => ({
  profile: {
    name: '',
    frequency: 4,
    level: 'Iniciante',
    goal: 'Emagrecer',
    week: 1,
    waterGoal: 0,
    setupDone: false
  },
  completed: [],
  water: {},
  checkins: [],
  favorites: [],
  shopping: [],
  read: [],
  schedule: {},
  exerciseChecks: {},
  videoPositions: {},
  meals: [],
  applications: [],
  symptoms: [],
  supplements: []
});

export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function weekDays(offset = 0) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(x.getDate() + i);
    return {
      key: dateKey(x),
      day: ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'][i],
      number: x.getDate(),
      fullDay: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'][i]
    };
  });
}

export function suggestedDays(frequency = 4) {
  const map = {
    3: [0, 2, 4],
    4: [0, 1, 3, 4],
    5: [0, 1, 2, 3, 4],
    6: [0, 1, 2, 3, 4, 5]
  };
  return map[frequency] || [0, 2, 4];
}

// Sugestão de distribuição padrão compatível com o print ProFit e diferenciada por objetivo e mês
export function suggestedSchedule(frequency = 4, goal = 'Emagrecer', month = 1, week = 1) {
  const isMassa = goal === 'Massa Magra';
  const m = Number(month) || 1;
  const w = Number(week) || 1;

  // Seleciona os IDs de treinos correspondentes ao mês
  const wA = m === 2 ? 'w2_1' : m === 3 ? 'w3_1' : 'w1';
  const wB = m === 2 ? 'w2_2' : m === 3 ? 'w3_2' : 'w2';
  const wC = m === 2 ? 'w2_3' : m === 3 ? 'w3_3' : 'w3';
  const wD = m === 2 ? 'w2_4' : m === 3 ? 'w3_4' : 'w4';

  const mTag = `(Mês 0${m})`;

  if (frequency === 3) {
    if (isMassa) {
      return [
        { day: 'Segunda', workoutId: wB, label: `Inferiores • Ênfase Glúteos ${mTag}`, color: 'green' },
        { day: 'Terça', workoutId: '', label: 'Descanso / Síntese Proteica', color: 'muted' },
        { day: 'Quarta', workoutId: wD, label: `Superiores & Postura ${mTag}`, color: 'blue' },
        { day: 'Quinta', workoutId: '', label: 'Descanso / Síntese Proteica', color: 'muted' },
        { day: 'Sexta', workoutId: wA, label: `Fullbody Hipertrofia ${mTag}`, color: 'purple' },
        { day: 'Sábado', workoutId: '', label: 'Descanso', color: 'muted' },
        { day: 'Domingo', workoutId: '', label: 'Descanso', color: 'muted' }
      ];
    }
    return [
      { day: 'Segunda', workoutId: wA, label: `Treino A • Fullbody 1 ${mTag}`, color: 'purple' },
      { day: 'Terça', workoutId: '', label: 'Descanso Ativo', color: 'muted' },
      { day: 'Quarta', workoutId: wB, label: `Treino B • Inferiores ${mTag}`, color: 'green' },
      { day: 'Quinta', workoutId: '', label: 'Descanso Ativo', color: 'muted' },
      { day: 'Sexta', workoutId: wC, label: `Treino C • Fullbody 2 ${mTag}`, color: 'pink' },
      { day: 'Sábado', workoutId: '', label: 'Descanso', color: 'muted' },
      { day: 'Domingo', workoutId: '', label: 'Descanso', color: 'muted' }
    ];
  }

  if (frequency === 5) {
    if (isMassa) {
      return [
        { day: 'Segunda', workoutId: wB, label: `Inferiores (Quadríceps) ${mTag}`, color: 'green' },
        { day: 'Terça', workoutId: wD, label: `Superiores & Costas ${mTag}`, color: 'blue' },
        { day: 'Quarta', workoutId: wA, label: `Posteriores & Glúteos ${mTag}`, color: 'purple' },
        { day: 'Quinta', workoutId: 'b1', label: 'Mobilidade & Liberação', color: 'peach' },
        { day: 'Sexta', workoutId: wC, label: `Fullbody Densidade ${mTag}`, color: 'pink' },
        { day: 'Sábado', workoutId: '', label: 'Descanso', color: 'muted' },
        { day: 'Domingo', workoutId: '', label: 'Descanso', color: 'muted' }
      ];
    }
    return [
      { day: 'Segunda', workoutId: wA, label: `Fullbody 1 ${mTag}`, color: 'purple' },
      { day: 'Terça', workoutId: wB, label: `Inferiores & Glúteos ${mTag}`, color: 'green' },
      { day: 'Quarta', workoutId: wD, label: `Superiores & Postura ${mTag}`, color: 'blue' },
      { day: 'Quinta', workoutId: 'b2', label: 'HIIT Express Queima', color: 'lime' },
      { day: 'Sexta', workoutId: wC, label: `Fullbody 2 ${mTag}`, color: 'pink' },
      { day: 'Sábado', workoutId: '', label: 'Descanso', color: 'muted' },
      { day: 'Domingo', workoutId: '', label: 'Descanso', color: 'muted' }
    ];
  }

  if (frequency === 6) {
    if (isMassa) {
      return [
        { day: 'Segunda', workoutId: wB, label: `Inferiores A ${mTag}`, color: 'green' },
        { day: 'Terça', workoutId: wD, label: `Superiores A ${mTag}`, color: 'blue' },
        { day: 'Quarta', workoutId: wA, label: `Inferiores B ${mTag}`, color: 'purple' },
        { day: 'Quinta', workoutId: wC, label: `Superiores B ${mTag}`, color: 'pink' },
        { day: 'Sexta', workoutId: wB, label: `Glúteos Isolados ${mTag}`, color: 'green' },
        { day: 'Sábado', workoutId: 'b1', label: 'Mobilidade Articular', color: 'peach' },
        { day: 'Domingo', workoutId: '', label: 'Descanso Total', color: 'muted' }
      ];
    }
    return [
      { day: 'Segunda', workoutId: wA, label: `Fullbody 1 ${mTag}`, color: 'purple' },
      { day: 'Terça', workoutId: wB, label: `Inferiores & Glúteos ${mTag}`, color: 'green' },
      { day: 'Quarta', workoutId: wD, label: `Superiores ${mTag}`, color: 'blue' },
      { day: 'Quinta', workoutId: 'b2', label: 'HIIT Express', color: 'lime' },
      { day: 'Sexta', workoutId: wC, label: `Fullbody 2 ${mTag}`, color: 'pink' },
      { day: 'Sábado', workoutId: 'b1', label: 'Mobilidade', color: 'peach' },
      { day: 'Domingo', workoutId: '', label: 'Descanso', color: 'muted' }
    ];
  }

  // Padrão 4x por semana (Exatamente como Screenshot 5 do ProFit)
  if (isMassa) {
    return [
      { day: 'Segunda', workoutId: wB, label: `Inferiores • Foco Glúteos ${mTag}`, color: 'green' },
      { day: 'Terça', workoutId: wD, label: `Superiores & Braços ${mTag}`, color: 'blue' },
      { day: 'Quarta', workoutId: '', label: 'Descanso / Recuperação Muscular', color: 'muted' },
      { day: 'Quinta', workoutId: wA, label: `Inferiores • Posterior & Core ${mTag}`, color: 'purple' },
      { day: 'Sexta', workoutId: wC, label: `Superiores & Costas ${mTag}`, color: 'pink' },
      { day: 'Sábado', workoutId: '', label: 'Descanso', color: 'muted' },
      { day: 'Domingo', workoutId: '', label: 'Descanso', color: 'muted' }
    ];
  }
  return [
    { day: 'Segunda', workoutId: wA, label: `Treino A • Fullbody 1 ${mTag}`, color: 'purple' },
    { day: 'Terça', workoutId: wB, label: `Treino B • Inferiores ${mTag}`, color: 'green' },
    { day: 'Quarta', workoutId: '', label: 'Descanso Ativo', color: 'muted' },
    { day: 'Quinta', workoutId: wD, label: `Treino D • Superiores ${mTag}`, color: 'blue' },
    { day: 'Sexta', workoutId: wC, label: `Treino C • Fullbody 2 ${mTag}`, color: 'pink' },
    { day: 'Sábado', workoutId: '', label: 'Descanso', color: 'muted' },
    { day: 'Domingo', workoutId: '', label: 'Descanso', color: 'muted' }
  ];
}
