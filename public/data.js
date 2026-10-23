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
    reviewer: 'Dra. Lara Castelli • Fisiologia e Treinamento',
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
    reviewer: 'Dra. Lara Castelli • Fisiologia e Treinamento',
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
    reviewer: 'Dra. Lara Castelli • Fisiologia e Treinamento',
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
    reviewer: 'Dra. Lara Castelli • Fisiologia e Treinamento',
    instructions: 'Evite elevar os ombros em direção às orelhas durante os movimentos de puxada.',
    exercises: [
      { name: 'Desenvolvimento de ombros', detail: '3 séries de 12 repetições', beginner: '10 reps sem carga para padrão motor', intermediate: '12 reps com peso moderado', advanced: '15 reps com subida explosiva e descida em 3s' },
      { name: 'Tríceps no banco ou cadeira', detail: '3 séries de 10 repetições', beginner: '8 reps com joelhos dobrados a 90°', intermediate: '10 reps com pernas esticadas', advanced: '12 reps com pés elevados' },
      { name: 'Prancha lateral adaptada', detail: '3 séries de 20s por lado', beginner: 'Apoio de joelhos dobrados', intermediate: 'Apoio padrão nos pés', advanced: 'Com elevação da perna de cima' }
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
    reviewer: 'Equipe Lara Castelli',
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
    reviewer: 'Equipe Lara Castelli',
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
    reviewer: 'Equipe Lara Castelli',
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
    reviewer: 'Lara Castelli'
  },
  {
    id: 'g2',
    kind: 'guide',
    title: 'Conheça a metodologia pós-emagrecimento',
    category: 'Comece aqui',
    description: 'Após emagrecer ou usar canetas emagrecedoras, o objetivo principal muda: não é mais perder peso a qualquer custo, e sim proteger e reconstruir massa muscular, sustentar o tônus da pele e estabelecer um metabolismo forte e autônomo. Nossos treinos foram desenhados especificamente para essa meta.',
    reviewer: 'Dra. Lara Castelli'
  },
  {
    id: 'g3',
    kind: 'guide',
    title: 'Faça sua avaliação e monte sua ficha',
    category: 'Comece aqui',
    description: 'Na aba "Ficha", defina se o seu foco agora é definição/emagrecimento ou ganho de massa magra, escolha se treinará 3, 4, 5 ou 6 dias na semana e siga o cronograma sugerido. Você tem total controle sobre seus dias de treino e descanso.',
    reviewer: 'Equipe Técnica'
  },
  {
    id: 'g4',
    kind: 'guide',
    title: 'Canetas emagrecedoras: dúvidas e cuidados',
    category: 'Seu cuidado',
    description: 'O uso de canetas deve ser sempre supervisionado pelo seu médico assistente. Neste aplicativo, você pode registrar as datas e dosagens prescritas pelo seu profissional para nunca esquecer a aplicação, além de acompanhar eventuais sintomas ou efeitos colaterais.',
    reviewer: 'Dra. Lara Castelli'
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

// Sugestão de distribuição padrão compatível com o print ProFit
export function suggestedSchedule(frequency = 4, goal = 'Emagrecer') {
  if (frequency === 3) {
    return [
      { day: 'Segunda', workoutId: 'w1', label: 'Treino A (Fullbody 1)', color: 'purple' },
      { day: 'Terça', workoutId: '', label: 'Descanso', color: 'muted' },
      { day: 'Quarta', workoutId: 'w2', label: 'Treino B (Inferiores 1)', color: 'green' },
      { day: 'Quinta', workoutId: '', label: 'Descanso', color: 'muted' },
      { day: 'Sexta', workoutId: 'w3', label: 'Treino C (Fullbody 2)', color: 'pink' },
      { day: 'Sábado', workoutId: '', label: 'Descanso', color: 'muted' },
      { day: 'Domingo', workoutId: '', label: 'Descanso', color: 'muted' }
    ];
  }
  if (frequency === 5) {
    return [
      { day: 'Segunda', workoutId: 'w1', label: 'Treino A (Fullbody 1)', color: 'purple' },
      { day: 'Terça', workoutId: 'w2', label: 'Treino B (Inferiores)', color: 'green' },
      { day: 'Quarta', workoutId: 'w4', label: 'Treino D (Superiores)', color: 'blue' },
      { day: 'Quinta', workoutId: 'b1', label: 'Bônus (Mobilidade)', color: 'peach' },
      { day: 'Sexta', workoutId: 'w3', label: 'Treino C (Fullbody 2)', color: 'pink' },
      { day: 'Sábado', workoutId: '', label: 'Descanso', color: 'muted' },
      { day: 'Domingo', workoutId: '', label: 'Descanso', color: 'muted' }
    ];
  }
  if (frequency === 6) {
    return [
      { day: 'Segunda', workoutId: 'w1', label: 'Treino A (Fullbody 1)', color: 'purple' },
      { day: 'Terça', workoutId: 'w2', label: 'Treino B (Inferiores)', color: 'green' },
      { day: 'Quarta', workoutId: 'w4', label: 'Treino D (Superiores)', color: 'blue' },
      { day: 'Quinta', workoutId: 'b2', label: 'HIIT Express', color: 'lime' },
      { day: 'Sexta', workoutId: 'w3', label: 'Treino C (Fullbody 2)', color: 'pink' },
      { day: 'Sábado', workoutId: 'b1', label: 'Mobilidade', color: 'peach' },
      { day: 'Domingo', workoutId: '', label: 'Descanso', color: 'muted' }
    ];
  }
  // Padrão 4x por semana (Exatamente como Screenshot 5 do ProFit)
  return [
    { day: 'Segunda', workoutId: 'w1', label: 'Treino A (Fullbody 1)', color: 'purple' },
    { day: 'Terça', workoutId: 'w2', label: 'Treino B (Inferiores 1)', color: 'green' },
    { day: 'Quarta', workoutId: '', label: 'Descanso', color: 'muted' },
    { day: 'Quinta', workoutId: 'w4', label: 'Treino D (Superiores)', color: 'blue' },
    { day: 'Sexta', workoutId: 'w3', label: 'Treino C (Fullbody 2)', color: 'pink' },
    { day: 'Sábado', workoutId: '', label: 'Descanso', color: 'muted' },
    { day: 'Domingo', workoutId: '', label: 'Descanso', color: 'muted' }
  ];
}
