// Manual browser regression: /qa-player.html, development only. Uses demo data.
const frame = document.querySelector('iframe'), results = [];
const oldDemo = sessionStorage.getItem('lara-demo');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const check = (name, ok) => { results.push({name, ok}); document.querySelector('#report').textContent = JSON.stringify(results, null, 2); if (!ok) throw Error(name); };
async function ready() {
  for (let i = 0; i < 100; i++) { if (frame.contentDocument?.querySelector('.lesson-actions')) return; await delay(50); }
  throw Error('Aula não carregou');
}
function fits(element, container) {
  const a = element.getBoundingClientRect(), b = container.getBoundingClientRect();
  return a.width > 0 && a.left >= b.left - 1 && a.right <= b.right + 1 && a.top >= b.top - 1 && a.bottom <= b.bottom + 1 && element.scrollWidth <= element.clientWidth + 1;
}
(async () => {
  try {
    sessionStorage.setItem('lara-demo', '1');
    frame.src = '/#workout?id=w1';
    await ready();
    const doc = frame.contentDocument;
    doc.querySelectorAll('video').forEach(video => video.pause());
    for (const width of [320, 344, 360, 375, 390, 414, 768, 860, 861, 1024, 1440]) {
      frame.style.width = width + 'px'; await delay(80);
      const actions = doc.querySelector('.lesson-actions');
      check(`${width}px ações`, [...actions.querySelectorAll('button')].every(button => fits(button, actions)));
      check(`${width}px página`, doc.documentElement.scrollWidth <= doc.documentElement.clientWidth + 1);
      for (const type of ['work', 'rest']) {
        doc.querySelector(`[data-action="start-timer"][data-type="${type}"]`).click();
        await delay(20);
        const overlay = doc.querySelector('.timer-overlay');
        check(`${width}px ${type}`, [...overlay.querySelectorAll('button,.timer-countdown,.timer-msg')].every(element => fits(element, overlay)));
        doc.querySelector('[data-action="timer-close"]').click();
      }
    }
    document.querySelector('#status').textContent = `PASS: ${results.length} verificações`;
  } catch (error) {
    document.querySelector('#status').textContent = 'FAIL: ' + error.message;
  } finally {
    if (oldDemo === null) sessionStorage.removeItem('lara-demo'); else sessionStorage.setItem('lara-demo', oldDemo);
  }
})();
