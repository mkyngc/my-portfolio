/* =====================================================
   ADMIN DASHBOARD — edits the portfolio content.
   Edits are kept as a draft in this browser; "Publish" downloads
   js/content-data.js to replace in your project.
===================================================== */
(function () {
  if (!sessionStorage.getItem('adminSession')) { location.replace('login.html'); return; }

  const KEY = 'portfolioDraft';
  let data = null;
  try { data = JSON.parse(localStorage.getItem(KEY)); } catch (_) { /* ignore */ }
  if (!data) data = JSON.parse(JSON.stringify(window.PORTFOLIO_CONTENT || {}));
  if (data.timeline && !data.experience) { data.experience = data.timeline; data.education = data.education || []; delete data.timeline; }

  if (!Array.isArray(data.projectCategories)) data.projectCategories = [{ id: 'web', label: 'Web Development' }, { id: 'system', label: 'System Development' }, { id: 'uiux', label: 'UI/UX Design' }];
  if (!data.settings) data.settings = { projectsPreview: 2, certificatesPreview: 2 };

  const $ = (s) => document.querySelector(s);
  function h(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const k in attrs || {}) {
      if (k === 'class') e.className = attrs[k];
      else if (k.startsWith('on')) e[k] = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    kids.flat().filter((x) => x !== null && x !== undefined).forEach((c) => e.append(c));
    return e;
  }
  const btn = (t, fn, cls = '') => h('button', { type: 'button', class: 'mini ' + cls, onclick: fn }, t);

  /* ---- Auto-save draft ---- */
  const status = $('#status');
  let timer;
  function save() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(data));
        status.textContent = 'Draft saved in this browser — not published yet (see Publish & Security).';
        status.className = 'status';
      } catch (_) {
        status.textContent = 'Could not save: browser storage is full. Use smaller images or image file paths.';
        status.className = 'status err';
      }
    }, 300);
  }

  /* ---- Image upload (resized to keep the data file small) ---- */
  function toDataUrl(file) {
    return new Promise((resolve, reject) => {
      if (file.type === 'image/svg+xml') {
        const r = new FileReader();
        r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file); return;
      }
      const img = new Image();
      const src = URL.createObjectURL(file);
      img.onload = () => {
        const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width * scale); cv.height = Math.round(img.height * scale);
        const ctx = cv.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(src);
        resolve(cv.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject; img.src = src;
    });
  }

  /* ---- Form builders ---- */
  const opts = (f) => (typeof f.o === 'function' ? f.o() : f.o);
  const blank = (fields) => Object.fromEntries(fields.map((f) => [f.k, (f.t === 'list' || f.t === 'gallery') ? [] : f.t === 'number' ? 0 : f.t === 'select' ? (opts(f)[0] || [''])[0] : '']));

  function field(f, obj) {
    const wrap = h('div', { class: 'f' }, h('label', {}, f.l));
    if (f.t === 'list') { wrap.append(listField(f, obj)); return wrap; }
    if (f.t === 'gallery') { wrap.append(galleryField(f, obj)); return wrap; }

    let input;
    if (f.t === 'textarea') input = h('textarea', { rows: f.rows || 4 });
    else if (f.t === 'select') {
      const o = opts(f).slice();
      if (!o.some(([v]) => v === obj[f.k])) o.unshift([obj[f.k] ?? '', '— No category —']);
      input = h('select', {}, o.map(([v, t]) => h('option', { value: v }, t)));
    }
    else input = h('input', { type: f.t === 'number' ? 'number' : 'text' });
    input.value = obj[f.k] ?? '';
    wrap.append(input);

    if (f.t === 'select' && f.manage) {
      const redraw = () => { const y = window.scrollY; show(SECTIONS.find((x) => x.id === 'projects')); window.scrollTo(0, y); };
      wrap.append(h('div', { class: 'cat-actions' },
        btn('+ Add category', () => {
          const name = (prompt('New category name:') || '').trim();
          if (!name) return;
          const cats = data.projectCategories;
          let k = cats.find((c) => (c.label || '').toLowerCase() === name.toLowerCase());
          if (!k) { k = { id: 'cat-' + Date.now().toString(36), label: name }; cats.push(k); }
          obj[f.k] = k.id; save(); redraw();
        }, 'add'),
        btn('Remove this category', () => {
          const cats = data.projectCategories;
          const i = cats.findIndex((c) => c.id === obj[f.k]);
          if (i < 0) { alert('This project has no category selected.'); return; }
          const used = (data.projects || []).filter((p) => p.category === cats[i].id).length;
          if (!confirm(`Remove the category "${cats[i].label}"? ${used} project(s) use it and will become uncategorized.`)) return;
          cats.splice(i, 1); save(); redraw();
        }, 'danger')));
    }

    let onValue = () => {};
    if (f.t === 'image') {
      const thumb = h('img', { class: 'thumb', alt: '' });
      onValue = () => { thumb.src = input.value || ''; thumb.style.display = input.value ? 'block' : 'none'; };
      const file = h('input', { type: 'file', accept: 'image/*' });
      file.onchange = async () => {
        if (!file.files[0]) return;
        try { input.value = await toDataUrl(file.files[0]); } catch (_) { alert('Could not read that image.'); return; }
        obj[f.k] = input.value; onValue(); save();
      };
      wrap.append(h('div', { class: 'hint' }, 'Type an image path (e.g. assets/images/me.jpg) or upload a file:'), file, thumb);
      onValue();
    }
    input.oninput = () => { obj[f.k] = f.t === 'number' ? Number(input.value) : input.value; onValue(); save(); };
    return wrap;
  }

  /* ---- Multi-photo gallery: add several photos at once, delete any of them ---- */
  function galleryField(f, obj) {
    const box = h('div', { class: 'gallery-admin' });
    if (!Array.isArray(obj[f.k])) obj[f.k] = [];
    const arr = obj[f.k];
    const grid = h('div', { class: 'gallery-grid' });
    const note = h('div', { class: 'hint' });
    const file = h('input', { type: 'file', accept: 'image/*', multiple: '' });

    function draw() {
      grid.textContent = '';
      arr.forEach((src, i) => {
        grid.append(h('div', { class: 'gallery-item' },
          h('img', { src, alt: 'Photo ' + (i + 1) }),
          h('button', { type: 'button', class: 'gallery-del', title: 'Delete this photo', 'aria-label': 'Delete photo ' + (i + 1),
            onclick: () => { if (confirm('Delete this photo?')) { arr.splice(i, 1); save(); draw(); } } }, '×')));
      });
      note.textContent = arr.length ? arr.length + ' photo' + (arr.length === 1 ? '' : 's') + ' — click × on a photo to delete it.' : 'No extra photos yet.';
    }

    file.onchange = async () => {
      const files = Array.from(file.files || []);
      if (!files.length) return;
      let failed = 0;
      for (const fl of files) {
        try { arr.push(await toDataUrl(fl)); } catch (_) { failed++; }
      }
      file.value = '';
      if (failed) alert(failed + ' file(s) could not be read as images.');
      save(); draw();
    };

    box.append(
      h('div', { class: 'hint' }, 'Select one or many photos at once (hold Ctrl/Shift, or select several on your phone):'),
      file, note, grid,
      btn('Delete all photos', () => { if (arr.length && confirm('Delete all ' + arr.length + ' photos?')) { arr.length = 0; save(); draw(); } }, 'danger'));
    draw();
    return box;
  }

  function listField(f, obj) {
    const box = h('div', { class: 'list' });
    const arr = obj[f.k] || (obj[f.k] = []);
    const move = (i, d) => { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; save(); draw(); };
    function draw() {
      box.textContent = '';
      arr.forEach((item, i) => {
        const title = (f.itemTitle && f.itemTitle(item)) || `Item ${i + 1}`;
        box.append(h('div', { class: 'item' },
          h('div', { class: 'item-head' }, h('strong', {}, title), h('span', {},
            btn('↑', () => move(i, -1)), btn('↓', () => move(i, 1)),
            btn('Delete', () => { if (confirm('Delete this item?')) { arr.splice(i, 1); save(); draw(); } }, 'danger'))),
          f.fields.map((sf) => field(sf, item))));
      });
      box.append(btn('+ Add ' + (f.single || 'item'), () => { arr.push(f.make ? f.make() : blank(f.fields)); save(); draw(); }, 'add'));
    }
    draw();
    return box;
  }

  /* ---- Publish & security panel ---- */
  function publishPanel() {
    const wrap = h('div');
    const download = () => {
      const js = '/* Portfolio content. Edit via admin.html, then replace this file with the downloaded one. */\nwindow.PORTFOLIO_CONTENT = ' + JSON.stringify(data, null, 2) + ';\n';
      const a = h('a', { href: URL.createObjectURL(new Blob([js], { type: 'text/javascript' })), download: 'content-data.js' });
      document.body.append(a); a.click(); a.remove();
    };
    wrap.append(h('div', { class: 'panel' },
      h('h3', {}, 'Publish your changes'),
      h('p', {}, 'Your edits are saved as a draft in this browser only. Visitors will not see them until you publish:'),
      h('ol', {}, h('li', {}, 'Click “Download content-data.js”.'),
        h('li', {}, 'Replace the file js/content-data.js in your project with the downloaded one.'),
        h('li', {}, 'Upload your project again (for example, git push to GitHub Pages).')),
      h('div', { class: 'row' },
        btn('Download content-data.js', download, 'primary'),
        btn('Preview draft on site', () => window.open('index.html?preview=1', '_blank')),
        btn('Discard draft', () => { if (confirm('Discard all unpublished changes?')) { localStorage.removeItem(KEY); location.reload(); } }, 'danger'))));

    const email = h('input', { type: 'text', value: 'admin@example.com' });
    const pass = h('input', { type: 'text', placeholder: 'New password (min. 10 characters)' });
    const out = h('pre', { hidden: '' });
    wrap.append(h('div', { class: 'panel' },
      h('h3', {}, 'Change admin password'),
      h('p', {}, 'Generate a hash, then paste the two lines into js/login.js (ADMIN_EMAIL and ADMIN_HASH). This only keeps casual visitors out of the dashboard; it is not real security.'),
      h('div', { class: 'f' }, h('label', {}, 'Admin email'), email),
      h('div', { class: 'f' }, h('label', {}, 'New password'), pass),
      btn('Generate', async () => {
        if (pass.value.length < 10) { alert('Use at least 10 characters.'); return; }
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pass.value));
        const hash = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
        out.hidden = false;
        out.textContent = `const ADMIN_EMAIL = '${email.value.trim().toLowerCase()}';\nconst ADMIN_HASH = '${hash}';`;
      }, 'primary'), out));
    return wrap;
  }

  /* ---- Sections ---- */
  const TL_FIELDS = [
    { k: 'date', l: 'Date (e.g. 2024 – Present)' }, { k: 'title', l: 'Title' },
    { k: 'org', l: 'Organization / School' }, { k: 'text', l: 'Description', t: 'textarea' }];

  const SECTIONS = [
    { id: 'profile', label: 'Home & Profile', icon: 'fa-house', obj: 'profile', fields: [
      { k: 'firstName', l: 'First name' }, { k: 'lastName', l: 'Last name' }, { k: 'greeting', l: 'Greeting (small text above name)' },
      { k: 'titles', l: 'Titles (separate with commas)' }, { k: 'description', l: 'Intro text', t: 'textarea' },
      { k: 'photo', l: 'Profile photo', t: 'image' }, { k: 'resume', l: 'Resume file path (e.g. assets/resume.pdf)' },
      { k: 'github', l: 'GitHub URL' }, { k: 'linkedin', l: 'LinkedIn URL' }, { k: 'facebook', l: 'Facebook URL' }] },
    { id: 'about', label: 'About', icon: 'fa-user', obj: 'about', fields: [
      { k: 'intro', l: 'Introduction (leave a blank line between paragraphs)', t: 'textarea', rows: 9 }] },
    { id: 'skills', label: 'Skills', icon: 'fa-code', k: 'skills', t: 'list', single: 'category', itemTitle: (i) => i.category, fields: [
      { k: 'category', l: 'Category' },
      { k: 'items', l: 'Skills', t: 'list', single: 'skill', itemTitle: (i) => i.name, fields: [{ k: 'name', l: 'Skill name' }] }] },
    { id: 'education', label: 'Education', icon: 'fa-graduation-cap', k: 'education', t: 'list', single: 'entry', itemTitle: (i) => i.title, fields: TL_FIELDS },
    { id: 'experience', label: 'Experience', icon: 'fa-briefcase', k: 'experience', t: 'list', single: 'entry', itemTitle: (i) => i.title, fields: TL_FIELDS },
    { id: 'categories', label: 'Project Categories', icon: 'fa-tags', k: 'projectCategories', t: 'list', single: 'category', itemTitle: (i) => i.label || 'New category',
      make: () => ({ id: 'cat-' + Date.now().toString(36), label: '' }), fields: [{ k: 'label', l: 'Category name' }] },
    { id: 'projects', label: 'Projects', icon: 'fa-diagram-project', k: 'projects', t: 'list', single: 'project', itemTitle: (i) => i.title, fields: [
      { k: 'title', l: 'Title' },
      { k: 'category', l: 'Category', t: 'select', manage: true, o: () => data.projectCategories.map((k) => [k.id, k.label || '(unnamed)']) },
      { k: 'image', l: 'Cover image (shown on the project card)', t: 'image' },
      { k: 'images', l: 'More photos (gallery shown in “View Details”)', t: 'gallery' },
      { k: 'description', l: 'Description', t: 'textarea' },
      { k: 'tags', l: 'Tags (separate with commas)' },
      { k: 'liveUrl', l: 'Live preview URL (leave empty to show a “View Details” popup instead)' }, { k: 'sourceUrl', l: 'Source code URL' }] },
    { id: 'certificates', label: 'Certificates', icon: 'fa-certificate', k: 'certificates', t: 'list', single: 'certificate', itemTitle: (i) => i.title, fields: [
      { k: 'title', l: 'Title' }, { k: 'issuer', l: 'Issuer & year (e.g. Coursera · 2024)' }, { k: 'image', l: 'Certificate image', t: 'image' }] },
    { id: 'display', label: 'Display', icon: 'fa-sliders', obj: 'settings', fields: [
      { k: 'projectsPreview', l: 'Projects shown before the “View all” button', t: 'number' },
      { k: 'certificatesPreview', l: 'Certificates shown before the “View all” button', t: 'number' }] },
    { id: 'contact', label: 'Contact', icon: 'fa-envelope', obj: 'contact', fields: [
      { k: 'lead', l: 'Intro text', t: 'textarea' }, { k: 'email', l: 'Email' }, { k: 'phone', l: 'Phone' }, { k: 'location', l: 'Location' }] },
    { id: 'publish', label: 'Publish & Security', icon: 'fa-cloud-arrow-up', custom: true },
  ];

  const nav = $('#adminNav');
  function show(sec) {
    nav.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.id === sec.id));
    $('#sectionTitle').textContent = sec.label;
    const body = $('#sectionBody');
    body.textContent = '';
    if (sec.custom) body.append(publishPanel());
    else if (sec.obj) { const o = data[sec.obj] || (data[sec.obj] = {}); sec.fields.forEach((f) => body.append(field(f, o))); }
    else body.append(listField(sec, data));
  }
  SECTIONS.forEach((sec) => {
    const b = h('button', { type: 'button', 'data-id': sec.id, onclick: () => show(sec) }, h('i', { class: 'fa-solid ' + sec.icon }), sec.label);
    nav.append(b);
  });
  show(SECTIONS[0]);

  $('#previewBtn').onclick = () => window.open('index.html?preview=1', '_blank');
  $('#logoutBtn').onclick = () => { sessionStorage.removeItem('adminSession'); location.href = 'login.html'; };
})();
