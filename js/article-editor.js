(function () {
  function esc(s) { return String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function initArticleEditor() {
    const editModal = document.getElementById('homeArticleEditModal');
    const editForm = document.getElementById('homeArticleEditForm');
    if (!editModal || !editForm) return;
    const editTitleInput = editForm.querySelector('input[name="title"]');
    const editIdInput = editForm.querySelector('input[name="id"]');
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
    const editToolbar = editModal.querySelector('.rich-editor-toolbar');
    let editImages = [];
    let editVideos = [];

    const syncEditImages = () => { if (editImagesList) editImagesList.innerHTML = editImages.map((src, i) => '<div class="home-post-image-item"><img src="' + esc(src) + '" alt="图片 ' + (i + 1) + '"><div class="home-post-image-item__foot"><p class="home-post-image-item__label">' + (i === 0 ? '主图' : '图片 ' + (i + 1)) + '</p><button type="button" class="home-post-image-item__remove" data-remove-edit-image="' + i + '">删除</button></div></div>').join(''); };
    const syncEditVideos = () => { if (editVideosList) editVideosList.innerHTML = editVideos.map((src, i) => '<div class="home-post-image-item"><video controls src="' + esc(src) + '" style="width:100%;max-width:180px;border-radius:10px;background:#000"></video><div class="home-post-image-item__foot"><p class="home-post-image-item__label">' + (i === 0 ? '主视频' : '视频 ' + (i + 1)) + '</p><button type="button" class="home-post-image-item__remove" data-remove-edit-video="' + i + '">删除</button></div></div>').join(''); };
    const closeEditModal = () => { editModal.hidden = true; };
    const openEditModal = (article) => {
      editIdInput.value = article.id;
      if (editTitleInput) editTitleInput.value = article.title || '';
      if (editBodyEditor) editBodyEditor.innerHTML = article.bodyHtml || article.body || '';
      if (editBodyInput) editBodyInput.value = editBodyEditor ? editBodyEditor.innerHTML : '';
      editImages = Array.isArray(article.images) && article.images.length ? article.images.slice() : (article.image ? [article.image] : []);
      editVideos = Array.isArray(article.videos) ? article.videos.slice() : [];
      syncEditImages();
      syncEditVideos();
      editModal.hidden = false;
    };
    window.openEditArticleModal = openEditModal;

    const bindEditorToolbar = (toolbar, targetEditor, targetInput) => {
      if (!toolbar || !targetEditor) return;
      toolbar.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-editor-command]');
        if (!btn) return;
        e.preventDefault();
        targetEditor.focus();
        const cmd = btn.dataset.editorCommand;
        const val = btn.dataset.editorValue || null;
        if (cmd === 'createLink') {
          const url = window.prompt('请输入链接地址');
          if (url) try { document.execCommand('createLink', false, url); } catch {}
        } else if (cmd === 'formatBlock') {
          try { document.execCommand(cmd, false, '<' + val + '>'); } catch {}
        } else {
          try { document.execCommand(cmd, false, val); } catch {}
        }
        if (targetInput) targetInput.value = targetEditor.innerHTML;
      });
    };

    if (editModal) editModal.addEventListener('click', (e) => { if (e.target && e.target.hasAttribute('data-close-article-edit-modal')) closeEditModal(); if (e.target === editModal) closeEditModal(); });
    if (editAddImageBtn && editImageInput) editAddImageBtn.addEventListener('click', (e) => { e.preventDefault(); editImageInput.click(); });
    if (editImageInput) editImageInput.addEventListener('change', (e) => { Array.from(e.target.files || []).forEach((file) => { const r = new FileReader(); r.onload = () => { editImages.push(String(r.result || '')); syncEditImages(); }; r.readAsDataURL(file); }); editImageInput.value = ''; });
    if (editImagesList) editImagesList.addEventListener('click', (e) => { const btn = e.target.closest('[data-remove-edit-image]'); if (!btn) return; editImages.splice(parseInt(btn.dataset.removeEditImage, 10), 1); syncEditImages(); });
    if (editAddVideoBtn && editVideoInput) editAddVideoBtn.addEventListener('click', (e) => { e.preventDefault(); editVideoInput.click(); });
    if (editVideoInput) editVideoInput.addEventListener('change', (e) => { Array.from(e.target.files || []).forEach((file) => { const r = new FileReader(); r.onload = () => { editVideos.push(String(r.result || '')); syncEditVideos(); }; r.readAsDataURL(file); }); editVideoInput.value = ''; });
    if (editVideosList) editVideosList.addEventListener('click', (e) => { const btn = e.target.closest('[data-remove-edit-video]'); if (!btn) return; editVideos.splice(parseInt(btn.dataset.removeEditVideo, 10), 1); syncEditVideos(); });
    bindEditorToolbar(editToolbar, editBodyEditor, editBodyInput);
    if (editTextColor && editBodyEditor) editTextColor.addEventListener('change', () => { editBodyEditor.focus(); try { document.execCommand('foreColor', false, editTextColor.value); } catch {} if (editBodyInput) editBodyInput.value = editBodyEditor.innerHTML; });
    if (editTextSize && editBodyEditor) editTextSize.addEventListener('change', () => { editBodyEditor.focus(); try { document.execCommand('fontSize', false, editTextSize.value); } catch {} if (editBodyInput) editBodyInput.value = editBodyEditor.innerHTML; });
    if (editBodyEditor) editBodyEditor.addEventListener('input', () => { if (editBodyInput) editBodyInput.value = editBodyEditor.innerHTML; });
    if (editForm) editForm.addEventListener('submit', async (e) => { e.preventDefault(); const session = window.TengyouSession && TengyouSession.get(); if (!session || String(session.email || '').toLowerCase() !== '871412257@qq.com') return alert('仅管理员可编辑文章'); const id = editIdInput ? editIdInput.value : ''; const title = editTitleInput ? editTitleInput.value.trim() : ''; const bodyHtml = editBodyEditor ? editBodyEditor.innerHTML.trim() : ''; const bodyText = editBodyEditor ? editBodyEditor.innerText.trim() : ''; if (!id || !title || !bodyHtml || !editImages.length) return alert('请填写标题、正文并至少保留一张图片'); const payload = { title, image: editImages[0], images: editImages.slice(), body: bodyText, bodyHtml, videos: editVideos.slice() }; try { await window.apiUpdateArticle(id, payload); const latest = await window.apiLoadArticles(); if (window.saveLocalArticles) window.saveLocalArticles(latest); if (window.saveState) await window.saveState({ ...(window.getState ? window.getState() : {}), articles: latest }); closeEditModal(); await window.renderHome(); await window.renderRanking(); alert('修改已保存'); } catch (err) { alert(err.message || '保存修改失败'); } });
  }
  window.initArticleEditor = initArticleEditor;
})();
