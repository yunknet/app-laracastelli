/* =====================================================================
   PROGRAMA DE TREINOS LARA CASTELLI — RECOMPOSIÇÃO 12 SEMANAS (FEMININO)
   ---------------------------------------------------------------------
   Este arquivo é a ÚNICA fonte dos treinos do app.
   - exerciseLibrary: cada exercício com "como fazer", cuidado e mídia.
   - templates: as fichas (quais exercícios, tipo e séries por nível).
   - O app gera automaticamente os 3 meses (fases) x 3 níveis.
   Para mudar um treino, edite aqui; não é preciso mexer no app.js.
   ===================================================================== */

/* ---------- 1. FASES (1 fase = 1 mês = 4 semanas) ---------- */
export const phases = {
  1: { name: 'Adaptação', weeks: '1 a 4', focus: 'aprender a técnica, preparar articulações e criar o hábito' },
  2: { name: 'Construção', weeks: '5 a 8', focus: 'aumentar o volume para construir músculo e firmeza' },
  3: { name: 'Definição', weeks: '9 a 12', focus: 'mais carga e intensidade para densidade muscular e contorno' }
};

// Faixas por fase. P = principal, A = acessório.
// rir = quantas repetições "sobram" no fim da série (pare antes da falha).
const prescriptions = {
  Academia: {
    P: { 1: { reps: '10 a 12', rir: 3 }, 2: { reps: '8 a 12', rir: 2 }, 3: { reps: '6 a 8', rir: 2 } },
    A: { 1: { reps: '12 a 15', rir: 3 }, 2: { reps: '10 a 15', rir: 2 }, 3: { reps: '8 a 12', rir: 1 } },
    rest: { P: '90 a 120 s', A: '60 a 90 s', C: '45 s' }
  },
  Casa: {
    P: { 1: { reps: '12 a 15', rir: 3 }, 2: { reps: '10 a 15, descendo em 3 s', rir: 2 }, 3: { reps: '8 a 12, descida em 3 s e pausa de 1 s embaixo', rir: 1 } },
    A: { 1: { reps: '12 a 15', rir: 3 }, 2: { reps: '12 a 15', rir: 2 }, 3: { reps: '10 a 15, com pausa de 1 s', rir: 1 } },
    rest: { P: '60 a 90 s', A: '45 a 60 s', C: '45 s' }
  }
};

/* ---------- 2. BIBLIOTECA DE EXERCÍCIOS ----------
   demo: caminho do vídeo/GIF curto de execução (ex.: '/assets/exercicios/agachamento-goblet.mp4').
   Deixe '' até ter a mídia; o app mostra o "Como fazer" em texto enquanto isso.
   core: prescrição fixa por fase para exercícios de tempo (prancha etc.).
   unilateral: true acrescenta "(cada lado)" na prescrição. */
