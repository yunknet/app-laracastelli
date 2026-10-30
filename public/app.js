import { demoContent, blankState, dateKey, weekDays, suggestedSchedule } from './data.js';
import { programView, validateProgramSettings } from './program-view.js';
import { BONUS_CATALOG } from './bonus-data.js';

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
  'eye-off': 'M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20',
  gift: 'M20 12v10H4V12M2 7h20v5H2zm10 0V2M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zm0 0h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z',
  lock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zm-12 0V7a5 5 0 0 1 10 0v4',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
};

const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.book}"/></svg>`;
const brand = () => `<a class="brand" href="#home"><img src="/assets/mark.svg" alt="Lara Castelli"><div><strong>Lara Castelli</strong><small>PROFIT • SEU CUIDADO</small></div></a>`;

const navs = [
  ['home', 'Início', 'home'],
  ['training', 'Treinos', 'training'],
  ['ficha', 'Ficha', 'ficha'],
  ['bonus', 'Bônus 7 Dias', 'gift'],
  ['food', 'Alimentação', 'food'],
  ['community', 'Comunidade', 'community'],
  ['profile', 'Perfil', 'profile']
];

let demo = sessionStorage.getItem('lara-demo') === '1';
let user = null;
let state = blankState();
let content = structuredClone(demoContent);
let posts = [];
let tickets = [];
let photos = [];
let pipMode = 'iniciante'; // 'iniciante' ou 'avancado'
let activeBonusTab = null;
let bonusTimerInterval = null;
const bonusContentCache = {};
let activeBonusModule = 1;
let loadingBonusContent = false;
let page = 'home';
let activeWorkoutId = null;
let activeLessonTab = 'pratica'; // 'instrucoes' ou 'pratica'
let currentMonth = 1;
let currentWeek = 1;
let search = '';
let saveQueue = Promise.resolve();
let showSetupForm = false;
let programConfig = { enabled: false };
let programCatalogue = [], programLoaded = false, programLoading = null, programError = "";
async function refreshProgramConfig() {
  programConfig = await api("/training-program/config").catch(() => ({ enabled: false }));
  programCatalogue = []; programLoaded = false; programError = ""; programLoading = null;
}
async function loadProgramCatalogue() {
  const owner = user?.id;
  try {
    const result = await api("/training-program/catalogue");
    if (owner !== user?.id) return;
    programCatalogue = result.workouts; programLoaded = true; programError = "";
  } catch (error) { if (owner === user?.id) programError = error.message; }
  finally { if (owner === user?.id) { programLoading = null; if (page === "programa") render(); } }
}

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
    page = hash === "programa" || hash.startsWith("programa?") ? "programa" : hash;
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
        ${[...navs, ...(programConfig.enabled ? [["programa", "Programa 12 semanas", "calendar"]] : [])].map(([id, label, iconName]) => `
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
  if (page === 'workout') attachVideoTracker();
  if (page === 'programa' && programConfig.enabled && !programLoaded && !programLoading && !programError) programLoading = loadProgramCatalogue();
  startBonusTimer();
}

function attachVideoTracker() {
  const vid = $('#workout-video');
  if (!vid || !activeWorkoutId) return;

  if (!state.videoPositions) state.videoPositions = {};
  const savedPos = state.videoPositions[activeWorkoutId];
  if (savedPos && savedPos > 5) {
    const restorePos = () => {
      if (savedPos < (vid.duration || 9999) - 5) {
        vid.currentTime = savedPos;
        const mins = Math.floor(savedPos / 60);
        const secs = String(Math.floor(savedPos % 60)).padStart(2, '0');
        toast(`Retomando aula de onde parou (${mins}:${secs})`);
      }
    };
    if (vid.readyState >= 1) restorePos();
    else vid.addEventListener('loadedmetadata', restorePos, { once: true });
  }

  let lastPersistedSec = 0;
  vid.addEventListener('timeupdate', () => {
    const currentSec = Math.floor(vid.currentTime);
    if (currentSec > 3 && !vid.ended) {
      state.videoPositions[activeWorkoutId] = currentSec;
      // Persiste periodicamente a cada 5 segundos de reprodução contínua (sem atrasar ou adiar)
      if (Math.abs(currentSec - lastPersistedSec) >= 5) {
        lastPersistedSec = currentSec;
        save();
      }
    }
  });

  vid.addEventListener('pause', () => {
    if (vid.currentTime > 3) {
      state.videoPositions[activeWorkoutId] = Math.floor(vid.currentTime);
      save();
    }
  });

  vid.addEventListener('ended', () => {
    state.videoPositions[activeWorkoutId] = 0;
    save();
  });

  window.addEventListener('beforeunload', () => {
    if (vid && vid.currentTime > 3 && !vid.ended) {
      state.videoPositions[activeWorkoutId] = Math.floor(vid.currentTime);
      save();
    }
  });
}

function pageTitle() {
  switch (page) {
    case 'home': return 'Início';
    case 'programa': return 'Programa 12 semanas';
    case 'training': return 'Seus Treinos';
    case 'bonus': return 'Bônus de 7 Dias';
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
        <img src="/assets/login-bg.png" alt="Método Lara Castelli">
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

function choiceCard(action, val, currentVal, iconEmoji, title, sub = '') {
  const isSelected = String(currentVal) === String(val);
  return `
    <button type="button" class="choice-card ${isSelected ? 'active' : ''}" data-action="${action}" data-val="${val}">
      <div class="choice-card-content">
        <span class="choice-card-icon">${iconEmoji}</span>
        <div class="choice-card-text">
          <strong class="choice-card-title">${esc(title)}</strong>
          ${sub ? `<span class="choice-card-sub">${esc(sub)}</span>` : ''}
        </div>
      </div>
      <span class="choice-card-radio"></span>
    </button>
  `;
}

function pageContent() {
  switch (page) {
    case 'home': return homeView();
    case 'programa': return programView({ state, config: programConfig, catalogue: programCatalogue, loaded: programLoaded, error: programError });
    case 'training': return trainingView();
    case 'bonus': return bonusView();
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
   SISTEMA DE BÔNUS EXCLUSIVOS DE 7 DIAS (D+7)
   ======================================================== */
function getBonusStatus() {
  const createdAtStr = user?.created_at || (demo ? (sessionStorage.getItem('lara-demo-created') || today()) : null);
  const createdAt = createdAtStr ? new Date(createdAtStr).getTime() : Date.now();
  const unlockTime = createdAt + 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const remainingMs = Math.max(0, unlockTime - now);
  // Aluna elegível no 7º dia; administradores têm prévia irrestrita para testes
  const isUnlocked = remainingMs <= 0 || user?.role === 'admin' || (demo && sessionStorage.getItem('lara-demo-unlocked') === '1');
  const chosenBonus = user?.chosenBonus || state.chosenBonus || (demo ? JSON.parse(sessionStorage.getItem('lara-demo-chosen-bonus') || 'null') : null);

  const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((remainingMs % (1000 * 60)) / 1000);

  return {
    createdAt,
    unlockTime,
    remainingMs,
    isUnlocked,
    chosenBonus,
    days,
    hours,
    mins,
    secs
  };
}

function startBonusTimer() {
  if (bonusTimerInterval) clearInterval(bonusTimerInterval);
  bonusTimerInterval = setInterval(() => {
    const timerEls = document.querySelectorAll('.bonus-timer-countdown');
    if (!timerEls.length) return;
    const status = getBonusStatus();
    if (status.isUnlocked && !status.chosenBonus) {
      clearInterval(bonusTimerInterval);
      render();
      return;
    }
    timerEls.forEach(el => {
      const d = el.querySelector('.td-days');
      const h = el.querySelector('.td-hours');
      const m = el.querySelector('.td-mins');
      const s = el.querySelector('.td-secs');
      if (d) d.textContent = String(status.days).padStart(2, '0');
      if (h) h.textContent = String(status.hours).padStart(2, '0');
      if (m) m.textContent = String(status.mins).padStart(2, '0');
      if (s) s.textContent = String(status.secs).padStart(2, '0');
    });
  }, 1000);
}

function bonusCountdownBanner() {
  const status = getBonusStatus();

  // Caso 1: Usuária já escolheu seu bônus
  if (status.chosenBonus) {
    const bonus = BONUS_CATALOG[status.chosenBonus.id] || { title: status.chosenBonus.title, emoji: '🎁' };
    return `
      <div class="bonus-countdown-banner chosen">
        <div class="bonus-banner-left">
          <div class="bonus-banner-icon" style="background: rgba(203, 230, 120, 0.2); border-color: var(--lime);">${bonus.emoji || '⭐'}</div>
          <div>
            <span class="bonus-banner-tag">✦ SEU BÔNUS PREMIUM ATIVO</span>
            <h3 class="bonus-banner-title">${esc(status.chosenBonus.title)}</h3>
            <p class="bonus-banner-sub">Conteúdo liberado de forma definitiva para o seu perfil.</p>
          </div>
        </div>
        <div>
          <button class="btn lime" data-action="open-chosen-bonus" data-id="${esc(status.chosenBonus.id)}" style="font-size: 13px; padding: 10px 20px;">
            Acessar Meu Bônus ▶
          </button>
        </div>
      </div>
    `;
  }

  // Caso 2: 7 dias se passaram -> Liberado para escolher 1 dos 5
  if (status.isUnlocked) {
    return `
      <div class="bonus-countdown-banner unlocked">
        <div class="bonus-banner-left">
          <div class="bonus-banner-icon">🎉</div>
          <div>
            <span class="bonus-banner-tag">✦ DESBLOQUEADO • ESCOLHA DISPONÍVEL</span>
            <h3 class="bonus-banner-title">Seu Bônus de 7 Dias foi Liberado!</h3>
            <p class="bonus-banner-sub">Você completou 1 semana! Escolha 1 dos 5 super bônus para liberar agora.</p>
          </div>
        </div>
        <div>
          <a href="#bonus" class="btn lime" style="font-size: 13px; padding: 10px 22px;">
            Escolher Meu Bônus ✦
          </a>
        </div>
      </div>
    `;
  }

  // Caso 3: Menos de 7 dias -> Contagem regressiva ativa
  return `
    <div class="bonus-countdown-banner">
      <div class="bonus-banner-left">
        <div class="bonus-banner-icon">🎁</div>
        <div>
          <span class="bonus-banner-tag">✦ BÔNUS ESPECIAL DE BOAS-VINDAS (7 DIAS)</span>
          <h3 class="bonus-banner-title">Escolha 1 entre 5 Bônus Exclusivos</h3>
          <p class="bonus-banner-sub">Após sua 1ª semana de adaptação, você poderá escolher 1 conteúdo premium definitivo.</p>
        </div>
      </div>
      <div class="bonus-banner-right" style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
        <div class="bonus-countdown-digits bonus-timer-countdown">
          <div class="cd-box"><span class="cd-val td-days">${String(status.days).padStart(2, '0')}</span><span class="cd-lbl">Dias</span></div>
          <span class="cd-sep">:</span>
          <div class="cd-box"><span class="cd-val td-hours">${String(status.hours).padStart(2, '0')}</span><span class="cd-lbl">Horas</span></div>
          <span class="cd-sep">:</span>
          <div class="cd-box"><span class="cd-val td-mins">${String(status.mins).padStart(2, '0')}</span><span class="cd-lbl">Min</span></div>
          <span class="cd-sep">:</span>
          <div class="cd-box"><span class="cd-val td-secs">${String(status.secs).padStart(2, '0')}</span><span class="cd-lbl">Seg</span></div>
        </div>
        <a href="#bonus" class="btn light" style="font-size: 12px; padding: 8px 16px;">
          Conhecer os 5 Bônus ↗
        </a>
      </div>
    </div>
  `;
}

function bonusView() {
  const status = getBonusStatus();
  const bonuses = Object.values(BONUS_CATALOG);

  // Se a aluna estiver com a aba de conteúdo ativa de um bônus escolhido (ou admin)
  if (activeBonusTab && (status.chosenBonus?.id === activeBonusTab || status.isUnlocked)) {
    return bonusContentView(activeBonusTab);
  }

  return `
    <div style="margin-bottom: 24px;">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 8px;">
        <span class="tag green" style="font-size: 10px; font-weight: 800; letter-spacing: 0.8px;">🎁 BÔNUS EXCLUSIVO DE 7 DIAS</span>
        ${user?.role === 'admin' ? `
          <span class="tag lime" style="font-size: 10px;">Modo Administrador (Acesso Irrestrito)</span>
        ` : ''}
      </div>
      <h1 style="font-size: 26px; font-weight: 800; color: var(--ink); margin-bottom: 6px;">Seus Bônus Especiais de Boas-Vindas</h1>
      <p style="font-size: 14px; color: var(--muted); max-width: 780px; line-height: 1.6;">
        Como aluna do Método Lara Castelli, após os seus primeiros 7 dias de treino você tem direito a escolher <strong>1 único bônus definitivo</strong> para desbloquear de forma vitalícia.
      </p>
    </div>

    <!-- Banner de Status / Contagem -->
    ${bonusCountdownBanner()}

    ${status.chosenBonus ? `
      <div class="card" style="padding: 16px 20px; margin-bottom: 28px; background: #f0f7f3; border: 1.5px solid #c2e2d0; border-radius: var(--radius-md); display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
        <span style="font-size: 24px;">✓</span>
        <div style="flex: 1;">
          <strong style="color: var(--green); font-size: 14px;">Você já selecionou o seu bônus de 7 dias:</strong>
          <span style="display: block; font-size: 13px; color: var(--ink); margin-top: 2px;">${esc(status.chosenBonus.title)}</span>
        </div>
        <button class="btn" data-action="open-chosen-bonus" data-id="${esc(status.chosenBonus.id)}" style="font-size: 12px; padding: 8px 18px;">
          Abrir Conteúdo ▶
        </button>
      </div>
    ` : status.isUnlocked ? `
      <div class="card" style="padding: 16px 20px; margin-bottom: 28px; background: #fffdf5; border: 1.5px solid #f2e3b3; border-radius: var(--radius-md); display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
        <span style="font-size: 24px;">💡</span>
        <div style="flex: 1;">
          <strong style="color: #8c6812; font-size: 14px;">Atenção à sua escolha:</strong>
          <span style="display: block; font-size: 13px; color: var(--muted); margin-top: 2px;">
            Você pode escolher <strong>somente 1 produto</strong> abaixo. Assim que você confirmar sua escolha, o conteúdo será liberado imediatamente e as outras opções não poderão ser selecionadas.
          </span>
        </div>
      </div>
    ` : `
      <div class="card" style="padding: 16px 20px; margin-bottom: 28px; background: var(--paper); border: 1.5px solid var(--line); border-radius: var(--radius-md); display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
        <span style="font-size: 24px;">🔒</span>
        <div style="flex: 1;">
          <strong style="color: var(--ink); font-size: 14px;">Conteúdos em contagem regressiva:</strong>
          <span style="display: block; font-size: 13px; color: var(--muted); margin-top: 2px;">
            Conheça todos os detalhes de cada bônus abaixo. No 7º dia exato após sua compra, o botão de seleção será ativado para você garantir seu bônus preferido.
          </span>
        </div>
      </div>
    `}

    <!-- Vitrine dos 5 Bônus -->
    <div class="bonus-grid">
      ${bonuses.map(b => {
        const isChosen = status.chosenBonus?.id === b.id;
        const hasOtherChosen = status.chosenBonus && !isChosen;

        return `
          <div class="bonus-card ${isChosen ? 'chosen' : ''} ${hasOtherChosen ? 'disabled' : ''}">
            <div class="bonus-card-media">
              <img src="${b.poster}" alt="${esc(b.title)}">
              <span class="bonus-card-badge ${b.badgeColor}">${b.badge}</span>
            </div>

            <div class="bonus-card-body">
              <div class="bonus-card-header">
                <span class="bonus-card-category">${b.emoji} ${esc(b.category)} • ${esc(b.duration)}</span>
                <h3 class="bonus-card-title">${esc(b.title)}</h3>
                <p class="bonus-card-tagline">${esc(b.tagline)}</p>
              </div>

              <ul class="bonus-card-highlights">
                ${b.highlights.map(h => `<li>${esc(h)}</li>`).join('')}
              </ul>

              <div class="bonus-card-footer">
                ${isChosen ? `
                  <div class="bonus-chosen-badge">✓ SEU BÔNUS ATIVO</div>
                  <button class="btn" data-action="open-chosen-bonus" data-id="${b.id}" style="width: 100%; font-size: 13px;">
                    Acessar Conteúdo Completo ▶
                  </button>
                ` : hasOtherChosen ? `
                  <button class="btn light" disabled style="width: 100%; font-size: 12px; opacity: 0.6; cursor: not-allowed;">
                    Outra opção (Você escolheu ${esc(status.chosenBonus.title.split(':')[0])})
                  </button>
                ` : status.isUnlocked ? `
                  <button class="btn lime" data-action="choose-bonus" data-id="${b.id}" style="width: 100%; font-size: 13px; font-weight: 800;">
                    ⭐ Escolher Este Bônus
                  </button>
                  <button class="btn light" data-action="preview-bonus" data-id="${b.id}" style="width: 100%; font-size: 12px;">
                    Ver Detalhes do Conteúdo
                  </button>
                ` : `
                  <button class="btn light" data-action="preview-bonus" data-id="${b.id}" style="width: 100%; font-size: 12px;">
                    Ver Detalhes do Conteúdo ↗
                  </button>
                  <span style="font-size: 11px; color: var(--muted); text-align: center; display: block;">
                    🔒 Libera em ${status.days}d ${status.hours}h
                  </span>
                `}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function bonusContentView(bonusId) {
  const meta = BONUS_CATALOG[bonusId];
  if (!meta) {
    activeBonusTab = null;
    return bonusView();
  }

  if (demo) {
    const demoBonus = {
      ...meta,
      video: '/assets/treino-video-1.mp4',
      modules: (meta.modulePreviews || []).map((p, idx) => ({
        ...p,
        description: `Aula prática com metodologia exclusiva de ${meta.category}.`,
        video: `/assets/treino-video-${(idx % 4) + 1}.mp4`,
        poster: meta.poster,
        steps: [
          'Passo 1: Aquecimento e alinhamento postural.',
          'Passo 2: Execução do movimento com técnica correta e cadência controlada.',
          'Passo 3: Finalização e checklist prático de retenção.'
        ],
        keyPoints: [
          'Mantenha a respiração contínua e a concentração no músculo-alvo.'
        ]
      }))
    };
    return renderFullBonusContent(demoBonus);
  }

  const cached = bonusContentCache[bonusId];
  if (cached && !cached.error) {
    return renderFullBonusContent(cached);
  }

  if (cached && cached.error) {
    return `
      <div style="margin-bottom: 20px;">
        <button class="btn light small" data-action="back-to-bonuses" style="margin-bottom: 14px;">
          ← Voltar aos Bônus
        </button>
      </div>
      <div class="card" style="text-align: center; padding: 40px 20px; background: var(--white); border-radius: var(--radius-lg); box-shadow: var(--card-shadow);">
        <div style="font-size: 40px; margin-bottom: 12px;">🔒</div>
        <h2 style="font-size: 20px; font-weight: 800; color: var(--ink); margin-bottom: 8px;">Acesso Restrito ao Conteúdo</h2>
        <p style="font-size: 14px; color: var(--muted); margin-bottom: 20px; max-width: 500px; margin-inline: auto;">
          ${esc(cached.error)}
        </p>
        <button class="btn green" data-action="back-to-bonuses">Voltar à Lista de Bônus</button>
      </div>
    `;
  }

  if (!loadingBonusContent) {
    loadingBonusContent = true;
    api('/bonus/content/' + bonusId)
      .then(res => {
        loadingBonusContent = false;
        bonusContentCache[bonusId] = res.bonus;
        render();
      })
      .catch(err => {
        loadingBonusContent = false;
        bonusContentCache[bonusId] = { error: err.message || 'Você não tem acesso a este conteúdo de bônus.' };
        render();
      });
  }

  return `
    <div style="margin-bottom: 20px;">
      <button class="btn light small" data-action="back-to-bonuses" style="margin-bottom: 14px;">
        ← Voltar aos Bônus
      </button>
    </div>
    <div class="card" style="text-align: center; padding: 50px 20px; background: var(--white); border-radius: var(--radius-lg);">
      <div style="font-size: 32px; margin-bottom: 12px;">⏳</div>
      <h3 style="font-size: 16px; font-weight: 800; color: var(--ink); margin-bottom: 6px;">Carregando suas aulas exclusivas...</h3>
      <p style="font-size: 13px; color: var(--muted);">Validando acesso seguro ao bônus selecionado.</p>
    </div>
  `;
}

function renderFullBonusContent(bonus) {
  const currentModule = (bonus.modules || []).find(m => m.num === activeBonusModule) || (bonus.modules && bonus.modules[0]) || {};
  const currentVideo = currentModule.video || bonus.video || '/assets/treino-video-1.mp4';
  const currentPoster = currentModule.poster || bonus.poster || '/assets/treino-poster-1.jpg';

  return `
    <div style="margin-bottom: 20px;">
      <button class="btn light small" data-action="back-to-bonuses" style="margin-bottom: 14px;">
        ← Voltar aos Bônus
      </button>

      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap;">
        <span class="tag green" style="font-size: 10px; font-weight: 800;">BÔNUS LIBERADO</span>
        <span class="tag lime" style="font-size: 10px;">${bonus.badge || 'Exclusivo'}</span>
      </div>
      <h1 style="font-size: 24px; font-weight: 800; color: var(--ink); margin-bottom: 6px;">${esc(bonus.title)}</h1>
      <p style="font-size: 14px; color: var(--muted); line-height: 1.6; max-width: 800px;">
        ${esc(bonus.summary)}
      </p>
    </div>

    <!-- Barra e Player de Vídeo com Navegação de Aulas -->
    <div id="bonus-player-container" style="margin-bottom: 28px;">
      <div id="bonus-active-indicator" style="background: var(--paper); border: 1px solid var(--line); border-bottom: none; border-radius: var(--radius-lg) var(--radius-lg) 0 0; padding: 12px 18px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
        <div>
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: var(--green);">
            ▶ Reproduzindo Agora:
          </span>
          <strong id="bonus-active-module-title" style="font-size: 14px; font-weight: 800; color: var(--ink); display: block; margin-top: 2px;">
            Módulo 0${currentModule.num || 1}: ${esc(currentModule.title || bonus.title)}
          </strong>
        </div>
        ${currentModule.duration ? `<span class="tag green" style="font-size: 11px;">Duração: ${esc(currentModule.duration)}</span>` : ''}
      </div>

      <div class="video-wrapper" style="border-radius: 0 0 var(--radius-lg) var(--radius-lg); overflow: hidden; box-shadow: var(--card-shadow); border: 1px solid var(--line);">
        <video id="bonus-video-player" controls playsinline preload="metadata" src="${currentVideo}" poster="${currentPoster}" style="width: 100%; display: block;"></video>
      </div>
    </div>

    <!-- Módulos e Etapas de Execução -->
    <div style="margin-bottom: 24px;">
      <h2 style="font-size: 18px; font-weight: 800; color: var(--ink); margin-bottom: 14px;">Módulos & Passo a Passo de Execução</h2>

      ${(bonus.modules || []).map(m => `
        <div class="bonus-module-card ${m.num === activeBonusModule ? 'active-module' : ''}" id="bonus-module-card-${m.num}">
          <div class="bonus-module-head">
            <span class="bonus-module-num">MÓDULO 0${m.num} • ${m.duration}</span>
            <button class="btn ${m.num === activeBonusModule ? 'green' : 'secondary'} small"
                    data-action="play-bonus-module"
                    data-module="${m.num}"
                    data-video="${esc(m.video || bonus.video)}"
                    data-title="${esc(m.title)}"
                    data-duration="${esc(m.duration)}"
                    data-poster="${esc(m.poster || bonus.poster)}">
              ${m.num === activeBonusModule ? '✓ Assistindo Agora' : '▶ Assistir Esta Aula'}
            </button>
          </div>
          <h3 style="font-size: 16px; font-weight: 800; color: var(--ink); margin-bottom: 6px;">${esc(m.title)}</h3>
          <p style="font-size: 13px; color: var(--muted); line-height: 1.5; margin-bottom: 12px;">${esc(m.description)}</p>

          <strong style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--green); display: block; margin-bottom: 6px;">
            Passo a Passo:
          </strong>
          <ol class="bonus-step-list">
            ${(m.steps || []).map(s => `<li>${esc(s)}</li>`).join('')}
          </ol>

          ${m.keyPoints?.length ? `
            <div class="bonus-keypoints">
              <strong>💡 Pontos de Atenção & Segurança:</strong>
              <ul style="margin: 6px 0 0 16px; padding: 0;">
                ${m.keyPoints.map(kp => `<li style="margin-bottom: 4px;">${esc(kp)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>

    <div style="display: flex; justify-content: flex-start; margin-bottom: 30px;">
      <button class="btn light" data-action="back-to-bonuses">
        ← Voltar à Lista de Bônus
      </button>
    </div>
  `;
}

function showBonusPreviewModal(bonusId) {
  const bonus = BONUS_CATALOG[bonusId];
  if (!bonus) return;
  const status = getBonusStatus();

  showModal(bonus.title, `
    <div style="margin-bottom: 16px;">
      <div style="position: relative; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 14px; max-height: 200px;">
        <img src="${bonus.poster}" alt="${esc(bonus.title)}" style="width: 100%; height: 200px; object-fit: cover;">
        <span class="bonus-card-badge ${bonus.badgeColor}" style="top: 10px; left: 10px;">${bonus.badge}</span>
      </div>

      <p style="font-size: 13px; color: var(--ink); line-height: 1.6; margin-bottom: 14px;">
        ${esc(bonus.summary)}
      </p>

      <h4 style="font-size: 13px; font-weight: 800; color: var(--green); margin-bottom: 8px;">Aulas incluídas neste bônus:</h4>
      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
        ${(bonus.modulePreviews || []).map(m => `
          <div style="background: var(--paper); padding: 10px 14px; border-radius: 8px; border-left: 3px solid var(--green);">
            <strong style="font-size: 12px; display: block; color: var(--ink);">Módulo 0${m.num}: ${esc(m.title)} (${m.duration})</strong>
          </div>
        `).join('')}
      </div>

      ${status.chosenBonus ? `
        <div style="background: #f7f9f6; padding: 12px; border-radius: 8px; text-align: center; font-size: 12px; color: var(--muted);">
          Você já selecionou o bônus: <strong>${esc(status.chosenBonus.title)}</strong>.
        </div>
      ` : status.isUnlocked ? `
        <div class="modal-actions-stacked" style="margin-top: 14px;">
          <button class="btn light" data-action="close-modal">Fechar</button>
          <button class="btn lime" data-action="choose-bonus" data-id="${bonus.id}">
            ⭐ Quero Escolher Este Bônus
          </button>
        </div>
      ` : `
        <div style="background: var(--lime-soft); padding: 12px 16px; border-radius: 8px; border: 1px solid #cce29b; text-align: center;">
          <span style="font-size: 12px; font-weight: 700; color: var(--green); display: block;">
            🔒 Liberação Automática em 7 Dias
          </span>
          <small style="font-size: 11px; color: var(--muted);">
            Faltam ${status.days} dias, ${status.hours} horas e ${status.mins} minutos para você poder selecionar este produto.
          </small>
        </div>
      `}
    </div>
  `);
}

function showBonusChoiceConfirmationModal(bonusId) {
  const bonus = BONUS_CATALOG[bonusId];
  if (!bonus) return;

  showModal('Confirmar Escolha de Bônus', `
    <div style="text-align: center; padding: 10px 0 16px;">
      <div style="font-size: 48px; margin-bottom: 12px;">${bonus.emoji}</div>
      <h3 style="font-size: 18px; font-weight: 800; color: var(--ink); margin-bottom: 6px;">
        ${esc(bonus.title)}
      </h3>
      <p style="font-size: 13px; color: var(--muted); line-height: 1.5; margin-bottom: 18px;">
        Você tem direito a <strong>apenas 1 bônus exclusivo</strong> de 7 dias. Ao confirmar a escolha de <strong>"${esc(bonus.shortTitle)}"</strong>, ele será desbloqueado de forma vitalícia e você <strong>não poderá escolher outro</strong>.
      </p>

      <div style="background: #fff8e6; border: 1px solid #fae19c; padding: 12px 16px; border-radius: 8px; font-size: 12px; color: #7a5806; margin-bottom: 22px; text-align: left;">
        ⚠️ <strong>Atenção:</strong> Esta escolha é definitiva e será gravada no seu perfil.
      </div>

      <div class="modal-actions-stacked">
        <button class="btn light" data-action="close-modal">
          Voltar e Ver Outros
        </button>
        <button class="btn lime" data-action="confirm-choose-bonus" data-id="${bonus.id}" style="font-weight: 800;">
          ✓ Confirmar Escolha Definitiva
        </button>
      </div>
    </div>
  `);
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

    <!-- Bônus Especial de Boas-Vindas (7 Dias) -->
    ${bonusCountdownBanner()}

    ${programConfig.enabled ? `<div class="program-entry"><a class="btn light" href="#programa">Abrir programa de 12 semanas ↗</a></div>` : ""}
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
      <div class="quick-card" style="cursor: pointer;" data-action="toggle-setup-form" title="Clique para personalizar seu objetivo">
        <div class="quick-icon peach">${icon('heart')}</div>
        <div class="quick-info">
          <strong>${state.profile.goal || 'Emagrecer'}</strong>
          <small>Foco do plano • <u>Alterar</u></small>
        </div>
      </div>
    </div>

    <!-- Card de Personalização do Treino (Onboarding / Setup Visual) -->
    <div class="card" style="margin-bottom: 24px; padding: 20px; background: #ffffff; border: 1px solid var(--line); border-radius: var(--radius-lg); box-shadow: var(--card-shadow);">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: ${showSetupForm ? '18px' : '0'}; flex-wrap: wrap;">
        <div>
          <span class="tag green" style="font-size: 10px; font-weight: 800; letter-spacing: 0.5px;">✦ SEU PLANO PERSONALIZADO</span>
          <h2 style="font-size: 17px; font-weight: 800; margin-top: 4px; color: var(--ink);">Dados do seu Treino</h2>
          <p style="font-size: 12px; color: var(--muted); margin-top: 2px;">Adapte o método ao seu objetivo e à sua rotina semanal.</p>
        </div>
        <button class="btn light" data-action="toggle-setup-form" style="font-size: 12px; padding: 6px 14px; min-height: 34px;">
          ${showSetupForm ? 'Fechar ▲' : 'Personalizar ✎'}
        </button>
      </div>

      ${showSetupForm ? `
        <form data-form="setup-plan" style="display: flex; flex-direction: column; gap: 20px;">
          <label class="field" style="margin-bottom: 0;">
            <span style="font-size: 13px; font-weight: 700; color: var(--ink);">Como você quer ser chamada?</span>
            <input name="name" type="text" value="${esc(name())}" required placeholder="Seu nome ou apelido" style="padding: 12px 14px; border-radius: 8px; border: 1.5px solid var(--line); font-size: 14px; width: 100%;">
          </label>

          <div>
            <span style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 4px; color: var(--ink);">Qual é o seu objetivo principal?</span>
            <p style="font-size: 11px; color: var(--muted); margin-bottom: 8px;">Toque na opção desejada para selecionar:</p>
            <div class="choice-grid">
              ${choiceCard('select-goal', 'Emagrecer', state.profile.goal, '🔥', 'Emagrecer e Definir', 'Déficit calórico com firmeza muscular')}
              ${choiceCard('select-goal', 'Massa Magra', state.profile.goal, '💪', 'Ganho de Massa Magra', 'Tonificação e hipertrofia')}
              ${choiceCard('select-goal', 'Criar rotina', state.profile.goal, '⚡', 'Criar Rotina Constante', 'Hábito diário progressivo')}
            </div>
          </div>

          <div>
            <span style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 4px; color: var(--ink);">Qual é o seu nível de treino atual?</span>
            <p style="font-size: 11px; color: var(--muted); margin-bottom: 8px;">Toque na opção desejada para selecionar:</p>
            <div class="choice-grid">
              ${choiceCard('select-level', 'Iniciante', state.profile.level, '🌱', 'Iniciante', 'Voltando aos treinos ou 1ª vez')}
              ${choiceCard('select-level', 'Intermediário', state.profile.level, '🌿', 'Intermediário', 'Já treina há pelo menos 6 meses')}
              ${choiceCard('select-level', 'Avançado', state.profile.level, '🌳', 'Avançado', 'Treino constante e boa intensidade')}
            </div>
          </div>

          <div>
            <span style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 4px; color: var(--ink);">Quantos dias você quer treinar por semana?</span>
            <p style="font-size: 11px; color: var(--muted); margin-bottom: 8px;">Toque na opção desejada para selecionar:</p>
            <div class="choice-grid-4">
              ${choiceCard('select-freq', '3', state.profile.frequency, '🗓️', '3x na semana', 'Dias alternados')}
              ${choiceCard('select-freq', '4', state.profile.frequency, '⭐', '4x na semana', 'Recomendado')}
              ${choiceCard('select-freq', '5', state.profile.frequency, '🔥', '5x na semana', 'Ritmo intenso')}
              ${choiceCard('select-freq', '6', state.profile.frequency, '⚡', '6x na semana', 'Foco máximo')}
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 6px;">
            <button class="btn" type="submit" style="min-height: 42px; font-size: 13px; padding: 10px 22px;">Salvar Meu Plano ✨</button>
          </div>
        </form>
      ` : `
        <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center; background: var(--paper); padding: 10px 14px; border-radius: var(--radius-md); font-size: 12px;">
          <span><b>Aluna:</b> ${esc(name())}</span>
          <span style="color: var(--line);">•</span>
          <span><b>Foco:</b> ${esc(state.profile.goal || 'Emagrecer')}</span>
          <span style="color: var(--line);">•</span>
          <span><b>Nível:</b> ${esc(state.profile.level || 'Iniciante')}</span>
          <span style="color: var(--line);">•</span>
          <span><b>Frequência:</b> ${state.profile.frequency || 4}x por semana</span>
        </div>
      `}
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
  const allWorkouts = workouts().length > 0 ? workouts() : demoContent.filter(c => c.kind === 'workout');
  const currentWorkouts = allWorkouts.filter(w => (w.month || 1) === currentMonth && w.category !== 'Bônus');
  const bonusWorkouts = allWorkouts.filter(w => w.category === 'Bônus');

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
      ${currentWorkouts.length > 0 ? `
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
      ` : `
        <div style="padding: 32px 20px; text-align: center; background: #fff; border-radius: var(--radius-md); border: 1px dashed var(--line);">
          <div style="font-size: 28px; margin-bottom: 8px;">⏳</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">Mês 0${currentMonth} em preparação</h3>
          <p style="font-size: 13px; color: var(--muted); max-width: 420px; margin: 0 auto;">As aulas e progressões específicas do Mês 0${currentMonth} serão liberadas conforme sua conclusão dos treinos anteriores.</p>
        </div>
      `}
    </section>

    <!-- Destaque: 5 Bônus Exclusivos de 7 Dias -->
    <div style="margin-top: 36px; padding: 20px 24px; background: linear-gradient(135deg, #102d24 0%, #173b2f 100%); border-radius: var(--radius-lg); color: var(--white); display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; border: 1px solid rgba(203,230,120,0.25);">
      <div>
        <span style="font-size: 10px; font-weight: 800; letter-spacing: 0.8px; color: var(--lime); text-transform: uppercase;">✦ BÔNUS DE BOAS-VINDAS (7 DIAS)</span>
        <h3 style="font-size: 16px; font-weight: 800; margin: 3px 0; color: var(--white);">5 Super Bônus Exclusivos • Escolha 1 no 7º Dia</h3>
        <p style="font-size: 12px; color: rgba(255,255,255,0.8); margin: 0;">Protocolo Vácuo Abdominal, SOS Anti-Flacidez, Glúteos 3D, Fim de Semana e Queima Turbo.</p>
      </div>
      <a href="#bonus" class="btn lime" style="font-size: 12px; padding: 10px 20px; font-weight: 800;">Ver os 5 Bônus ↗</a>
    </div>

    <!-- Trilho de Bônus -->
    <section class="netflix-rail" style="margin-top: 32px;">
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
  const schedule = suggestedSchedule(frequency, goal, currentMonth, currentWeek);

  const weekThemes = {
    1: 'Adaptação neuromuscular e alinhamento postural',
    2: 'Aumento de cadência e sustentação muscular',
    3: 'Sobrecarga progressiva e densidade de esforço',
    4: 'Consolidação de força e pico metabólico'
  };

  return `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 24px; font-weight: 800;">Ficha Interativa • Mês 0${currentMonth}</h1>
      <p style="font-size: 13px; color: var(--muted); margin-top: 4px;">Programação personalizada de acordo com seu objetivo e rotina semanal.</p>
    </div>

    <!-- Seletor de Mês da Ficha -->
    <div class="pill-group" style="margin-bottom: 18px;">
      ${[1, 2, 3].map(m => `
        <button class="${currentMonth === m ? 'active' : ''}" data-action="set-month" data-id="${m}">
          Mês 0${m}
        </button>
      `).join('')}
    </div>

    <div class="ficha-view">
      <!-- Foco Semanal Dinâmico -->
      <div style="font-size: 12px; color: var(--green); font-weight: 700; margin-bottom: 14px; background: rgba(36, 84, 67, 0.08); padding: 8px 14px; border-radius: var(--radius-sm); border-left: 3px solid var(--green);">
        🎯 Foco da Semana 0${currentWeek}: ${weekThemes[currentWeek] || 'Consistência de Execução'}
      </div>

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

        <!-- Seletor Interativo de Semana -->
        <button class="week-select-pill" data-action="cycle-week" title="Toque para alternar entre as 4 semanas do mês" style="cursor: pointer; background: var(--paper); border: 1px solid var(--line); border-radius: 20px; padding: 6px 14px; display: inline-flex; align-items: center; gap: 6px; font-weight: 700; font-size: 13px; color: var(--ink);">
          <span>Semana ${currentWeek}</span>
          ${icon('arrow')}
        </button>

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
        💡 <b>Objetivo Ativo (${goal}):</b> Programação calculada para ${frequency}x na semana com pausas estruturadas para recuperação articular e tônus muscular.
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
          <span>⚪ ${esc(workout.title)} • Instruções Técnicas</span>
          ${icon('arrow')}
        </div>
        <div class="lesson-item ${activeLessonTab === 'pratica' ? 'active' : ''}" data-action="set-lesson-tab" data-id="pratica" style="cursor: pointer;">
          <span>🟢 ${esc(workout.title)} • Prática Guiada</span>
          ${icon('play')}
        </div>
      </div>

      ${activeLessonTab === 'instrucoes' ? `
        <!-- Painel Técnico de Instruções -->
        <div class="instructions-panel" style="background: #fff; padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--line); margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span style="font-size: 22px;">📋</span>
            <h3 style="font-size: 16px; font-weight: 800;">Orientações da Treinadora Lara Castelli</h3>
          </div>
          <p style="font-size: 13px; color: var(--ink); line-height: 1.6; margin-bottom: 14px;">
            ${esc(workout.instructions || 'Mantenha a postura alinhada, respiração diafragmática ativa e respeite os limites do seu corpo.')}
          </p>
          <div style="background: var(--paper); border-left: 3px solid var(--green); padding: 12px; border-radius: 4px; font-size: 12px; color: var(--muted); margin-bottom: 16px; line-height: 1.6;">
            <strong>💡 Foco do Treino:</strong> ${esc(workout.description)}
          </div>
          <h4 style="font-size: 13px; font-weight: 800; margin-bottom: 10px;">Postura & Cues por Exercício:</h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${(workout.exercises || []).map((e, idx) => `
              <div style="padding: 10px; background: #fafbf9; border-radius: 8px; border: 1px solid var(--line);">
                <strong style="font-size: 13px; display: block;">${idx + 1}. ${esc(e.name)}</strong>
                <span style="font-size: 12px; color: var(--muted); display: block; margin-top: 2px;">Prescrição: ${esc(e.detail)}</span>
                ${e.beginner ? `<span style="font-size: 11px; color: var(--green); display: block; margin-top: 4px;">• <i>Opção Adaptada (Iniciante):</i> ${esc(e.beginner)}</span>` : ''}
              </div>
            `).join('')}
          </div>
          <button class="btn full" data-action="set-lesson-tab" data-id="pratica" style="margin-top: 18px;">
            ▶ Iniciar Prática Guiada no Player
          </button>
        </div>
      ` : `
        <!-- Player de Vídeo com PIP e Cronômetro (Screenshots 3 e 4) -->
        <div class="video-wrapper">
          <video id="workout-video" controls playsinline preload="metadata" src="${workout.video}" poster="${workout.poster}"></video>
          
          <!-- PIP Adaptação Iniciante/Avançado Interativo com Vídeo de Demonstração -->
          <div class="video-pip" data-action="toggle-pip" title="Toque para alternar a demonstração no canto" style="cursor: pointer;">
            <video id="pip-video" playsinline muted loop autoplay src="${pipMode === 'iniciante' ? (workout.pipVideo || '/assets/treino-video-2.mp4') : workout.video}" poster="${pipMode === 'iniciante' ? '/assets/treino-poster-2.jpg' : workout.poster}"></video>
            <span id="pip-badge">${pipMode === 'iniciante' ? 'Iniciante (Adaptado)' : 'Avançado'} 🔄</span>
          </div>

          <!-- Overlay do Cronômetro Interativo -->
          <div class="timer-overlay hidden" id="timer-box">
            <div id="rest-icon" class="hidden">
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
      `}

      <!-- Ações da Lição (Screenshot 3) -->
      <div class="lesson-actions">
        <button class="btn-complete ${isCompletedToday ? 'done' : ''}" data-action="toggle-complete" data-id="${workout.id}">
          ${icon('check')}
          ${isCompletedToday ? 'Aula concluída hoje' : 'Marcar como concluída'}
        </button>

        <div class="lesson-timing-controls">
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

    <form data-form="profile" class="card" style="max-width: 650px; margin-bottom: 24px;">
      <h3 style="margin-bottom: 16px;">Seus Dados de Treino</h3>
      ${formField('Como quer ser chamada?', 'name', 'text', name(), 'required placeholder="Seu nome"')}
      
      <div style="margin-bottom: 18px;">
        <span style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 4px; color: var(--ink);">Objetivo Principal</span>
        <p style="font-size: 11px; color: var(--muted); margin-bottom: 8px;">Toque na opção desejada para selecionar:</p>
        <div class="choice-grid">
          ${choiceCard('select-goal', 'Emagrecer', state.profile.goal, '🔥', 'Emagrecer e Definir', 'Déficit calórico com firmeza muscular')}
          ${choiceCard('select-goal', 'Massa Magra', state.profile.goal, '💪', 'Ganho de Massa Magra', 'Tonificação e hipertrofia')}
          ${choiceCard('select-goal', 'Criar rotina', state.profile.goal, '⚡', 'Criar Rotina Constante', 'Hábito diário progressivo')}
        </div>
      </div>

      <div style="margin-bottom: 18px;">
        <span style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 4px; color: var(--ink);">Nível de Treino</span>
        <p style="font-size: 11px; color: var(--muted); margin-bottom: 8px;">Toque na opção desejada para selecionar:</p>
        <div class="choice-grid">
          ${choiceCard('select-level', 'Iniciante', state.profile.level, '🌱', 'Iniciante', 'Voltando aos treinos ou 1ª vez')}
          ${choiceCard('select-level', 'Intermediário', state.profile.level, '🌿', 'Intermediário', 'Já treina há pelo menos 6 meses')}
          ${choiceCard('select-level', 'Avançado', state.profile.level, '🌳', 'Avançado', 'Treino constante e boa intensidade')}
        </div>
      </div>

      <div style="margin-bottom: 18px;">
        <span style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 4px; color: var(--ink);">Frequência Semanal</span>
        <p style="font-size: 11px; color: var(--muted); margin-bottom: 8px;">Toque na opção desejada para selecionar:</p>
        <div class="choice-grid-4">
          ${choiceCard('select-freq', '3', state.profile.frequency, '🗓️', '3x na semana', 'Dias alternados')}
          ${choiceCard('select-freq', '4', state.profile.frequency, '⭐', '4x na semana', 'Recomendado')}
          ${choiceCard('select-freq', '5', state.profile.frequency, '🔥', '5x na semana', 'Ritmo intenso')}
          ${choiceCard('select-freq', '6', state.profile.frequency, '⚡', '6x na semana', 'Foco máximo')}
        </div>
      </div>

      <button class="btn" style="margin-top: 8px; min-height: 42px; font-size: 13px;">Salvar alterações ✨</button>
    </form>

    <form data-form="change-password" class="card" style="max-width: 600px; margin-bottom: 24px;">
      <h3 style="margin-bottom: 12px;">Alterar Minha Senha</h3>
      <p style="font-size: 13px; color: var(--muted); margin-bottom: 16px;">
        Substitua a sua senha inicial por uma senha pessoal de sua preferência.
      </p>
      ${formField('Nova senha (mínimo 6 caracteres)', 'newPassword', 'password', '', 'required minlength="6" placeholder="Digite sua nova senha"')}
      <button class="btn" style="margin-top: 8px;">Salvar Nova Senha</button>
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
          ${users.map(u => {
            const daysPassed = u.created_at ? (Date.now() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24) : 0;
            let bonusTag = '';
            if (u.chosenBonus) {
              bonusTag = `<span class="tag green" style="font-size: 10px; margin-top: 4px; display: inline-block;">🎁 Bônus: ${esc(u.chosenBonus.title.split(':')[0])}</span>`;
            } else if (u.role !== 'admin') {
              if (daysPassed >= 7) {
                bonusTag = `<span class="tag lime" style="font-size: 10px; margin-top: 4px; display: inline-block;">✦ Bônus 7D: Liberado (Aguardando escolha)</span>`;
              } else {
                const daysRemaining = Math.max(1, Math.ceil(7 - daysPassed));
                bonusTag = `<span class="tag muted" style="font-size: 10px; margin-top: 4px; display: inline-block;">⏳ Bônus 7D: em ${daysRemaining} dia(s)</span>`;
              }
            }

            return `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--line);">
                <div>
                  <strong>${esc(u.name)}</strong>
                  <small style="display: block; color: var(--muted);">${esc(u.email)} • ${u.role === 'admin' ? 'Administrador' : u.active ? 'Acesso Ativo' : 'Suspenso'}</small>
                  ${bonusTag}
                </div>
                ${u.id !== user.id ? `
                  <div style="display: flex; gap: 8px;">
                    <button class="btn light" style="font-size: 11px; min-height: 32px; padding: 6px 12px;" data-action="toggle-user" data-id="${u.id}" data-active="${u.active ? '1' : '0'}">
                      ${u.active ? 'Suspender' : 'Ativar'}
                    </button>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
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

  timerBox.classList.remove('hidden');
  if (type === 'rest') {
    timerBox.classList.add('rest');
    if (restIcon) restIcon.classList.remove('hidden');
    if (timerLabel) timerLabel.textContent = 'DESCANSE E HIDRATE-SE';
  } else {
    timerBox.classList.remove('rest');
    if (restIcon) restIcon.classList.add('hidden');
    if (timerLabel) timerLabel.textContent = 'EXECUÇÃO';
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
        setTimeout(() => { timerBox.classList.add('hidden'); }, 1500);
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
  if (timerBox) timerBox.classList.add('hidden');
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
      case 'program-retry':
        programError = ''; programLoaded = false; render(); break;
      case 'program-complete': {
        if (!programConfig.enabled || !programCatalogue.some(w => w.id === id)) throw Error('Treino indisponível.');
        const oldCompleted = [...state.completed];
        const index = state.completed.findIndex(c => c.id === id && c.date === today());
        if (index >= 0) state.completed.splice(index, 1); else state.completed.push({ id, date: today() });
        try { await save(); } catch (error) { state.completed = oldCompleted; throw error; }
        render(); toast(index >= 0 ? 'Conclusão desfeita.' : 'Treino do programa registrado.'); break;
      }
      case 'demo':
        programConfig = { enabled: false }; programCatalogue = []; programLoaded = false;
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
        programConfig = { enabled: false }; programCatalogue = []; programLoaded = false;
        state = blankState();
        renderLogin();
        break;

      case 'open-bonus':
        activeBonusTab = null;
        location.hash = 'bonus';
        break;

      case 'back-to-bonuses':
        activeBonusTab = null;
        location.hash = 'bonus';
        render();
        break;

      case 'preview-bonus':
        showBonusPreviewModal(id);
        break;

      case 'choose-bonus':
        showBonusChoiceConfirmationModal(id);
        break;

      case 'confirm-choose-bonus': {
        const bonusId = id;
        $('#modal').close();
        try {
          if (demo) {
            const b = BONUS_CATALOG[bonusId];
            const chosen = { id: bonusId, title: b?.title || bonusId, chosen_at: new Date().toISOString() };
            state.chosenBonus = chosen;
            sessionStorage.setItem('lara-demo-chosen-bonus', JSON.stringify(chosen));
            toast('🎉 Bônus desbloqueado com sucesso!');
            activeBonusTab = bonusId;
            location.hash = 'bonus';
            render();
          } else {
            const r = await api('/bonus/choose', 'POST', { bonusId });
            if (r.ok) {
              state.chosenBonus = r.chosenBonus;
              if (user) user.chosenBonus = r.chosenBonus;
              toast('🎉 Bônus desbloqueado com sucesso!');
              activeBonusTab = bonusId;
              location.hash = 'bonus';
              render();
            }
          }
        } catch (err) {
          toast(err.message || 'Não foi possível confirmar a escolha do bônus.');
        }
        break;
      }

      case 'open-chosen-bonus':
        activeBonusTab = id || state.chosenBonus?.id;
        location.hash = 'bonus';
        render();
        break;

      case 'play-bonus-module': {
        const modNum = parseInt(b.dataset.module, 10);
        const videoSrc = b.dataset.video;
        const title = b.dataset.title;
        const poster = b.dataset.poster;

        activeBonusModule = modNum;

        const player = document.getElementById('bonus-video-player');
        const titleEl = document.getElementById('bonus-active-module-title');
        if (player && videoSrc) {
          player.src = videoSrc;
          if (poster) player.poster = poster;
          player.load();
          player.play().catch(() => {});
        }
        if (titleEl && title) {
          titleEl.textContent = `Módulo 0${modNum}: ${title}`;
        }

        document.querySelectorAll('.bonus-module-card').forEach(card => card.classList.remove('active-module'));
        const activeCard = document.getElementById(`bonus-module-card-${modNum}`);
        if (activeCard) activeCard.classList.add('active-module');

        document.querySelectorAll('[data-action="play-bonus-module"]').forEach(btnEl => {
          if (parseInt(btnEl.dataset.module, 10) === modNum) {
            btnEl.className = 'btn green small';
            btnEl.innerHTML = '✓ Assistindo Agora';
          } else {
            btnEl.className = 'btn secondary small';
            btnEl.innerHTML = '▶ Assistir Esta Aula';
          }
        });

        const playerWrap = document.getElementById('bonus-active-indicator') || player;
        if (playerWrap) {
          playerWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        break;
      }

      case 'toggle-setup-form':
        showSetupForm = !showSetupForm;
        render();
        break;

      case 'select-goal':
        state.profile.goal = b.dataset.val;
        render();
        break;

      case 'select-level':
        state.profile.level = b.dataset.val;
        render();
        break;

      case 'select-freq':
        state.profile.frequency = Number(b.dataset.val);
        render();
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
            ${formField('Senha inicial (mínimo 6 caracteres)', 'password', 'text', 'metodolara', 'required minlength="6"')}
            <button class="btn full" style="margin-top: 14px;">Criar Acesso e Gerar Mensagem</button>
          </form>
        `);
        break;

      case 'toggle-user': {
        const isCurrentlyActive = b.dataset.active === '1' || b.textContent.trim().toLowerCase().includes('suspender');
        const nextState = !isCurrentlyActive;
        await api('/admin/users/' + id, 'PUT', { active: nextState });
        await refreshAdmin();
        toast(nextState ? 'Aluna reativada com sucesso.' : 'Aluna suspensa com sucesso.');
        break;
      }

      case 'cycle-week':
        currentWeek = (currentWeek % 4) + 1;
        render();
        toast(`Visualizando programação da Semana 0${currentWeek}`);
        break;

      case 'toggle-pip': {
        pipMode = (pipMode === 'iniciante' ? 'avancado' : 'iniciante');
        const pipVideo = document.getElementById('pip-video');
        const pipBadge = document.getElementById('pip-badge');
        const workout = byId(activeWorkoutId) || workouts()[0];
        if (pipVideo && workout) {
          const newSrc = pipMode === 'iniciante' ? (workout.pipVideo || '/assets/treino-video-2.mp4') : workout.video;
          const newPoster = pipMode === 'iniciante' ? '/assets/treino-poster-2.jpg' : workout.poster;
          if (pipVideo.getAttribute('src') !== newSrc) {
            pipVideo.src = newSrc;
            pipVideo.poster = newPoster;
            pipVideo.play().catch(() => {});
          }
        }
        if (pipBadge) {
          pipBadge.textContent = (pipMode === 'iniciante' ? 'Iniciante (Adaptado)' : 'Avançado') + ' 🔄';
        }
        toast(pipMode === 'iniciante' ? 'Modo de visualização: Iniciante (Adaptado)' : 'Modo de visualização: Avançado');
        break;
      }

      case 'copy-admin-msg': {
        const textarea = b.previousElementSibling;
        if (textarea && textarea.value) {
          try {
            await navigator.clipboard.writeText(textarea.value);
            b.textContent = 'Mensagem Copiada! ✓';
            toast('Dados de acesso copiados com sucesso!');
          } catch {
            textarea.select();
            document.execCommand('copy');
            b.textContent = 'Mensagem Copiada! ✓';
            toast('Dados de acesso copiados com sucesso!');
          }
        }
        break;
      }

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
      case 'program-setup': {
        if (!programConfig.enabled) throw Error('Programa não ativado.');
        const previous = state.profile.trainingProgram;
        state.profile.trainingProgram = validateProgramSettings(data);
        try { await save(); } catch (error) { if (previous === undefined) delete state.profile.trainingProgram; else state.profile.trainingProgram = previous; throw error; }
        location.hash = 'programa'; render(); toast('Preferências do programa salvas.'); break;
      }
      case 'login': {
        const r = await api('/login', 'POST', data);
        user = r.user;
        demo = false;
        sessionStorage.removeItem('lara-demo');
        state = { ...blankState(), ...await api('/state') };
        const serverContent = await api('/content');
        content = (Array.isArray(serverContent) && serverContent.length > 0) ? serverContent : structuredClone(demoContent);
      await refreshProgramConfig();
        if (!state.profile?.setupDone) showSetupForm = true;
        location.hash = 'home';
        render();
        break;
      }
      case 'setup-plan':
      case 'profile': {
        const nameVal = form.elements.name?.value?.trim() || name();
        state.profile = {
          ...state.profile,
          name: nameVal,
          goal: state.profile.goal || 'Emagrecer',
          level: state.profile.level || 'Iniciante',
          frequency: Number(state.profile.frequency || 4),
          setupDone: true
        };
        await save();
        showSetupForm = false;
        toast('Plano e ficha adaptados com sucesso!');
        render();
        break;
      }
      case 'change-password': {
        const newPassword = form.elements.newPassword?.value;
        if (!newPassword || newPassword.length < 6) {
          toast('A nova senha deve ter no mínimo 6 caracteres.');
          break;
        }
        if (demo) {
          toast('Modo de demonstração: senha simulada.');
          form.reset();
          break;
        }
        await api('/me/password', 'PUT', { newPassword });
        form.reset();
        toast('Senha atualizada com sucesso!');
        break;
      }
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
          <button class="btn full" style="margin-top: 12px;" data-action="copy-admin-msg">Copiar Mensagem</button>
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
      const serverContent = await api('/content');
      content = (Array.isArray(serverContent) && serverContent.length > 0) ? serverContent : structuredClone(demoContent);
      await refreshProgramConfig();
      if (!state.profile?.setupDone) showSetupForm = true;
    }
  }
  render();
} catch {
  renderLogin();
}
