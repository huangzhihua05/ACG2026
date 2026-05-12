(function () {
  const QUOTES = window.HITOKOTO_QUOTES || [];
  const HISTORY_KEY = 'tengyou-hitokoto-history';
  const HISTORY_MAX = 15;
  const ROTATE_MS = 12000;
  let index = 0;
  let timer = null;
  let history = [];
  let sequence = [];

  function escText(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function loadHistory() {
    try {
      const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      history = Array.isArray(raw) ? raw.slice(0, HISTORY_MAX) : [];
    } catch {
      history = [];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_MAX)));
    } catch {}
  }

  function addHistory(item) {
    const key = item.text + '|' + item.source;
    history = [item, ...history.filter((x) => (x.text + '|' + x.source) !== key)].slice(0, HISTORY_MAX);
    saveHistory();
  }

  function buildSequence() {
    sequence = [];
    const schools = [];
    const grouped = new Map();
    QUOTES.forEach((item, idx) => {
      if (!schools.includes(item.school)) schools.push(item.school);
      if (!grouped.has(item.school)) grouped.set(item.school, []);
      grouped.get(item.school).push(idx);
    });
    schools.forEach((school) => { sequence.push(...(grouped.get(school) || [])); });
    if (!sequence.length) sequence = QUOTES.map((_, i) => i);
  }

  function nextIndex() {
    if (!sequence.length) buildSequence();
    if (!sequence.length) return 0;
    const next = sequence.shift();
    sequence.push(next);
    return next;
  }

  function wrapBy18(text) {
    return String(text || '');
  }

  function autoHeight() {
    const box = document.getElementById('hitokotoQuote');
    if (!box) return;
    box.style.height = 'auto';
    box.style.minHeight = 'unset';
    box.style.height = box.scrollHeight + 'px';
  }

  function renderHistory() {
    const list = document.getElementById('hitokotoHistoryList');
    if (!list) return;
    list.innerHTML = '';
  }

  function renderAt(nextIndex, push = true) {
    const textEl = document.getElementById('hitokotoText');
    const sourceEl = document.getElementById('hitokotoSource');
    if (!textEl || !sourceEl || !QUOTES.length) return;

    const next = ((nextIndex % QUOTES.length) + QUOTES.length) % QUOTES.length;
    index = next;
    const item = QUOTES[next];
    textEl.innerHTML = wrapBy18(item.text);
    sourceEl.textContent = item.source;
    if (push) addHistory(item);
    renderHistory();
    window.requestAnimationFrame(autoHeight);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function start(keepCurrent = true) {
    stop();
    const wrap = document.getElementById('hitokotoCarousel');
    if (!wrap || !QUOTES.length) return;

    if (!sequence.length) buildSequence();

    if (!keepCurrent || typeof index !== 'number' || index < 0 || index >= QUOTES.length) {
      index = nextIndex();
      renderAt(index, true);
    }

    timer = window.setInterval(() => {
      renderAt(nextIndex(), true);
    }, ROTATE_MS);
  }

  function init() {
    const wrap = document.getElementById('hitokotoCarousel');
    const historyList = document.getElementById('hitokotoHistoryList');
    if (!wrap) return;
    if (wrap.dataset.bound === '1') {
      start();
      return;
    }
    wrap.dataset.bound = '1';
    const prev = document.getElementById('hitokotoPrevBtn');
    const next = document.getElementById('hitokotoNextBtn');
    loadHistory();

    if (prev) prev.addEventListener('click', () => { stop(); renderAt(index - 1, true); start(true); });
    if (next) next.addEventListener('click', () => { stop(); renderAt(index + 1, true); start(true); });
    if (historyList) {
      historyList.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-hitokoto-history-index]');
        if (!btn) return;
        const item = history[Number(btn.dataset.hitokotoHistoryIndex)];
        const idx = QUOTES.findIndex((x) => x.text === item.text && x.source === item.source);
        if (idx >= 0) {
          stop();
          renderAt(idx, false);
          start();
        }
      });
    }
    wrap.addEventListener('mouseenter', stop);
    wrap.addEventListener('mouseleave', start);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
    start();
  }

  window.initHitokotoCarousel = init;
  document.addEventListener('DOMContentLoaded', init);
})();