export const exerciseLibrary = {
  'agachamento-goblet': {
    name: 'Agachamento goblet',
    equipment: 'Halter ou kettlebell (em casa: mochila com peso)',
    howTo: ['Segure o peso junto ao peito, pés na largura dos ombros e pontas levemente para fora.', 'Desça empurrando o quadril para trás e para baixo, joelhos acompanhando a direção dos pés.', 'Desça até onde mantiver a coluna reta e suba empurrando o chão com o pé inteiro.'],
    tip: 'Não deixe os joelhos caírem para dentro nem o calcanhar sair do chão.',
    demo: ''
  },
  'agachamento-sumo': {
    name: 'Agachamento sumô com halter',
    equipment: 'Halter ou mochila',
    howTo: ['Pés mais afastados que os ombros e pontas bem viradas para fora.', 'Segure o peso com os braços esticados entre as pernas.', 'Desça mantendo o tronco alto e suba apertando os glúteos.'],
    tip: 'Joelhos sempre na direção das pontas dos pés.',
    demo: ''
  },
  'leg-press': {
    name: 'Leg press 45°',
    equipment: 'Aparelho leg press',
    howTo: ['Costas e quadril bem apoiados, pés no meio da plataforma na largura do quadril.', 'Destrave e desça controlando até os joelhos formarem cerca de 90°.', 'Empurre a plataforma sem travar totalmente os joelhos no final.'],
    tip: 'Se o quadril descolar do banco, diminua a descida.',
    demo: ''
  },
  'bulgaro': {
    name: 'Agachamento búlgaro',
    equipment: 'Banco ou cadeira firme (halteres opcionais)',
    howTo: ['De costas para o banco, apoie o peito do pé de trás sobre ele.', 'Com o tronco levemente inclinado à frente, desça o joelho de trás em direção ao chão.', 'Suba empurrando com o calcanhar da perna da frente.'],
    tip: 'Tronco inclinado à frente trabalha mais o glúteo. Use apoio lateral se faltar equilíbrio.',
    unilateral: true,
    demo: ''
  },
  'afundo-tras': {
    name: 'Afundo para trás (passada atrás)',
    equipment: 'Peso corporal ou halteres',
    howTo: ['Em pé, dê um passo largo para trás.', 'Desça até o joelho de trás quase tocar o chão, tronco firme.', 'Volte à posição inicial empurrando com a perna da frente.'],
    tip: 'O joelho da frente não deve passar muito da ponta do pé.',
    unilateral: true,
    demo: ''
  },
  'afundo-halteres': {
    name: 'Passada com halteres',
    equipment: 'Halteres',
    howTo: ['Halteres ao lado do corpo, dê um passo à frente.', 'Desça os dois joelhos até cerca de 90°.', 'Empurre com a perna da frente e volte, alternando as pernas.'],
    tip: 'Passos mais longos trabalham mais glúteo; mais curtos, mais coxa.',
    unilateral: true,
    demo: ''
  },
  'elevacao-pelvica': {
    name: 'Elevação pélvica (barra ou máquina)',
    equipment: 'Banco + barra com protetor, ou máquina de glúteo',
    howTo: ['Apoie a parte de cima das costas no banco, barra sobre o quadril, pés firmes no chão.', 'Suba o quadril até o tronco ficar alinhado com as coxas, apertando os glúteos.', 'Segure 1 s no topo e desça controlando.'],
    tip: 'Queixo levemente para baixo e costelas fechadas: não arqueie a lombar no topo.',
    demo: ''
  },
  'elevacao-pelvica-chao': {
    name: 'Elevação pélvica no chão',
    equipment: 'Colchonete + halter ou mochila sobre o quadril',
    howTo: ['Deitada de barriga para cima, joelhos dobrados e pés no chão.', 'Apoie o peso sobre o quadril e suba até alinhar ombros, quadril e joelhos.', 'Aperte os glúteos no topo e desça devagar.'],
    tip: 'Empurre o chão com os calcanhares, não com as pontas dos pés.',
    demo: ''
  },
  'elevacao-pelvica-unilateral': {
    name: 'Elevação pélvica unilateral',
    equipment: 'Banco ou chão',
    howTo: ['Posição da elevação pélvica, com uma perna estendida no ar.', 'Suba o quadril empurrando com o calcanhar da perna apoiada.', 'Desça sem deixar o quadril girar para o lado.'],
    tip: 'Comece no chão; quando ficar fácil, apoie as costas no banco.',
    unilateral: true,
    demo: ''
  },
  'ponte-unilateral': {
    name: 'Ponte de glúteo unilateral',
    equipment: 'Colchonete',
    howTo: ['Deitada, um pé apoiado no chão e a outra perna estendida.', 'Suba o quadril apertando o glúteo da perna apoiada.', 'Segure 1 s em cima e desça devagar.'],
    tip: 'Quadril reto: não deixe um lado cair.',
    unilateral: true,
    demo: ''
  },
  'stiff-halteres': {
    name: 'Stiff com halteres',
    equipment: 'Halteres (em casa: mochila ou garrafas)',
    howTo: ['Em pé, joelhos levemente dobrados, pesos na frente das coxas.', 'Leve o quadril para trás deslizando os pesos rente às pernas, coluna reta.', 'Desça até sentir alongar a parte de trás da coxa e suba apertando os glúteos.'],
    tip: 'Movimento é de quadril, não de coluna. Se arredondar as costas, desça menos.',
    demo: ''
  },
  'mesa-flexora': {
    name: 'Mesa ou cadeira flexora',
    equipment: 'Aparelho flexor',
    howTo: ['Ajuste o rolo logo acima do calcanhar.', 'Dobre os joelhos trazendo os calcanhares em direção ao glúteo.', 'Volte devagar, sem deixar o peso bater.'],
    tip: 'Mantenha o quadril colado no banco.',
    demo: ''
  },
  'cadeira-extensora': {
    name: 'Cadeira extensora',
    equipment: 'Aparelho extensor',
    howTo: ['Costas apoiadas, rolo na frente do tornozelo, joelho alinhado ao eixo do aparelho.', 'Estique as pernas até quase travar.', 'Desça controlando em 2 a 3 s.'],
    tip: 'Com dor no joelho, faça só a metade final do movimento.',
    demo: ''
  },
  'cadeira-abdutora': {
    name: 'Cadeira abdutora',
    equipment: 'Aparelho abdutor',
    howTo: ['Sentada, costas apoiadas, almofadas por fora dos joelhos.', 'Abra as pernas o máximo que conseguir com controle.', 'Feche devagar, sem deixar o peso bater.'],
    tip: 'Inclinar levemente o tronco à frente aumenta o trabalho do glúteo.',
    demo: ''
  },
  'abducao-elastico': {
    name: 'Abdução com miniband',
    equipment: 'Miniband (elástico em faixa) acima dos joelhos',
    howTo: ['Sentada na beira da cadeira ou deitada de lado, elástico acima dos joelhos.', 'Abra os joelhos contra o elástico.', 'Volte devagar mantendo o elástico tenso.'],
    tip: 'O movimento é curto e controlado; o glúteo deve "queimar".',
    demo: ''
  },
  'coice-polia': {
    name: 'Coice na polia (glúteo no cabo)',
    equipment: 'Polia baixa com tornozeleira',
    howTo: ['De frente para a polia, tornozeleira presa, mãos apoiadas no aparelho.', 'Leve a perna para trás e um pouco para cima, joelho levemente dobrado.', 'Volte devagar sem encostar o peso.'],
    tip: 'Não arqueie a lombar: o quadril não deve girar.',
    unilateral: true,
    demo: ''
  },
  'coice-quatro-apoios': {
    name: 'Coice em quatro apoios',
    equipment: 'Colchonete (tornozeleira ou elástico opcional)',
    howTo: ['Em quatro apoios, mãos abaixo dos ombros e joelhos abaixo do quadril.', 'Empurre um pé em direção ao teto, joelho dobrado a 90°.', 'Desça sem encostar o joelho no chão.'],
    tip: 'Abdômen firme para a lombar não afundar.',
    unilateral: true,
    demo: ''
  },
  'panturrilha': {
    name: 'Panturrilha em pé',
    equipment: 'Aparelho de panturrilha ou degrau',
    howTo: ['Pontas dos pés na borda, calcanhares para fora.', 'Suba o máximo na ponta dos pés.', 'Desça devagar até alongar bem.'],
    tip: 'Pausa de 1 s em cima e embaixo.',
    demo: ''
  },
  'panturrilha-degrau': {
    name: 'Panturrilha unilateral no degrau',
    equipment: 'Degrau e apoio na parede',
    howTo: ['Um pé na borda do degrau, mão na parede para equilíbrio.', 'Suba na ponta do pé.', 'Desça abaixo do nível do degrau.'],
    tip: 'Movimento lento, sem quicar.',
    unilateral: true,
    demo: ''
  },
  'puxada-frontal': {
    name: 'Puxada frontal aberta',
    equipment: 'Aparelho de puxada (pulley)',
    howTo: ['Sentada, coxas presas, segure a barra um pouco mais aberta que os ombros.', 'Puxe a barra até a parte de cima do peito, levando os cotovelos para baixo.', 'Volte devagar até esticar os braços.'],
    tip: 'Ombros longe das orelhas e peito aberto. Não jogue o corpo para trás.',
    demo: ''
  },
  'puxada-triangulo': {
    name: 'Puxada com triângulo',
    equipment: 'Pulley com puxador triângulo',
    howTo: ['Segure o triângulo com as palmas viradas uma para a outra.', 'Puxe em direção ao peito, cotovelos rentes ao corpo.', 'Volte devagar.'],
    tip: 'Pegada mais confortável para quem sente o ombro.',
    demo: ''
  },
  'puxada-elastico': {
    name: 'Puxada no elástico',
    equipment: 'Elástico com alças preso no alto da porta',
    howTo: ['Ajoelhada ou sentada de frente para a porta, braços esticados segurando as alças.', 'Puxe os cotovelos para baixo e para trás em direção às costelas.', 'Volte devagar.'],
    tip: 'Aproxime-se ou afaste-se da porta para ajustar a dificuldade.',
    demo: ''
  },
  'remada-baixa': {
    name: 'Remada baixa sentada',
    equipment: 'Polia baixa ou máquina de remada',
    howTo: ['Sentada, pés apoiados, tronco reto.', 'Puxe o puxador até a barriga, levando os cotovelos para trás.', 'Junte as escápulas no final e volte devagar.'],
    tip: 'O tronco fica parado: quem puxa são as costas.',
    demo: ''
  },
  'remada-unilateral': {
    name: 'Remada unilateral com halter',
    equipment: 'Halter e banco',
    howTo: ['Apoie a mão e o joelho do mesmo lado no banco, costas retas.', 'Puxe o halter em direção ao quadril.', 'Desça até esticar o braço.'],
    tip: 'Imagine levar o cotovelo para o bolso de trás.',
    unilateral: true,
    demo: ''
  },
  'remada-curvada': {
    name: 'Remada curvada com halteres',
    equipment: 'Halteres ou mochila',
    howTo: ['Joelhos levemente dobrados, tronco inclinado à frente com coluna reta.', 'Puxe os pesos em direção à barriga.', 'Desça até esticar os braços.'],
    tip: 'Se a lombar cansar, apoie a testa ou o peito numa mesa.',
    demo: ''
  },
  'remada-elastico': {
    name: 'Remada no elástico',
    equipment: 'Elástico com alças preso na porta (altura do peito)',
    howTo: ['De frente para a porta, braços esticados segurando as alças.', 'Puxe os cotovelos para trás juntando as escápulas.', 'Volte devagar.'],
    tip: 'Ombros baixos durante todo o movimento.',
    demo: ''
  },
  'supino-maquina': {
    name: 'Supino na máquina',
    equipment: 'Máquina de supino (chest press)',
    howTo: ['Ajuste o banco para as pegadas ficarem na altura do meio do peito.', 'Empurre até quase esticar os braços.', 'Volte devagar até sentir o peito alongar.'],
    tip: 'Escápulas encostadas no banco.',
    demo: ''
  },
  'supino-inclinado-halteres': {
    name: 'Supino inclinado com halteres',
    equipment: 'Banco inclinado e halteres',
    howTo: ['Banco a cerca de 30°, halteres na altura do peito.', 'Empurre para cima aproximando os halteres.', 'Desça controlando até a linha do peito.'],
    tip: 'Cotovelos a cerca de 45° do corpo, não totalmente abertos.',
    demo: ''
  },
  'supino-chao': {
    name: 'Supino no chão com halteres',
    equipment: 'Halteres ou garrafas',
    howTo: ['Deitada, joelhos dobrados, halteres acima do peito.', 'Desça até os cotovelos tocarem levemente o chão.', 'Empurre para cima.'],
    tip: 'Ótima opção para quem sente o ombro em outros supinos.',
    demo: ''
  },
  'flexao-inclinada': {
    name: 'Flexão de braço inclinada',
    equipment: 'Mesa, bancada, sofá ou parede',
    howTo: ['Mãos apoiadas na borda, um pouco mais abertas que os ombros, corpo reto.', 'Desça o peito até perto da borda.', 'Empurre de volta mantendo o corpo em linha.'],
    tip: 'Quanto mais baixo o apoio, mais difícil. Progrida da parede para a mesa e depois para o chão.',
    demo: ''
  },
  'crucifixo-maquina': {
    name: 'Crucifixo na máquina (peck deck)',
    equipment: 'Máquina peck deck ou polia',
    howTo: ['Sentada, braços abertos na altura dos ombros, cotovelos levemente dobrados.', 'Feche os braços à frente do peito.', 'Abra devagar até sentir alongar.'],
    tip: 'Não deixe os ombros subirem.',
    demo: ''
  },
  'desenvolvimento-maquina': {
    name: 'Desenvolvimento na máquina',
    equipment: 'Máquina de desenvolvimento',
    howTo: ['Costas apoiadas, pegadas na altura dos ombros.', 'Empurre para cima sem travar os cotovelos.', 'Desça devagar até a altura das orelhas.'],
    tip: 'Abdômen firme para não arquear a lombar.',
    demo: ''
  },
  'desenvolvimento-halteres': {
    name: 'Desenvolvimento com halteres',
    equipment: 'Halteres',
    howTo: ['Sentada com encosto (ou em pé), halteres na altura das orelhas.', 'Empurre para cima aproximando os halteres.', 'Desça devagar.'],
    tip: 'Em pé, contraia glúteo e abdômen para proteger a lombar.',
    demo: ''
  },
  'elevacao-lateral': {
    name: 'Elevação lateral',
    equipment: 'Halteres leves ou elástico',
    howTo: ['Em pé, halteres ao lado do corpo, cotovelos levemente dobrados.', 'Eleve os braços para os lados até a altura dos ombros.', 'Desça devagar.'],
    tip: 'Carga leve e controle. Não balance o tronco.',
    demo: ''
  },
  'face-pull': {
    name: 'Face pull na polia',
    equipment: 'Polia alta com corda',
    howTo: ['Polia na altura do rosto, segure a corda com as palmas para baixo.', 'Puxe a corda em direção ao rosto abrindo os cotovelos para os lados.', 'Volte devagar.'],
    tip: 'Ótimo para postura e ombros saudáveis.',
    demo: ''
  },
  'face-pull-elastico': {
    name: 'Face pull no elástico',
    equipment: 'Elástico preso na porta na altura do rosto',
    howTo: ['De frente para a porta, segure o elástico com os braços esticados.', 'Puxe em direção ao rosto abrindo os cotovelos.', 'Volte devagar.'],
    tip: 'Ombros baixos e peito aberto.',
    demo: ''
  },
  'rosca-direta': {
    name: 'Rosca direta',
    equipment: 'Barra, halteres ou polia',
    howTo: ['Em pé, cotovelos colados ao corpo, palmas para frente.', 'Dobre os cotovelos levando o peso até os ombros.', 'Desça devagar até esticar.'],
    tip: 'Não balance o corpo para subir o peso.',
    demo: ''
  },
  'rosca-martelo': {
    name: 'Rosca martelo',
    equipment: 'Halteres ou garrafas',
    howTo: ['Em pé, palmas viradas para o corpo.', 'Dobre os cotovelos subindo os pesos.', 'Desça devagar.'],
    tip: 'Cotovelos parados ao lado do corpo.',
    demo: ''
  },
  'triceps-corda': {
    name: 'Tríceps na corda',
    equipment: 'Polia alta com corda',
    howTo: ['De frente para a polia, cotovelos colados ao corpo.', 'Estique os braços para baixo abrindo a corda no final.', 'Volte até os cotovelos formarem 90°.'],
    tip: 'Só o antebraço se move.',
    demo: ''
  },
  'triceps-frances': {
    name: 'Tríceps francês com halter',
    equipment: 'Halter ou garrafa',
    howTo: ['Sentada, segure o halter com as duas mãos acima da cabeça.', 'Desça o peso atrás da cabeça dobrando os cotovelos.', 'Estique os braços de volta.'],
    tip: 'Cotovelos apontando para frente, perto da cabeça.',
    demo: ''
  },
  'triceps-banco': {
    name: 'Tríceps no banco ou cadeira',
    equipment: 'Cadeira firme encostada na parede',
    howTo: ['Mãos na borda da cadeira, quadril à frente, joelhos dobrados.', 'Desça dobrando os cotovelos até cerca de 90°.', 'Empurre de volta.'],
    tip: 'Se incomodar o ombro, troque pelo tríceps francês.',
    demo: ''
  },
  'prancha': {
    name: 'Prancha',
    equipment: 'Colchonete',
    howTo: ['Antebraços no chão, cotovelos abaixo dos ombros.', 'Corpo reto da cabeça aos pés (ou aos joelhos, na versão facilitada).', 'Aperte abdômen e glúteos e respire normalmente.'],
    tip: 'Quadril não pode afundar nem subir.',
    core: { 1: '20 a 30 s', 2: '30 a 45 s', 3: '45 a 60 s' },
    demo: ''
  },
  'prancha-lateral': {
    name: 'Prancha lateral',
    equipment: 'Colchonete',
    howTo: ['Deitada de lado, apoie o antebraço com o cotovelo abaixo do ombro.', 'Suba o quadril até o corpo ficar reto.', 'Segure o tempo indicado e troque de lado.'],
    tip: 'Versão mais fácil: joelhos dobrados e apoiados.',
    core: { 1: '15 a 20 s', 2: '20 a 30 s', 3: '30 a 40 s' },
    unilateral: true,
    demo: ''
  },
  'dead-bug': {
    name: 'Dead bug',
    equipment: 'Colchonete',
    howTo: ['Deitada, braços para o teto e joelhos dobrados a 90° no ar.', 'Estique um braço para trás e a perna oposta para frente, sem tirar a lombar do chão.', 'Volte e troque de lado.'],
    tip: 'Devagar. A lombar fica colada no chão o tempo todo.',
    core: { 1: '6 por lado', 2: '8 por lado', 3: '10 por lado' },
    demo: ''
  },
  'pallof': {
    name: 'Pallof press',
    equipment: 'Polia ou elástico na altura do peito',
    howTo: ['De lado para a polia, segure o puxador junto ao peito.', 'Estique os braços à frente sem deixar o tronco girar.', 'Volte ao peito e repita; depois troque de lado.'],
    tip: 'Quanto mais longe da polia, mais difícil.',
    core: { 1: '8 por lado', 2: '10 por lado', 3: '12 por lado' },
    demo: ''
  },
  'abdominal-infra': {
    name: 'Abdominal infra (elevação de joelhos)',
    equipment: 'Colchonete',
    howTo: ['Deitada, mãos ao lado do corpo, joelhos dobrados no ar.', 'Leve os joelhos em direção ao peito tirando levemente o quadril do chão.', 'Desça devagar sem encostar os pés.'],
    tip: 'Sem impulso: o abdômen faz o trabalho.',
    core: { 1: '10 repetições', 2: '12 repetições', 3: '15 repetições' },
    demo: ''
  },
  'abdominal-polia': {
    name: 'Abdominal na polia',
    equipment: 'Polia alta com corda',
    howTo: ['Ajoelhada de frente para a polia, corda atrás da cabeça.', 'Enrole o tronco levando os cotovelos em direção às coxas.', 'Volte devagar.'],
    tip: 'O quadril fica parado; quem mexe é o tronco.',
    core: { 1: '10 repetições', 2: '12 repetições', 3: '15 repetições' },
    demo: ''
  },
  'cardio-bike': {
    name: 'Finalizador na bike ou elíptico',
    equipment: 'Bicicleta ergométrica ou elíptico',
    howTo: ['Pedale leve por 2 minutos para começar.', 'Siga os blocos de tempo indicados (forte / leve).', 'Termine com 2 minutos leves.'],
    tip: '"Forte" é um ritmo em que fica difícil falar frases inteiras.',
    cardio: { 1: '10 min contínuos em ritmo leve', 2: '6 blocos de 30 s forte + 90 s leve', 3: '8 blocos de 30 s forte + 90 s leve' },
    demo: ''
  },
  'cardio-casa': {
    name: 'Finalizador sem impacto',
    equipment: 'Nenhum',
    howTo: ['Marcha no lugar elevando os joelhos, alternando com polichinelo sem salto (passo lateral).', 'Siga os blocos de tempo indicados.', 'Termine com 1 minuto de caminhada leve no lugar.'],
    tip: 'Sem saltos: protege joelhos e assoalho pélvico.',
    cardio: { 1: '8 min contínuos em ritmo leve', 2: '6 blocos de 30 s forte + 60 s leve', 3: '8 blocos de 30 s forte + 60 s leve' },
    demo: ''
  }
};

