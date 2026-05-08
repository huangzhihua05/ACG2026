(function () {
  function esc(s) { return String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function initHome() {
    if (!window.TengyouSession || !window.apiFetch) return;
    const isAdmin = (s) => !!s && String(s.email || '').toLowerCase() === '871412257@qq.com';
    const homeList = document.getElementById('homeArticleList');
    if (!homeList) return;
    homeList.addEventListener('click', async (e) => {
      const like = e.target.closest('[data-like-article]');
      const manage = e.target.closest('[data-home-manage]');
      if (like) { await window.apiLikeArticle(like.dataset.likeArticle); await window.renderHome(); await window.renderRanking(); return; }
      if (!manage) return;
      const articles = await window.apiLoadArticles();
      const a = articles.find((x) => String(x.id) === String(manage.dataset.articleId));
      if (!a) return;
      const action = manage.dataset.homeManage;
      if (action === 'pin' && isAdmin(window.TengyouSession.get())) {
        const nextPinned = !a.isPinned;
        if (nextPinned) {
          const pinnedCount = articles.filter((item) => item.isPinned && String(item.id) !== String(a.id)).length;
          if (pinnedCount >= 3) {
            alert('最多只能置顶3篇文章');
            return;
          }
        }
        await window.apiUpdateArticle(a.id, { isPinned: nextPinned });
        await window.renderHome(); await window.renderRanking();
      } else if (action === 'edit' && isAdmin(window.TengyouSession.get())) {
        window.openEditArticleModal(a);
      } else if (action === 'delete' && isAdmin(window.TengyouSession.get())) {
        if (window.confirm('确定删除这篇文章吗？')) {
          await window.apiDeleteArticle(a.id);
          const current = (window.loadLocalArticles && window.loadLocalArticles()) || [];
          const next = current.filter((item) => String(item.id) !== String(a.id));
          if (window.saveLocalArticles) window.saveLocalArticles(next);
          await window.renderHome(); await window.renderRanking();
        }
      }
    });
  }
  window.initHome = initHome;
})();
