// Catálogo Público dos 5 Bônus Exclusivos de Boas-Vindas (Liberação em 7 Dias)
// Método Lara Castelli • Apenas metadados de apresentação e prévia dos módulos.
// O conteúdo completo, passos detalhados e vídeos são protegidos no servidor via API.

export const BONUS_CATALOG = {
  'cintura-vacuo': {
    id: 'cintura-vacuo',
    title: 'Protocolo Cintura Fina & Vácuo Abdominal (LPF)',
    shortTitle: 'Cintura Fina & Vácuo',
    tagline: 'Reduza de 3 a 7 cm de cintura, ative o transverso profundo e combata a diástase com a técnica hipopressiva.',
    badge: 'Mais Escolhido 🔥',
    badgeColor: 'gold',
    emoji: '🧘‍♀️',
    category: 'Cintura & Postura',
    duration: '4 aulas práticas • 25 min',
    level: 'Todos os níveis',
    poster: '/assets/treino-poster-1.jpg',
    summary: 'O método hipopressivo reprograma a musculatura da parede abdominal interna através de pressão negativa e respiração diafragmática. Indicado para quem busca afinar a cintura, melhorar a postura e recuperar a firmeza abdominal sem impacto.',
    highlights: [
      'Redução de medidas sem esforço de flexão de tronco',
      'Ativação do músculo transverso (a "cinta natural" do corpo)',
      'Prevenção e melhora de diástase pós-parto e sobrepeso',
      'Descompressão de vértebras lombares e melhora postural'
    ],
    modulePreviews: [
      { num: 1, title: 'Fundamentos da Respiração Hipopressiva & Postura Neutra', duration: '6 min' },
      { num: 2, title: 'O Vácuo no Solo (Nível 1 - Posição Deitada)', duration: '7 min' },
      { num: 3, title: 'Vácuo em 4 Apoios & Sentada (Nível 2 - Construção)', duration: '6 min' },
      { num: 4, title: 'Rotina Matinal de 5 Minutos (Checklist de 21 Dias)', duration: '6 min' }
    ]
  },

  'anti-flacidez': {
    id: 'anti-flacidez',
    title: 'Manual SOS Anti-Flacidez: Resgate de Firmeza Muscular',
    shortTitle: 'SOS Anti-Flacidez',
    tagline: 'Protocolo de blindagem dérmica e tônus para quem perde peso rápido (com ou sem caneta), combatendo a flacidez.',
    badge: 'Firmeza & Pele 🌟',
    badgeColor: 'emerald',
    emoji: '💧',
    category: 'Nutrição & Tônus',
    duration: 'Guia completo + Vídeos práticos',
    level: 'Todos os níveis',
    poster: '/assets/treino-poster-2.jpg',
    summary: 'A perda acelerada de peso e a restrição calórica severa podem degradar colágeno e músculo antes da gordura. Este manual fornece a estratégia exata de aminoácidos, hidratação celular e estímulo de força para que sua pele acompanhe o novo corpo com máxima firmeza.',
    highlights: [
      'Como evitar o temido "rosto de Ozempic" e flacidez nos braços',
      'As 4 regras de ouro da distribuição proteica na síntese de colágeno',
      'Suplementação precisa com comprovação científica (Creatina + Peptídeos)',
      'Receita do Shot Firmador Matinal com antioxidantes'
    ],
    modulePreviews: [
      { num: 1, title: 'O Efeito Déficit Acelerado e a Flacidez da Pele', duration: '7 min' },
      { num: 2, title: 'As 4 Regras de Ouro da Síntese Proteica Diária', duration: '8 min' },
      { num: 3, title: 'Guia de Suplementação Inteligente com Evidência', duration: '6 min' },
      { num: 4, title: 'Shot Firmador Matinal & Hidratação Intracelular', duration: '5 min' }
    ]
  },

  'gluteos-3d': {
    id: 'gluteos-3d',
    title: 'Acelerador de Glúteos 3D: Bumbum Firme em 10 Minutos',
    shortTitle: 'Acelerador Glúteos 3D',
    tagline: 'Protocolo de isolamento e ativação muscular profunda para empinar, modelar e preencher os glúteos sem dores nos joelhos.',
    badge: 'Hipertrofia Feminina 🍑',
    badgeColor: 'purple',
    emoji: '🍑',
    category: 'Glúteos & Tônus',
    duration: 'Circuito de 10 min • 4 módulos',
    level: 'Iniciante a Avançado',
    poster: '/assets/treino-poster-3.jpg',
    summary: 'A maioria das mulheres sofre de "amnésia glútea" por ficar horas sentada, fazendo a coxa e a lombar compensarem nos treinos. Este acelerador reativa o glúteo médio, mínimo e máximo com técnicas de tempo sob tensão e isometria de alta intensidade.',
    highlights: [
      'Acorde glúteos adormecidos antes que a coxa roube o trabalho',
      'Treino express de 10 minutos para fazer em casa ou na academia',
      'Técnica Time Under Tension (TUT) sem necessidade de sobrecargas pesadas',
      'Cronograma semanal para somar à sua ficha atual sem sobretreino'
    ],
    modulePreviews: [
      { num: 1, title: 'Desbloqueio da Amnésia Glútea & Conexão Mente-Músculo', duration: '5 min' },
      { num: 2, title: 'O Circuito Pump Express 3D (10 Minutos)', duration: '7 min' },
      { num: 3, title: 'Técnica Time Under Tension (Cadência 3-1-1)', duration: '5 min' },
      { num: 4, title: 'Calendário de Aplicação Semanal', duration: '4 min' }
    ]
  },

  'fim-de-semana': {
    id: 'fim-de-semana',
    title: 'Manual Fim de Semana Sem Culpa: Comer Fora sem Engordar',
    shortTitle: 'Fim de Semana Sem Culpa',
    tagline: 'O guia antibloqueio metabólico para aproveitar pizzarias, japoneses, churrascos e vinho mantendo o emagrecimento.',
    badge: 'Vida Social & Equilíbrio 🍷',
    badgeColor: 'rose',
    emoji: '🍽️',
    category: 'Nutrição Comportamental',
    duration: 'Manual de Bolso + Guia de Escolhas',
    level: 'Todos os níveis',
    poster: '/assets/rotina.png',
    summary: 'Ninguém sustenta um estilo de vida se tiver que se isolar socialmente. Este manual prático ensina o jogo das compensações inteligentes, permitindo que você aproveite saídas e taças de vinho com a família e amigos sem travar a balança na segunda-feira.',
    highlights: [
      'Cardápio de escolhas inteligentes em Pizzaria, Japonês, Churrasco e Italiano',
      'Como beber vinho ou drinks sem bloquear a oxidação de gorduras',
      'Receita do Shot Anti-Estufamento para a manhã seguinte',
      'Protocolo de Segunda-Feira: como eliminar a retenção hídrica em 48h'
    ],
    modulePreviews: [
      { num: 1, title: 'O Guia dos Restaurantes: Escolhas Inteligentes', duration: '7 min' },
      { num: 2, title: 'Álcool Consciente: Como Beber sem Bloquear a Queima', duration: '6 min' },
      { num: 3, title: 'O Shot Anti-Estufamento do Dia Seguinte', duration: '5 min' },
      { num: 4, title: 'Protocolo de Segunda-Feira (Reset Metabólico)', duration: '5 min' }
    ]
  },

  'queima-acelerada': {
    id: 'queima-acelerada',
    title: 'Desafio Queima Acelerada: Destrave Metabólico de 7 Dias',
    shortTitle: 'Queima Acelerada 7D',
    tagline: 'Protocolo de choque metabólico para quebrar o efeito platô, acelerar o gasto calórico e queimar gordura resistente.',
    badge: 'Destrave Turbo ⚡',
    badgeColor: 'lime',
    emoji: '🔥',
    category: 'Metabolismo & Queima',
    duration: 'Desafio de 7 dias • 4 módulos',
    level: 'Intermediário a Avançado',
    poster: '/assets/treino-poster-4.jpg',
    summary: 'Quando o corpo se acostuma com a rotina de treinos e dieta, ele entra em modo de conservação energética e o peso na balança trava. Este desafio utiliza picos metabólicos curtos de 7 minutos e infusões botânicas termogênicas para forçar o organismo a destravar a queima calórica.',
    highlights: [
      'Quebre a adaptação metabólica que estaciona o emagrecimento',
      'Treino Tabata Metabolic Finisher de 7 minutos (alta queima residual)',
      'Blend de Chá Termogênico Seca-Tudo 100% natural',
      'Checklist diário de 7 dias com metas simples e transformadoras'
    ],
    modulePreviews: [
      { num: 1, title: 'O Choque Metabólico e a Quebra da Termogênese Adaptativa', duration: '6 min' },
      { num: 2, title: 'O Treino Tabata Metabolic Finisher (7 Minutos)', duration: '8 min' },
      { num: 3, title: 'O Blend Termogênico Seca-Tudo (Infusão Natural)', duration: '5 min' },
      { num: 4, title: 'Checklist Diário do Desafio (7 Dias de Metas)', duration: '5 min' }
    ]
  }
};