/* ---------- 3. FICHAS ----------
   Cada item: [slug, tipo, [séries Iniciante, séries Intermediário]]
   tipo: 'P' principal, 'A' acessório, 'C' core, 'K' cardio.
   Avançada = Intermediário + 1 série nos exercícios principais (máximo 5). */
export const templates = [
  // ----- ACADEMIA -----
  {
    key: 'ac-fb-a', local: 'Academia', title: 'Full Body A • Glúteos e costas', poster: 1,
    focus: 'Corpo inteiro com ênfase em glúteos e costas.',
    items: [['agachamento-goblet', 'P', [3, 4]], ['elevacao-pelvica', 'P', [3, 4]], ['puxada-frontal', 'P', [3, 3]], ['supino-maquina', 'A', [2, 3]], ['cadeira-abdutora', 'A', [2, 3]], ['prancha', 'C', [2, 3]]]
  },
  {
    key: 'ac-fb-b', local: 'Academia', title: 'Full Body B • Posterior e ombros', poster: 2,
    focus: 'Corpo inteiro com ênfase em posterior de coxa, glúteos e ombros.',
    items: [['leg-press', 'P', [3, 4]], ['stiff-halteres', 'P', [3, 3]], ['remada-baixa', 'P', [3, 3]], ['desenvolvimento-maquina', 'A', [2, 3]], ['mesa-flexora', 'A', [2, 3]], ['coice-polia', 'A', [2, 3]], ['dead-bug', 'C', [2, 3]]]
  },
  {
    key: 'ac-fb-c', local: 'Academia', title: 'Full Body C • Pernas e braços', poster: 3,
    focus: 'Corpo inteiro com trabalho unilateral de pernas, glúteo médio e braços.',
    items: [['bulgaro', 'P', [2, 3]], ['puxada-triangulo', 'P', [3, 3]], ['cadeira-extensora', 'A', [2, 3]], ['cadeira-abdutora', 'A', [2, 3]], ['elevacao-lateral', 'A', [2, 3]], ['triceps-corda', 'A', [2, 2]], ['pallof', 'C', [2, 2]]]
  },
  {
    key: 'ac-inf-a', local: 'Academia', title: 'Inferior A • Foco em glúteos', poster: 1,
    focus: 'Glúteos e posterior de coxa.',
    items: [['elevacao-pelvica', 'P', [3, 4]], ['stiff-halteres', 'P', [3, 4]], ['bulgaro', 'A', [2, 3]], ['coice-polia', 'A', [2, 3]], ['cadeira-abdutora', 'A', [2, 3]], ['prancha', 'C', [2, 3]]]
  },
  {
    key: 'ac-sup-a', local: 'Academia', title: 'Superior A • Costas e ombros', poster: 4,
    focus: 'Costas, ombros e tríceps para postura e braços firmes.',
    items: [['puxada-frontal', 'P', [3, 4]], ['supino-inclinado-halteres', 'P', [3, 3]], ['remada-unilateral', 'A', [2, 3]], ['desenvolvimento-halteres', 'A', [2, 3]], ['elevacao-lateral', 'A', [2, 3]], ['triceps-corda', 'A', [2, 3]]]
  },
  {
    key: 'ac-inf-b', local: 'Academia', title: 'Inferior B • Foco em coxas', poster: 2,
    focus: 'Quadríceps, posterior e panturrilhas, com glúteo unilateral.',
    items: [['agachamento-goblet', 'P', [3, 4]], ['leg-press', 'P', [3, 4]], ['mesa-flexora', 'A', [2, 3]], ['cadeira-extensora', 'A', [2, 3]], ['elevacao-pelvica-unilateral', 'A', [2, 3]], ['panturrilha', 'A', [3, 3]], ['abdominal-infra', 'C', [2, 3]]]
  },
  {
    key: 'ac-sup-b', local: 'Academia', title: 'Superior B • Costas, braços e glúteo', poster: 4,
    focus: 'Costas, peito, bíceps e um finalizador de glúteo.',
    items: [['remada-baixa', 'P', [3, 4]], ['puxada-triangulo', 'A', [2, 3]], ['crucifixo-maquina', 'A', [2, 2]], ['face-pull', 'A', [2, 3]], ['rosca-direta', 'A', [2, 3]], ['cadeira-abdutora', 'A', [2, 3]]]
  },
  {
    key: 'ac-extra', local: 'Academia', title: 'Dia Extra • Glúteos e abdômen', poster: 3,
    focus: 'Volume extra de glúteos, abdômen e condicionamento.',
    items: [['elevacao-pelvica', 'P', [3, 4]], ['afundo-halteres', 'A', [2, 3]], ['coice-polia', 'A', [2, 3]], ['cadeira-abdutora', 'A', [3, 3]], ['abdominal-polia', 'C', [2, 3]], ['prancha-lateral', 'C', [2, 2]], ['cardio-bike', 'K', [1, 1]]]
  },
  // ----- CASA -----
  {
    key: 'ca-fb-a', local: 'Casa', title: 'Casa Full Body A • Glúteos e costas', poster: 1,
    focus: 'Corpo inteiro em casa com ênfase em glúteos e costas.',
    items: [['agachamento-goblet', 'P', [3, 4]], ['elevacao-pelvica-chao', 'P', [3, 4]], ['remada-curvada', 'P', [3, 3]], ['flexao-inclinada', 'A', [2, 3]], ['abducao-elastico', 'A', [2, 3]], ['prancha', 'C', [2, 3]]]
  },
  {
    key: 'ca-fb-b', local: 'Casa', title: 'Casa Full Body B • Posterior e ombros', poster: 2,
    focus: 'Corpo inteiro em casa com ênfase em posterior de coxa e ombros.',
    items: [['afundo-tras', 'P', [3, 3]], ['stiff-halteres', 'P', [3, 4]], ['remada-elastico', 'P', [3, 3]], ['desenvolvimento-halteres', 'A', [2, 3]], ['coice-quatro-apoios', 'A', [2, 3]], ['dead-bug', 'C', [2, 3]]]
  },
  {
    key: 'ca-fb-c', local: 'Casa', title: 'Casa Full Body C • Pernas e braços', poster: 3,
    focus: 'Corpo inteiro em casa com pernas unilaterais e braços.',
    items: [['bulgaro', 'P', [2, 3]], ['puxada-elastico', 'P', [3, 3]], ['ponte-unilateral', 'A', [2, 3]], ['elevacao-lateral', 'A', [2, 3]], ['rosca-martelo', 'A', [2, 3]], ['triceps-banco', 'A', [2, 2]], ['prancha-lateral', 'C', [2, 2]]]
  },
  {
    key: 'ca-inf-a', local: 'Casa', title: 'Casa Inferior A • Foco em glúteos', poster: 1,
    focus: 'Glúteos e posterior de coxa em casa.',
    items: [['elevacao-pelvica-chao', 'P', [3, 4]], ['stiff-halteres', 'P', [3, 4]], ['bulgaro', 'A', [2, 3]], ['coice-quatro-apoios', 'A', [2, 3]], ['abducao-elastico', 'A', [2, 3]], ['prancha', 'C', [2, 3]]]
  },
  {
    key: 'ca-sup-a', local: 'Casa', title: 'Casa Superior A • Costas e ombros', poster: 4,
    focus: 'Costas, peito, ombros e tríceps em casa.',
    items: [['remada-curvada', 'P', [3, 4]], ['flexao-inclinada', 'P', [3, 3]], ['desenvolvimento-halteres', 'A', [2, 3]], ['puxada-elastico', 'A', [2, 3]], ['elevacao-lateral', 'A', [2, 3]], ['triceps-frances', 'A', [2, 3]]]
  },
  {
    key: 'ca-inf-b', local: 'Casa', title: 'Casa Inferior B • Foco em coxas', poster: 2,
    focus: 'Coxas, glúteos e panturrilhas em casa.',
    items: [['agachamento-goblet', 'P', [3, 4]], ['afundo-tras', 'P', [3, 3]], ['agachamento-sumo', 'A', [2, 3]], ['ponte-unilateral', 'A', [2, 3]], ['panturrilha-degrau', 'A', [2, 3]], ['abdominal-infra', 'C', [2, 3]]]
  },
  {
    key: 'ca-sup-b', local: 'Casa', title: 'Casa Superior B • Costas, braços e glúteo', poster: 4,
    focus: 'Costas, peito, braços e um finalizador de glúteo em casa.',
    items: [['remada-elastico', 'P', [3, 4]], ['supino-chao', 'P', [3, 3]], ['face-pull-elastico', 'A', [2, 3]], ['rosca-martelo', 'A', [2, 3]], ['triceps-frances', 'A', [2, 2]], ['abducao-elastico', 'A', [2, 3]]]
  },
  {
    key: 'ca-extra', local: 'Casa', title: 'Casa Dia Extra • Glúteos e abdômen', poster: 3,
    focus: 'Volume extra de glúteos, abdômen e condicionamento sem impacto.',
    items: [['elevacao-pelvica-chao', 'P', [3, 4]], ['elevacao-pelvica-unilateral', 'A', [2, 3]], ['coice-quatro-apoios', 'A', [2, 3]], ['abducao-elastico', 'A', [3, 3]], ['abdominal-infra', 'C', [2, 3]], ['prancha-lateral', 'C', [2, 2]], ['cardio-casa', 'K', [1, 1]]]
  }
];

