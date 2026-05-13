(function () {
  const THEME_KEY = 'tengyou-theme';
  const SESSION_KEY = 'tengyou-session';
  const APPROVED_EMAIL = '871412257@qq.com';
  const API_BASE = window.TENGYOU_API_BASE || window.__TENGYOU_API_BASE || 'https://api.12345588.xyz';
  const stateCache = { data: { users: [], articles: [], comments: [], boardPosts: [], drafts: [] } };
  const LANG_KEY = 'tengyou-lang';
  const I18N = {
    'zh-CN': { home: '首页', permanent: '永久地址（建议保存）', vpn: 'VPN（自用推荐）', faq: '解压常见问题解答', donate: '捐赠方式（自愿）', findGame: '代找游戏', login: '登录', register: '注册', search: '搜索文章', heroTitle: '全站资源免登免费下载', heroSub: '全球单机游戏下载试玩分享中心', heroPlaceholder: '输入任意内容，找到所有关联游戏…', heroSearchBtn: '搜索', langBtn: 'A/文', latest: '最新文章', notice: '公告', rank: '近期游戏热榜', navPopular: '本站热门游戏', navCommon: '常用导航栏', linkSearch: '文章搜索', bannerPublic: '公开链接 Hot', bannerPublic2: '全部游戏链接公开分享', bannerHelp: '资源求助 NEW', bannerHelp2: '全站游戏免登录免费下载', bannerHelpCenter: '帮助中心 GO', bannerHelpCenter2: '解决 99% 游戏问题' },
    'zh-TW': { home: '首頁', permanent: '永久地址（建議保存）', vpn: 'VPN（自用推薦）', faq: '解壓常見問題解答', donate: '捐贈方式（自願）', findGame: '代找遊戲', login: '登入', register: '註冊', search: '搜尋文章', heroTitle: '全站資源免登免費下載', heroSub: '全球單機遊戲下載試玩分享中心', heroPlaceholder: '輸入任意內容，找到所有關聯遊戲…', heroSearchBtn: '搜尋', langBtn: 'A/文', latest: '最新文章', notice: '公告', rank: '近期遊戲熱榜', navPopular: '本站熱門遊戲', navCommon: '常用導覽欄', linkSearch: '文章搜尋', bannerPublic: '公開連結 Hot', bannerPublic2: '全部遊戲連結公開分享', bannerHelp: '資源求助 NEW', bannerHelp2: '全站遊戲免登入免費下載', bannerHelpCenter: '幫助中心 GO', bannerHelpCenter2: '解決 99% 遊戲問題' },
    en: { home: 'Home', permanent: 'Permanent URL', vpn: 'VPN Recommended', faq: 'FAQ', donate: 'Donate', findGame: 'Find Game', login: 'Login', register: 'Register', search: 'Search', heroTitle: 'Free ACG Resources', heroSub: 'Global PC game sharing center', heroPlaceholder: 'Type anything to find related games…', heroSearchBtn: 'Search', langBtn: 'A/文', latest: 'Latest Posts', notice: 'Notice', rank: 'Top Games', navPopular: 'Popular Games', navCommon: 'Quick Links', linkSearch: 'Search Posts', bannerPublic: 'Public Links Hot', bannerPublic2: 'All game links shared publicly', bannerHelp: 'Help Request NEW', bannerHelp2: 'No-login game access', bannerHelpCenter: 'Help Center GO', bannerHelpCenter2: 'Solve 99% of problems' },
    ko: { home: '홈', permanent: '영구 주소', vpn: 'VPN 추천', faq: 'FAQ', donate: '후원', findGame: '게임 찾기', login: '로그인', register: '회원가입', search: '검색', heroTitle: '무료 ACG 리소스', heroSub: '전 세계 PC 게임 공유 센터', heroPlaceholder: '내용을 입력해 관련 게임을 찾으세요…', heroSearchBtn: '검색', langBtn: 'A/文', latest: '최신 글', notice: '공지', rank: '인기 게임', navPopular: '인기 게임', navCommon: '바로가기', linkSearch: '게시글 검색', bannerPublic: '공개 링크 Hot', bannerPublic2: '모든 게임 링크 공개 공유', bannerHelp: '도움 요청 NEW', bannerHelp2: '로그인 없이 게임 이용', bannerHelpCenter: '도움말 GO', bannerHelpCenter2: '문제의 99% 해결' },
    ja: { home: 'ホーム', permanent: '永久アドレス', vpn: 'VPN おすすめ', faq: 'FAQ', donate: '寄付', findGame: 'ゲームを探す', login: 'ログイン', register: '登録', search: '検索', heroTitle: '無料 ACG リソース', heroSub: '世界中のPCゲーム共有センター', heroPlaceholder: '関連ゲームを検索…', heroSearchBtn: '検索', langBtn: 'A/文', latest: '最新記事', notice: 'お知らせ', rank: '人気ゲーム', navPopular: '人気ゲーム', navCommon: 'よく使うリンク', linkSearch: '記事検索', bannerPublic: '公開リンク Hot', bannerPublic2: 'すべてのゲームリンクを公開共有', bannerHelp: 'ヘルプ NEW', bannerHelp2: 'ログイン不要で利用', bannerHelpCenter: 'ヘルプ GO', bannerHelpCenter2: '問題の99%を解決' },
    fr: { home: 'Accueil', permanent: 'Adresse permanente', vpn: 'VPN recommandé', faq: 'FAQ', donate: 'Faire un don', findGame: 'Trouver un jeu', login: 'Connexion', register: 'Inscription', search: 'Rechercher', heroTitle: 'Ressources ACG gratuites', heroSub: 'Centre mondial de partage de jeux PC', heroPlaceholder: 'Saisissez du texte pour trouver des jeux…', heroSearchBtn: 'Rechercher', langBtn: 'A/文', latest: 'Derniers articles', notice: 'Annonce', rank: 'Jeux populaires', navPopular: 'Jeux populaires', navCommon: 'Liens rapides', linkSearch: 'Recherche d’articles', bannerPublic: 'Liens publics Hot', bannerPublic2: 'Tous les liens de jeux partagés publiquement', bannerHelp: 'Aide NEW', bannerHelp2: 'Accès sans connexion', bannerHelpCenter: 'Centre d’aide GO', bannerHelpCenter2: 'Résoudre 99 % des problèmes' },
    it: { home: 'Home', permanent: 'Indirizzo permanente', vpn: 'VPN consigliato', faq: 'FAQ', donate: 'Dona', findGame: 'Trova gioco', login: 'Accedi', register: 'Registrati', search: 'Cerca', heroTitle: 'Risorse ACG gratuite', heroSub: 'Centro globale di condivisione giochi PC', heroPlaceholder: 'Digita per trovare giochi correlati…', heroSearchBtn: 'Cerca', langBtn: 'A/文', latest: 'Ultimi articoli', notice: 'Avviso', rank: 'Giochi top', navPopular: 'Giochi popolari', navCommon: 'Link rapidi', linkSearch: 'Cerca articoli', bannerPublic: 'Link pubblici Hot', bannerPublic2: 'Tutti i link dei giochi condivisi pubblicamente', bannerHelp: 'Richiesta aiuto NEW', bannerHelp2: 'Accesso senza login', bannerHelpCenter: 'Centro assistenza GO', bannerHelpCenter2: 'Risolve il 99% dei problemi' },
    de: { home: 'Start', permanent: 'Permanente Adresse', vpn: 'VPN empfohlen', faq: 'FAQ', donate: 'Spenden', findGame: 'Spiel finden', login: 'Login', register: 'Registrieren', search: 'Suchen', heroTitle: 'Kostenlose ACG-Ressourcen', heroSub: 'Weltweite PC-Spieltauschzentrale', heroPlaceholder: 'Geben Sie etwas ein, um Spiele zu finden…', heroSearchBtn: 'Suchen', langBtn: 'A/文', latest: 'Neueste Beiträge', notice: 'Hinweis', rank: 'Top-Spiele', navPopular: 'Beliebte Spiele', navCommon: 'Schnellzugriffe', linkSearch: 'Beiträge suchen', bannerPublic: 'Öffentliche Links Hot', bannerPublic2: 'Alle Spielelinks öffentlich geteilt', bannerHelp: 'Hilfe NEW', bannerHelp2: 'Ohne Login nutzbar', bannerHelpCenter: 'Hilfecenter GO', bannerHelpCenter2: '99 % der Probleme lösen' },
    ru: { home: 'Главная', permanent: 'Постоянный адрес', vpn: 'Рекомендуемый VPN', faq: 'FAQ', donate: 'Пожертвовать', findGame: 'Найти игру', login: 'Войти', register: 'Регистрация', search: 'Поиск', heroTitle: 'Бесплатные ресурсы ACG', heroSub: 'Мировой центр обмена ПК-играми', heroPlaceholder: 'Введите текст, чтобы найти игры…', heroSearchBtn: 'Поиск', langBtn: 'A/文', latest: 'Последние статьи', notice: 'Уведомление', rank: 'Топ игр', navPopular: 'Популярные игры', navCommon: 'Быстрые ссылки', linkSearch: 'Поиск статей', bannerPublic: 'Публичные ссылки Hot', bannerPublic2: 'Все ссылки на игры общедоступны', bannerHelp: 'Помощь NEW', bannerHelp2: 'Без входа в систему', bannerHelpCenter: 'Центр помощи GO', bannerHelpCenter2: 'Решает 99% проблем' }
  };

  function apiFetch(url, options = {}) {
    return fetch(API_BASE + url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    }).then(async (res) => {
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = text; }
      if (!res.ok) throw new Error((data && data.message) || '请求失败');
      return data;
    });
  }

  async function loadState() {
    const res = await apiFetch('/api/state');
    const remote = res.item || stateCache.data;
    const localArticles = loadLocalArticles();
    const remoteArticles = Array.isArray(remote.articles) ? remote.articles : [];
    const mergedArticles = attachPersistedTags([...remoteArticles]);
    localArticles.forEach((item) => {
      if (!mergedArticles.some((x) => String(x.id) === String(item.id))) mergedArticles.push(item);
    });
    const normalizedMerged = attachPersistedTags(mergedArticles);
    stateCache.data = { ...remote, articles: normalizedMerged };
    saveLocalArticles(normalizedMerged);
    syncTagsFromItems(normalizedMerged);
    if (normalizedMerged.length !== remoteArticles.length) {
      try { await saveState({ ...remote, articles: normalizedMerged }); } catch (err) {}
    }
    return stateCache.data;
  }
  async function saveState(nextState) { const res = await apiFetch('/api/state', { method: 'PUT', body: JSON.stringify(nextState) }); stateCache.data = res.item || nextState; return stateCache.data; }
  async function apiLoadArticles() {
    const localItems = loadLocalArticles();
    if (localItems.length) {
      stateCache.data.articles = attachPersistedTags(localItems);
      try {
        const res = await apiFetch('/api/articles');
        const apiItems = Array.isArray(res.items) ? res.items : [];
        const merged = attachPersistedTags([...apiItems, ...localItems]);
        stateCache.data.articles = merged;
        saveLocalArticles(merged);
        syncTagsFromItems(merged);
        return merged;
      } catch (e) {
        return stateCache.data.articles;
      }
    }
    try {
      const res = await apiFetch('/api/articles');
      const apiItems = Array.isArray(res.items) ? res.items : [];
      const merged = attachPersistedTags(apiItems);
      stateCache.data.articles = merged;
      saveLocalArticles(merged);
      syncTagsFromItems(merged);
      return merged;
    } catch (e) {
      return attachPersistedTags(Array.isArray(stateCache.data.articles) ? stateCache.data.articles : []);
    }
  }
  async function apiLoadArticle(id) { const res = await apiFetch('/api/articles/' + encodeURIComponent(id)); return res.item || null; }
  async function apiCreateArticle(payload) { return apiFetch('/api/articles', { method: 'POST', body: JSON.stringify(payload) }); }
  async function apiUpdateArticle(id, payload) { return apiFetch('/api/articles/' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify(payload) }); }
  async function apiDeleteArticle(id) { return apiFetch('/api/articles/' + encodeURIComponent(id), { method: 'DELETE' }); }
  async function apiLikeArticle(id) { return apiFetch('/api/articles/' + encodeURIComponent(id) + '/like', { method: 'POST', body: '{}' }); }
  async function apiLoadComments(id) { const res = await apiFetch('/api/articles/' + encodeURIComponent(id) + '/comments'); return Array.isArray(res.items) ? res.items : []; }
  async function apiCreateComment(id, payload) { return apiFetch('/api/articles/' + encodeURIComponent(id) + '/comments', { method: 'POST', body: JSON.stringify(payload) }); }
  async function apiLoadBoardPosts() { const res = await apiFetch('/api/board-posts'); return Array.isArray(res.items) ? res.items : []; }
  async function apiCreateBoardPost(payload) { return apiFetch('/api/board-posts', { method: 'POST', body: JSON.stringify(payload) }); }
  async function apiLogin(payload) { return apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }); }
  async function apiRegister(payload) { return apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }); }
  window.apiLogin = apiLogin;
  window.apiRegister = apiRegister;
  function getState() { return stateCache.data; }
  function setState(next) { stateCache.data = next; return saveState(next); }

  window.TengyouSession = {
    get() { try { const raw = localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } },
    set(username, email) { localStorage.setItem(SESSION_KEY, JSON.stringify({ username: (username || '').trim(), email: (email || '').trim().toLowerCase(), loggedInAt: Date.now() })); },
    clear() { localStorage.removeItem(SESSION_KEY); },
    isLoggedIn() { return !!this.get(); },
  };

  const esc = (s) => String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const fmt = (ts) => { try { return new Date(ts).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };
  const normalizeArticle = (a) => ({ id: a.id, title: a.title || '未命名文章', image: a.image || (a.images && a.images[0]) || '', images: Array.isArray(a.images) ? a.images : (a.image ? [a.image] : []), body: a.body || '', bodyHtml: a.bodyHtml || '', ts: a.ts || 0, authorEmail: a.authorEmail || '', likes: a.likes || 0, comments: Array.isArray(a.comments) ? a.comments : [], isPinned: !!a.isPinned, videos: Array.isArray(a.videos) ? a.videos : [], tags: Array.isArray(a.tags) ? a.tags : [] });
  const articleStats = (a) => ({ likes: a.likes || 0, comments: (a.comments || []).length, heat: (a.likes || 0) * 2 + (a.comments || []).length });
  const isAdmin = (s) => !!s && String(s.email || '').toLowerCase() === APPROVED_EMAIL;

  function getLang() { try { return localStorage.getItem(LANG_KEY) || 'zh-CN'; } catch { return 'zh-CN'; } }
  function setLang(lang) { try { localStorage.setItem(LANG_KEY, lang); } catch {} applyI18n(lang); }
  function applyI18n(lang) { const dict = I18N[lang] || I18N['zh-CN']; document.querySelectorAll('[data-i18n]').forEach((el) => { const key = el.getAttribute('data-i18n'); if (dict[key]) el.textContent = dict[key]; }); document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { const key = el.getAttribute('data-i18n-placeholder'); if (dict[key]) el.setAttribute('placeholder', dict[key]); }); const langBtn = document.getElementById('langSwitchBtn'); const langIcon = document.querySelector('.lang-switch__icon'); if (langBtn) { langBtn.setAttribute('aria-label', '切换语言'); langBtn.setAttribute('title', '切换语言'); if (langIcon) langIcon.textContent = '文/A'; } if (window.initHitokotoCarousel) window.initHitokotoCarousel(); }
  function initTheme() { const stored = localStorage.getItem(THEME_KEY); const theme = stored === 'dark' || stored === 'light' ? stored : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.setAttribute('data-theme', theme); localStorage.setItem(THEME_KEY, theme); applyI18n(getLang()); }
  function ensureLanguageSwitcher() { if (document.getElementById('langSwitchWrap')) return; if (!document.querySelector('.home-banner__overlay')) return; const navActions = document.querySelector('.nav-actions'); if (!navActions) return; const wrap = document.createElement('div'); wrap.className = 'lang-switch'; wrap.id = 'langSwitchWrap'; wrap.innerHTML = '<button type="button" class="icon-btn lang-switch__btn" id="langSwitchBtn" aria-label="切换语言" title="切换语言"><span class="lang-switch__icon" aria-hidden="true">文/A</span></button><div class="lang-switch__menu" id="langSwitchMenu" hidden><button type="button" data-lang="zh-CN">简体中文</button><button type="button" data-lang="zh-TW">繁体中文</button><button type="button" data-lang="en">English</button><button type="button" data-lang="ko">한국어</button><button type="button" data-lang="ja">日本語</button><button type="button" data-lang="fr">Français</button><button type="button" data-lang="it">Italiano</button><button type="button" data-lang="de">Deutsch</button><button type="button" data-lang="ru">Русский</button></div>'; const auth = navActions.querySelector('.nav-auth'); if (auth) navActions.insertBefore(wrap, auth); else navActions.appendChild(wrap); }
  function initLang() { ensureLanguageSwitcher(); applyI18n(getLang()); const wrap = document.getElementById('langSwitchWrap'); const btn = document.getElementById('langSwitchBtn'); const menu = document.getElementById('langSwitchMenu'); if (!wrap || !btn || !menu) return; btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); const willOpen = menu.hidden; document.querySelectorAll('.lang-switch__menu').forEach((m) => { m.hidden = true; }); menu.hidden = !willOpen ? true : false; }); menu.addEventListener('click', (e) => { const target = e.target.closest('[data-lang]'); if (!target) return; setLang(target.dataset.lang); applyI18n(target.dataset.lang); menu.hidden = true; }); document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) menu.hidden = true; }); }
  function toggleTheme() { const cur = document.documentElement.getAttribute('data-theme') || 'light'; const next = cur === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', next); localStorage.setItem(THEME_KEY, next); }
  function getDraftStorageKey() { const session = TengyouSession.get(); return 'tengyou-home-draft:' + String(session && session.email ? session.email : 'guest').toLowerCase(); }
  function getArticlesStorageKey() { return 'tengyou-home-articles'; }
  function saveLocalDraft(payload) { try { localStorage.setItem(getDraftStorageKey(), JSON.stringify(payload)); } catch (e) {} }
  function loadLocalDraft() { try { const raw = localStorage.getItem(getDraftStorageKey()); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
  function dedupeArticles(items) {
    const result = [];
    (Array.isArray(items) ? items : []).forEach((item) => {
      if (!result.some((x) => String(x && x.id) === String(item && item.id))) result.push(item);
    });
    return result;
  }
  function saveLocalArticles(items) { try { localStorage.setItem(getArticlesStorageKey(), JSON.stringify(dedupeArticles(items))); } catch (e) {} }
  function loadLocalArticles() { try { const raw = localStorage.getItem(getArticlesStorageKey()); return dedupeArticles(raw ? JSON.parse(raw) : []); } catch (e) { return []; } }
  function getArticleTagsStorageKey() { return 'tengyou-article-tags'; }
  function loadArticleTagsCache() { try { const raw = localStorage.getItem(getArticleTagsStorageKey()); return raw ? JSON.parse(raw) : {}; } catch (e) { return {}; } }
  function saveArticleTagsCache(map) { try { localStorage.setItem(getArticleTagsStorageKey(), JSON.stringify(map || {})); } catch (e) {} }
  function getPersistedTags(articleId) {
    const cache = loadArticleTagsCache();
    return Array.isArray(cache[String(articleId)]) ? cache[String(articleId)] : [];
  }
  function attachPersistedTags(items) {
    return dedupeArticles(items).map((item) => {
      const next = { ...item };
      const persisted = getPersistedTags(next.id);
      if ((!Array.isArray(next.tags) || !next.tags.length) && persisted.length) next.tags = persisted;
      return next;
    });
  }
  function syncTagsFromItems(items) {
    const map = loadArticleTagsCache();
    dedupeArticles(items).forEach((item) => {
      if (Array.isArray(item.tags) && item.tags.length) map[String(item.id)] = item.tags.slice();
    });
    saveArticleTagsCache(map);
    return map;
  }
  function buildArticleExportPayload(article) {
    const normalized = normalizeArticle(article || {});
    return {
      version: 2,
      exportedAt: Date.now(),
      site: window.location.origin || '',
      article: {
        id: normalized.id,
        title: normalized.title,
        body: normalized.body,
        bodyHtml: normalized.bodyHtml,
        image: normalized.image,
        images: normalized.images,
        videos: normalized.videos,
        tags: normalized.tags,
        authorEmail: normalized.authorEmail,
        ts: normalized.ts,
        likes: normalized.likes,
        comments: normalized.comments,
        isPinned: normalized.isPinned
      },
      media: {
        images: normalized.images.map((src) => ({ src, dataUrl: src && String(src).startsWith('data:') ? src : null })),
        videos: normalized.videos.map((src) => ({ src, dataUrl: src && String(src).startsWith('data:') ? src : null }))
      }
    };
  }
  async function downloadTextFile(filename, text) {
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: 'JSON 文件', accept: { 'application/json': ['.json'] } }]
        });
        const writable = await handle.createWritable();
        await writable.write(new Blob([text], { type: 'application/json;charset=utf-8' }));
        await writable.close();
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function exportArticle(articleId) {
    const articles = await apiLoadArticles();
    const article = articles.find((item) => String(item.id) === String(articleId));
    if (!article) throw new Error('文章不存在，无法导出');
    const payload = buildArticleExportPayload(article);
    const safeTitle = String(payload.article.title || 'article').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 40);
    downloadTextFile('article-' + safeTitle + '-' + payload.article.id + '.json', JSON.stringify(payload, null, 2));
    return payload;
  }
  function buildAllArticlesExportPayload(articles) {
    const safeArticles = Array.isArray(articles) ? dedupeArticles(articles).map((article) => {
      const normalized = normalizeArticle(article);
      const tagList = Array.isArray(normalized.tags) ? normalized.tags.filter(Boolean) : [];
      return {
        id: normalized.id,
        title: normalized.title,
        body: normalized.body,
        bodyHtml: normalized.bodyHtml,
        image: normalized.image,
        images: normalized.images,
        videos: normalized.videos,
        tags: tagList,
        authorEmail: normalized.authorEmail,
        ts: normalized.ts,
        likes: normalized.likes,
        comments: normalized.comments,
        isPinned: normalized.isPinned
      };
    }) : [];
    return {
      version: 2,
      exportedAt: Date.now(),
      site: window.location.origin || '',
      articles: safeArticles,
      media: safeArticles.map((article) => ({
        id: article.id,
        images: (article.images || []).map((src) => ({ src, dataUrl: src && String(src).startsWith('data:') ? src : null })),
        videos: (article.videos || []).map((src) => ({ src, dataUrl: src && String(src).startsWith('data:') ? src : null }))
      }))
    };
  }
  async function exportAllArticles(articles) {
    const payload = buildAllArticlesExportPayload(articles);
    const filename = 'all-articles-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + '.json';
    await downloadTextFile(filename, JSON.stringify(payload, null, 2));
    return payload;
  }
  async function importArticleFile(file) {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed && parsed.articles)) {
      const imported = [];
      for (const item of parsed.articles) {
        imported.push(await importArticleFile({ text: async () => JSON.stringify({ article: item, media: Array.isArray(parsed.media) ? parsed.media.find((m) => String(m.id) === String(item.id)) || null : null }) }));
      }
      return imported.length ? imported[imported.length - 1] : null;
    }
    const article = parsed && parsed.article ? parsed.article : parsed;
    if (!article || typeof article !== 'object') throw new Error('无效的文章文件');
    const normalized = normalizeArticle(article);
    if (!normalized.title || (!normalized.body && !normalized.bodyHtml) || !normalized.image) throw new Error('文章文件缺少必要内容');
    const media = parsed && parsed.media ? parsed.media : null;
    const restoreSrc = (src, fallback) => {
      if (src) return src;
      return fallback || '';
    };
    const restoredImages = Array.isArray(media?.images) && media.images.length
      ? media.images.map((item, idx) => restoreSrc(item.dataUrl, item.src || normalized.images[idx] || normalized.image)).filter(Boolean)
      : normalized.images;
    const restoredVideos = Array.isArray(media?.videos) && media.videos.length
      ? media.videos.map((item, idx) => restoreSrc(item.dataUrl, item.src || normalized.videos[idx] || '')).filter(Boolean)
      : normalized.videos;
    const restoredArticle = {
      ...normalized,
      image: restoredImages[0] || normalized.image,
      images: restoredImages.length ? restoredImages : [normalized.image],
      videos: restoredVideos
    };
    const localArticles = loadLocalArticles();
    const existingIndex = localArticles.findIndex((item) => String(item.id) === String(restoredArticle.id));
    const storedArticle = existingIndex >= 0
      ? { ...localArticles[existingIndex], ...restoredArticle, comments: Array.isArray(restoredArticle.comments) ? restoredArticle.comments : (localArticles[existingIndex].comments || []) }
      : restoredArticle;
    let syncedArticle = storedArticle;
    try {
      const remoteRes = existingIndex >= 0 ? await apiUpdateArticle(storedArticle.id, storedArticle) : await apiCreateArticle(storedArticle);
      if (remoteRes && remoteRes.item) {
        syncedArticle = normalizeArticle({ ...remoteRes.item, tags: Array.isArray(remoteRes.item.tags) ? remoteRes.item.tags : storedArticle.tags });
      }
    } catch (err) {
      console.warn('[import-remote-sync]', err);
    }
    const nextArticles = existingIndex >= 0
      ? localArticles.map((item, idx) => idx === existingIndex ? syncedArticle : item)
      : [...localArticles, syncedArticle];
    const dedupedArticles = dedupeArticles(nextArticles);
    stateCache.data.articles = dedupedArticles;
    saveLocalArticles(dedupedArticles);
    const tagMap = loadArticleTagsCache();
    tagMap[String(syncedArticle.id)] = Array.isArray(syncedArticle.tags) ? syncedArticle.tags : [];
    saveArticleTagsCache(tagMap);
    try { await saveState({ ...(stateCache.data || {}), articles: dedupedArticles }); } catch (err) { console.warn('[import-sync]', err); }
    return syncedArticle;
  }

  function promptImportFiles() {
    const input = document.getElementById('importArticleFileInput');
    if (!input) {
      alert('导入控件未找到，请刷新页面');
      return null;
    }
    return input;
  }

  function updateImportVisibility() {
    const importBtn = document.getElementById('importArticleBtn');
    const exportAllBtn = document.getElementById('exportAllArticlesBtn');
    const input = document.getElementById('importArticleFileInput');
    const session = TengyouSession.get();
    const visible = isAdmin(session);
    [importBtn, exportAllBtn].forEach((btn) => {
      if (!btn) return;
      btn.hidden = !visible;
      btn.disabled = !visible;
      btn.style.display = visible ? '' : 'none';
    });
    if (input) {
      input.disabled = !visible;
    }
    const toolRow = document.querySelector('.home-post-tools');
    if (toolRow) toolRow.dataset.importVisible = visible ? '1' : '0';
  }

  async function renderHome() {
    applyI18n(getLang());
    const list = document.getElementById('homeArticleList'); if (!list) return;
    const chips = document.getElementById('homeHeroChips');
    const bannerChips = document.getElementById('homeBannerChips');
    if (chips) { chips.innerHTML = ''; }
    if (bannerChips) { bannerChips.innerHTML = ''; }
    const pag = document.getElementById('homePagination');
    const items = (await apiLoadArticles()).map(normalizeArticle).sort((a, b) => (b.isPinned === true ? 1 : 0) - (a.isPinned === true ? 1 : 0) || (b.ts || 0) - (a.ts || 0));
    const tagsById = loadArticleTagsCache();
    items.forEach((a) => { if (!Array.isArray(a.tags) || !a.tags.length) a.tags = Array.isArray(tagsById[String(a.id)]) ? tagsById[String(a.id)] : []; });
    saveArticleTagsCache(Object.fromEntries(items.map((a) => [String(a.id), Array.isArray(a.tags) ? a.tags : []])));
    const page = parseInt(list.getAttribute('data-current-page') || '1', 10);
    const perPage = 11; const totalPages = Math.max(1, Math.ceil(items.length / perPage)); const cur = Math.min(Math.max(page, 1), totalPages);
    list.setAttribute('data-current-page', String(cur)); list.innerHTML = '';
    if (!items.length) list.innerHTML = '<p class="board-empty">暂无文章。</p>';
    else items.slice((cur - 1) * perPage, cur * perPage).forEach((a) => { const s = articleStats(a); const tagHtml = Array.isArray(a.tags) && a.tags.length ? '<div class="article-card__tags article-card__tags--inline">' + a.tags.slice(0, 6).map((tag) => '<span class="article-tag-chip">' + esc(tag) + '</span>').join('') + '</div>' : ''; const el = document.createElement('article'); el.className = 'article-card home-article-card'; el.innerHTML = '<div class="article-card__thumb"><a href="article.html?id=' + encodeURIComponent(a.id) + '"><img src="' + esc(a.image || 'https://placehold.co/280x350') + '" alt="' + esc(a.title) + '"></a></div><div class="article-card__body' + (a.isPinned ? ' article-card__body--pinned' : '') + '">' + (a.isPinned ? '<div class="article-card__tags"><span class="tag tag--pin">置顶</span></div>' : '') + '<h2 class="article-card__title"><a href="article.html?id=' + encodeURIComponent(a.id) + '">' + esc(a.title) + '</a></h2><div class="article-card__excerpt article-card__excerpt--plain">' + esc((a.body || '').slice(0, 120) || '暂无正文预览') + '</div><div class="article-card__footer"><div class="article-card__footer-left">' + tagHtml + '<div class="article-card__meta article-card__meta--bottom"><span>点赞 ' + s.likes + '</span><span>评论 ' + s.comments + '</span></div></div><div class="article-card__footer-right">' + (isAdmin(TengyouSession.get()) ? '<div class="article-card__manage-group"><button type="button" class="article-card__manage-btn" data-home-manage="export" data-article-id="' + a.id + '">一键导出</button><button type="button" class="article-card__manage-btn" data-home-manage="edit" data-article-id="' + a.id + '">编辑</button><button type="button" class="article-card__manage-btn" data-home-manage="delete" data-article-id="' + a.id + '">删除</button><button type="button" class="article-card__manage-btn" data-home-manage="pin" data-article-id="' + a.id + '">' + (a.isPinned ? '取消置顶' : '置顶') + '</button></div>' : '') + '<button type="button" class="board-post__like-btn" data-like-article="' + a.id + '">点赞</button></div></div></div>'; list.appendChild(el); });
    if (pag) { pag.innerHTML = ''; pag.hidden = items.length <= perPage; if (!pag.hidden) for (let i = 1; i <= totalPages; i++) { const b = document.createElement('button'); b.type = 'button'; b.className = 'board-pagination__btn' + (i === cur ? ' board-pagination__btn--current' : ''); b.textContent = String(i); b.dataset.homePage = String(i); pag.appendChild(b); } }
    const rank = document.getElementById('hotRankHome'); if (rank) { rank.innerHTML = ''; items.slice(0, 10).forEach((a) => { const row = document.createElement('a'); row.className = 'hot-rank__title-item'; row.href = 'ranking.html#article-' + encodeURIComponent(a.id); row.innerHTML = '<span class="hot-rank__num">' + (items.indexOf(a) + 1) + '</span><span class="hot-rank__title">' + esc(a.title) + '</span><span class="hot-rank__heat">' + articleStats(a).heat + '</span>'; rank.appendChild(row); }); }
    const hotGamesBlock = Array.from(document.querySelectorAll('.sidebar-block')).find((el) => el.querySelector('.sidebar-game-list') && el.querySelector('.sidebar-block__title') && el.querySelector('.sidebar-block__title').textContent.includes('本站热门游戏')); if (hotGamesBlock) hotGamesBlock.remove();
    const commonNavBlock = Array.from(document.querySelectorAll('.sidebar-block')).find((el) => el.querySelector('.sidebar-link-grid') && el.querySelector('.sidebar-block__title') && el.querySelector('.sidebar-block__title').textContent.includes('常用导航栏')); if (commonNavBlock) commonNavBlock.remove();
    const tagCloud = document.getElementById('tagCloudHome'); if (tagCloud) { const counts = new Map(); items.forEach((a) => { (Array.isArray(a.tags) ? a.tags : []).forEach((t) => { const key = String(t || '').trim(); if (!key) return; counts.set(key, (counts.get(key) || 0) + 1); }); }); let topTags = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10); if (!topTags.length) topTags = [['汉化', 1], ['攻略', 1], ['补丁', 1], ['GALGAME', 1], ['全年龄', 1], ['像素', 1], ['RPG', 1], ['ADV', 1]]; tagCloud.innerHTML = topTags.map(([tag, count], idx) => '<a href="search.html?tag=' + encodeURIComponent(tag) + '" class="tc-' + ((idx % 8) + 1) + '">' + esc(tag) + ' <span>(' + count + ')</span></a>').join(''); }
    const tagCounts = new Map();
    items.forEach((a) => { (Array.isArray(a.tags) ? a.tags : []).forEach((t) => { const key = String(t || '').trim(); if (!key) return; tagCounts.set(key, (tagCounts.get(key) || 0) + 1); }); });
    const topTags = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const tagMarkup = topTags.length ? topTags.map(([tag, count], idx) => '<a href="search.html?tag=' + encodeURIComponent(tag) + '" class="home-hero__chip home-hero__chip--tag chip-' + ((idx % 5) + 1) + '">' + esc(tag) + ' <span>(' + count + ')</span></a>').join('') : '';
    if (chips) { chips.innerHTML = tagMarkup; }
    if (bannerChips) { bannerChips.innerHTML = tagMarkup; }
  }

  let rankingMode = 'heat';
  let rankingTagSelection = [];
  function normalizeTagsFromCache(items) { const cache = loadArticleTagsCache(); return items.map((a) => { const next = { ...a }; if (!Array.isArray(next.tags) || !next.tags.length) next.tags = Array.isArray(cache[String(next.id)]) ? cache[String(next.id)] : []; return next; }); }
  function getAllArticleTags(items) { const set = new Set(); normalizeTagsFromCache(items).forEach((a) => (Array.isArray(a.tags) ? a.tags : []).forEach((t) => { const tag = String(t || '').trim(); if (tag) set.add(tag); })); return Array.from(set).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN')); }
  function filterRankingItems(items) { let filtered = normalizeTagsFromCache(items).slice(); if (rankingMode === 'tool') filtered = filtered.filter((a) => (Array.isArray(a.tags) ? a.tags : []).some((t) => String(t).trim() === '工具补丁')); else if (rankingTagSelection.length) filtered = filtered.filter((a) => rankingTagSelection.every((tag) => (Array.isArray(a.tags) ? a.tags : []).some((t) => String(t).trim() === tag))); if (rankingMode === 'updated') filtered.sort((a, b) => (b.ts || 0) - (a.ts || 0)); else filtered.sort((a, b) => articleStats(b).heat - articleStats(a).heat || (b.ts || 0) - (a.ts || 0)); return filtered; }
  function initRankingFilters(items) { const modeBtns = document.querySelectorAll('[data-ranking-mode]'); const tagBtn = document.getElementById('rankingTagPickerBtn'); const tagPanel = document.getElementById('rankingTagPanel'); const tagPanelList = document.getElementById('rankingTagPanelList'); const tagSummary = document.getElementById('rankingTagSummary'); const tagConfirm = document.getElementById('rankingTagConfirmBtn'); const tagClose = document.getElementById('rankingTagPanelCloseBtn'); const rankList = document.getElementById('rankingList'); if (!tagPanelList || !tagSummary) return; const allTags = getAllArticleTags(items); tagPanelList.innerHTML = allTags.map((tag) => '<button type="button" class="ranking-tag-option" data-tag-option="' + esc(tag) + '">' + esc(tag) + '</button>').join('') || '<p class="board-empty">暂无标签</p>'; const syncSummary = () => { tagSummary.textContent = rankingTagSelection.length ? '已选：' + rankingTagSelection.join('、') : '未选择标签'; tagPanelList.querySelectorAll('[data-tag-option]').forEach((el) => { const active = rankingTagSelection.includes(el.dataset.tagOption); el.classList.toggle('is-active', active); }); }; if (tagBtn && !tagBtn.dataset.boundRanking) { tagBtn.dataset.boundRanking = '1'; tagBtn.addEventListener('click', () => { if (tagPanel) tagPanel.hidden = !tagPanel.hidden; syncSummary(); }); } if (tagClose && !tagClose.dataset.boundRanking) { tagClose.dataset.boundRanking = '1'; tagClose.addEventListener('click', () => { if (tagPanel) tagPanel.hidden = true; }); } if (tagConfirm && !tagConfirm.dataset.boundRanking) { tagConfirm.dataset.boundRanking = '1'; tagConfirm.addEventListener('click', () => { if (rankList) rankList.setAttribute('data-ranking-page', '1'); if (tagPanel) tagPanel.hidden = true; renderRanking(); }); } if (!tagPanelList.dataset.boundRanking) { tagPanelList.dataset.boundRanking = '1'; tagPanelList.addEventListener('click', (e) => { const btn = e.target.closest('[data-tag-option]'); if (!btn) return; const tag = btn.dataset.tagOption; if (rankingTagSelection.includes(tag)) rankingTagSelection = rankingTagSelection.filter((x) => x !== tag); else rankingTagSelection.push(tag); syncSummary(); }); } modeBtns.forEach((btn) => { if (btn.dataset.boundRanking) return; btn.dataset.boundRanking = '1'; btn.addEventListener('click', () => { rankingMode = btn.dataset.rankingMode || 'heat'; if (rankList) rankList.setAttribute('data-ranking-page', '1'); modeBtns.forEach((b) => b.classList.toggle('is-active', b === btn)); renderRanking(); }); }); syncSummary(); initTooltips(); }
  function initTooltips() { let tip = document.getElementById('rankingTooltip'); if (!tip) { tip = document.createElement('div'); tip.id = 'rankingTooltip'; tip.className = 'ranking-tooltip'; tip.hidden = true; document.body.appendChild(tip); } const show = (text, x, y) => { tip.textContent = text; tip.style.left = (x + 12) + 'px'; tip.style.top = (y + 12) + 'px'; tip.hidden = false; }; const hide = () => { tip.hidden = true; }; document.querySelectorAll('[data-tooltip]').forEach((el) => { if (el.dataset.boundTooltip) return; el.dataset.boundTooltip = '1'; el.addEventListener('mouseenter', (e) => show(el.dataset.tooltip || '', e.pageX, e.pageY)); el.addEventListener('mousemove', (e) => show(el.dataset.tooltip || '', e.pageX, e.pageY)); el.addEventListener('mouseleave', hide); el.addEventListener('focus', (e) => show(el.dataset.tooltip || '', e.pageX || 0, e.pageY || 0)); el.addEventListener('blur', hide); }); document.addEventListener('scroll', hide, true); }
  async function renderRanking() {
    const list = document.getElementById('rankingList');
    if (!list) return;

    const logoImg = document.querySelector('.site-header .logo__image');
    if (logoImg) logoImg.src = 'assets/0001.png';

    const pag = document.getElementById('rankingPagination');
    const allItems = (await apiLoadArticles()).map(normalizeArticle);
    initRankingFilters(allItems);
    const items = filterRankingItems(allItems);
    const perPage = 15;
    const totalPages = Math.max(1, Math.ceil(items.length / perPage));

    let cur = parseInt(list.getAttribute('data-ranking-page') || '1', 10);
    if (!Number.isFinite(cur) || cur < 1) cur = 1;
    if (cur > totalPages) cur = totalPages;
    list.setAttribute('data-ranking-page', String(cur));
    window.__rankingPage = cur;

    list.innerHTML = '';
    const pageItems = items.slice((cur - 1) * perPage, cur * perPage);
    pageItems.forEach((a, i) => {
      const idx = (cur - 1) * perPage + i + 1;
      const s = articleStats(a);
      const tagHtml = Array.isArray(a.tags) && a.tags.length
        ? '<div class="article-card__tags article-card__tags--inline">' + a.tags.slice(0, 6).map((tag) => '<span class="article-tag-chip">' + esc(tag) + '</span>').join('') + '</div>'
        : '';
      const topBadge = idx <= 3 ? '<span class="ranking-top-badge ranking-top-badge--top' + idx + '">top' + idx + '</span>' : '';
      const card = document.createElement('article');
      card.className = 'article-card home-article-card';
      card.id = 'article-' + a.id;
      card.innerHTML = '<div class="article-card__thumb"><a href="article.html?id=' + encodeURIComponent(a.id) + '">' + topBadge + '<img src="' + esc(a.image || 'https://placehold.co/280x350') + '" alt="' + esc(a.title) + '"></a></div><div class="article-card__body' + (a.isPinned ? ' article-card__body--pinned' : '') + '">' + (a.isPinned ? '<div class="article-card__tags"><span class="tag tag--pin">置顶</span></div>' : '') + '<h2 class="article-card__title"><a href="article.html?id=' + encodeURIComponent(a.id) + '">' + esc(a.title) + '</a></h2><div class="article-card__excerpt article-card__excerpt--plain">' + esc((a.body || '').slice(0, 120) || '暂无正文预览') + '</div>' + tagHtml + '<div class="article-card__footer"><div class="article-card__footer-left"><div class="article-card__meta article-card__meta--bottom"><span>排名 ' + idx + '</span><span>点赞 ' + s.likes + '</span><span>评论 ' + s.comments + '</span></div></div><div class="article-card__footer-right"><span class="hot-rank__heat">热度 ' + s.heat + '</span></div></div></div>';
      list.appendChild(card);
    });

    if (pag) {
      pag.innerHTML = '';
      pag.hidden = items.length <= perPage;
      if (!pag.hidden) {
        const mkBtn = (label, page) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'board-pagination__btn';
          b.textContent = label;
          b.dataset.gotoPage = String(page);
          b.disabled = page < 1 || page > totalPages;
          return b;
        };

        pag.appendChild(mkBtn('上一页', cur - 1));
        const maxButtons = 5;
        const start = Math.max(1, Math.min(cur - Math.floor(maxButtons / 2), totalPages - maxButtons + 1));
        const end = Math.min(totalPages, start + maxButtons - 1);
        for (let i = start; i <= end; i++) {
          const b = mkBtn(String(i), i);
          if (i === cur) b.classList.add('board-pagination__btn--current');
          pag.appendChild(b);
        }
        pag.appendChild(mkBtn('下一页', cur + 1));
      }

      if (!pag.dataset.boundRanking) {
        pag.dataset.boundRanking = '1';
        pag.addEventListener('click', (e) => {
          const pageBtn = e.target.closest('[data-goto-page]');
          if (!pageBtn) return;
          const nextPage = parseInt(pageBtn.dataset.gotoPage || '1', 10);
          if (!Number.isFinite(nextPage) || nextPage < 1) return;
          document.getElementById('rankingList').setAttribute('data-ranking-page', String(nextPage));
          renderRanking();
        });
      }
    }
  }

  async function renderSearch() { const list = document.getElementById('searchResultList'); if (!list) return; const qs = new URLSearchParams(location.search); const q = (qs.get('q') || '').trim(); const tag = (qs.get('tag') || '').trim(); const items = (await apiLoadArticles()).map(normalizeArticle); const tagsById = loadArticleTagsCache(); items.forEach((a) => { if (!Array.isArray(a.tags) || !a.tags.length) a.tags = Array.isArray(tagsById[String(a.id)]) ? tagsById[String(a.id)] : []; }); const normalizedQ = q.toLowerCase(); const scored = items.map((a) => { const title = String(a.title || '').toLowerCase(); if (tag) { const tagMatched = (Array.isArray(a.tags) ? a.tags : []).some((t) => String(t).trim().toLowerCase() === tag.toLowerCase()); return { a, score: tagMatched ? 1000 + articleStats(a).heat : -1 }; } if (!normalizedQ) return { a, score: -1 }; if (title === normalizedQ) return { a, score: 2000 + articleStats(a).heat }; if (title.startsWith(normalizedQ)) return { a, score: 1500 + articleStats(a).heat }; if (title.includes(normalizedQ)) return { a, score: 1000 + articleStats(a).heat }; let overlap = 0; for (const ch of new Set(Array.from(normalizedQ))) if (title.includes(ch)) overlap += 1; return { a, score: overlap ? overlap * 10 + articleStats(a).heat : -1 }; }).filter((x) => x.score >= 0).sort((a, b) => b.score - a.score || articleStats(b.a).heat - articleStats(a.a).heat || (b.a.ts || 0) - (a.a.ts || 0)).map((x) => x.a).slice(0, 300); list.innerHTML = !q && !tag ? '<p class="board-empty">请输入标题关键词进行搜索。</p>' : !scored.length ? '<p class="board-empty">没有找到匹配的文章。</p>' : ''; scored.forEach((a, idx) => { const card = document.createElement('article'); card.className = 'article-card'; card.innerHTML = '<div class="article-card__thumb"><a href="article.html?id=' + encodeURIComponent(a.id) + '"><img src="' + esc(a.image) + '" alt="' + esc(a.title) + '"></a></div><div class="article-card__body' + (a.isPinned ? ' article-card__body--pinned' : '') + '">' + (a.isPinned ? '<div class="article-card__tags"><span class="tag tag--pin">置顶</span></div>' : '') + '<h2 class="article-card__title"><a href="article.html?id=' + encodeURIComponent(a.id) + '">' + esc(a.title) + '</a></h2><div class="article-card__meta article-card__meta--bottom"><span>热度 ' + articleStats(a).heat + '</span><span>匹配度 ' + (scored.length - idx) + '</span></div></div>'; list.appendChild(card); }); }
  window.apiLoadArticles = apiLoadArticles; window.apiUpdateArticle = apiUpdateArticle; window.apiDeleteArticle = apiDeleteArticle; window.apiLikeArticle = apiLikeArticle; window.saveLocalArticles = saveLocalArticles; window.loadLocalArticles = loadLocalArticles; window.saveState = saveState; window.getState = getState; window.renderHome = renderHome; window.renderRanking = renderRanking;

  async function renderArticle() {
    const root = document.getElementById('articlePage'); if (!root) return; const id = new URLSearchParams(location.search).get('id'); const article = normalizeArticle(await apiLoadArticle(id)); if (!article || !article.id) { root.innerHTML = '<p class="board-empty">文章不存在。</p>'; return; }
    const contentHtml = (article.bodyHtml || article.body || '').trim();
    const mediaGallery = article.images.length ? '<div class="article-gallery">' + article.images.map((src, i) => '<figure class="article-gallery__item"><img src="' + esc(src) + '" alt="' + esc(article.title + ' 图片 ' + (i + 1)) + '"><figcaption>图片 ' + (i + 1) + '</figcaption></figure>').join('') + '</div>' : '';
    const mediaVideos = article.videos.length ? '<div class="article-video-list">' + article.videos.map((src, i) => '<div class="article-video-item"><video controls playsinline src="' + esc(src) + '"></video><p>视频 ' + (i + 1) + '</p></div>').join('') + '</div>' : '';
    const articleTags = Array.isArray(article.tags) && article.tags.length ? '<div class="article-detail__tags">' + article.tags.map((tag) => '<span class="article-tag-chip">' + esc(tag) + '</span>').join('') + '</div>' : '';
    if (!article.tags.length) { const cachedTags = loadArticleTagsCache()[String(article.id)] || []; if (cachedTags.length) article.tags = cachedTags; }
    root.innerHTML = '<section class="content-section article-detail"><div class="article-detail__header">' + (article.isPinned ? '<span class="article-pin-badge">置顶</span>' : '') + '<h1 class="article-detail__title">' + esc(article.title) + '</h1></div><div class="article-detail__meta">发布时间 ' + fmt(article.ts) + '</div><div class="article-detail__actions"><button type="button" class="article-like-btn" data-article-like="' + article.id + '">点赞</button><span class="article-like-count">点赞 ' + (article.likes || 0) + '</span><span class="article-comment-count">评论 ' + article.comments.length + '</span></div>' + mediaGallery + mediaVideos + '<div class="board-post__text board-post__text--rich article-detail__content">' + contentHtml + '</div>' + articleTags + '<section class="content-section article-comments-section"><h2>评论区</h2><div id="articleCommentList"></div><form id="articleCommentForm" class="board-comment-form"><textarea name="comment" maxlength="1000" required placeholder="发表评论…"></textarea><button class="btn-primary btn-primary--sm" type="submit">发表评论</button></form></section></section>';
    const list = document.getElementById('articleCommentList'); const form = document.getElementById('articleCommentForm');
    async function renderComments() { const comments = await apiLoadComments(id); list.innerHTML = comments.length ? comments.map((c) => '<div class="board-comment"><div class="board-comment__meta"><span class="board-comment__name">' + esc(c.nickname || '匿名旅人') + '</span><span class="board-comment__time">' + fmt(c.ts) + '</span></div><p class="board-comment__text">' + esc(c.body || '') + '</p></div>').join('') : '<p class="board-comment-empty">暂无评论</p>'; }
    await renderComments();
    if (form) form.addEventListener('submit', async (e) => { e.preventDefault(); const session = TengyouSession.get(); if (!session) return alert('请先登录'); const ta = form.querySelector('textarea[name="comment"]'); const body = ta.value.trim(); if (!body) return; await apiCreateComment(id, { nickname: session.username, authorEmail: session.email, body, ts: Date.now() }); ta.value = ''; await renderArticle(); });
    const likeBtn = root.querySelector('[data-article-like]'); if (likeBtn) likeBtn.addEventListener('click', async () => { await apiLikeArticle(id); await renderArticle(); await renderHome(); await renderRanking(); });
  }

  async function renderBoard() { const view = document.getElementById('boardView'); if (!view) return; const posts = (await apiLoadBoardPosts()).slice().sort((a, b) => (b.ts || 0) - (a.ts || 0)); view.innerHTML = posts.length ? posts.map((p) => '<article class="board-thread"><div class="board-post"><div class="board-post__avatar" aria-hidden="true">' + esc((p.nickname || '匿').charAt(0)) + '</div><div class="board-post__body"><div class="board-post__head"><span class="board-post__name">' + esc(p.nickname || '匿名旅人') + '</span><span class="board-post__time">' + fmt(p.ts) + '</span></div><button type="button" class="board-post__title-btn" data-open-post="' + p.id + '">' + esc(p.body || '') + '</button></div></div></article>').join('') : '<p class="board-empty">暂无留言，登录后来发第一条吧～</p>'; }

  function initSearchBindings() {
    const targets = [
      { input: document.getElementById('heroSearchInput'), button: document.getElementById('heroSearchBtn') },
      { input: document.getElementById('homeSearchInput'), button: document.getElementById('homeSearchBtn') },
      { input: document.getElementById('sidebarSearch'), button: document.getElementById('searchConfirmBtn') },
    ];
    const goSearch = (input) => { const q = (input && input.value || '').trim(); if (q) location.href = 'search.html?q=' + encodeURIComponent(q); };
    targets.forEach(({ input, button }) => {
      if (input && !input.dataset.boundSearch) {
        input.dataset.boundSearch = '1';
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); goSearch(input); } });
      }
      if (button && !button.dataset.boundSearch) {
        button.dataset.boundSearch = '1';
        button.addEventListener('click', () => {
          const q = (input && input.value || '').trim();
          console.log('[search-click]', q, button.id, input && input.id);
          alert('搜索按钮已点击：' + (q || '空')); 
          goSearch(input);
        });
      }
      if (button && !button.dataset.boundPointer) {
        button.dataset.boundPointer = '1';
        button.addEventListener('pointerup', () => console.log('[search-pointerup]', button.id));
      }
    });
  }

  function initAuth() {
    const loginAccountHistory = document.getElementById('loginAccountHistory');
    const loginForm = document.getElementById('loginForm');
    if (loginForm && !loginForm.dataset.boundAuth) {
      loginForm.dataset.boundAuth = '1';
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const accountInput = loginForm.querySelector('input[name="account"]');
        const passwordInput = loginForm.querySelector('input[name="password"]');
        const rememberInput = loginForm.querySelector('input[name="rememberMe"]');
        const account = accountInput?.value.trim();
        const password = passwordInput?.value || '';
        const email = loginForm.querySelector('input[name="email"]')?.value.trim() || account;
        if (!account || !password) return alert('请填写账号和密码');
        const rememberKey = 'tengyou-login-remember';
        const historyKey = 'tengyou-login-history';
        const existingHistory = (() => { try { return JSON.parse(localStorage.getItem(historyKey) || '[]'); } catch { return []; } })();
        if (account && !existingHistory.includes(account)) { existingHistory.unshift(account); localStorage.setItem(historyKey, JSON.stringify(existingHistory.slice(0, 10))); if (loginAccountHistory) loginAccountHistory.innerHTML = existingHistory.slice(0, 10).map((item) => '<option value="' + esc(item) + '"></option>').join(''); }
        if (rememberInput && rememberInput.checked) { try { localStorage.setItem(rememberKey, JSON.stringify({ account, password, email })); } catch (err) {} } else { localStorage.removeItem(rememberKey); }
        TengyouSession.set(account, email);
        let loginOk = false;
        try { const res = await apiLogin({ account, password }); const item = res.item || {}; TengyouSession.set(item.username || account, item.email || email); loginOk = true; } catch (err) { console.warn('[login-error]', err); }
        console.log('[login]', { account, email, loginOk, session: TengyouSession.get() });
        alert(loginOk ? '登录成功' : '登录成功（本地会话）');
        updateImportVisibility();
        await renderHome();
        if (window.location.pathname.includes('login.html')) window.location.href = 'index.html';
      });
    }
    if (loginForm) {
      try {
        const remembered = JSON.parse(localStorage.getItem('tengyou-login-remember') || 'null');
        if (remembered) {
          const accountInput = loginForm.querySelector('input[name="account"]');
          const passwordInput = loginForm.querySelector('input[name="password"]');
          const rememberInput = loginForm.querySelector('input[name="rememberMe"]');
          if (accountInput) accountInput.value = remembered.account || '';
          if (passwordInput) passwordInput.value = remembered.password || '';
          if (rememberInput) rememberInput.checked = true;
        }
        const history = JSON.parse(localStorage.getItem('tengyou-login-history') || '[]');
        if (loginAccountHistory && Array.isArray(history)) loginAccountHistory.innerHTML = history.slice(0, 10).map((item) => '<option value="' + esc(item) + '"></option>').join('');
      } catch (err) {}
    }
    const registerForm = document.getElementById('registerForm');
    if (registerForm && !registerForm.dataset.boundAuth) {
      registerForm.dataset.boundAuth = '1';
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const u = registerForm.querySelector('input[name="username"]')?.value.trim();
        const email = registerForm.querySelector('input[name="email"]')?.value.trim();
        const password = registerForm.querySelector('input[name="password"]')?.value || '';
        const password2 = registerForm.querySelector('input[name="password2"]')?.value || '';
        const agree = registerForm.querySelector('input[name="agree"]')?.checked;
        if (!u || !email || !password) return alert('请填写完整注册信息');
        if (password !== password2) return alert('两次输入的密码不一致');
        if (!agree) return alert('请先勾选同意条款');
        try {
          const res = await apiRegister({ username: u, email, password });
          const item = res.item || {};
          TengyouSession.set(item.username || u, item.email || email);
          alert('注册成功并已登录');
          updateImportVisibility();
          if (window.location.pathname.includes('register.html')) window.location.href = 'login.html';
        } catch (err) {
          TengyouSession.set(u, email);
          alert((err && err.message) ? ('注册已本地保存：' + err.message) : '注册已本地保存');
        }
      });
    }
  }

  function initPostEditor() {
    const postBtn = document.getElementById('openPostFormBtn'); const postModal = document.getElementById('homePostModal'); const postForm = document.getElementById('homePostForm'); const titleInput = postForm && postForm.querySelector('input[name="title"]'); const bodyEditor = document.getElementById('homePostBodyEditor'); const bodyInput = document.getElementById('homePostBodyInput'); const imageInput = document.getElementById('homePostImagesInput'); const imageList = document.getElementById('homePostImagesList'); const videoInput = document.getElementById('homePostVideosInput'); const videoList = document.getElementById('homePostVideosList'); const addImageBtn = document.getElementById('addImageBtn'); const addVideoBtn = document.getElementById('addVideoBtn'); const tagInput = document.getElementById('homePostTagInput'); const addTagBtn = document.getElementById('addTagBtn'); const tagsList = document.getElementById('homePostTagsList'); const editorToolbar = document.querySelector('.rich-editor-toolbar'); const colorInput = document.getElementById('postTextColor'); const sizeInput = document.getElementById('postTextSize'); let images = []; let videos = []; let tags = []; if (!postBtn || !postModal || !postForm) return;
    const localDraft = loadLocalDraft();
    const syncImages = () => { if (imageList) imageList.innerHTML = images.map((src, i) => '<div class="home-post-image-item"><img src="' + esc(src) + '" data-preview-media="image" data-preview-index="' + i + '" alt="图片 ' + (i + 1) + '"><div class="home-post-image-item__foot"><p class="home-post-image-item__label">' + (i === 0 ? '主图' : '图片 ' + (i + 1)) + '</p><button type="button" class="home-post-image-item__remove" data-remove-home-image="' + i + '">删除</button></div></div>').join(''); };
    const syncVideos = () => { if (videoList) videoList.innerHTML = videos.map((src, i) => '<div class="home-post-image-item"><video controls src="' + esc(src) + '" data-preview-media="video" data-preview-index="' + i + '" style="width:100%;max-width:180px;border-radius:10px;background:#000"></video><div class="home-post-image-item__foot"><p class="home-post-image-item__label">' + (i === 0 ? '主视频' : '视频 ' + (i + 1)) + '</p><button type="button" class="home-post-image-item__remove" data-remove-home-video="' + i + '">删除</button></div></div>').join(''); };
    const syncTags = () => { if (tagsList) tagsList.innerHTML = tags.map((tag, i) => '<span class="home-post-tags__tag">' + esc(tag) + '<button type="button" class="home-post-tags__remove" data-remove-tag="' + i + '" aria-label="删除标签">×</button></span>').join(''); };
    const closePostModal = () => { postModal.hidden = true; const viewer = document.getElementById('homePostMediaViewer'); if (viewer) viewer.hidden = true; };
    if (bodyInput && bodyEditor) bodyInput.value = bodyEditor.innerHTML;
    if (postBtn && !postBtn.dataset.boundPost) { postBtn.dataset.boundPost = '1'; postBtn.addEventListener('click', () => { const session = TengyouSession.get(); console.log('[post-button]', { session, isAdmin: isAdmin(session), hasModal: !!postModal }); if (!isAdmin(session)) { alert('当前账号不是管理员'); return; } postModal.hidden = false; if (localDraft) { if (titleInput) titleInput.value = localDraft.title || ''; if (bodyEditor) bodyEditor.innerHTML = localDraft.bodyHtml || ''; if (bodyInput) bodyInput.value = localDraft.bodyHtml || ''; images = Array.isArray(localDraft.images) ? localDraft.images.slice() : []; videos = Array.isArray(localDraft.videos) ? localDraft.videos.slice() : []; tags = Array.isArray(localDraft.tags) ? localDraft.tags.slice() : []; syncImages(); syncVideos(); syncTags(); } alert('发表文章按钮已点击'); }); }
    if (postBtn && !postBtn.dataset.boundPointer) { postBtn.dataset.boundPointer = '1'; postBtn.addEventListener('pointerup', () => { console.log('[post-button-pointerup]', TengyouSession.get(), isAdmin(TengyouSession.get())); }); }
    if (!postModal.dataset.boundClose) { postModal.dataset.boundClose = '1'; postModal.addEventListener('click', (e) => { if (e.target && e.target.hasAttribute('data-close-post-modal')) closePostModal(); }); }
    if (addImageBtn && imageInput && !addImageBtn.dataset.boundPost) { addImageBtn.dataset.boundPost = '1'; addImageBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); imageInput.click(); }); }
    if (addVideoBtn && videoInput && !addVideoBtn.dataset.boundPost) { addVideoBtn.dataset.boundPost = '1'; addVideoBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); videoInput.click(); }); }
    if (bodyEditor && !bodyEditor.dataset.boundPost) { bodyEditor.dataset.boundPost = '1'; bodyEditor.addEventListener('click', (e) => e.stopPropagation()); }
    const addTag = () => { const value = (tagInput && tagInput.value || '').trim(); if (!value) return; if (!tags.includes(value)) tags.push(value); if (tagInput) tagInput.value = ''; syncTags(); };
    if (addTagBtn && !addTagBtn.dataset.boundPost) { addTagBtn.dataset.boundPost = '1'; addTagBtn.addEventListener('click', (e) => { e.preventDefault(); addTag(); }); }
    if (tagInput && !tagInput.dataset.boundPost) { tagInput.dataset.boundPost = '1'; tagInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }); }
    if (tagsList && !tagsList.dataset.boundPost) { tagsList.dataset.boundPost = '1'; tagsList.addEventListener('click', (e) => { const btn = e.target.closest('[data-remove-tag]'); if (!btn) return; tags.splice(parseInt(btn.dataset.removeTag, 10), 1); syncTags(); }); }
    const execEditorCommand = (command, value = null) => { if (!bodyEditor) return; bodyEditor.focus(); try { document.execCommand(command, false, value); } catch (e) {} if (bodyInput) bodyInput.value = bodyEditor.innerHTML; saveLocalDraft({ title: titleInput ? titleInput.value : '', bodyHtml: bodyEditor.innerHTML, images: images.slice(), videos: videos.slice(), ts: Date.now() }); };
    if (editorToolbar && !editorToolbar.dataset.boundPost) { editorToolbar.dataset.boundPost = '1'; editorToolbar.addEventListener('click', (e) => { const btn = e.target.closest('[data-editor-command]'); if (!btn) return; e.preventDefault(); const cmd = btn.dataset.editorCommand; const val = btn.dataset.editorValue || null; if (cmd === 'createLink') { const url = window.prompt('请输入链接地址'); if (url) execEditorCommand('createLink', url); return; } if (cmd === 'formatBlock') execEditorCommand(cmd, '<' + val + '>'); else execEditorCommand(cmd, val); }); }
    if (colorInput && !colorInput.dataset.boundPost) { colorInput.dataset.boundPost = '1'; colorInput.addEventListener('change', () => execEditorCommand('foreColor', colorInput.value)); }
    if (sizeInput && !sizeInput.dataset.boundPost) { sizeInput.dataset.boundPost = '1'; sizeInput.addEventListener('change', () => execEditorCommand('fontSize', sizeInput.value)); }
    function openMediaViewer(type, index) { const viewer = document.getElementById('homePostMediaViewer'); if (!viewer) return; const content = viewer.querySelector('.home-post-media-viewer__content'); const caption = viewer.querySelector('.home-post-media-viewer__caption'); const arr = type === 'video' ? videos : images; const src = arr[index]; if (!src) return; content.innerHTML = type === 'video' ? '<video controls autoplay src="' + esc(src) + '"></video>' : '<img src="' + esc(src) + '" alt="预览图片">'; caption.textContent = (type === 'video' ? '视频预览' : '图片预览') + ' · 第 ' + (index + 1) + ' 个'; viewer.hidden = false; }
    const mediaViewer = document.getElementById('homePostMediaViewer');
    if (mediaViewer && !mediaViewer.dataset.boundPost) { mediaViewer.dataset.boundPost = '1'; mediaViewer.addEventListener('click', (e) => { if (e.target && e.target.hasAttribute('data-close-media-viewer')) mediaViewer.hidden = true; if (e.target === mediaViewer) mediaViewer.hidden = true; }); }
    if (imageInput && !imageInput.dataset.boundPost) { imageInput.dataset.boundPost = '1'; imageInput.addEventListener('change', (e) => { Array.from(e.target.files || []).forEach((file) => { const r = new FileReader(); r.onload = () => { images.push(String(r.result || '')); syncImages(); }; r.readAsDataURL(file); }); imageInput.value = ''; }); }
    if (imageList && !imageList.dataset.boundPost) { imageList.dataset.boundPost = '1'; imageList.addEventListener('click', (e) => { const btn = e.target.closest('[data-remove-home-image]'); if (btn) { images.splice(parseInt(btn.dataset.removeHomeImage, 10), 1); syncImages(); return; } const preview = e.target.closest('[data-preview-media]'); if (preview && preview.dataset.previewMedia === 'image') openMediaViewer('image', parseInt(preview.dataset.previewIndex, 10)); }); }
    if (videoInput && !videoInput.dataset.boundPost) { videoInput.dataset.boundPost = '1'; videoInput.addEventListener('change', (e) => { Array.from(e.target.files || []).forEach((file) => { const r = new FileReader(); r.onload = () => { videos.push(String(r.result || '')); syncVideos(); }; r.readAsDataURL(file); }); videoInput.value = ''; }); }
    if (videoList && !videoList.dataset.boundPost) { videoList.dataset.boundPost = '1'; videoList.addEventListener('click', (e) => { const btn = e.target.closest('[data-remove-home-video]'); if (btn) { videos.splice(parseInt(btn.dataset.removeHomeVideo, 10), 1); syncVideos(); return; } const preview = e.target.closest('[data-preview-media]'); if (preview && preview.dataset.previewMedia === 'video') openMediaViewer('video', parseInt(preview.dataset.previewIndex, 10)); }); }
    if (bodyEditor && !bodyEditor.dataset.boundInput) { bodyEditor.dataset.boundInput = '1'; bodyEditor.addEventListener('input', () => { if (bodyInput) bodyInput.value = bodyEditor.innerHTML; saveLocalDraft({ title: titleInput ? titleInput.value : '', bodyHtml: bodyEditor.innerHTML, images: images.slice(), videos: videos.slice(), ts: Date.now() }); }); }
    const publishArticle = async () => { const session = TengyouSession.get(); if (!session || !isAdmin(session)) { alert('仅管理员可发表文章'); return; } const title = titleInput ? titleInput.value.trim() : ''; const bodyHtml = bodyEditor ? bodyEditor.innerHTML.trim() : ''; const bodyText = bodyEditor ? bodyEditor.innerText.trim() : ''; if (!title || !bodyHtml || !images.length) { alert('请填写标题、正文并至少添加一张图片'); return; } const payload = { title, image: images[0], images: images.slice(), body: bodyText, bodyHtml, authorEmail: session.email, videos: videos.slice(), tags: tags.slice(), ts: Date.now() }; const existing = Array.isArray(stateCache.data.articles) ? stateCache.data.articles : []; let mergedArticles = existing; let savedTags = tags.slice(); try { const res = await apiCreateArticle(payload); const savedArticle = normalizeArticle((res && res.item) ? { ...res.item, tags: Array.isArray(res.item.tags) ? res.item.tags : payload.tags } : { ...payload, likes: 0, comments: [], isPinned: false }); savedTags = Array.isArray(savedArticle.tags) ? savedArticle.tags : savedTags; mergedArticles = [...existing.filter((item) => String(item.id) !== String(savedArticle.id)), savedArticle]; } catch (e) { const localArticle = normalizeArticle({ id: Date.now(), ...payload, likes: 0, comments: [], isPinned: false }); savedTags = Array.isArray(localArticle.tags) ? localArticle.tags : savedTags; mergedArticles = [...existing.filter((item) => String(item.id) !== String(localArticle.id)), localArticle]; } stateCache.data.articles = mergedArticles; saveLocalArticles(mergedArticles); const savedArticleId = String((mergedArticles[mergedArticles.length - 1] || {}).id || Date.now()); const tagMap = loadArticleTagsCache(); tagMap[savedArticleId] = savedTags; saveArticleTagsCache(tagMap); try { await saveState({ ...(stateCache.data || {}), articles: mergedArticles }); } catch (err) {} images = []; videos = []; tags = []; syncImages(); syncVideos(); syncTags(); if (bodyEditor) bodyEditor.innerHTML = ''; if (bodyInput) bodyInput.value = ''; if (titleInput) titleInput.value = ''; closePostModal(); localStorage.removeItem(getDraftStorageKey()); alert('发布成功，标签：' + (savedTags.length ? savedTags.join('、') : '无')); await renderHome(); await renderRanking(); };
    if (postForm && !postForm.dataset.boundPost) { postForm.dataset.boundPost = '1'; postForm.addEventListener('submit', async (e) => { e.preventDefault(); await publishArticle(); }); }
    const editModal = document.getElementById('homeArticleEditModal');
    const editForm = document.getElementById('homeArticleEditForm');
    const editTitleInput = editForm && editForm.querySelector('input[name="title"]');
    const editIdInput = editForm && editForm.querySelector('input[name="id"]');
    const editBodyEditor = document.getElementById('homeArticleEditBodyEditor');
    const editBodyInput = document.getElementById('homeArticleEditBodyInput');
    const editImagesList = document.getElementById('homeArticleEditImagesList');
    const editVideosList = document.getElementById('homeArticleEditVideosList');
    const editImageInput = document.getElementById('homeArticleEditImagesInput');
    const editVideoInput = document.getElementById('homeArticleEditVideosInput');
    const editAddImageBtn = document.getElementById('editAddImageBtn');
    const editAddVideoBtn = document.getElementById('editAddVideoBtn');
    const editTagInput = document.getElementById('homeArticleEditTagInput');
    const editAddTagBtn = document.getElementById('editAddTagBtn');
    const editTagsList = document.getElementById('homeArticleEditTagsList');
    const editTextColor = document.getElementById('homeArticleEditTextColor');
    const editTextSize = document.getElementById('homeArticleEditTextSize');
    const editToolbar = editModal ? editModal.querySelector('.rich-editor-toolbar') : null;
    let editImages = [];
    let editVideos = [];
    let editTags = [];
    let editArticleCache = null;
    const syncEditImages = () => { if (editImagesList) editImagesList.innerHTML = editImages.map((src, i) => '<div class="home-post-image-item"><img src="' + esc(src) + '" data-preview-media="image" data-preview-index="' + i + '" alt="图片 ' + (i + 1) + '"><div class="home-post-image-item__foot"><p class="home-post-image-item__label">' + (i === 0 ? '主图' : '图片 ' + (i + 1)) + '</p><button type="button" class="home-post-image-item__remove" data-remove-edit-image="' + i + '">删除</button></div></div>').join(''); };
    const syncEditVideos = () => { if (editVideosList) editVideosList.innerHTML = editVideos.map((src, i) => '<div class="home-post-image-item"><video controls src="' + esc(src) + '" data-preview-media="video" data-preview-index="' + i + '" style="width:100%;max-width:180px;border-radius:10px;background:#000"></video><div class="home-post-image-item__foot"><p class="home-post-image-item__label">' + (i === 0 ? '主视频' : '视频 ' + (i + 1)) + '</p><button type="button" class="home-post-image-item__remove" data-remove-edit-video="' + i + '">删除</button></div></div>').join(''); };
    const syncEditTags = () => { if (editTagsList) editTagsList.innerHTML = editTags.map((tag, i) => '<span class="home-post-tags__tag">' + esc(tag) + '<button type="button" class="home-post-tags__remove" data-remove-edit-tag="' + i + '" aria-label="删除标签">×</button></span>').join(''); };
    const closeEditModal = () => { if (editModal) editModal.hidden = true; };
    function openEditModal(article) { if (!editModal || !editForm) return; editArticleCache = article || null; editIdInput.value = article.id; if (editTitleInput) editTitleInput.value = article.title || ''; if (editBodyEditor) editBodyEditor.innerHTML = article.bodyHtml || article.body || ''; if (editBodyInput) editBodyInput.value = editBodyEditor ? editBodyEditor.innerHTML : ''; editImages = Array.isArray(article.images) && article.images.length ? article.images.slice() : (article.image ? [article.image] : []); editVideos = Array.isArray(article.videos) ? article.videos.slice() : []; editTags = Array.isArray(article.tags) ? article.tags.slice() : []; syncEditImages(); syncEditVideos(); syncEditTags(); editModal.hidden = false; };
    if (editModal) editModal.addEventListener('click', (e) => { if (e.target && e.target.hasAttribute('data-close-article-edit-modal')) closeEditModal(); if (e.target === editModal) closeEditModal(); });
    if (editAddImageBtn && editImageInput) editAddImageBtn.addEventListener('click', (e) => { e.preventDefault(); editImageInput.click(); });
    if (editImageInput) editImageInput.addEventListener('change', (e) => { Array.from(e.target.files || []).forEach((file) => { const r = new FileReader(); r.onload = () => { editImages.push(String(r.result || '')); syncEditImages(); }; r.readAsDataURL(file); }); editImageInput.value = ''; });
    if (editImagesList) editImagesList.addEventListener('click', (e) => { const btn = e.target.closest('[data-remove-edit-image]'); if (!btn) return; editImages.splice(parseInt(btn.dataset.removeEditImage, 10), 1); syncEditImages(); });
    if (editAddVideoBtn && editVideoInput) editAddVideoBtn.addEventListener('click', (e) => { e.preventDefault(); editVideoInput.click(); });
    if (editVideoInput) editVideoInput.addEventListener('change', (e) => { Array.from(e.target.files || []).forEach((file) => { const r = new FileReader(); r.onload = () => { editVideos.push(String(r.result || '')); syncEditVideos(); }; r.readAsDataURL(file); }); editVideoInput.value = ''; });
    if (editVideosList) editVideosList.addEventListener('click', (e) => { const btn = e.target.closest('[data-remove-edit-video]'); if (!btn) return; editVideos.splice(parseInt(btn.dataset.removeEditVideo, 10), 1); syncEditVideos(); });
    const addEditTag = () => { const value = (editTagInput && editTagInput.value || '').trim(); if (!value) return; if (!editTags.includes(value)) editTags.push(value); if (editTagInput) editTagInput.value = ''; syncEditTags(); };
    if (editAddTagBtn) editAddTagBtn.addEventListener('click', (e) => { e.preventDefault(); addEditTag(); });
    if (editTagInput) editTagInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addEditTag(); } });
    if (editTagsList) editTagsList.addEventListener('click', (e) => { const btn = e.target.closest('[data-remove-edit-tag]'); if (!btn) return; editTags.splice(parseInt(btn.dataset.removeEditTag, 10), 1); syncEditTags(); });

    const bindEditorToolbar = (toolbar, targetEditor, targetInput) => { if (!toolbar || !targetEditor) return; toolbar.addEventListener('click', (e) => { const btn = e.target.closest('[data-editor-command]'); if (!btn) return; e.preventDefault(); targetEditor.focus(); const cmd = btn.dataset.editorCommand; const val = btn.dataset.editorValue || null; if (cmd === 'createLink') { const url = window.prompt('请输入链接地址'); if (url) try { document.execCommand('createLink', false, url); } catch {} } else if (cmd === 'formatBlock') { try { document.execCommand(cmd, false, '<' + val + '>'); } catch {} } else { try { document.execCommand(cmd, false, val); } catch {} } if (targetInput) targetInput.value = targetEditor.innerHTML; }); };
    bindEditorToolbar(editorToolbar, bodyEditor, bodyInput);
    bindEditorToolbar(editToolbar, editBodyEditor, editBodyInput);
    if (colorInput && bodyEditor) colorInput.addEventListener('change', () => { bodyEditor.focus(); try { document.execCommand('foreColor', false, colorInput.value); } catch {} if (bodyInput) bodyInput.value = bodyEditor.innerHTML; });
    if (sizeInput && bodyEditor) sizeInput.addEventListener('change', () => { bodyEditor.focus(); try { document.execCommand('fontSize', false, sizeInput.value); } catch {} if (bodyInput) bodyInput.value = bodyEditor.innerHTML; });
    if (editTextColor && editBodyEditor) editTextColor.addEventListener('change', () => { editBodyEditor.focus(); try { document.execCommand('foreColor', false, editTextColor.value); } catch {} if (editBodyInput) editBodyInput.value = editBodyEditor.innerHTML; });
    if (editTextSize && editBodyEditor) editTextSize.addEventListener('change', () => { editBodyEditor.focus(); try { document.execCommand('fontSize', false, editTextSize.value); } catch {} if (editBodyInput) editBodyInput.value = editBodyEditor.innerHTML; });
    if (editBodyEditor) editBodyEditor.addEventListener('input', () => { if (editBodyInput) editBodyInput.value = editBodyEditor.innerHTML; });
    if (editForm) editForm.addEventListener('submit', async (e) => { e.preventDefault(); const session = TengyouSession.get(); if (!session || !isAdmin(session)) return alert('仅管理员可编辑文章'); const id = editIdInput ? editIdInput.value : ''; const title = editTitleInput ? editTitleInput.value.trim() : ''; const bodyHtml = editBodyEditor ? editBodyEditor.innerHTML.trim() : ''; const bodyText = editBodyEditor ? editBodyEditor.innerText.trim() : ''; const cache = editArticleCache || {}; const resolvedImages = editImages.length ? editImages.slice() : (Array.isArray(cache.images) && cache.images.length ? cache.images.slice() : (cache.image ? [cache.image] : [])); const resolvedVideos = editVideos.length ? editVideos.slice() : (Array.isArray(cache.videos) ? cache.videos.slice() : []); const resolvedTags = editTags.length ? editTags.slice() : (Array.isArray(cache.tags) ? cache.tags.slice() : []); const nextBodyHtml = bodyHtml || cache.bodyHtml || `<p>${esc(bodyText || cache.body || title || '')}</p>`; if (!id || !title || !resolvedImages.length) return alert('请填写标题并至少保留一张图片'); const payload = { title, image: resolvedImages[0], images: resolvedImages, body: bodyText || cache.body || title, bodyHtml: nextBodyHtml, videos: resolvedVideos, tags: resolvedTags }; const localUpdated = normalizeArticle({ ...(cache || {}), ...payload, id: cache.id || id, ts: cache.ts || Date.now(), authorEmail: cache.authorEmail || (TengyouSession.get() || {}).email || '' }); const localArticles = loadLocalArticles(); const nextArticles = localArticles.some((item) => String(item.id) === String(id)) ? localArticles.map((item) => String(item.id) === String(id) ? { ...item, ...localUpdated } : item) : [localUpdated, ...localArticles]; stateCache.data.articles = attachPersistedTags(dedupeArticles(nextArticles)); saveLocalArticles(stateCache.data.articles); const tagMap = loadArticleTagsCache(); if (resolvedTags.length) tagMap[String(id)] = resolvedTags.slice(); else if (Array.isArray(cache.tags) && cache.tags.length) tagMap[String(id)] = cache.tags.slice(); saveArticleTagsCache(tagMap); await renderHome(); await renderRanking(); try { await apiUpdateArticle(id, payload); const latest = await apiLoadArticles(); const mergedLatest = attachPersistedTags(latest.map((item) => String(item.id) === String(id) ? { ...item, tags: resolvedTags.length ? resolvedTags.slice() : (Array.isArray(cache.tags) ? cache.tags.slice() : []) } : item)); stateCache.data.articles = mergedLatest; saveLocalArticles(mergedLatest); syncTagsFromItems(mergedLatest); try { await saveState({ ...(stateCache.data || {}), articles: stateCache.data.articles }); } catch (err) {} } catch (err) { console.warn('[edit-save-error]', err); } finally { closeEditModal(); await renderHome(); await renderRanking(); alert('修改已保存'); } });
    const homeList = document.getElementById('homeArticleList'); if (homeList) homeList.addEventListener('click', async (e) => { const like = e.target.closest('[data-like-article]'); const manage = e.target.closest('[data-home-manage]'); if (like) { await apiLikeArticle(like.dataset.likeArticle); await renderHome(); await renderRanking(); return; } if (!manage) return; const articles = await apiLoadArticles(); const a = articles.find((x) => String(x.id) === String(manage.dataset.articleId)); if (!a) return; const action = manage.dataset.homeManage; if (action === 'export' && isAdmin(TengyouSession.get())) { try { const payload = await exportArticle(a.id); alert('已导出：' + (payload.article.title || '文章')); } catch (err) { alert(err.message || '导出失败'); } } else if (action === 'pin' && isAdmin(TengyouSession.get())) { await apiUpdateArticle(a.id, { isPinned: !a.isPinned }); await renderHome(); await renderRanking(); } else if (action === 'edit' && isAdmin(TengyouSession.get())) { openEditModal(a); } else if (action === 'delete' && isAdmin(TengyouSession.get())) { if (window.confirm('确定删除这篇文章吗？')) { const localArticles = loadLocalArticles().filter((item) => String(item.id) !== String(a.id)); stateCache.data.articles = localArticles; saveLocalArticles(localArticles); try { await apiDeleteArticle(a.id); } catch (err) { console.warn('[delete-remote]', err); } try { await saveState({ ...(stateCache.data || {}), articles: localArticles }); } catch (err) { console.warn('[delete-sync]', err); } await renderHome(); await renderRanking(); } } });
    const exportAllBtn = document.getElementById('exportAllArticlesBtn'); if (exportAllBtn && !exportAllBtn.dataset.boundExportAll) { exportAllBtn.dataset.boundExportAll = '1'; exportAllBtn.addEventListener('click', async () => { const session = TengyouSession.get(); if (!isAdmin(session)) return; try { const localArticles = loadLocalArticles(); const payload = await exportAllArticles(localArticles); alert('已导出全部文章：' + (Array.isArray(payload.articles) ? payload.articles.length : 0) + ' 篇'); } catch (err) { alert(err.message || '导出失败'); } }); }
    const homeImportBtn = document.getElementById('importArticleBtn'); if (homeImportBtn && !homeImportBtn.dataset.boundImport) { homeImportBtn.dataset.boundImport = '1'; homeImportBtn.addEventListener('click', (e) => { const session = TengyouSession.get(); if (!isAdmin(session)) return; const input = document.getElementById('importArticleFileInput'); if (input) input.click(); }); }
    const homeImportInput = document.getElementById('importArticleFileInput'); if (homeImportInput && !homeImportInput.dataset.boundImport) { homeImportInput.dataset.boundImport = '1'; homeImportInput.addEventListener('change', async (e) => { const session = TengyouSession.get(); if (!isAdmin(session)) return; const input = e.currentTarget; const files = Array.from((input && input.files) || []); const debug = document.getElementById('importDebugInfo'); if (debug) { debug.hidden = false; debug.textContent = '正在导入，请稍候...'; } if (!files.length) { if (debug) { debug.hidden = false; debug.textContent = '没有检测到文件，请重新选择导出的 JSON。'; } alert('未检测到文件，请确保选择了 JSON 文件（后缀 .json）'); if (input) input.value = ''; return; } let successCount = 0; let lastTitle = ''; const importedTitles = []; try { for (const file of files) { if (!String(file.name || '').toLowerCase().endsWith('.json')) { throw new Error('请选择 JSON 文件'); } const imported = await importArticleFile(file); successCount += 1; lastTitle = imported && imported.title ? imported.title : lastTitle; importedTitles.push(imported && imported.title ? imported.title : file.name); } const localNow = loadLocalArticles(); const msg = (successCount > 1 ? ('导入成功：' + successCount + ' 个文件') : ('导入成功：' + (lastTitle || '文章'))); if (debug) { debug.hidden = false; debug.textContent = msg + '｜本地文章数：' + localNow.length + '｜导入标题：' + importedTitles.join('、'); } stateCache.data.articles = localNow; await renderHome(); await renderRanking(); await Promise.resolve(); alert(msg); if (debug) { debug.hidden = false; debug.textContent = msg + '｜本地文章数：' + localNow.length + '｜导入标题：' + importedTitles.join('、'); } } catch (err) { const failMsg = err.message || '导入失败'; if (debug) { debug.hidden = false; debug.textContent = '导入失败：' + failMsg; } alert(failMsg); } finally { if (input) input.value = ''; } }); }

    const homePag = document.getElementById('homePagination'); if (homePag) homePag.addEventListener('click', (e) => { const btn = e.target.closest('[data-home-page]'); if (!btn) return; document.getElementById('homeArticleList').setAttribute('data-current-page', btn.dataset.homePage); renderHome(); });
    const rankPag = document.getElementById('rankingPagination'); if (rankPag && !rankPag.dataset.boundRanking) { rankPag.dataset.boundRanking = '1'; rankPag.addEventListener('click', (e) => { const pageBtn = e.target.closest('[data-goto-page]'); if (!pageBtn) return; const nextPage = parseInt(pageBtn.dataset.gotoPage || '1', 10); if (!Number.isFinite(nextPage) || nextPage < 1) return; const listEl = document.getElementById('rankingList'); if (!listEl) return; listEl.setAttribute('data-ranking-page', String(nextPage)); renderRanking(); }); }
    const boardForm = document.getElementById('boardForm'); if (boardForm) boardForm.addEventListener('submit', async (e) => { e.preventDefault(); const session = TengyouSession.get(); if (!session) return alert('请先登录'); const ta = boardForm.querySelector('textarea[name="content"]'); const body = ta.value.trim(); if (!body) return; try { await apiCreateBoardPost({ nickname: session.username, body, ts: Date.now() }); ta.value = ''; await renderBoard(); } catch (err) { alert(err.message || '发布失败'); } });
    const boardView = document.getElementById('boardView'); if (boardView) boardView.addEventListener('click', (e) => { const btn = e.target.closest('[data-open-post]'); if (btn) location.href = 'find-game.html#post=' + encodeURIComponent(btn.dataset.openPost); });
    document.addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; const postModalEl = document.getElementById('homePostModal'); const viewer = document.getElementById('homePostMediaViewer'); const editModalNow = document.getElementById('homeArticleEditModal'); if (postModalEl && !postModalEl.hidden) postModalEl.hidden = true; if (viewer && !viewer.hidden) viewer.hidden = true; if (editModalNow && !editModalNow.hidden) editModalNow.hidden = true; });
    const draftBtn = document.getElementById('saveDraftBtn'); if (draftBtn) draftBtn.addEventListener('click', async () => { draftBtn.classList.add('is-pressed'); const msg = document.getElementById('draftStatusMsg'); if (msg) { msg.hidden = false; msg.textContent = '正在保存...'; msg.className = 'draft-status'; } window.setTimeout(() => draftBtn.classList.remove('is-pressed'), 120); try { const session = TengyouSession.get(); if (!session || !isAdmin(session)) throw new Error('仅管理员可保存草稿'); if (!postForm) throw new Error('表单未就绪'); const title = titleInput ? titleInput.value.trim() : ''; const bodyHtml = bodyEditor ? bodyEditor.innerHTML.trim() : ''; const payload = { email: session.email, title, bodyHtml, images: images.slice(), videos: videos.slice(), ts: Date.now() }; saveLocalDraft(payload); const res = await apiFetch('/api/drafts', { method: 'POST', body: JSON.stringify(payload) }); if (!res || !res.item) throw new Error('保存成功但服务器未返回结果'); if (msg) { msg.textContent = '保存成功'; msg.className = 'draft-status draft-status--success'; } } catch (err) { const fallback = loadLocalDraft(); if (fallback) { saveLocalDraft(fallback); if (msg) { msg.textContent = '已本地保存，联网后会同步'; msg.className = 'draft-status draft-status--success'; } } else if (msg) { msg.textContent = err.message || '保存失败'; msg.className = 'draft-status draft-status--error'; } } finally { if (msg) { window.setTimeout(() => { msg.hidden = true; }, 2500); } } });
    document.addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; const postModalEl = document.getElementById('homePostModal'); const viewer = document.getElementById('homePostMediaViewer'); const editModal = document.getElementById('homeArticleEditModal'); const articleEditModal = document.querySelector('.article-edit-modal:not([hidden])'); if (postModalEl && !postModalEl.hidden) postModalEl.hidden = true; if (viewer && !viewer.hidden) viewer.hidden = true; if (editModal && !editModal.hidden) editModal.hidden = true; if (articleEditModal) articleEditModal.hidden = true; });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try { initTheme(); } catch (err) { console.warn('[initTheme]', err); }
    try { initLang(); } catch (err) { console.warn('[initLang]', err); }
    try { initSearchBindings(); } catch (err) { console.warn('[initSearchBindings]', err); }
    try { initAuth(); } catch (err) { console.warn('[initAuth]', err); }
    try { initPostEditor(); } catch (err) { console.warn('[initPostEditor]', err); }
    try { updateImportVisibility(); } catch (err) { console.warn('[updateImportVisibility]', err); }
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn && !themeBtn.dataset.boundTheme) {
      themeBtn.dataset.boundTheme = '1';
      themeBtn.addEventListener('click', toggleTheme);
    }
    try { await loadState(); } catch (err) { console.warn('[loadState]', err); }
    try { if (window.initHome) initHome(); } catch (err) { console.warn('[initHome]', err); }
    try { if (window.initArticleEditor) initArticleEditor(); } catch (err) { console.warn('[initArticleEditor]', err); }
    try { await renderHome(); } catch (err) { console.warn('[renderHome]', err); }
    try { await renderRanking(); } catch (err) { console.warn('[renderRanking]', err); }
    try { await renderBoard(); } catch (err) { console.warn('[renderBoard]', err); }
    try { await renderSearch(); } catch (err) { console.warn('[renderSearch]', err); }
    try { await renderArticle(); } catch (err) { console.warn('[renderArticle]', err); }
    const searchResultList = document.getElementById('searchResultList'); if (searchResultList) { const q = new URLSearchParams(location.search).get('q') || ''; const bc = document.getElementById('searchBreadcrumb'); if (bc) bc.innerHTML = '<a href="index.html">首页</a><span class="breadcrumb__sep">›</span><span class="breadcrumb__current">搜索：' + esc(q) + '</span>'; const searchLogo = document.querySelector('#searchBreadcrumb .search-result-logo, #searchBreadcrumb .logo img'); if (searchLogo && searchLogo.tagName === 'IMG') searchLogo.src = 'assets/0001.png'; }
  });
})();