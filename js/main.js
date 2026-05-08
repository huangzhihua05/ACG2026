(function () {
  const THEME_KEY = 'tengyou-theme';
  const SESSION_KEY = 'tengyou-session';
  const APPROVED_EMAIL = '871412257@qq.com';
  const API_BASE = window.TENGYOU_API_BASE || 'http://localhost:3000';
  const stateCache = { data: { users: [], articles: [], comments: [], boardPosts: [], drafts: [] } };

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
    const mergedArticles = [...remoteArticles];
    localArticles.forEach((item) => {
      if (!mergedArticles.some((x) => String(x.id) === String(item.id))) mergedArticles.push(item);
    });
    stateCache.data = { ...remote, articles: mergedArticles };
    saveLocalArticles(mergedArticles);
    if (mergedArticles.length !== remoteArticles.length) {
      try { await saveState({ ...remote, articles: mergedArticles }); } catch (err) {}
    }
    return stateCache.data;
  }
  async function saveState(nextState) { const res = await apiFetch('/api/state', { method: 'PUT', body: JSON.stringify(nextState) }); stateCache.data = res.item || nextState; return stateCache.data; }
  async function apiLoadArticles() {
    try {
      const res = await apiFetch('/api/articles');
      const apiItems = Array.isArray(res.items) ? res.items : [];
      stateCache.data.articles = apiItems;
      saveLocalArticles(apiItems);
      return apiItems;
    } catch (e) {
      const localItems = loadLocalArticles();
      if (localItems.length) return localItems;
      return Array.isArray(stateCache.data.articles) ? stateCache.data.articles : [];
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
  const normalizeArticle = (a) => ({ id: a.id, title: a.title || '未命名文章', image: a.image || (a.images && a.images[0]) || '', images: Array.isArray(a.images) ? a.images : (a.image ? [a.image] : []), body: a.body || '', bodyHtml: a.bodyHtml || '', ts: a.ts || 0, authorEmail: a.authorEmail || '', likes: a.likes || 0, comments: Array.isArray(a.comments) ? a.comments : [], isPinned: !!a.isPinned, videos: Array.isArray(a.videos) ? a.videos : [] });
  const articleStats = (a) => ({ likes: a.likes || 0, comments: (a.comments || []).length, heat: (a.likes || 0) * 2 + (a.comments || []).length });
  const isAdmin = (s) => !!s && String(s.email || '').toLowerCase() === APPROVED_EMAIL;
  function initTheme() { const stored = localStorage.getItem(THEME_KEY); const theme = stored === 'dark' || stored === 'light' ? stored : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.setAttribute('data-theme', theme); localStorage.setItem(THEME_KEY, theme); }
  function toggleTheme() { const cur = document.documentElement.getAttribute('data-theme') || 'light'; const next = cur === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', next); localStorage.setItem(THEME_KEY, next); }
  function getDraftStorageKey() { const session = TengyouSession.get(); return 'tengyou-home-draft:' + String(session && session.email ? session.email : 'guest').toLowerCase(); }
  function getArticlesStorageKey() { return 'tengyou-home-articles'; }
  function saveLocalDraft(payload) { try { localStorage.setItem(getDraftStorageKey(), JSON.stringify(payload)); } catch (e) {} }
  function loadLocalDraft() { try { const raw = localStorage.getItem(getDraftStorageKey()); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
  function saveLocalArticles(items) { try { localStorage.setItem(getArticlesStorageKey(), JSON.stringify(Array.isArray(items) ? items : [])); } catch (e) {} }
  function loadLocalArticles() { try { const raw = localStorage.getItem(getArticlesStorageKey()); return raw ? JSON.parse(raw) : []; } catch (e) { return []; } }

  async function renderHome() {
    const list = document.getElementById('homeArticleList'); if (!list) return;
    const pag = document.getElementById('homePagination');
    const items = (await apiLoadArticles()).map(normalizeArticle).sort((a, b) => (b.isPinned === true ? 1 : 0) - (a.isPinned === true ? 1 : 0) || (b.ts || 0) - (a.ts || 0));
    const page = parseInt(list.getAttribute('data-current-page') || '1', 10);
    const perPage = 11; const totalPages = Math.max(1, Math.ceil(items.length / perPage)); const cur = Math.min(Math.max(page, 1), totalPages);
    list.setAttribute('data-current-page', String(cur)); list.innerHTML = '';
    if (!items.length) list.innerHTML = '<p class="board-empty">暂无文章。</p>';
    else items.slice((cur - 1) * perPage, cur * perPage).forEach((a) => { const s = articleStats(a); const el = document.createElement('article'); el.className = 'article-card home-article-card'; el.innerHTML = '<div class="article-card__thumb"><a href="article.html?id=' + encodeURIComponent(a.id) + '"><img src="' + esc(a.image || 'https://placehold.co/280x350') + '" alt="' + esc(a.title) + '"></a></div><div class="article-card__body' + (a.isPinned ? ' article-card__body--pinned' : '') + '">' + (a.isPinned ? '<div class="article-card__tags"><span class="tag tag--pin">置顶</span></div>' : '') + '<h2 class="article-card__title"><a href="article.html?id=' + encodeURIComponent(a.id) + '">' + esc(a.title) + '</a></h2><div class="article-card__excerpt article-card__excerpt--plain">' + esc((a.body || '').slice(0, 120) || '暂无正文预览') + '</div><div class="article-card__meta article-card__meta--bottom"><span>点赞 ' + s.likes + '</span><span>评论 ' + s.comments + '</span></div><div class="article-card__footer">' + (isAdmin(TengyouSession.get()) ? '<div class="article-card__manage-group"><button type="button" class="article-card__manage-btn" data-home-manage="edit" data-article-id="' + a.id + '">编辑</button><button type="button" class="article-card__manage-btn" data-home-manage="delete" data-article-id="' + a.id + '">删除</button><button type="button" class="article-card__manage-btn" data-home-manage="pin" data-article-id="' + a.id + '">' + (a.isPinned ? '取消置顶' : '置顶') + '</button></div>' : '') + '<button type="button" class="board-post__like-btn" data-like-article="' + a.id + '">点赞</button></div></div>'; list.appendChild(el); });
    if (pag) { pag.innerHTML = ''; pag.hidden = items.length <= perPage; if (!pag.hidden) for (let i = 1; i <= totalPages; i++) { const b = document.createElement('button'); b.type = 'button'; b.className = 'board-pagination__btn' + (i === cur ? ' board-pagination__btn--current' : ''); b.textContent = String(i); b.dataset.homePage = String(i); pag.appendChild(b); } }
    const rank = document.getElementById('hotRankHome'); if (rank) { rank.innerHTML = ''; items.slice(0, 10).map((a, idx) => ({...a, rank: idx + 1})).forEach((a) => { const row = document.createElement('a'); row.className = 'hot-rank__item'; row.href = 'article.html?id=' + encodeURIComponent(a.id); row.innerHTML = '<span class="hot-rank__num">' + a.rank + '</span><span class="hot-rank__title">' + esc(a.title.slice(0, 10)) + '</span><span class="hot-rank__heat">' + articleStats(a).heat + '</span>'; rank.appendChild(row); }); }
  }

  async function renderRanking() {
    const list = document.getElementById('rankingList'); if (!list) return;
    const pag = document.getElementById('rankingPagination'); const items = (await apiLoadArticles()).map(normalizeArticle).sort((a, b) => articleStats(b).heat - articleStats(a).heat || (b.ts || 0) - (a.ts || 0));
    const page = parseInt(list.getAttribute('data-ranking-page') || '1', 10); const perPage = 15; const totalPages = Math.max(1, Math.ceil(items.length / perPage)); const cur = Math.min(Math.max(page, 1), totalPages);
    list.setAttribute('data-ranking-page', String(cur)); list.innerHTML = '';
    items.slice((cur - 1) * perPage, cur * perPage).forEach((a, i) => { const idx = (cur - 1) * perPage + i + 1; const row = document.createElement('a'); row.className = 'ranking-row'; row.href = 'article.html?id=' + encodeURIComponent(a.id); row.innerHTML = '<span class="ranking-row__rank">' + idx + '</span><span class="ranking-row__title">' + esc(a.title) + '</span><span class="ranking-row__heat">热度 ' + articleStats(a).heat + '</span>'; list.appendChild(row); });
    if (pag) { pag.innerHTML = ''; pag.hidden = items.length <= perPage; if (!pag.hidden) for (let i = 1; i <= totalPages; i++) { const b = document.createElement('button'); b.type = 'button'; b.className = 'board-pagination__btn' + (i === cur ? ' board-pagination__btn--current' : ''); b.textContent = String(i); b.dataset.rankingPage = String(i); pag.appendChild(b); } }
  }

  async function renderSearch() { const list = document.getElementById('searchResultList'); if (!list) return; const q = new URLSearchParams(location.search).get('q') || ''; const items = (await apiLoadArticles()).map(normalizeArticle).filter((a) => q && a.title.toLowerCase().includes(q.toLowerCase())); list.innerHTML = !q ? '<p class="board-empty">请输入标题关键词进行搜索。</p>' : !items.length ? '<p class="board-empty">没有找到匹配的文章。</p>' : ''; items.forEach((a) => { const card = document.createElement('article'); card.className = 'article-card'; card.innerHTML = '<div class="article-card__thumb"><a href="article.html?id=' + encodeURIComponent(a.id) + '"><img src="' + esc(a.image) + '" alt="' + esc(a.title) + '"></a></div><div class="article-card__body' + (a.isPinned ? ' article-card__body--pinned' : '') + '">' + (a.isPinned ? '<div class="article-card__tags"><span class="tag tag--pin">置顶</span></div>' : '') + '<h2 class="article-card__title"><a href="article.html?id=' + encodeURIComponent(a.id) + '">' + esc(a.title) + '</a></h2><div class="article-card__meta article-card__meta--bottom"><span>点赞 ' + articleStats(a).likes + '</span><span>评论 ' + articleStats(a).comments + '</span></div></div>'; list.appendChild(card); }); }
  window.apiLoadArticles = apiLoadArticles; window.apiUpdateArticle = apiUpdateArticle; window.apiDeleteArticle = apiDeleteArticle; window.apiLikeArticle = apiLikeArticle; window.saveLocalArticles = saveLocalArticles; window.loadLocalArticles = loadLocalArticles; window.saveState = saveState; window.getState = getState; window.renderHome = renderHome; window.renderRanking = renderRanking;

  async function renderArticle() {
    const root = document.getElementById('articlePage'); if (!root) return; const id = new URLSearchParams(location.search).get('id'); const article = normalizeArticle(await apiLoadArticle(id)); if (!article || !article.id) { root.innerHTML = '<p class="board-empty">文章不存在。</p>'; return; }
    const contentHtml = (article.bodyHtml || article.body || '').trim();
    const mediaGallery = article.images.length ? '<div class="article-gallery">' + article.images.map((src, i) => '<figure class="article-gallery__item"><img src="' + esc(src) + '" alt="' + esc(article.title + ' 图片 ' + (i + 1)) + '"><figcaption>图片 ' + (i + 1) + '</figcaption></figure>').join('') + '</div>' : '';
    const mediaVideos = article.videos.length ? '<div class="article-video-list">' + article.videos.map((src, i) => '<div class="article-video-item"><video controls playsinline src="' + esc(src) + '"></video><p>视频 ' + (i + 1) + '</p></div>').join('') + '</div>' : '';
    root.innerHTML = '<section class="content-section article-detail"><div class="article-detail__header">' + (article.isPinned ? '<span class="article-pin-badge">置顶</span>' : '') + '<h1 class="article-detail__title">' + esc(article.title) + '</h1></div><div class="article-detail__meta">发布时间 ' + fmt(article.ts) + '</div><div class="article-detail__actions"><button type="button" class="article-like-btn" data-article-like="' + article.id + '">点赞</button><span class="article-like-count">点赞 ' + (article.likes || 0) + '</span><span class="article-comment-count">评论 ' + article.comments.length + '</span></div>' + mediaGallery + mediaVideos + '<div class="board-post__text board-post__text--rich article-detail__content">' + contentHtml + '</div><section class="content-section article-comments-section"><h2>评论区</h2><div id="articleCommentList"></div><form id="articleCommentForm" class="board-comment-form"><textarea name="comment" maxlength="1000" required placeholder="发表评论…"></textarea><button class="btn-primary btn-primary--sm" type="submit">发表评论</button></form></section></section>';
    const list = document.getElementById('articleCommentList'); const form = document.getElementById('articleCommentForm');
    async function renderComments() { const comments = await apiLoadComments(id); list.innerHTML = comments.length ? comments.map((c) => '<div class="board-comment"><div class="board-comment__meta"><span class="board-comment__name">' + esc(c.nickname || '匿名旅人') + '</span><span class="board-comment__time">' + fmt(c.ts) + '</span></div><p class="board-comment__text">' + esc(c.body || '') + '</p></div>').join('') : '<p class="board-comment-empty">暂无评论</p>'; }
    await renderComments();
    if (form) form.addEventListener('submit', async (e) => { e.preventDefault(); const session = TengyouSession.get(); if (!session) return alert('请先登录'); const ta = form.querySelector('textarea[name="comment"]'); const body = ta.value.trim(); if (!body) return; await apiCreateComment(id, { nickname: session.username, authorEmail: session.email, body, ts: Date.now() }); ta.value = ''; await renderArticle(); });
    const likeBtn = root.querySelector('[data-article-like]'); if (likeBtn) likeBtn.addEventListener('click', async () => { await apiLikeArticle(id); await renderArticle(); await renderHome(); await renderRanking(); });
  }

  async function renderBoard() { const view = document.getElementById('boardView'); if (!view) return; const posts = (await apiLoadBoardPosts()).slice().sort((a, b) => (b.ts || 0) - (a.ts || 0)); view.innerHTML = posts.length ? posts.map((p) => '<article class="board-thread"><div class="board-post"><div class="board-post__avatar" aria-hidden="true">' + esc((p.nickname || '匿').charAt(0)) + '</div><div class="board-post__body"><div class="board-post__head"><span class="board-post__name">' + esc(p.nickname || '匿名旅人') + '</span><span class="board-post__time">' + fmt(p.ts) + '</span></div><button type="button" class="board-post__title-btn" data-open-post="' + p.id + '">' + esc(p.body || '') + '</button></div></div></article>').join('') : '<p class="board-empty">暂无留言，登录后来发第一条吧～</p>'; }

  function bindCommon() {
    const theme = document.getElementById('themeToggle'); if (theme) theme.addEventListener('click', toggleTheme);
    const searchInput = document.getElementById('sidebarSearch'); const confirm = document.getElementById('searchConfirmBtn'); const goSearch = () => { const q = (searchInput && searchInput.value || '').trim(); if (q) location.href = 'search.html?q=' + encodeURIComponent(q); };
    if (searchInput) searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); goSearch(); } }); if (confirm) confirm.addEventListener('click', goSearch);
    const loginAccountHistory = document.getElementById('loginAccountHistory');
    const loginForm = document.getElementById('loginForm'); if (loginForm) loginForm.addEventListener('submit', async (e) => { e.preventDefault(); const accountInput = loginForm.querySelector('input[name="account"]'); const passwordInput = loginForm.querySelector('input[name="password"]'); const rememberInput = loginForm.querySelector('input[name="rememberMe"]'); const account = accountInput?.value.trim(); const password = passwordInput?.value || ''; const email = loginForm.querySelector('input[name="email"]')?.value.trim() || account; if (!account || !password) return alert('请填写账号和密码'); const rememberKey = 'tengyou-login-remember'; const historyKey = 'tengyou-login-history'; const existingHistory = (() => { try { return JSON.parse(localStorage.getItem(historyKey) || '[]'); } catch { return []; } })(); if (account && !existingHistory.includes(account)) { existingHistory.unshift(account); localStorage.setItem(historyKey, JSON.stringify(existingHistory.slice(0, 10))); if (loginAccountHistory) loginAccountHistory.innerHTML = existingHistory.slice(0, 10).map((item) => '<option value="' + esc(item) + '"></option>').join(''); } if (rememberInput && rememberInput.checked) { try { localStorage.setItem(rememberKey, JSON.stringify({ account, password, email })); } catch (err) {} } else { localStorage.removeItem(rememberKey); } TengyouSession.set(account, email); try { const res = await apiLogin({ account, password }); const item = res.item || {}; TengyouSession.set(item.username || account, item.email || email); } catch (err) {} alert('登录成功'); await renderHome(); });
    if (loginForm) { try { const rememberKey = 'tengyou-login-remember'; const remembered = JSON.parse(localStorage.getItem(rememberKey) || 'null'); if (remembered) { const accountInput = loginForm.querySelector('input[name="account"]'); const passwordInput = loginForm.querySelector('input[name="password"]'); const rememberInput = loginForm.querySelector('input[name="rememberMe"]'); if (accountInput) accountInput.value = remembered.account || ''; if (passwordInput) passwordInput.value = remembered.password || ''; if (rememberInput) rememberInput.checked = true; } const historyKey = 'tengyou-login-history'; const history = JSON.parse(localStorage.getItem(historyKey) || '[]'); if (loginAccountHistory && Array.isArray(history)) loginAccountHistory.innerHTML = history.slice(0, 10).map((item) => '<option value="' + esc(item) + '"></option>').join(''); } catch (err) {} }
    const registerForm = document.getElementById('registerForm'); if (registerForm) registerForm.addEventListener('submit', async (e) => { e.preventDefault(); const u = registerForm.querySelector('input[name="username"]')?.value.trim(); const email = registerForm.querySelector('input[name="email"]')?.value.trim(); const password = registerForm.querySelector('input[name="password"]')?.value || ''; if (!u || !email || !password) return alert('请填写完整注册信息'); try { const res = await apiRegister({ username: u, email, password }); const item = res.item || {}; TengyouSession.set(item.username || u, item.email || email); alert('注册成功并已登录'); } catch (err) { TengyouSession.set(u, email); alert((err && err.message) ? ('注册已本地保存：' + err.message) : '注册已本地保存'); } });
    window.addEventListener('beforeunload', () => {
      if (!Array.isArray(stateCache.data.articles)) return;
      saveLocalArticles(stateCache.data.articles);
    });
    const postBtn = document.getElementById('openPostFormBtn'); const postModal = document.getElementById('homePostModal'); const postForm = document.getElementById('homePostForm'); const titleInput = postForm && postForm.querySelector('input[name="title"]'); const bodyEditor = document.getElementById('homePostBodyEditor'); const bodyInput = document.getElementById('homePostBodyInput'); const imageInput = document.getElementById('homePostImagesInput'); const imageList = document.getElementById('homePostImagesList'); const videoInput = document.getElementById('homePostVideosInput'); const videoList = document.getElementById('homePostVideosList'); const addImageBtn = document.getElementById('addImageBtn'); const addVideoBtn = document.getElementById('addVideoBtn'); const editorToolbar = document.querySelector('.rich-editor-toolbar'); const colorInput = document.getElementById('postTextColor'); const sizeInput = document.getElementById('postTextSize'); let images = []; let videos = [];
    const localDraft = loadLocalDraft();
    const syncImages = () => { if (imageList) imageList.innerHTML = images.map((src, i) => '<div class="home-post-image-item"><img src="' + esc(src) + '" data-preview-media="image" data-preview-index="' + i + '" alt="图片 ' + (i + 1) + '"><div class="home-post-image-item__foot"><p class="home-post-image-item__label">' + (i === 0 ? '主图' : '图片 ' + (i + 1)) + '</p><button type="button" class="home-post-image-item__remove" data-remove-home-image="' + i + '">删除</button></div></div>').join(''); };
    const syncVideos = () => { if (videoList) videoList.innerHTML = videos.map((src, i) => '<div class="home-post-image-item"><video controls src="' + esc(src) + '" data-preview-media="video" data-preview-index="' + i + '" style="width:100%;max-width:180px;border-radius:10px;background:#000"></video><div class="home-post-image-item__foot"><p class="home-post-image-item__label">' + (i === 0 ? '主视频' : '视频 ' + (i + 1)) + '</p><button type="button" class="home-post-image-item__remove" data-remove-home-video="' + i + '">删除</button></div></div>').join(''); };
    const closePostModal = () => { if (postModal) postModal.hidden = true; const viewer = document.getElementById('homePostMediaViewer'); if (viewer) viewer.hidden = true; };
    if (bodyInput && bodyEditor) bodyInput.value = bodyEditor.innerHTML;
    if (postBtn && postModal) postBtn.addEventListener('click', () => { const session = TengyouSession.get(); if (!isAdmin(session)) return; postModal.hidden = false; if (localDraft) { if (titleInput) titleInput.value = localDraft.title || ''; if (bodyEditor) bodyEditor.innerHTML = localDraft.bodyHtml || ''; if (bodyInput) bodyInput.value = localDraft.bodyHtml || ''; images = Array.isArray(localDraft.images) ? localDraft.images.slice() : []; videos = Array.isArray(localDraft.videos) ? localDraft.videos.slice() : []; syncImages(); syncVideos(); } }); if (postModal) postModal.addEventListener('click', (e) => { if (e.target && e.target.hasAttribute('data-close-post-modal')) closePostModal(); });
    if (addImageBtn && imageInput) addImageBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); addImageBtn.classList.add('is-pressed'); window.setTimeout(() => { addImageBtn.classList.remove('is-pressed'); imageInput.click(); }, 80); });
    if (addVideoBtn && videoInput) addVideoBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); addVideoBtn.classList.add('is-pressed'); window.setTimeout(() => { addVideoBtn.classList.remove('is-pressed'); videoInput.click(); }, 80); });
    if (bodyEditor) bodyEditor.addEventListener('click', (e) => e.stopPropagation());
    const execEditorCommand = (command, value = null) => {
      if (!bodyEditor) return;
      bodyEditor.focus();
      try { document.execCommand(command, false, value); } catch (e) {}
      if (bodyInput) bodyInput.value = bodyEditor.innerHTML;
      saveLocalDraft({ title: titleInput ? titleInput.value : '', bodyHtml: bodyEditor.innerHTML, images: images.slice(), videos: videos.slice(), ts: Date.now() });
    };
    if (editorToolbar) editorToolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-editor-command]');
      if (!btn) return;
      e.preventDefault();
      const cmd = btn.dataset.editorCommand;
      const val = btn.dataset.editorValue || null;
      if (cmd === 'createLink') { const url = window.prompt('请输入链接地址'); if (url) execEditorCommand('createLink', url); return; }
      if (cmd === 'formatBlock') execEditorCommand(cmd, '<' + val + '>');
      else execEditorCommand(cmd, val);
    });
    if (colorInput) colorInput.addEventListener('change', () => execEditorCommand('foreColor', colorInput.value));
    if (sizeInput) sizeInput.addEventListener('change', () => execEditorCommand('fontSize', sizeInput.value));
    function openMediaViewer(type, index) {
      const viewer = document.getElementById('homePostMediaViewer');
      if (!viewer) return;
      const content = viewer.querySelector('.home-post-media-viewer__content');
      const caption = viewer.querySelector('.home-post-media-viewer__caption');
      const arr = type === 'video' ? videos : images;
      const src = arr[index];
      if (!src) return;
      content.innerHTML = type === 'video' ? '<video controls autoplay src="' + esc(src) + '"></video>' : '<img src="' + esc(src) + '" alt="预览图片">';
      caption.textContent = (type === 'video' ? '视频预览' : '图片预览') + ' · 第 ' + (index + 1) + ' 个';
      viewer.hidden = false;
    }
    const mediaViewer = document.getElementById('homePostMediaViewer');
    if (mediaViewer) {
      mediaViewer.addEventListener('click', (e) => {
        if (e.target && e.target.hasAttribute('data-close-media-viewer')) mediaViewer.hidden = true;
        if (e.target === mediaViewer) mediaViewer.hidden = true;
      });
    }
    if (imageInput) imageInput.addEventListener('change', (e) => { Array.from(e.target.files || []).forEach((file) => { const r = new FileReader(); r.onload = () => { images.push(String(r.result || '')); syncImages(); }; r.readAsDataURL(file); }); imageInput.value = ''; }); if (imageList) imageList.addEventListener('click', (e) => { const btn = e.target.closest('[data-remove-home-image]'); if (btn) { images.splice(parseInt(btn.dataset.removeHomeImage, 10), 1); syncImages(); return; } const preview = e.target.closest('[data-preview-media]'); if (preview && preview.dataset.previewMedia === 'image') openMediaViewer('image', parseInt(preview.dataset.previewIndex, 10)); });
    if (videoInput) videoInput.addEventListener('change', (e) => { Array.from(e.target.files || []).forEach((file) => { const r = new FileReader(); r.onload = () => { videos.push(String(r.result || '')); syncVideos(); }; r.readAsDataURL(file); }); videoInput.value = ''; }); if (videoList) videoList.addEventListener('click', (e) => { const btn = e.target.closest('[data-remove-home-video]'); if (btn) { videos.splice(parseInt(btn.dataset.removeHomeVideo, 10), 1); syncVideos(); return; } const preview = e.target.closest('[data-preview-media]'); if (preview && preview.dataset.previewMedia === 'video') openMediaViewer('video', parseInt(preview.dataset.previewIndex, 10)); });
    if (bodyEditor) bodyEditor.addEventListener('input', () => { if (bodyInput) bodyInput.value = bodyEditor.innerHTML; saveLocalDraft({ title: titleInput ? titleInput.value : '', bodyHtml: bodyEditor.innerHTML, images: images.slice(), videos: videos.slice(), ts: Date.now() }); });
    const publishArticle = async () => { const session = TengyouSession.get(); if (!session || !isAdmin(session)) { alert('仅管理员可发表文章'); return; } const title = titleInput ? titleInput.value.trim() : ''; const bodyHtml = bodyEditor ? bodyEditor.innerHTML.trim() : ''; const bodyText = bodyEditor ? bodyEditor.innerText.trim() : ''; if (!title || !bodyHtml || !images.length) { alert('请填写标题、正文并至少添加一张图片'); return; } const payload = { title, image: images[0], images: images.slice(), body: bodyText, bodyHtml, authorEmail: session.email, videos: videos.slice(), ts: Date.now() }; const existing = Array.isArray(stateCache.data.articles) ? stateCache.data.articles : []; let mergedArticles = existing; try { const res = await apiCreateArticle(payload); const savedArticle = normalizeArticle((res && res.item) ? res.item : { ...payload, likes: 0, comments: [], isPinned: false }); mergedArticles = [...existing.filter((item) => String(item.id) !== String(savedArticle.id)), savedArticle]; } catch (e) { const localArticle = normalizeArticle({ id: Date.now(), ...payload, likes: 0, comments: [], isPinned: false }); mergedArticles = [...existing.filter((item) => String(item.id) !== String(localArticle.id)), localArticle]; } stateCache.data.articles = mergedArticles; saveLocalArticles(mergedArticles); try { await saveState({ ...(stateCache.data || {}), articles: mergedArticles }); } catch (err) {} images = []; videos = []; syncImages(); syncVideos(); if (bodyEditor) bodyEditor.innerHTML = ''; if (bodyInput) bodyInput.value = ''; if (titleInput) titleInput.value = ''; closePostModal(); localStorage.removeItem(getDraftStorageKey()); const draftMsg = document.getElementById('draftStatusMsg'); if (draftMsg) { draftMsg.textContent = '发布成功'; draftMsg.hidden = false; draftMsg.className = 'draft-status draft-status--success'; } await renderHome(); await renderRanking(); };
    if (postForm) postForm.addEventListener('submit', async (e) => { e.preventDefault(); await publishArticle(); });
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
    const editTextColor = document.getElementById('homeArticleEditTextColor');
    const editTextSize = document.getElementById('homeArticleEditTextSize');
    const editToolbar = editModal ? editModal.querySelector('.rich-editor-toolbar') : null;
    let editImages = [];
    let editVideos = [];
    const syncEditImages = () => { if (editImagesList) editImagesList.innerHTML = editImages.map((src, i) => '<div class="home-post-image-item"><img src="' + esc(src) + '" data-preview-media="image" data-preview-index="' + i + '" alt="图片 ' + (i + 1) + '"><div class="home-post-image-item__foot"><p class="home-post-image-item__label">' + (i === 0 ? '主图' : '图片 ' + (i + 1)) + '</p><button type="button" class="home-post-image-item__remove" data-remove-edit-image="' + i + '">删除</button></div></div>').join(''); };
    const syncEditVideos = () => { if (editVideosList) editVideosList.innerHTML = editVideos.map((src, i) => '<div class="home-post-image-item"><video controls src="' + esc(src) + '" data-preview-media="video" data-preview-index="' + i + '" style="width:100%;max-width:180px;border-radius:10px;background:#000"></video><div class="home-post-image-item__foot"><p class="home-post-image-item__label">' + (i === 0 ? '主视频' : '视频 ' + (i + 1)) + '</p><button type="button" class="home-post-image-item__remove" data-remove-edit-video="' + i + '">删除</button></div></div>').join(''); };
    const closeEditModal = () => { if (editModal) editModal.hidden = true; };
    function openEditModal(article) { if (!editModal || !editForm) return; editIdInput.value = article.id; if (editTitleInput) editTitleInput.value = article.title || ''; if (editBodyEditor) editBodyEditor.innerHTML = article.bodyHtml || article.body || ''; if (editBodyInput) editBodyInput.value = editBodyEditor ? editBodyEditor.innerHTML : ''; editImages = Array.isArray(article.images) && article.images.length ? article.images.slice() : (article.image ? [article.image] : []); editVideos = Array.isArray(article.videos) ? article.videos.slice() : []; syncEditImages(); syncEditVideos(); editModal.hidden = false; };
    if (editModal) editModal.addEventListener('click', (e) => { if (e.target && e.target.hasAttribute('data-close-article-edit-modal')) closeEditModal(); if (e.target === editModal) closeEditModal(); });
    if (editAddImageBtn && editImageInput) editAddImageBtn.addEventListener('click', (e) => { e.preventDefault(); editImageInput.click(); });
    if (editImageInput) editImageInput.addEventListener('change', (e) => { Array.from(e.target.files || []).forEach((file) => { const r = new FileReader(); r.onload = () => { editImages.push(String(r.result || '')); syncEditImages(); }; r.readAsDataURL(file); }); editImageInput.value = ''; });
    if (editImagesList) editImagesList.addEventListener('click', (e) => { const btn = e.target.closest('[data-remove-edit-image]'); if (!btn) return; editImages.splice(parseInt(btn.dataset.removeEditImage, 10), 1); syncEditImages(); });
    if (editAddVideoBtn && editVideoInput) editAddVideoBtn.addEventListener('click', (e) => { e.preventDefault(); editVideoInput.click(); });
    if (editVideoInput) editVideoInput.addEventListener('change', (e) => { Array.from(e.target.files || []).forEach((file) => { const r = new FileReader(); r.onload = () => { editVideos.push(String(r.result || '')); syncEditVideos(); }; r.readAsDataURL(file); }); editVideoInput.value = ''; });
    if (editVideosList) editVideosList.addEventListener('click', (e) => { const btn = e.target.closest('[data-remove-edit-video]'); if (!btn) return; editVideos.splice(parseInt(btn.dataset.removeEditVideo, 10), 1); syncEditVideos(); });
    const bindEditorToolbar = (toolbar, targetEditor, targetInput) => { if (!toolbar || !targetEditor) return; toolbar.addEventListener('click', (e) => { const btn = e.target.closest('[data-editor-command]'); if (!btn) return; e.preventDefault(); targetEditor.focus(); const cmd = btn.dataset.editorCommand; const val = btn.dataset.editorValue || null; if (cmd === 'createLink') { const url = window.prompt('请输入链接地址'); if (url) try { document.execCommand('createLink', false, url); } catch {} } else if (cmd === 'formatBlock') { try { document.execCommand(cmd, false, '<' + val + '>'); } catch {} } else { try { document.execCommand(cmd, false, val); } catch {} } if (targetInput) targetInput.value = targetEditor.innerHTML; }); };
    bindEditorToolbar(editorToolbar, bodyEditor, bodyInput);
    bindEditorToolbar(editToolbar, editBodyEditor, editBodyInput);
    if (colorInput && bodyEditor) colorInput.addEventListener('change', () => { bodyEditor.focus(); try { document.execCommand('foreColor', false, colorInput.value); } catch {} if (bodyInput) bodyInput.value = bodyEditor.innerHTML; });
    if (sizeInput && bodyEditor) sizeInput.addEventListener('change', () => { bodyEditor.focus(); try { document.execCommand('fontSize', false, sizeInput.value); } catch {} if (bodyInput) bodyInput.value = bodyEditor.innerHTML; });
    if (editTextColor && editBodyEditor) editTextColor.addEventListener('change', () => { editBodyEditor.focus(); try { document.execCommand('foreColor', false, editTextColor.value); } catch {} if (editBodyInput) editBodyInput.value = editBodyEditor.innerHTML; });
    if (editTextSize && editBodyEditor) editTextSize.addEventListener('change', () => { editBodyEditor.focus(); try { document.execCommand('fontSize', false, editTextSize.value); } catch {} if (editBodyInput) editBodyInput.value = editBodyEditor.innerHTML; });
    if (editBodyEditor) editBodyEditor.addEventListener('input', () => { if (editBodyInput) editBodyInput.value = editBodyEditor.innerHTML; });
    if (editForm) editForm.addEventListener('submit', async (e) => { e.preventDefault(); const session = TengyouSession.get(); if (!session || !isAdmin(session)) return alert('仅管理员可编辑文章'); const id = editIdInput ? editIdInput.value : ''; const title = editTitleInput ? editTitleInput.value.trim() : ''; const bodyHtml = editBodyEditor ? editBodyEditor.innerHTML.trim() : ''; const bodyText = editBodyEditor ? editBodyEditor.innerText.trim() : ''; if (!id || !title || !bodyHtml || !editImages.length) return alert('请填写标题、正文并至少保留一张图片'); const payload = { title, image: editImages[0], images: editImages.slice(), body: bodyText, bodyHtml, videos: editVideos.slice() }; try { await apiUpdateArticle(id, payload); const latest = await apiLoadArticles(); stateCache.data.articles = latest; saveLocalArticles(latest); try { await saveState({ ...(stateCache.data || {}), articles: latest }); } catch (err) {} closeEditModal(); await renderHome(); await renderRanking(); alert('修改已保存'); } catch (err) { alert(err.message || '保存修改失败'); } });
    const homeList = document.getElementById('homeArticleList'); if (homeList) homeList.addEventListener('click', async (e) => { const like = e.target.closest('[data-like-article]'); const manage = e.target.closest('[data-home-manage]'); if (like) { await apiLikeArticle(like.dataset.likeArticle); await renderHome(); await renderRanking(); return; } if (!manage) return; const articles = await apiLoadArticles(); const a = articles.find((x) => String(x.id) === String(manage.dataset.articleId)); if (!a) return; const action = manage.dataset.homeManage; if (action === 'pin' && isAdmin(TengyouSession.get())) { await apiUpdateArticle(a.id, { isPinned: !a.isPinned }); await renderHome(); await renderRanking(); } else if (action === 'edit' && isAdmin(TengyouSession.get())) { openEditModal(a); } else if (action === 'delete' && isAdmin(TengyouSession.get())) { if (window.confirm('确定删除这篇文章吗？')) { await apiDeleteArticle(a.id); stateCache.data.articles = (stateCache.data.articles || []).filter((item) => String(item.id) !== String(a.id)); saveLocalArticles(stateCache.data.articles); await saveState({ ...stateCache.data, articles: stateCache.data.articles }); await renderHome(); await renderRanking(); } } });
    const homePag = document.getElementById('homePagination'); if (homePag) homePag.addEventListener('click', (e) => { const btn = e.target.closest('[data-home-page]'); if (!btn) return; document.getElementById('homeArticleList').setAttribute('data-current-page', btn.dataset.homePage); renderHome(); });
    const rankPag = document.getElementById('rankingPagination'); if (rankPag) rankPag.addEventListener('click', (e) => { const btn = e.target.closest('[data-ranking-page]'); if (!btn) return; document.getElementById('rankingList').setAttribute('data-ranking-page', btn.dataset.rankingPage); renderRanking(); });
    const boardForm = document.getElementById('boardForm'); if (boardForm) boardForm.addEventListener('submit', async (e) => { e.preventDefault(); const session = TengyouSession.get(); if (!session) return alert('请先登录'); const ta = boardForm.querySelector('textarea[name="content"]'); const body = ta.value.trim(); if (!body) return; try { await apiCreateBoardPost({ nickname: session.username, body, ts: Date.now() }); ta.value = ''; await renderBoard(); } catch (err) { alert(err.message || '发布失败'); } });
    const boardView = document.getElementById('boardView'); if (boardView) boardView.addEventListener('click', (e) => { const btn = e.target.closest('[data-open-post]'); if (btn) location.href = 'find-game.html#post=' + encodeURIComponent(btn.dataset.openPost); });
    document.addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; const postModalEl = document.getElementById('homePostModal'); const viewer = document.getElementById('homePostMediaViewer'); const editModalNow = document.getElementById('homeArticleEditModal'); if (postModalEl && !postModalEl.hidden) postModalEl.hidden = true; if (viewer && !viewer.hidden) viewer.hidden = true; if (editModalNow && !editModalNow.hidden) editModalNow.hidden = true; });
    const draftBtn = document.getElementById('saveDraftBtn'); if (draftBtn) draftBtn.addEventListener('click', async () => { draftBtn.classList.add('is-pressed'); const msg = document.getElementById('draftStatusMsg'); if (msg) { msg.hidden = false; msg.textContent = '正在保存...'; msg.className = 'draft-status'; } window.setTimeout(() => draftBtn.classList.remove('is-pressed'), 120); try { const session = TengyouSession.get(); if (!session || !isAdmin(session)) throw new Error('仅管理员可保存草稿'); if (!postForm) throw new Error('表单未就绪'); const title = titleInput ? titleInput.value.trim() : ''; const bodyHtml = bodyEditor ? bodyEditor.innerHTML.trim() : ''; const payload = { email: session.email, title, bodyHtml, images: images.slice(), videos: videos.slice(), ts: Date.now() }; saveLocalDraft(payload); const res = await apiFetch('/api/drafts', { method: 'POST', body: JSON.stringify(payload) }); if (!res || !res.item) throw new Error('保存成功但服务器未返回结果'); if (msg) { msg.textContent = '保存成功'; msg.className = 'draft-status draft-status--success'; } } catch (err) { const fallback = loadLocalDraft(); if (fallback) { saveLocalDraft(fallback); if (msg) { msg.textContent = '已本地保存，联网后会同步'; msg.className = 'draft-status draft-status--success'; } } else if (msg) { msg.textContent = err.message || '保存失败'; msg.className = 'draft-status draft-status--error'; } } finally { if (msg) { window.setTimeout(() => { msg.hidden = true; }, 2500); } } });
    document.addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; const postModalEl = document.getElementById('homePostModal'); const viewer = document.getElementById('homePostMediaViewer'); const editModal = document.getElementById('homeArticleEditModal'); const articleEditModal = document.querySelector('.article-edit-modal:not([hidden])'); if (postModalEl && !postModalEl.hidden) postModalEl.hidden = true; if (viewer && !viewer.hidden) viewer.hidden = true; if (editModal && !editModal.hidden) editModal.hidden = true; if (articleEditModal) articleEditModal.hidden = true; });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    bindCommon();
    await loadState();
    if (window.initHome) initHome();
    if (window.initAuth) initAuth();
    if (window.initArticleEditor) initArticleEditor();
    await renderHome(); await renderRanking(); await renderBoard(); await renderSearch(); await renderArticle();
    const searchResultList = document.getElementById('searchResultList'); if (searchResultList) { const q = new URLSearchParams(location.search).get('q') || ''; const bc = document.getElementById('searchBreadcrumb'); if (bc) bc.innerHTML = '<a href="index.html">首页</a><span class="breadcrumb__sep">›</span><span class="breadcrumb__current">搜索：' + esc(q) + '</span>'; }
  });
})();