/* ---------- 4. CALENDÁRIO SEMANAL ----------
   Índices 0 = Segunda ... 6 = Domingo. */
export const weeklyPlans = {
  2: [[0, 'fb-a'], [3, 'fb-b']],
  3: [[0, 'fb-a'], [2, 'fb-b'], [4, 'fb-c']],
  4: [[0, 'inf-a'], [1, 'sup-a'], [3, 'inf-b'], [4, 'sup-b']],
  5: [[0, 'inf-a'], [1, 'sup-a'], [3, 'inf-b'], [4, 'sup-b'], [5, 'extra']]
};
export const allowedFrequencies = [2, 3, 4, 5];
export const clampFrequency = f => {
  const n = Number(f);
  return Number.isFinite(n) ? Math.min(5, Math.max(2, Math.round(n))) : 3;
};
export const localPrefix = local => (local === 'Casa' ? 'ca' : 'ac');
export const workoutId = (local, slot, month) => `${localPrefix(local)}-${slot}-m${month}`;

/* ---------- 5. GERADOR (não precisa editar) ---------- */
const PHASE3_EXTRA_SET_MAIN = 2; // +1 série nos 2 primeiros principais na Fase 3
const MAX_SETS = 5;

function setsFor(base, type, month, mainIndex) {
  let sets = base;
  if (month === 1 && type !== 'K') sets = Math.max(2, base - 1);
  if (month === 3 && type === 'P' && mainIndex < PHASE3_EXTRA_SET_MAIN) sets = base + 1;
  return Math.min(MAX_SETS, sets);
}

