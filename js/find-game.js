(function () {
  var API_BASE = window.TENGYOU_API_BASE || window.__TENGYOU_API_BASE || "https://api.12345588.xyz";
  var MAX_POST = 2000;
  var MAX_COMMENT = 1000;
  var POSTS_PER_PAGE = 15;
  var COMMENTS_PER_PAGE = 15;
  var NESTED_COMMENT_LIMIT = 5;
  var currentPage = 1;
  var viewState = { mode: "list", postId: null };
  var expandedNestedComments = {};

  function containsForbiddenContent(text) {
    if (!text || typeof text !== "string") return false;
    var patterns = [
      /(?:https?:\/\/|www\.)/i,
      /[\w.-]+\.(?:com|net|org|cn|cc|top|xyz|gov|edu|io|me|tv|info)(?:[\/?#][^\s]*)?/i,
      /magnet\s*:\s*\?/i,
      /magnet%3a%3f/i,
      /赌博|博彩|下注|代开|彩票/i,
      /色情|裸聊|成人视频|自拍偷拍/i,
      /毒品|吸毒|贩毒|冰毒|海洛因|大麻/i,
    ];
    var compact = text.replace(/\s+/g, "");
    return patterns.some(function (re) { return re.test(text) || re.test(compact); });
  }

  function apiFetch(path, options) {
    options = options || {};
    var headers = Object.assign({}, options.headers || {});
    var hasBody = options.body != null;
    if (hasBody && !headers["Content-Type"]) {
      headers["Content-Type"] = "text/plain; charset=utf-8";
    }
    return fetch(API_BASE + path, Object.assign({}, options, {
      headers: headers,
    })).then(async function (res) {
      var text = await res.text();
      var data = null;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
      if (!res.ok) {
        var message = (data && data.message) || (typeof data === "string" && data.trim()) || ("请求失败（HTTP " + res.status + "）");
        var err = new Error(message);
        err.status = res.status;
        err.body = data;
        throw err;
      }
      return data;
    });
  }

  function normalizePost(p) {
    return {
      id: p.id,
      nickname: p.nickname || "匿名旅人",
      body: p.body || "",
      ts: p.ts || 0,
      likes: typeof p.likes === "number" ? p.likes : 0,
      isPinned: !!p.isPinned,
      comments: [],
    };
  }

  function normalizeComment(c) {
    return {
      id: c.id,
      postId: c.postId,
      parentId: c.parentId != null ? c.parentId : null,
      nickname: c.nickname || "匿名旅人",
      body: c.body || "",
      ts: c.ts || 0,
      likes: typeof c.likes === "number" ? c.likes : 0,
    };
  }

  async function loadBoard() {
    var res = await apiFetch("/api/board-posts");
    var posts = Array.isArray(res.items) ? res.items.map(normalizePost) : [];
    var seen = {};
    var unique = [];
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      var key = String(post.nickname || "").trim().toLowerCase() + "|" + String(post.body || "").trim().toLowerCase();
      var prev = seen[key];
      if (prev && Math.abs((Number(prev.ts) || 0) - (Number(post.ts) || 0)) <= 3000) {
        try { await apiFetch("/api/board-posts/" + encodeURIComponent(post.id), { method: "DELETE" }); } catch (err) {}
        continue;
      }
      seen[key] = post;
      unique.push(post);
    }
    return { posts: unique };
  }

  async function loadComments(postId) {
    var res = await apiFetch("/api/board-posts/" + encodeURIComponent(postId) + "/comments");
    return Array.isArray(res.items) ? res.items.map(normalizeComment) : [];
  }

  function formatTime(ts) {
    try {
      return new Date(ts).toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  }

  function avatarLetter(name) {
    var s = (name || "匿").trim();
    return s.charAt(0) || "匿";
  }

  function getSession() {
    return window.TengyouSession && window.TengyouSession.get ? window.TengyouSession.get() : null;
  }

  function getSessionUser() {
    var s = getSession();
    return s ? s.username : null;
  }

  function isAdmin(session) {
    return !!session && String(session.email || "").toLowerCase() === "871412257@qq.com";
  }

  function updateSessionBar() {
    var bar = document.getElementById("boardSessionBar");
    if (!bar) return;
    bar.innerHTML = "";
    var session = getSession();
    if (session) {
      var p = document.createElement("p");
      p.className = "board-session board-session--in";
      p.innerHTML = '当前用户：<strong class="board-session__name"></strong> <button type="button" class="board-session__logout">退出</button>';
      p.querySelector(".board-session__name").textContent = session.username;
      p.querySelector(".board-session__logout").addEventListener("click", function () {
        window.TengyouSession.clear();
        initPage();
      });
      bar.appendChild(p);
    } else {
      var hint = document.createElement("p");
      hint.className = "board-session board-session--out";
      hint.innerHTML = '发布留言、回复评论需先 <a href="login.html">登录</a> 或 <a href="register.html">注册</a>。';
      bar.appendChild(hint);
    }
  }

  function updateFormVisibility() {
    var form = document.getElementById("boardForm");
    var guestNote = document.getElementById("boardGuestNote");
    var user = getSessionUser();
    if (form) form.style.display = user ? "block" : "none";
    if (guestNote) guestNote.style.display = user ? "none" : "block";
  }

  function renderPagination(container, totalItems, perPage, page) {
    if (!container) return 1;
    container.innerHTML = "";
    var totalPages = totalItems ? Math.ceil(totalItems / perPage) : 1;
    if (totalPages <= 1) {
      container.hidden = true;
      return 1;
    }
    container.hidden = false;
    for (var i = 1; i <= totalPages; i++) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "board-pagination__btn";
      btn.setAttribute("data-page", String(i));
      btn.textContent = String(i);
      if (i === page) {
        btn.classList.add("board-pagination__btn--current");
        btn.setAttribute("aria-current", "page");
      }
      container.appendChild(btn);
    }
    return totalPages;
  }

  function findPost(board, postId) {
    return (board.posts || []).filter(function (p) { return String(p.id) === String(postId); })[0] || null;
  }

  function renderCommentList(listEl, comments, postId) {
    listEl.innerHTML = "";
    var sorted = comments.slice().sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
    var user = getSessionUser();

    if (!sorted.length) {
      var empty = document.createElement("p");
      empty.className = "board-comment-empty";
      empty.textContent = "还没有评论";
      listEl.appendChild(empty);
      return;
    }

    sorted.slice(0, 3).forEach(function (c) {
      var item = document.createElement("div");
      item.className = "board-comment";
      var meta = document.createElement("div");
      meta.className = "board-comment__meta";
      var name = document.createElement("span");
      name.className = "board-comment__name";
      name.textContent = c.nickname || "匿名旅人";
      var time = document.createElement("span");
      time.className = "board-comment__time";
      time.textContent = formatTime(c.ts);
      meta.appendChild(name);
      meta.appendChild(time);
      var body = document.createElement("p");
      body.className = "board-comment__text";
      body.textContent = c.body || "";
      item.appendChild(meta);
      item.appendChild(body);

      if (user) {
        var replyToggle = document.createElement("button");
        replyToggle.type = "button";
        replyToggle.className = "board-comment-more-btn";
        replyToggle.setAttribute("data-toggle-reply-form", String(postId) + ":" + String(c.id));
        replyToggle.textContent = "回复";
        item.appendChild(replyToggle);

        var replyForm = document.createElement("form");
        replyForm.className = "board-comment-form board-comment-form--reply";
        replyForm.hidden = true;
        replyForm.setAttribute("data-reply-post-id", String(postId));
        replyForm.setAttribute("data-reply-comment-id", String(c.id));
        var replyTa = document.createElement("textarea");
        replyTa.name = "reply";
        replyTa.required = true;
        replyTa.maxLength = MAX_COMMENT;
        replyTa.rows = 2;
        replyTa.placeholder = "回复这条评论…";
        var replyBtn = document.createElement("button");
        replyBtn.type = "submit";
        replyBtn.className = "btn-primary btn-primary--sm";
        replyBtn.textContent = "发送回复";
        replyForm.appendChild(replyTa);
        replyForm.appendChild(replyBtn);
        item.appendChild(replyForm);
      }

      item.dataset.commentId = String(c.id);
      listEl.appendChild(item);
    });

    if (sorted.length > 3) {
      var moreTip = document.createElement("p");
      moreTip.className = "board-comment-more";
      moreTip.textContent = "还有更多评论，请点进此留言查看。";
      listEl.appendChild(moreTip);
    }
  }

  async function renderList(board) {
    var root = document.getElementById("boardView");
    if (!root) return;
    root.className = "board-view";
    root.innerHTML = "";

    var posts = board.posts.slice().sort(function (a, b) {
      return (b.isPinned === true ? 1 : 0) - (a.isPinned === true ? 1 : 0) || (b.ts || 0) - (a.ts || 0);
    });
    var totalPages = renderPagination(document.getElementById("boardPagination"), posts.length, POSTS_PER_PAGE, currentPage);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    if (!posts.length) {
      var empty = document.createElement("p");
      empty.className = "board-empty";
      empty.textContent = "暂无留言，登录后来发第一条吧～";
      root.appendChild(empty);
      return;
    }

    var start = (currentPage - 1) * POSTS_PER_PAGE;
    var pagePosts = posts.slice(start, start + POSTS_PER_PAGE);
    var session = getSession();
    var user = session ? session.username : null;
    var admin = isAdmin(session);

    for (var i = 0; i < pagePosts.length; i++) {
      var p = pagePosts[i];
      var thread = document.createElement("article");
      thread.className = "board-thread";
      thread.setAttribute("data-post-id", String(p.id));

      var row = document.createElement("div");
      row.className = "board-post";
      var av = document.createElement("div");
      av.className = "board-post__avatar";
      av.setAttribute("aria-hidden", "true");
      av.textContent = avatarLetter(p.nickname);
      var body = document.createElement("div");
      body.className = "board-post__body";
      var head = document.createElement("div");
      head.className = "board-post__head";
      var name = document.createElement("span");
      name.className = "board-post__name";
      name.textContent = p.nickname || "匿名旅人";
      var time = document.createElement("span");
      time.className = "board-post__time";
      time.textContent = formatTime(p.ts);
      head.appendChild(name);
      head.appendChild(time);

      if (user) {
        body.appendChild(head);
        var titleBtn = document.createElement("button");
        titleBtn.type = "button";
        titleBtn.className = "board-post__title-btn";
        titleBtn.setAttribute("data-open-post", String(p.id));
        titleBtn.textContent = p.body || "";
        body.appendChild(titleBtn);
      } else {
        var text = document.createElement("p");
        text.className = "board-post__text";
        text.textContent = p.body || "";
        body.appendChild(head);
        body.appendChild(text);
      }

      row.appendChild(av);
      row.appendChild(body);
      thread.appendChild(row);

      var commentsWrap = document.createElement("div");
      commentsWrap.className = "board-comments";
      var subTitle = document.createElement("h3");
      subTitle.className = "board-comments__title";
      subTitle.textContent = "评论";
      commentsWrap.appendChild(subTitle);

      var actions = document.createElement("div");
      actions.className = "board-post__actions";
      actions.style.display = (admin || String(p.nickname || "") === String(user || "")) ? "flex" : "none";
      if (admin) {
        var pinBtn = document.createElement("button");
        pinBtn.type = "button";
        pinBtn.className = "board-post__action-btn";
        pinBtn.setAttribute("data-pin-post", String(p.id));
        pinBtn.textContent = p.isPinned ? "取消置顶" : "置顶";
        actions.appendChild(pinBtn);
      }
      if (admin || String(p.nickname || "") === String(user || "")) {
        var delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "board-post__action-btn board-post__action-btn--danger";
        delBtn.setAttribute("data-delete-post", String(p.id));
        delBtn.textContent = "删除";
        actions.appendChild(delBtn);
      }
      commentsWrap.appendChild(actions);

      var cList = document.createElement("div");
      cList.className = "board-comment-list";
      var comments = await loadComments(p.id);
      renderCommentList(cList, comments, p.id);
      commentsWrap.appendChild(cList);

      if (user) {
        var cForm = document.createElement("form");
        cForm.className = "board-comment-form";
        cForm.setAttribute("data-post-id", String(p.id));
        var ta = document.createElement("textarea");
        ta.name = "comment";
        ta.required = true;
        ta.maxLength = MAX_COMMENT;
        ta.placeholder = "写下评论…（禁止任何网址）";
        ta.rows = 3;
        var hint = document.createElement("p");
        hint.className = "board-form__hint";
        hint.textContent = "禁止发布任何网址，违者将无法发送。";
        var btn = document.createElement("button");
        btn.type = "submit";
        btn.className = "btn-primary btn-primary--sm";
        btn.textContent = "发表评论";
        cForm.appendChild(ta);
        cForm.appendChild(hint);
        cForm.appendChild(btn);
        commentsWrap.appendChild(cForm);
      } else {
        var loginPrompt = document.createElement("p");
        loginPrompt.className = "board-comment-login-hint";
        loginPrompt.innerHTML = '<a href="login.html">登录</a> 后可回复该留言';
        commentsWrap.appendChild(loginPrompt);
      }

      thread.appendChild(commentsWrap);
      root.appendChild(thread);
    }
  }

  async function renderDetail(board, postId) {
    var root = document.getElementById("boardView");
    if (!root) return;
    root.className = "board-view";
    root.innerHTML = "";

    var post = findPost(board, postId);
    if (!post) {
      var empty = document.createElement("p");
      empty.className = "board-empty";
      empty.textContent = "留言不存在或已失效。";
      root.appendChild(empty);
      return;
    }

    var session = getSession();
    var user = session ? session.username : null;
    var admin = isAdmin(session);

    var detail = document.createElement("article");
    detail.className = "board-thread board-comment-detail";

    var row = document.createElement("div");
    row.className = "board-post";
    var av = document.createElement("div");
    av.className = "board-post__avatar";
    av.setAttribute("aria-hidden", "true");
    av.textContent = avatarLetter(post.nickname);
    var body = document.createElement("div");
    body.className = "board-post__body";
    var head = document.createElement("div");
    head.className = "board-post__head";
    var name = document.createElement("span");
    name.className = "board-post__name";
    name.textContent = post.nickname || "匿名旅人";
    var time = document.createElement("span");
    time.className = "board-post__time";
    time.textContent = formatTime(post.ts);
    head.appendChild(name);
    head.appendChild(time);
    var text = document.createElement("p");
    text.className = "board-post__text";
    text.textContent = post.body || "";
    body.appendChild(head);
    body.appendChild(text);
    row.appendChild(av);
    row.appendChild(body);
    detail.appendChild(row);

    var actions = document.createElement("div");
    actions.className = "board-post__actions";
    actions.style.display = (admin || String(post.nickname || "") === String(user || "")) ? "flex" : "none";
    if (admin) {
      var pinBtn = document.createElement("button");
      pinBtn.type = "button";
      pinBtn.className = "board-post__action-btn";
      pinBtn.setAttribute("data-pin-post", String(post.id));
      pinBtn.textContent = post.isPinned ? "取消置顶" : "置顶";
      actions.appendChild(pinBtn);
    }
    if (admin || String(post.nickname || "") === String(user || "")) {
      var delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "board-post__action-btn board-post__action-btn--danger";
      delBtn.setAttribute("data-delete-post", String(post.id));
      delBtn.textContent = "删除";
      actions.appendChild(delBtn);
    }
    detail.appendChild(actions);

    var comments = await loadComments(post.id);
    var commentsWrap = document.createElement("div");
    commentsWrap.className = "board-comments";
    var subTitle = document.createElement("h3");
    subTitle.className = "board-comments__title";
    subTitle.textContent = "评论";
    commentsWrap.appendChild(subTitle);

    var cList = document.createElement("div");
    cList.className = "board-comment-list";
    renderCommentList(cList, comments, post.id);
    commentsWrap.appendChild(cList);

    if (user) {
      var cForm = document.createElement("form");
      cForm.className = "board-comment-form";
      cForm.setAttribute("data-post-id", String(post.id));
      var ta = document.createElement("textarea");
      ta.name = "comment";
      ta.required = true;
      ta.maxLength = MAX_COMMENT;
      ta.placeholder = "写下评论…（禁止磁力链接）";
      ta.rows = 3;
      var hint = document.createElement("p");
      hint.className = "board-form__hint";
      hint.textContent = "禁止发布 magnet:? 等磁力链接，违者将无法发送。";
      var btn = document.createElement("button");
      btn.type = "submit";
      btn.className = "btn-primary btn-primary--sm";
      btn.textContent = "发表评论";
      cForm.appendChild(ta);
      cForm.appendChild(hint);
      cForm.appendChild(btn);
      commentsWrap.appendChild(cForm);
    }

    detail.appendChild(commentsWrap);
    root.appendChild(detail);

    renderPagination(document.getElementById("boardPagination"), comments.length, COMMENTS_PER_PAGE, currentPage);
  }

  async function initPage() {
    updateSessionBar();
    updateFormVisibility();
    var board = await loadBoard();
    if (viewState.mode === "detail" && viewState.postId != null) {
      await renderDetail(board, viewState.postId);
    } else {
      await renderList(board);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initPage();

    var form = document.getElementById("boardForm");
    if (form) {
      var submitPost = async function () {
        var user = getSessionUser();
        if (!user) return window.alert("请先登录后再发布留言。");
        var bodyInput = form.querySelector('textarea[name="content"]');
        var body = bodyInput ? bodyInput.value.trim() : "";
        if (!body) return window.alert("请先填写留言内容。");
        if (body.length > MAX_POST) return window.alert("内容请控制在 " + MAX_POST + " 字以内。");
        if (containsForbiddenContent(body)) return window.alert("内容包含违规信息，已自动阻止发布。");
        try {
          var btn = form.querySelector('button[type="submit"]');
          if (btn) { btn.disabled = true; btn.textContent = "发布中…"; }
          await apiFetch("/api/board-posts", {
            method: "POST",
            body: JSON.stringify({ nickname: user, body: body, ts: Date.now() }),
          });
          form.reset();
          currentPage = 1;
          await initPage();
        } catch (err) {
          window.alert("留言保存失败：" + (err && err.message ? err.message : "未知错误"));
        } finally {
          var btn2 = form.querySelector('button[type="submit"]');
          if (btn2) { btn2.disabled = false; btn2.textContent = "发布留言"; }
        }
      };
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        submitPost();
      });
    }

    var pagNav = document.getElementById("boardPagination");
    if (pagNav) {
      pagNav.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-page]");
        if (!btn || btn.disabled) return;
        var p = parseInt(btn.getAttribute("data-page"), 10);
        if (isNaN(p) || p === currentPage) return;
        currentPage = p;
        initPage();
      });
    }

    var view = document.getElementById("boardView");
    if (view) {
      view.addEventListener("click", async function (e) {
        var openBtn = e.target.closest("[data-open-post]");
        if (openBtn) {
          if (!getSessionUser()) return window.alert("请先登录后再进入留言详情。");
          viewState.mode = "detail";
          viewState.postId = openBtn.getAttribute("data-open-post");
          currentPage = 1;
          initPage();
          return;
        }

        var toggle = e.target.closest("[data-toggle-reply-form]");
        if (toggle) {
          var parts = toggle.getAttribute("data-toggle-reply-form").split(":");
          var replyForm = view.querySelector('[data-reply-post-id="' + parts[0] + '"][data-reply-comment-id="' + parts[1] + '"]');
          if (replyForm) replyForm.hidden = !replyForm.hidden;
          return;
        }

        var delPost = e.target.closest("[data-delete-post]");
        var pinPost = e.target.closest("[data-pin-post]");
        if (!delPost && !pinPost) return;
        var session = getSession();
        if (!session) return;
        var admin = isAdmin(session);
        var postId = String((delPost || pinPost).getAttribute(delPost ? "data-delete-post" : "data-pin-post") || "");
        if (delPost) {
          try {
            var board = await loadBoard();
            var post = findPost(board, postId);
            if (!post) return;
            if (!admin && String(post.nickname || "") !== String(session.username || "")) return;
            await apiFetch("/api/board-posts/" + encodeURIComponent(postId), { method: "DELETE" });
            await initPage();
          } catch (err) {
            window.alert("删除失败：" + (err && err.message ? err.message : "未知错误"));
          }
          return;
        }
        if (pinPost) {
          if (!admin) return;
          try {
            var board2 = await loadBoard();
            var post2 = findPost(board2, postId);
            if (!post2) return;
            await apiFetch("/api/board-posts/" + encodeURIComponent(postId), {
              method: "PATCH",
              body: JSON.stringify({ isPinned: !post2.isPinned }),
            });
            await initPage();
          } catch (err) {
            window.alert("操作失败：" + (err && err.message ? err.message : "未知错误"));
          }
        }
      });

      view.addEventListener("submit", async function (e) {
        var cForm = e.target;
        if (!cForm || !cForm.classList || !cForm.classList.contains("board-comment-form")) return;
        e.preventDefault();
        var user = getSessionUser();
        if (!user) return;
        var postId = cForm.getAttribute("data-post-id");
        var replyPostId = cForm.getAttribute("data-reply-post-id");
        var body;
        if (replyPostId) {
          var replyTa = cForm.querySelector('textarea[name="reply"]');
          body = replyTa ? replyTa.value.trim() : "";
        } else {
          var ta = cForm.querySelector('textarea[name="comment"]');
          body = ta ? ta.value.trim() : "";
        }
        if (!body) return;
        if (body.length > MAX_COMMENT) return window.alert((replyPostId ? "回复" : "评论") + "请控制在 " + MAX_COMMENT + " 字以内。");
        if (containsForbiddenContent(body)) return window.alert("内容包含违规信息，已自动阻止发布。");

        try {
          var payload = { nickname: user, body: body, ts: Date.now() };
          if (replyPostId) payload.parentId = Number(cForm.getAttribute("data-reply-comment-id")) || null;
          await apiFetch("/api/board-posts/" + encodeURIComponent(postId) + "/comments", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          cForm.reset();
          await initPage();
        } catch (err) {
          window.alert((replyPostId ? "回复" : "评论") + "保存失败：" + (err && err.message ? err.message : "未知错误"));
        }
      });
    }
  });
})();
