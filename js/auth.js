(function () {
  function esc(s) { return String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function initAuth() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const historyList = document.getElementById('loginAccountHistory');
    const rememberKey = 'tengyou-login-remember';
    const historyKey = 'tengyou-login-history';

    const loadHistory = () => {
      try {
        const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
        if (historyList && Array.isArray(history)) historyList.innerHTML = history.slice(0, 10).map((item) => '<option value="' + esc(item) + '"></option>').join('');
      } catch {}
    };

    const loadRemembered = () => {
      if (!loginForm) return;
      try {
        const remembered = JSON.parse(localStorage.getItem(rememberKey) || 'null');
        if (!remembered) return;
        const accountInput = loginForm.querySelector('input[name="account"]');
        const passwordInput = loginForm.querySelector('input[name="password"]');
        const rememberInput = loginForm.querySelector('input[name="rememberMe"]');
        if (accountInput) accountInput.value = remembered.account || '';
        if (passwordInput) passwordInput.value = remembered.password || '';
        if (rememberInput) rememberInput.checked = true;
      } catch {}
    };

    if (loginForm && window.TengyouSession && window.apiLogin) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const accountInput = loginForm.querySelector('input[name="account"]');
        const passwordInput = loginForm.querySelector('input[name="password"]');
        const rememberInput = loginForm.querySelector('input[name="rememberMe"]');
        const account = accountInput?.value.trim();
        const password = passwordInput?.value || '';
        const email = loginForm.querySelector('input[name="email"]')?.value.trim() || account;
        if (!account || !password) return alert('请填写账号和密码');
        const existingHistory = (() => { try { return JSON.parse(localStorage.getItem(historyKey) || '[]'); } catch { return []; } })();
        if (account && !existingHistory.includes(account)) {
          existingHistory.unshift(account);
          localStorage.setItem(historyKey, JSON.stringify(existingHistory.slice(0, 10)));
          loadHistory();
        }
        if (rememberInput && rememberInput.checked) localStorage.setItem(rememberKey, JSON.stringify({ account, password, email }));
        else localStorage.removeItem(rememberKey);
        TengyouSession.set(account, email);
        try { const res = await apiLogin({ account, password }); const item = res.item || {}; TengyouSession.set(item.username || account, item.email || email); } catch {}
        alert('登录成功');
        if (window.renderHome) await window.renderHome();
      });
      loadRemembered();
      loadHistory();
    }

    if (registerForm && window.apiRegister && window.TengyouSession) {
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
        try { const res = await apiRegister({ username: u, email, password }); const item = res.item || {}; TengyouSession.set(item.username || u, item.email || email); alert('注册成功并已登录'); } catch (err) { TengyouSession.set(u, email); alert((err && err.message) ? ('注册已本地保存：' + err.message) : '注册已本地保存'); }
      });
    }
  }

  window.initAuth = initAuth;
})();