function line(lib, type, sets, local, month) {
  const rx = prescriptions[local];
  if (type === 'K') return lib.cardio[month];
  const side = lib.unilateral ? ' (cada lado)' : '';
  if (type === 'C') return `${sets} séries de ${lib.core[month]}${lib.unilateral && !/lado/.test(lib.core[month]) ? ' (cada lado)' : ''} • descanso ${rx.rest.C}`;
  const p = rx[type][month];
  const rirText = p.rir === 1 ? 'pare quando ainda conseguir mais 1' : `pare quando ainda conseguir mais ${p.rir}`;
  return `${sets} séries de ${p.reps} reps${side} • ${rirText} • descanso ${rx.rest[type]}`;
}

function estimateMinutes(exercises) {
  const setsTotal = exercises.reduce((s, e) => s + (e.sets || 0), 0);
  return Math.round(10 + setsTotal * 2.2);
}

const warmup = local => local === 'Casa'
  ? 'Aquecimento (8 min): 3 min de marcha no lugar, 10 rotações de quadril, 10 círculos de ombro e 8 agachamentos lentos sem peso. Faça 1 série leve de aproximação no primeiro exercício.'
  : 'Aquecimento (8 a 10 min): 3 a 5 min de bike ou esteira leve, 10 rotações de quadril, 10 círculos de ombro e 8 agachamentos lentos. No primeiro exercício, faça 1 série de 12 com metade da carga e 1 de 6 com 3/4 da carga.';

