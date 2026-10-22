import { demoContent, blankState, dateKey, weekDays, suggestedSchedule } from './data.js';

const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const paths = {
  home: 'M3 10 12 3l9 7v11h-6v-7H9v7H3z',
  training: 'M7 8v8M4 9v6m13-7v8m3-7v6M7 12h10',
  ficha: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4',
  food: 'M12 3a9 9 0 1 0 9 9h-9V3Zm3 0v6h6a8 8 0 0 0-6-6',
  community: 'M21 11a8 8 0 0 1-8 8H6l-4 3 1-7a8 8 0 1 1 18-4Z',
  profile: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-3a8 8 0 0 1 16 0v3',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  back: 'M19 12H5m6 6-6-6 6-6',
  check: 'm5 12 4 4L20 5',
  play: 'm9 5 11 7-11 7Z',
  water: 'M12 2S4 11 4 15a8 8 0 0 0 16 0c0-4-8-13-8-13Z',
  calendar: 'M4 5h16v16H4ZM8 2v6m8-6v6M4 10h16',
  book: 'M12 5C8 2 4 3 2 4v16c3-2 6-2 10 0 4-2 7-2 10 0V4c-3-1-6-2-10 1Zm0 0v15',
  heart: 'M20 5c-3-3-7-1-8 2-1-3-5-5-8-2-5 5 8 15 8 15S25 10 20 5Z',
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2',
  close: 'm6 6 12 12M6 18 18 6',
  plus: 'M12 4v16M4 12h16',
  logout: 'M9 3H3v18h6m5-15 6 6-6 6M8 12h12',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',
  camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  progress: 'm4 17 5-5 4 3 7-10M4 4v16h17',
  eye: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  'eye-off': 'M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20'
};

const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.book}"/></svg>`;
const brand = () => `<a class="brand" href="#home"><img src="/assets/mark.svg" alt="Lara Castelli"><div><strong>Lara Castelli</strong><small>PROFIT • SEU CUIDADO</small></div></a>`;

const navs = [
  ['home', 'Início', 'home'],
  ['training', 'Treinos', 'training'],
  ['ficha', 'Ficha', 'ficha'],
  ['food', 'Alimentação', 'food'],
  ['community', 'Comunidade', 'community'],
  ['profile', 'Perfil', 'profile']
];

let demo = sessionStorage.getItem('lara-demo') === '1';
let user = null;
let state = blankState();
let content = [];
let posts = [];
let tickets = [];
let page = 'home';
let activeWorkoutId = null;
let activeLessonTab = 'pratica'; // 'instrucoes' ou 'pratica'
let currentMonth = 1;
let currentWeek = 1;
let search = '';
let saveQueue = Promise.resolve();

// Cronômetros de Treino e Descanso (Screenshots 3 e 4)
let timerInterval = null;
let timerType = null; // 'work' ou 'rest'
let timerSeconds = 0;
let toastId;

const isDemo = () => demo;

async function api(url, method = 'GET', body) {
  const r = await fetch('/api' + url, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined
  });
  if (!r.ok) {
    let error;
    try { error = (await r.json()).error; } catch {}
    throw new Error(error || 'Não foi possível concluir a solicitação.');
  }
  return r.json();
}

function toast(message) {
  clearTimeout(toastId);
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('visible');
  toastId = setTimeout(() => el.classList.remove('visible'), 3500);
}

function loadDemo() {
  try {
    state = { ...blankState(), ...JSON.parse(localStorage.getItem('lara-demo-state') || '{}') };
    posts = JSON.parse(localStorage.getItem('lara-demo-posts') || '[]');
  } catch {
    state = blankState();
    posts = [];
  }
  user = { id: 'demo', name: 'Aluna Visitante', role: 'demo' };
  content = structuredClone(demoContent);
}

async function save() {
  if (demo) {
    try {
      localStorage.setItem('lara-demo-state', JSON.stringify(state));
    } catch {
      toast('Não foi possível salvar localmente.');
    }
    return;
  }
  const snapshot = structuredClone(state);
  saveQueue = saveQueue.catch(() => {}).then(() => api('/state', 'PUT', snapshot));
  return saveQueue;
}