const rules = 'Como progredir: quando conseguir fazer o número máximo de repetições em todas as séries, aumente um pouco a carga no próximo treino. Técnica vem antes de carga. Sentiu dor na articulação, tontura ou mal-estar? Pare e use a versão mais leve.';

const deload = month => month === 3
  ? 'Semana 12 (última): semana leve com metade das séries e reteste de força e medidas.'
  : `Semana ${month * 4} (última do mês): semana leve, faça metade das séries com a mesma carga.`;

export function buildProgramWorkouts() {
  const out = [];
  for (const t of templates) {
    for (const month of [1, 2, 3]) {
      let mainIndex = 0;
      const exercises = t.items.map(([slug, type, [beg, inter]]) => {
        const lib = exerciseLibrary[slug];
        if (!lib) throw new Error(`Exercício sem cadastro na biblioteca: ${slug}`);
        const mi = type === 'P' ? mainIndex++ : 99;
        const sBeg = setsFor(beg, type, month, mi);
        const sInt = setsFor(inter, type, month, mi);
        const sAdv = type === 'P' ? Math.min(MAX_SETS, sInt + 1) : sInt;
        return {
          slug,
          type,
          name: lib.name,
          equipment: lib.equipment,
          detail: line(lib, type, sInt, t.local, month),
          beginner: line(lib, type, sBeg, t.local, month),
          intermediate: line(lib, type, sInt, t.local, month),
          advanced: line(lib, type, sAdv, t.local, month),
          howTo: lib.howTo,
          tip: lib.tip,
          demo: lib.demo || '',
          sets: sInt,
          setsByLevel: { Iniciante: sBeg, 'Intermediário': sInt, 'Avançado': sAdv }
        };
      });
      const ph = phases[month];
      out.push({
        id: `${t.key}-m${month}`,
        kind: 'workout',
        programKey: t.key,
        local: t.local,
        title: t.title,
        category: `Mês 0${month}`,
        month,
        phase: ph.name,
        minutes: estimateMinutes(exercises),
        level: 'Iniciante a Avançado',
        video: '',
        poster: `/assets/treino-poster-${t.poster}.jpg`,
        description: `${t.focus} Fase ${month} • ${ph.name} (semanas ${ph.weeks}): ${ph.focus}.`,
        instructions: `${warmup(t.local)}\n\n${rules}\n\n${deload(month)}`,
        reviewer: 'Equipe Lara Castelli',
        exercises
      });
    }
  }
  return out;
}

/* Posição da aluna no ciclo de 12 semanas a partir da data de início. */
export function programPosition(startDate, now = new Date()) {
  const unset = { week: 1, month: 1, weekInMonth: 1, deload: false, status: 'unconfigured' };
  if (typeof startDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(startDate) || Number.isNaN(now.getTime())) return unset;
  const [year, monthNumber, day] = startDate.split('-').map(Number);
  const start = new Date(Date.UTC(year, monthNumber - 1, day));
  if (start.getUTCFullYear() !== year || start.getUTCMonth() !== monthNumber - 1 || start.getUTCDate() !== day) return unset;
  // Compare calendar dates, so week boundaries do not depend on noon or DST.
  const current = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((current - start.getTime()) / 86400000);
  const week = Math.min(12, Math.max(1, Math.floor(days / 7) + 1));
  const month = Math.ceil(week / 4);
  const weekInMonth = week - (month - 1) * 4;
  const status = days < 0 ? 'not-started' : days >= 84 ? 'completed' : 'active';
  return { week, month, weekInMonth, deload: status === 'active' && weekInMonth === 4, status };
}