const workouts = () => content.filter(c => c.kind === 'workout');
const recipes = () => content.filter(c => c.kind === 'recipe');
const guides = () => content.filter(c => c.kind === 'guide');
const byId = id => content.find(c => c.id === id);
const name = () => state.profile.name || user?.name || 'Aluna';
const today = () => dateKey();
const niceDate = k => new Date(k + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

/* ========================================================
   RENDERIZADOR PRINCIPAL
   ======================================================== */
function render() {
  const hash = location.hash.slice(1) || 'home';
  if (hash.startsWith('workout')) {
    const params = new URLSearchParams(hash.split('?')[1] || '');
    activeWorkoutId = params.get('id') || workouts()[0]?.id;
    page = 'workout';
  } else {
    page = hash;
  }

  if (!user) {
    renderLogin();
    return;
  }

  $('#app').innerHTML = `
    <aside class="sidebar">
      ${brand()}
      <p class="nav-label">MENU PRINCIPAL</p>
      <nav class="nav">
        ${navs.map(([id, label, iconName]) => `
          <a href="#${id}" class="${page === id ? 'active' : ''}">
            ${icon(iconName)}
            ${label}
          </a>
        `).join('')}
        ${user.role === 'admin' ? `
          <a href="#admin" class="${page === 'admin' ? 'active' : ''}">
            ${icon('settings')}
            Administração
          </a>
        ` : ''}
      </nav>
      <div class="sidebar-bottom">
        <div class="support-card">
          <h3>Espaço da Aluna</h3>
          <p>Dúvidas sobre os treinos ou adaptações? Fale conosco.</p>
          <a href="#care">Enviar mensagem ↗</a>
        </div>
      </div>
    </aside>

    <div class="shell">
      <header class="topbar">
        <div class="mobile-brand">${brand()}</div>
        <div class="top-title">Lara Castelli &nbsp;/&nbsp; <b>${pageTitle()}</b></div>
        <div class="tools">
          <form class="search" data-form="search">
            ${icon('search')}
            <input name="q" placeholder="Buscar no app" value="${esc(search)}">
          </form>
          <a class="icon-btn" href="#notifications" aria-label="Notificações">
            ${icon('bell')}
            ${content.some(c => c.kind === 'announcement' && !state.read.includes(c.id)) ? '<i class="badge-dot"></i>' : ''}
          </a>
          <a class="user-pill" href="#profile">
            <span class="avatar">${esc(name().slice(0, 2).toUpperCase())}</span>
            <div>
              <strong>${esc(name().split(' ')[0])}</strong>
              <small>${state.profile.level || 'Iniciante'}</small>
            </div>
          </a>
        </div>
      </header>

      ${demo ? `
        <div class="demo-bar">
          <span>MODO DEMONSTRAÇÃO • CONTEÚDOS E PRÉVIAS VISUAIS</span>
          <button data-action="logout">Entrar na minha conta</button>
        </div>
      ` : ''}

      <main class="main" id="main">
        ${pageContent()}
      </main>
    </div>

    <!-- Barra de Navegação Inferior Mobile (Screenshots 1, 2, 5) -->
    <nav class="bottomnav" aria-label="Menu Mobile">
      <a href="#home" class="${page === 'home' ? 'active' : ''}">
        ${icon('home')}
        Início
      </a>
      <a href="#training" class="${page === 'training' || page === 'workout' ? 'active' : ''}">
        ${icon('training')}
        Treinos
      </a>
      <a href="#ficha" class="${page === 'ficha' ? 'active' : ''}">
        ${icon('ficha')}
        Ficha
      </a>
      <a href="#community" class="${page === 'community' ? 'active' : ''}">
        ${icon('community')}
        Comunidade
      </a>
      <a href="#profile" class="${page === 'profile' ? 'active' : ''}">
        ${icon('profile')}
        Perfil
      </a>
    </nav>
  `;

  if (page === 'community') refreshPosts();
  if (page === 'care') refreshTickets();
  if (page === 'admin') refreshAdmin();
}

function pageTitle() {
  switch (page) {
    case 'home': return 'Início';
    case 'training': return 'Seus Treinos';
    case 'ficha': return 'Ficha Interativa';
    case 'workout': return 'Player de Treino';
    case 'food': return 'Alimentação';
    case 'progress': return 'Minha Evolução';
    case 'care': return 'Espaço da Aluna';
    case 'community': return 'Comunidade';
    case 'profile': return 'Meu Perfil';
    case 'admin': return 'Administração';
    default: return 'Lara Castelli';
  }
}

function renderLogin() {
  $('#app').innerHTML = `
    <div class="login">
      <section class="login-art">
        <img src="/assets/rotina.png" alt="Lara Castelli">
        ${brand()}
        <div class="copy">
          <h1>Defina seu corpo sem abrir mão da sua vida.</h1>
          <p>O método completo de treino e cuidado para a sua nova fase pós-emagrecimento.</p>
        </div>
      </section>
      <section class="login-form">
        <div>
          <p class="eyebrow">ÁREA EXCLUSIVA DE MEMBROS</p>
          <h2 style="font-size: 26px; font-weight: 800; margin: 8px 0 6px;">Que bom ter você aqui.</h2>
          <p class="muted" style="font-size: 13px; margin-bottom: 24px;">Entre para acessar seus treinos e fichas.</p>
          <form data-form="login">
            ${formField('Seu e-mail de compra', 'email', 'email', '', 'required autocomplete="username" placeholder="seuemail@exemplo.com"')}
            ${formField('Sua senha', 'password', 'password', '', 'required autocomplete="current-password" placeholder="Sua senha de acesso"')}
            <p class="error" id="login-error"></p>
            <button class="btn full" type="submit">Entrar no app ${icon('arrow')}</button>
          </form>
        </div>
      </section>
    </div>
  `;
}

function formField(label, name, type = 'text', value = '', extra = '') {
  if (type === 'password') {
    return `
      <label class="field password-field">
        <span>${label}</span>
        <div class="password-wrap">
          <input name="${name}" type="password" value="${esc(value)}" ${extra}>
          <button type="button" class="btn-toggle-pw" data-action="toggle-pw" aria-label="Mostrar ou ocultar senha">
            ${icon('eye')}
          </button>
        </div>
      </label>
    `;
  }
  return `<label class="field"><span>${label}</span><input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
}

function pageContent() {
  switch (page) {
    case 'home': return homeView();
    case 'training': return trainingView();
    case 'ficha': return fichaView();
    case 'workout': return workoutPlayerView();
    case 'food': return foodView();
    case 'progress': return progressView();
    case 'care': return careView();
    case 'community': return communityView();
    case 'notifications': return notificationsView();
    case 'profile': return profileView();
    case 'admin': return adminView();
    case 'search': return searchView();
    default: return homeView();
  }
}

/* ========================================================
   TELA INÍCIO (Estilo ProFit / Netflix - Screenshot 1)
   ======================================================== */
function homeView() {
  const completedCount = state.completed.filter(c => weekDays().some(d => d.key === c.date)).length;
  const water = state.water[today()] || 0;
  const firstWorkout = workouts()[0];

  return `
    <!-- Hero Banner Promocional / Próximo Treino -->
    <div class="hero-card">
      <div>
        <span class="hero-tag">✦ Exclusivo sistema de treinos</span>
        <h1>Defina seu corpo sem abrir mão da sua vida</h1>
        <p>Acompanhamento progressivo e ficha adaptada para sustentar o tônus muscular e a firmeza da pele.</p>
        <a href="#workout?id=${firstWorkout?.id || 'w1'}" class="btn lime">
          Iniciar treino de hoje ${icon('play')}
        </a>
      </div>
      <div class="hero-photo">
        <img src="/assets/rotina.png" alt="Lara Castelli">
      </div>
    </div>

    <!-- Indicadores Rápidos -->
    <div class="quick-row">
      <div class="quick-card">
        <div class="quick-icon green">${icon('training')}</div>
        <div class="quick-info">
          <strong>${completedCount} / ${state.profile.frequency || 4}</strong>
          <small>Treinos na semana</small>
        </div>
      </div>
      <div class="quick-card">
        <div class="quick-icon blue">${icon('water')}</div>
        <div class="quick-info">
          <strong>${(water / 1000).toLocaleString('pt-BR')} L</strong>
          <small>Água hoje <button data-action="quick-water" style="color:var(--green); font-weight:700; margin-left:6px;">+ 250ml</button></small>
        </div>
      </div>
      <div class="quick-card">
        <div class="quick-icon peach">${icon('heart')}</div>
        <div class="quick-info">
          <strong>${state.profile.goal || 'Emagrecer'}</strong>
          <small>Foco do plano atual</small>
        </div>
      </div>
    </div>

    <!-- NETFLIX RAIL 1: Comece aqui (Screenshot 1) -->
    <section class="netflix-rail">
      <div class="rail-head">
        <div>
          <h2>Comece aqui</h2>
          <p>Tudo o que você precisa saber antes de começar os treinos</p>
        </div>
      </div>
      <div class="rail-track">
        ${guides().filter(g => g.category === 'Comece aqui').map(g => `
          <button class="rail-card-guide" data-action="open-guide" data-id="${g.id}">
            <div>
              <span class="guide-tag">Introdução</span>
              <h3 class="guide-title">${esc(g.title)}</h3>
            </div>
            <span class="guide-action">Acessar ${icon('arrow')}</span>
          </button>
        `).join('')}
      </div>
    </section>

    <!-- NETFLIX RAIL 2: Seu treino mensal (Screenshot 2) -->
    <section class="netflix-rail">
      <div class="rail-head">
        <div>
          <h2>Seu treino mensal</h2>
          <p>Planejamento completo com vídeo explicativo e ficha interativa</p>
        </div>
        <a href="#training">Ver todos ↗</a>
      </div>
      <div class="rail-track">
        ${[1, 2, 3].map(m => `
          <button class="rail-card-poster" data-action="select-month" data-id="${m}">
            <img src="/assets/treino-poster-${m}.jpg" alt="Mês 0${m}">
            <div class="poster-overlay">
              <span class="poster-tag">Mês 0${m}</span>
              <strong class="poster-title">Fase ${m === 1 ? 'Adaptação' : m === 2 ? 'Construção' : 'Definição'}</strong>
              <small class="poster-sub">${m === 1 ? '4 aulas ativas' : 'Planejamento progressivo'}</small>
            </div>
            <div class="poster-play">${icon('play')}</div>
          </button>
        `).join('')}
      </div>
    </section>

    <!-- NETFLIX RAIL 3: Bônus & Especiais (Screenshot 2) -->
    <section class="netflix-rail">
      <div class="rail-head">
        <div>
          <h2>Bônus</h2>
          <p>Mais conteúdos para variar os treinos e complementar seus meses</p>
        </div>
      </div>
      <div class="rail-track">
        ${workouts().filter(w => w.category === 'Bônus').map(w => `
          <button class="rail-card-wide" data-action="open-workout" data-id="${w.id}">
            <div class="card-media">
              <img src="${w.poster}" alt="${esc(w.title)}">
              <span class="pill-badge">${esc(w.title.split(' ')[0])}</span>
            </div>
            <div class="card-body">
              <h3 class="card-title">${esc(w.title)}</h3>
              <p class="card-sub">${w.minutes} min • ${esc(w.level)}</p>
            </div>
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

/* ========================================================
   TELA TREINOS / BIBLIOTECA (Screenshot 2)
   ======================================================== */
function trainingView() {
  const currentWorkouts = workouts().filter(w => (w.month || 1) === currentMonth && w.category !== 'Bônus');
  const bonusWorkouts = workouts().filter(w => w.category === 'Bônus');

  return `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 24px; font-weight: 800;">Biblioteca de Treinos</h1>
      <p style="font-size: 13px; color: var(--muted); margin-top: 4px;">Escolha o mês e acesse suas aulas em vídeo com ficha interativa.</p>
    </div>

    <!-- Seletor de Mês (Pílulas) -->
    <div class="pill-group" style="margin-bottom: 28px;">
      ${[1, 2, 3].map(m => `
        <button class="${currentMonth === m ? 'active' : ''}" data-action="set-month" data-id="${m}">
          Mês 0${m}
        </button>
      `).join('')}
    </div>

    <!-- Trilho de Aulas do Mês -->
    <section class="netflix-rail">
      <div class="rail-head">
        <div>
          <h2>Aulas do Mês 0${currentMonth}</h2>
          <p>Vídeos guiados com cronômetro e ficha por nível</p>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px;">
        ${currentWorkouts.map(w => `
          <button class="rail-card-wide" style="flex: auto;" data-action="open-workout" data-id="${w.id}">
            <div class="card-media" style="height: 140px;">
              <img src="${w.poster}" alt="${esc(w.title)}">
              <span class="pill-badge">${esc(w.category)}</span>
            </div>
            <div class="card-body">
              <h3 class="card-title">${esc(w.title)}</h3>
              <p class="card-sub">${w.minutes} min • ${esc(w.level)}</p>
            </div>
          </button>
        `).join('')}
      </div>
    </section>

    <!-- Trilho de Bônus -->
    <section class="netflix-rail" style="margin-top: 36px;">
      <div class="rail-head">
        <div>
          <h2>Aulas Bônus & Complementares</h2>
          <p>Treinos rápidos para acelerar seus resultados</p>
        </div>
      </div>
      <div class="rail-track">
        ${bonusWorkouts.map(w => `
          <button class="rail-card-wide" data-action="open-workout" data-id="${w.id}">
            <div class="card-media">
              <img src="${w.poster}" alt="${esc(w.title)}">
              <span class="pill-badge">${esc(w.title.split(' ')[0])}</span>
            </div>
            <div class="card-body">
              <h3 class="card-title">${esc(w.title)}</h3>
              <p class="card-sub">${w.minutes} min • ${esc(w.level)}</p>
            </div>
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

/* ========================================================
   FICHA INTERATIVA (Screenshot 5 ProFit)
   ======================================================== */
function fichaView() {
  const goal = state.profile.goal || 'Emagrecer';
  const frequency = state.profile.frequency || 4;
  const schedule = suggestedSchedule(frequency, goal);

  return `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 24px; font-weight: 800;">Ficha Interativa • Mês 01</h1>
      <p style="font-size: 13px; color: var(--muted); margin-top: 4px;">Adaptada ao seu nível, objetivo e frequência semanal de treinos.</p>
    </div>

    <div class="ficha-view">
      <!-- Filtros da Ficha (Screenshot 5) -->
      <div class="ficha-filters">
        <!-- Objetivo: Emagrecer vs Massa Magra -->
        <div class="pill-group">
          <button class="${goal === 'Emagrecer' ? 'active' : ''}" data-action="set-goal" data-id="Emagrecer">
            Emagrecer
          </button>
          <button class="${goal === 'Massa Magra' ? 'active' : ''}" data-action="set-goal" data-id="Massa Magra">
            Massa magra
          </button>
        </div>

        <!-- Dropdown de Semana -->
        <div class="week-select-pill">
          <span>Semana ${currentWeek}</span>
          ${icon('arrow')}
        </div>

        <!-- Frequência: 3x, 4x, 5x, 6x sem -->
        <div class="pill-group">
          ${[3, 4, 5, 6].map(f => `
            <button class="${frequency === f ? 'active' : ''}" data-action="set-frequency" data-id="${f}">
              ${f}x sem
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Tabela Semanal de Treinos (Screenshot 5) -->
      <div class="schedule-table">
        ${schedule.map(item => `
          <div class="schedule-item">
            <div class="day-title">${item.day}</div>
            <div>
              ${item.workoutId ? `
                <a href="#workout?id=${item.workoutId}" class="workout-badge ${item.color}">
                  ${item.label} ↗
                </a>
              ` : `
                <span class="workout-badge muted">
                  Descanso
                </span>
              `}
            </div>
          </div>
        `).join('')}
      </div>

      <div style="margin-top: 24px; padding: 16px; background: #fafbf9; border-radius: var(--radius-md); font-size: 12px; color: var(--muted); line-height: 1.6;">
        💡 <b>Como funciona:</b> Toque em qualquer aula da sua semana para abrir o vídeo com a execução correta e a contagem de descanso guiada.
      </div>
    </div>
  `;
}

/* ========================================================
   PLAYER DE TREINO & AULA DEDICADA (Screenshots 3 e 4)
   ======================================================== */
function workoutPlayerView() {
  const workout = byId(activeWorkoutId) || workouts()[0];
  if (!workout) return `<div class="empty"><h3>Treino indisponível</h3><a href="#training" class="btn">Voltar aos treinos</a></div>`;

  const isCompletedToday = state.completed.some(c => c.id === workout.id && c.date === today());

  return `
    <div class="player-view">
      <!-- Barra Superior da Aula (Screenshot 3) -->
      <div class="player-topbar">
        <a href="#training" class="btn-back">
          ${icon('back')}
          Voltar
        </a>
        <div style="font-size: 13px; font-weight: 700; color: var(--muted);">
          ${esc(workout.title)}
        </div>
        <div style="width: 40px;"></div>
      </div>

      <!-- Seletor de Lições (Screenshot 3) -->
      <div class="lesson-accordion">
        <div class="lesson-item ${activeLessonTab === 'instrucoes' ? 'active' : ''}" data-action="set-lesson-tab" data-id="instrucoes" style="cursor: pointer;">
          <span>⚪ ${esc(workout.title)} • Instruções</span>
          ${icon('arrow')}
        </div>
        <div class="lesson-item ${activeLessonTab === 'pratica' ? 'active' : ''}" data-action="set-lesson-tab" data-id="pratica" style="cursor: pointer;">
          <span>🟢 ${esc(workout.title)} • Prática Guiada</span>
          ${icon('play')}
        </div>
      </div>

      <!-- Player de Vídeo com PIP e Cronômetro (Screenshots 3 e 4) -->
      <div class="video-wrapper">
        <video id="workout-video" controls playsinline preload="metadata" src="${workout.video}" poster="${workout.poster}"></video>
        
        <!-- PIP Adaptação Iniciante/Avançado (Screenshot 3 e 4) -->
        <div class="video-pip" title="Demonstração alternativa adaptada">
          <img src="/assets/treino-poster-2.jpg" alt="Adaptação">
          <span>Iniciante</span>
        </div>

        <!-- Overlay do Cronômetro Interativo (Screenshot 4) -->
        <div class="timer-overlay" id="timer-box" style="display: none;">
          <div id="rest-icon" style="display: none;">
            ${icon('water', 'timer-bottle-icon')}
          </div>
          <div class="timer-countdown" id="timer-display">0:10</div>
          <div class="timer-msg" id="timer-label">EXECUÇÃO</div>
          <div class="timer-controls">
            <button class="btn lime" data-action="timer-toggle">Pausar</button>
            <button class="btn light" data-action="timer-close">Fechar cronômetro</button>
          </div>
        </div>
      </div>

      <!-- Ações da Lição (Screenshot 3) -->
      <div class="lesson-actions">
        <button class="btn-complete ${isCompletedToday ? 'done' : ''}" data-action="toggle-complete" data-id="${workout.id}">
          ${icon('check')}
          ${isCompletedToday ? 'Aula concluída hoje' : 'Marcar como concluída'}
        </button>

        <div style="display: flex; gap: 8px;">
          <button class="btn light" data-action="start-timer" data-seconds="10" data-type="work" title="Iniciar contagem">
            ⏱ Cronômetro
          </button>
          <button class="btn light" data-action="start-timer" data-seconds="30" data-type="rest" title="Tempo de descanso">
            💧 Descanso
          </button>
        </div>
      </div>

      <!-- Detalhes e Ficha da Aula (Screenshot 3) -->
      <div class="lesson-details">
        <div class="accordion-box">
          <div class="accordion-header">
            <span>📋 Ficha de Exercícios da Aula</span>
            <span class="tag green">${state.profile.level || 'Iniciante'}</span>
          </div>
          <div class="accordion-body">
            ${(workout.exercises || []).map((e, i) => `
              <label class="exercise-row">
                <input type="checkbox" data-exercise="${workout.id}:${today()}:${i}" ${state.exerciseChecks[`${workout.id}:${today()}:${i}`] ? 'checked' : ''}>
                <div>
                  <strong>${esc(e.name)}</strong>
                  <small>${esc((state.profile.level === 'Iniciante' ? e.beginner : state.profile.level === 'Intermediário' ? e.intermediate : e.advanced) || e.detail)}</small>
                </div>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="accordion-box">
          <div class="accordion-header">
            <span>📖 Sobre este Conteúdo</span>
            ${icon('arrow')}
          </div>
          <div class="accordion-body">
            <p>${esc(workout.description)}</p>
            ${workout.reviewer ? `<p style="font-size: 11px; color: var(--muted); margin-top: 12px;"><b>Responsável:</b> ${esc(workout.reviewer)}</p>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ========================================================
   OUTRAS TELAS: ALIMENTAÇÃO, COMUNIDADE, PERFIL, ADMIN
   ======================================================== */
function foodView() {
  return `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 24px; font-weight: 800;">Alimentação & Nutrição</h1>
      <p style="font-size: 13px; color: var(--muted); margin-top: 4px;">Receitas práticas e proteicas pensadas para a sua recuperação.</p>
    </div>

    <section class="netflix-rail">
      <div class="rail-head">
        <h2>Receitas Rápidas</h2>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px;">
        ${recipes().map(r => `
          <div class="rail-card-wide" style="flex: auto;">
            <div class="card-media" style="display: grid; place-items: center; font-size: 44px; background: #f6f8f2;">
              ${r.emoji || '🥣'}
            </div>
            <div class="card-body">
              <span class="tag green" style="font-size: 9px; margin-bottom: 4px;">${esc(r.category)}</span>
              <h3 class="card-title">${esc(r.title)}</h3>
              <p class="card-sub">${r.minutes} min de preparo</p>
              <button class="btn light full" style="margin-top: 10px; font-size: 11px; min-height: 36px;" data-action="open-recipe" data-id="${r.id}">
                Ver ingredientes
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function communityView() {
  return `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 24px; font-weight: 800;">Comunidade</h1>
      <p style="font-size: 13px; color: var(--muted); margin-top: 4px;">Compartilhe sua rotina, conquistas e evolução com outras alunas.</p>
    </div>

    <form data-form="post" class="card" style="margin-bottom: 24px;">
      <label class="field">
        <span>Como foi seu dia ou treino de hoje?</span>
        <textarea name="body" placeholder="Compartilhe uma vitória, foto ou dica…" required maxlength="2000"></textarea>
      </label>
      <div style="display: flex; justify-content: flex-end;">
        <button class="btn">Publicar na comunidade</button>
      </div>
    </form>

    <div id="posts" style="display: flex; flex-direction: column; gap: 16px;"></div>
  `;
}

async function refreshPosts() {
  try {
    if (!demo) posts = await api('/posts');
    const container = $('#posts');
    if (!container) return;
    container.innerHTML = posts.map(p => `
      <div class="card" style="padding: 18px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
          <span class="avatar">${esc(p.name.slice(0, 2).toUpperCase())}</span>
          <div>
            <strong>${esc(p.name)}</strong>
            <small style="display: block; color: var(--muted); font-size: 11px;">${new Date(p.created_at).toLocaleDateString('pt-BR')}</small>
          </div>
        </div>
        <p style="font-size: 14px; line-height: 1.6; margin-bottom: 14px;">${esc(p.body)}</p>
        <div style="display: flex; gap: 16px; align-items: center; border-top: 1px solid var(--line); padding-top: 10px;">
          <button data-action="like" data-id="${p.id}" style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: ${p.liked ? '#d4493b' : 'var(--muted)'};">
            ${icon('heart')} ${p.likes || 0} curtidas
          </button>
        </div>
      </div>
    `).join('') || `<div class="empty"><h3>Seja a primeira a publicar!</h3></div>`;
  } catch (e) {
    toast(e.message);
  }
}

function notificationsView() {
  return `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 24px; font-weight: 800;">Notificações & Avisos</h1>
      <p style="font-size: 13px; color: var(--muted); margin-top: 4px;">Recados e orientações da equipe da Lara Castelli.</p>
    </div>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${content.filter(c => c.kind === 'announcement').map(a => `
        <div class="card" style="padding: 18px;">
          <span class="tag green" style="font-size: 9px; margin-bottom: 6px;">COMUNICADO</span>
          <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 6px;">${esc(a.title)}</h3>
          <p style="font-size: 13px; color: var(--muted); line-height: 1.6;">${esc(a.description)}</p>
        </div>
      `).join('')}
    </div>
  `;
}

function profileView() {
  return `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 24px; font-weight: 800;">Meu Perfil</h1>
      <p style="font-size: 13px; color: var(--muted); margin-top: 4px;">Personalize suas preferências de treino e metas.</p>
    </div>

    <form data-form="profile" class="card" style="max-width: 600px; margin-bottom: 24px;">
      <h3 style="margin-bottom: 16px;">Seus Dados de Treino</h3>
      ${formField('Como quer ser chamada?', 'name', 'text', name(), 'required')}
      
      <label class="field">
        <span>Objetivo principal</span>
        <select name="goal">
          <option value="Emagrecer" ${state.profile.goal === 'Emagrecer' ? 'selected' : ''}>Emagrecer e Definir</option>
          <option value="Massa Magra" ${state.profile.goal === 'Massa Magra' ? 'selected' : ''}>Ganho de Massa Magra</option>
          <option value="Criar rotina" ${state.profile.goal === 'Criar rotina' ? 'selected' : ''}>Criar uma rotina constante</option>
        </select>
      </label>

      <label class="field">
        <span>Nível de treino</span>
        <select name="level">
          <option value="Iniciante" ${state.profile.level === 'Iniciante' ? 'selected' : ''}>Iniciante (voltando a treinar)</option>
          <option value="Intermediário" ${state.profile.level === 'Intermediário' ? 'selected' : ''}>Intermediário</option>
          <option value="Avançado" ${state.profile.level === 'Avançado' ? 'selected' : ''}>Avançado</option>
        </select>
      </label>

      <label class="field">
        <span>Frequência semanal</span>
        <select name="frequency">
          <option value="3" ${state.profile.frequency === 3 ? 'selected' : ''}>3 dias por semana</option>
          <option value="4" ${state.profile.frequency === 4 ? 'selected' : ''}>4 dias por semana (Recomendado)</option>
          <option value="5" ${state.profile.frequency === 5 ? 'selected' : ''}>5 dias por semana</option>
          <option value="6" ${state.profile.frequency === 6 ? 'selected' : ''}>6 dias por semana</option>
        </select>
      </label>

      <button class="btn" style="margin-top: 8px;">Salvar alterações</button>
    </form>

    <div class="card" style="max-width: 600px;">
      <h3 style="margin-bottom: 12px;">Sua Conta</h3>
      <p style="font-size: 13px; color: var(--muted); margin-bottom: 16px;">E-mail cadastrado: <b>${esc(user?.email || 'Demonstração')}</b></p>
      <button class="btn light" data-action="logout">
        ${icon('logout')} Sair da conta
      </button>
    </div>
  `;
}

function progressView() {
  const completedCount = state.completed?.length || 0;
  const totalWater = Object.values(state.water || {}).reduce((a, b) => a + b, 0);

  return `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 24px; font-weight: 800;">Minha Evolução & Progresso</h1>
      <p style="font-size: 13px; color: var(--muted); margin-top: 4px;">Acompanhe sua transformação física, registros e fotos.</p>
    </div>

    <div class="quick-row" style="margin-bottom: 24px;">
      <div class="quick-card">
        <span class="quick-sub">Total de Treinos</span>
        <strong class="quick-val">${completedCount} concluídos</strong>
      </div>
      <div class="quick-card">
        <span class="quick-sub">Água Ingerida</span>
        <strong class="quick-val">${(totalWater / 1000).toFixed(1)} Litros</strong>
      </div>
      <div class="quick-card">
        <span class="quick-sub">Frequência Atual</span>
        <strong class="quick-val">${state.profile.frequency || 4}x por semana</strong>
      </div>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3 style="font-size: 16px; font-weight: 800;">Galeria de Evolução Privada</h3>
          <p style="font-size: 12px; color: var(--muted);">Suas fotos antes/depois ficam 100% privadas na sua conta.</p>
        </div>
        <button class="btn" data-action="open-photos">
          ${icon('camera')} Gerenciar Fotos
        </button>
      </div>
    </div>

    <div class="card">
      <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 12px;">Histórico de Check-ins</h3>
      ${state.checkins?.length ? `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${state.checkins.slice().reverse().map(c => `
            <div style="padding: 12px; background: var(--paper); border-radius: 8px; font-size: 13px;">
              <div style="display: flex; justify-content: space-between; font-weight: 700;">
                <span>${niceDate(c.date)}</span>
                <span style="color: var(--green);">${c.weight ? c.weight + ' kg' : ''}</span>
              </div>
              ${c.note ? `<p style="color: var(--muted); margin-top: 4px;">${esc(c.note)}</p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : `
        <p style="font-size: 13px; color: var(--muted);">Nenhum check-in registrado ainda. Clique em Check-in na página inicial para começar.</p>
      `}
    </div>
  `;
}

function careView() {
  return `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 24px; font-weight: 800;">Espaço da Aluna & Dúvidas</h1>
      <p style="font-size: 13px; color: var(--muted); margin-top: 4px;">Envie perguntas sobre adaptações dos treinos e orientações de rotina.</p>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 12px;">Falar com a Equipe Dra. Lara Castelli</h3>
      <form data-form="ticket">
        <label class="field">
          <span>Sua dúvida ou mensagem</span>
          <textarea name="body" required rows="3" placeholder="Ex: Sinto um pouco de enjoo no dia seguinte da aplicação da caneta. Devo treinar mais leve?" style="width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 12px; font-size: 13px;"></textarea>
        </label>
        <button class="btn" style="margin-top: 8px;">Enviar Mensagem</button>
      </form>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 16px;">Minhas Mensagens</h3>
      <div id="tickets-list">
        <div class="empty"><h3>Carregando mensagens...</h3></div>
      </div>
    </div>

    <div class="card">
      <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 12px;">Orientações Rápidas & FAQ</h3>
      <div style="display: flex; flex-direction: column; gap: 14px; font-size: 13px; line-height: 1.6; color: var(--ink);">
        <div>
          <strong>• Treino no dia da aplicação da caneta:</strong>
          <p style="color: var(--muted);">Priorize treinos de menor impacto ou mobilidade (como o Bônus de Mobilidade) caso sinta fadiga nas primeiras 24 horas.</p>
        </div>
        <div>
          <strong>• Hidratação obrigatória:</strong>
          <p style="color: var(--muted);">A perda rápida de peso requer ingestão mínima de 35ml a 40ml de água por quilo de peso corporal para proteger os rins e manter a elasticidade da pele.</p>
        </div>
        <div>
          <strong>• Consumo de proteínas:</strong>
          <p style="color: var(--muted);">Para não perder massa muscular (flacidez pós-caneta), garanta pelo menos 1,6g de proteína por kg ao longo do dia.</p>
        </div>
      </div>
    </div>
  `;
}

async function refreshTickets() {
  try {
    tickets = demo ? JSON.parse(localStorage.getItem('lara-demo-tickets') || '[]') : await api('/tickets');
    const container = $('#tickets-list');
    if (!container) return;
    if (!tickets.length) {
      container.innerHTML = `<div class="empty"><h3>Nenhuma mensagem ainda</h3><p>Envie sua primeira dúvida acima para a nossa equipe.</p></div>`;
      return;
    }
    container.innerHTML = tickets.map(t => `
      <div class="card" style="margin-bottom: 12px; padding: 16px; background: var(--paper);">
        <p style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">${esc(t.body)}</p>
        <small style="color: var(--muted);">${new Date(t.created_at || Date.now()).toLocaleDateString('pt-BR')}</small>
        ${t.reply ? `
          <div style="margin-top: 10px; padding: 12px; background: var(--lime-soft); border-radius: 8px; border-left: 3px solid var(--green);">
            <strong style="font-size: 12px; color: var(--green); display: block; margin-bottom: 4px;">Resposta da Equipe Lara Castelli:</strong>
            <p style="font-size: 12px; line-height: 1.5;">${esc(t.reply)}</p>
          </div>
        ` : `
          <div style="margin-top: 8px;">
            <span class="tag" style="font-size: 10px;">Aguardando resposta da Dra. Lara</span>
          </div>
        `}
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

async function showPhotos() {
  photos = demo ? JSON.parse(localStorage.getItem('lara-demo-photos') || '[]') : await api('/photos');
  showModal('Minha Evolução por Fotos', `
    <p style="font-size: 12px; color: var(--muted); margin-bottom: 16px;">
      ${demo ? 'Fotos de teste ficam apenas neste navegador.' : 'Fotos individuais são 100% privadas, acessíveis somente pela sua conta.'}
      Formatos: JPEG, PNG ou WebP (até 4 MB).
    </p>
    <form data-form="photo" style="margin-bottom: 20px;">
      <label class="field">
        <span>Data da foto</span>
        <input name="date" type="date" value="${today()}" max="${today()}" required>
      </label>
      <label class="field">
        <span>Selecionar foto</span>
        <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" required>
      </label>
      <button class="btn full" style="margin-top: 10px;">Guardar Foto</button>
    </form>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px;">
      ${photos.map(p => `
        <div class="card" style="padding: 8px; text-align: center;">
          <img src="${demo ? p.data : '/api/photos/' + p.id}" alt="Registro de ${esc(p.date)}" style="width: 100%; height: 130px; object-fit: cover; border-radius: 8px;">
          <small style="display: block; margin: 6px 0; font-weight: 700;">${niceDate(p.date)}</small>
          <button class="btn light" style="font-size: 10px; min-height: 28px; padding: 4px 8px; width: 100%;" data-action="remove-photo" data-id="${p.id}">Excluir</button>
        </div>
      `).join('')}
    </div>
  `);
}

function adminView() {
  if (user?.role !== 'admin') return `<div class="empty"><h3>Acesso restrito à administração.</h3></div>`;
  return `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 24px; font-weight: 800;">Painel de Administração</h1>
      <p style="font-size: 13px; color: var(--muted); margin-top: 4px;">Gerencie conteúdos, alunas e liberação de acessos.</p>
    </div>

    <div class="quick-row" style="margin-bottom: 24px;">
      <button class="btn" data-action="admin-new-user">
        ${icon('plus')} Cadastrar Aluna / Gerar Acesso
      </button>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <h3 style="margin-bottom: 12px;">Integração Automática com Checkout</h3>
      <p style="font-size: 13px; color: var(--muted); line-height: 1.6;">
        Para criar alunas automaticamente após o pagamento (Hotmart, Kiwify, Eduzz, Stripe, Kirvano, etc.), configure o Webhook da plataforma para:
      </p>
      <code style="display: block; background: #20352a; color: var(--lime); padding: 12px; border-radius: 8px; font-size: 12px; margin: 12px 0;">
        POST https://app.laracastelli.mivaia.com/api/webhook/checkout
      </code>
      <small style="color: var(--muted);">O webhook cadastra a aluna no PostgreSQL imediatamente com status ativo e senha provisória.</small>
    </div>

    <div id="admin-user-list"></div>
  `;
}

async function refreshAdmin() {
  try {
    const users = await api('/admin/users');
    const container = $('#admin-user-list');
    if (!container) return;
    container.innerHTML = `
      <div class="card">
        <h3 style="margin-bottom: 16px;">Alunas Cadastradas (${users.length})</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${users.map(u => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--line);">
              <div>
                <strong>${esc(u.name)}</strong>
                <small style="display: block; color: var(--muted);">${esc(u.email)} • ${u.role === 'admin' ? 'Administrador' : u.active ? 'Acesso Ativo' : 'Suspenso'}</small>
              </div>
              ${u.id !== user.id ? `
                <div style="display: flex; gap: 8px;">
                  <button class="btn light" style="font-size: 11px; min-height: 32px; padding: 6px 12px;" data-action="toggle-user" data-id="${u.id}">
                    ${u.active ? 'Suspender' : 'Ativar'}
                  </button>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (e) {
    toast(e.message);
  }
}

function searchView() {
  const results = content.filter(c => (c.title + ' ' + c.description).toLowerCase().includes(search.toLowerCase()));
  return `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 24px; font-weight: 800;">Resultados para "${esc(search)}"</h1>
    </div>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${results.map(r => `
        <button class="card" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; text-align: left;" data-action="${r.kind === 'workout' ? 'open-workout' : 'open-guide'}" data-id="${r.id}">
          <div>
            <span class="tag green" style="font-size: 9px;">${esc(r.kind)}</span>
            <h3 style="font-size: 14px; margin-top: 4px;">${esc(r.title)}</h3>
          </div>
          ${icon('arrow')}
        </button>
      `).join('') || `<div class="empty"><h3>Nenhum resultado encontrado.</h3></div>`}
    </div>
  `;
}

/* ========================================================
   CRONÔMETRO INTERATIVO (Screenshots 3 e 4)
   ======================================================== */
function startWorkoutTimer(seconds, type = 'work') {
  clearInterval(timerInterval);
  timerSeconds = seconds;
  timerType = type;

  const timerBox = $('#timer-box');
  const timerDisplay = $('#timer-display');
  const timerLabel = $('#timer-label');
  const restIcon = $('#rest-icon');

  if (!timerBox) return;

  timerBox.style.display = 'flex';
  if (type === 'rest') {
    timerBox.classList.add('rest');
    restIcon.style.display = 'block';
    timerLabel.textContent = 'DESCANSE E HIDRATE-SE';
  } else {
    timerBox.classList.remove('rest');
    restIcon.style.display = 'none';
    timerLabel.textContent = 'EXECUÇÃO';
  }

  updateTimerUI();

  timerInterval = setInterval(() => {
    timerSeconds--;
    updateTimerUI();
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      toast(type === 'rest' ? 'Descanso concluído! Próxima série.' : 'Tempo do exercício concluído!');
      if (type === 'work') {
        // Entra automaticamente no descanso
        startWorkoutTimer(30, 'rest');
      } else {
        setTimeout(() => { timerBox.style.display = 'none'; }, 1500);
      }
    }
  }, 1000);
}

function updateTimerUI() {
  const display = $('#timer-display');
  if (!display) return;
  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  display.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
}

function stopWorkoutTimer() {
  clearInterval(timerInterval);
  const timerBox = $('#timer-box');
  if (timerBox) timerBox.style.display = 'none';
}

/* ========================================================
   EVENT LISTENERS
   ======================================================== */
document.addEventListener('click', async event => {
  const b = event.target.closest('[data-action]');
  if (!b) return;
  const { action, id, seconds, type } = b.dataset;

  try {
    switch (action) {
      case 'demo':
        demo = true;
        sessionStorage.setItem('lara-demo', '1');
        loadDemo();
        location.hash = 'home';
        render();
        break;

      case 'logout':
        if (!demo) await api('/logout', 'POST', {});
        demo = false;
        sessionStorage.removeItem('lara-demo');
        user = null;
        state = blankState();
        renderLogin();
        break;

      case 'select-month':
        currentMonth = Number(id);
        location.hash = 'training';
        break;

      case 'set-month':
        currentMonth = Number(id);
        render();
        break;

      case 'set-goal':
        state.profile.goal = id;
        await save();
        render();
        toast(`Objetivo ajustado para ${id}.`);
        break;

      case 'set-frequency':
        state.profile.frequency = Number(id);
        await save();
        render();
        toast(`Frequência ajustada para ${id}x por semana.`);
        break;

      case 'open-workout':
        activeWorkoutId = id;
        location.hash = `workout?id=${id}`;
        break;

      case 'set-lesson-tab':
        activeLessonTab = id;
        render();
        break;

      case 'open-guide': {
        const guide = byId(id);
        if (guide) {
          showModal(guide.title, `<p style="font-size:14px; line-height:1.7;">${esc(guide.description)}</p>`);
        }
        break;
      }

      case 'open-recipe': {
        const recipe = byId(id);
        if (recipe) {
          showModal(recipe.title, `
            <div style="font-size: 13px; line-height: 1.6;">
              <p style="margin-bottom: 14px;">${esc(recipe.description)}</p>
              <h4 style="margin: 12px 0 6px;">Ingredientes:</h4>
              <ul style="padding-left: 20px; margin-bottom: 14px;">
                ${(recipe.ingredients || []).map(i => `<li>${esc(i)}</li>`).join('')}
              </ul>
              <h4 style="margin: 12px 0 6px;">Modo de preparo:</h4>
              <ol style="padding-left: 20px;">
                ${(recipe.steps || []).map(s => `<li>${esc(s)}</li>`).join('')}
              </ol>
            </div>
          `);
        }
        break;
      }

      case 'quick-water':
        state.water[today()] = (state.water[today()] || 0) + 250;
        await save();
        render();
        toast('+250 ml de água registrados!');
        break;

      case 'toggle-complete': {
        const doneIndex = state.completed.findIndex(c => c.id === id && c.date === today());
        if (doneIndex >= 0) {
          state.completed.splice(doneIndex, 1);
          toast('Conclusão desfeita.');
        } else {
          state.completed.push({ id, date: today() });
          toast('Parabéns! Mais um treino concluído.');
        }
        await save();
        render();
        break;
      }

      case 'start-timer':
        startWorkoutTimer(Number(seconds) || 10, type || 'work');
        break;

      case 'timer-toggle':
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
          b.textContent = 'Continuar';
        } else {
          timerInterval = setInterval(() => {
            timerSeconds--;
            updateTimerUI();
            if (timerSeconds <= 0) {
              clearInterval(timerInterval);
              toast('Cronômetro concluído!');
              stopWorkoutTimer();
            }
          }, 1000);
          b.textContent = 'Pausar';
        }
        break;

      case 'timer-close':
        stopWorkoutTimer();
        break;

      case 'like':
        if (demo) {
          const p = posts.find(x => x.id === id);
          if (p) {
            p.liked = !p.liked;
            p.likes = (p.likes || 0) + (p.liked ? 1 : -1);
            localStorage.setItem('lara-demo-posts', JSON.stringify(posts));
          }
        } else {
          await api('/posts/' + id + '/like', 'POST', {});
        }
        refreshPosts();
        break;

      case 'admin-new-user':
        showModal('Cadastrar Aluna / Gerar Acesso', `
          <form data-form="admin-new-user">
            ${formField('Nome completo', 'name', 'text', '', 'required')}
            ${formField('E-mail da aluna', 'email', 'email', '', 'required')}
            ${formField('Senha inicial (mínimo 12 caracteres)', 'password', 'text', 'LaraCastelli2026!', 'required minlength="12"')}
            <button class="btn full" style="margin-top: 14px;">Criar Acesso e Gerar Mensagem</button>
          </form>
        `);
        break;

      case 'toggle-user':
        await api('/admin/users/' + id, 'PUT', { active: true });
        refreshAdmin();
        toast('Status da aluna atualizado.');
        break;

      case 'open-photos':
        showPhotos();
        break;

      case 'remove-photo':
        if (demo) {
          photos = photos.filter(p => p.id !== id);
          localStorage.setItem('lara-demo-photos', JSON.stringify(photos));
        } else {
          await api('/photos/' + id, 'DELETE');
        }
        showPhotos();
        toast('Foto excluída.');
        break;

      case 'toggle-pw': {
        const btn = event.target.closest('.btn-toggle-pw');
        if (!btn) break;
        const wrap = btn.closest('.password-wrap');
        const input = wrap?.querySelector('input');
        if (!input) break;
        const isPw = input.type === 'password';
        input.type = isPw ? 'text' : 'password';
        btn.innerHTML = icon(isPw ? 'eye-off' : 'eye');
        break;
      }

      case 'close-modal':
        $('#modal').close();
        break;
    }
  } catch (err) {
    toast(err.message);
  }
});

document.addEventListener('change', async event => {
  const el = event.target;
  if (el.dataset.exercise) {
    state.exerciseChecks[el.dataset.exercise] = el.checked;
    await save();
  }
});

document.addEventListener('submit', async event => {
  const form = event.target.closest('[data-form]');
  if (!form) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const kind = form.dataset.form;

  try {
    switch (kind) {
      case 'login': {
        const r = await api('/login', 'POST', data);
        user = r.user;
        demo = false;
        sessionStorage.removeItem('lara-demo');
        state = { ...blankState(), ...await api('/state') };
        content = await api('/content');
        location.hash = 'home';
        render();
        break;
      }
      case 'profile':
        state.profile = { ...state.profile, ...data, frequency: Number(data.frequency) };
        await save();
        toast('Preferências salvas com sucesso!');
        render();
        break;
      case 'post':
        if (demo) {
          posts.unshift({
            id: crypto.randomUUID(),
            user_id: 'demo',
            name: name(),
            body: data.body,
            likes: 0,
            liked: false,
            created_at: new Date().toISOString()
          });
          localStorage.setItem('lara-demo-posts', JSON.stringify(posts));
        } else {
          await api('/posts', 'POST', data);
        }
        form.reset();
        refreshPosts();
        toast('Publicado na comunidade!');
        break;
      case 'ticket':
        if (demo) {
          tickets.unshift({
            id: crypto.randomUUID(),
            body: data.body,
            reply: '',
            created_at: new Date().toISOString()
          });
          localStorage.setItem('lara-demo-tickets', JSON.stringify(tickets));
        } else {
          await api('/tickets', 'POST', data);
        }
        form.reset();
        refreshTickets();
        toast('Mensagem enviada para a equipe!');
        break;
      case 'photo': {
        const file = form.elements.photo.files[0];
        if (!file || file.size > 4 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          throw Error('Escolha JPEG, PNG ou WebP de até 4 MB.');
        }
        const dataUri = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(file);
        });
        if (demo) {
          photos.unshift({ id: crypto.randomUUID(), date: form.elements.date.value, data: dataUri });
          localStorage.setItem('lara-demo-photos', JSON.stringify(photos));
        } else {
          await api('/photos', 'POST', { date: form.elements.date.value, data: dataUri });
        }
        showPhotos();
        toast('Foto guardada com sucesso!');
        break;
      }
      case 'search':
        search = data.q.trim();
        location.hash = 'search';
        render();
        break;
      case 'admin-new-user': {
        await api('/admin/users', 'POST', data);
        $('#modal').close();
        refreshAdmin();
        showModal('Acesso Criado com Sucesso!', `
          <p style="font-size: 13px; line-height: 1.6; margin-bottom: 14px;">
            A conta foi cadastrada no PostgreSQL. Envie os dados abaixo para a aluna:
          </p>
          <textarea readonly style="width: 100%; height: 110px; font-size: 12px; padding: 10px; border: 1px solid var(--line); border-radius: 8px;">Olá ${data.name}! Seu acesso à plataforma Lara Castelli foi liberado.\n\nAcesse: https://app.laracastelli.mivaia.com\nLogin: ${data.email}\nSenha: ${data.password}</textarea>
          <button class="btn full" style="margin-top: 12px;" onclick="navigator.clipboard.writeText(this.previousElementSibling.value); this.textContent='Copiado!';">Copiar Mensagem</button>
        `);
        break;
      }
    }
  } catch (err) {
    if (kind === 'login') {
      $('#login-error').textContent = err.message;
    } else {
      toast(err.message);
    }
  }
});

function showModal(title, bodyHtml) {
  const m = $('#modal');
  m.innerHTML = `
    <div class="modal-head">
      <h2>${esc(title)}</h2>
      <button class="icon-btn" data-action="close-modal">${icon('close')}</button>
    </div>
    <div class="modal-body">${bodyHtml}</div>
  `;
  m.showModal();
}

window.addEventListener('hashchange', () => {
  stopWorkoutTimer();
  render();
  window.scrollTo(0, 0);
});

// Inicialização
try {
  if (demo) {
    loadDemo();
  } else {
    const r = await api('/me');
    user = r.user;
    if (user) {
      state = { ...blankState(), ...await api('/state') };
      content = await api('/content');
    }
  }
  render();
} catch {
  renderLogin();
}
