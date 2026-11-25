/* =====================================================
   Builds the portfolio from window.PORTFOLIO_CONTENT
   (js/content-data.js). Admins can preview an unpublished
   draft with index.html?preview=1 while signed in.
===================================================== */
function renderPortfolio() {
  let c = window.PORTFOLIO_CONTENT || {};
  let preview = false;
  try {
    if (/[?&]preview/.test(location.search) && sessionStorage.getItem('adminSession')) {
      const draft = JSON.parse(localStorage.getItem('portfolioDraft'));
      if (draft) { c = draft; preview = true; }
    }
  } catch (_) { /* ignore */ }

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const url = (u) => (/^\s*javascript:/i.test(u || '') ? '#' : esc(u));
  const $ = (id) => document.getElementById(id);
  const set = (id, html) => { const e = $(id); if (e) e.innerHTML = html; };

  const p = c.profile || {};
  const full = `${p.firstName || ''} ${p.lastName || ''}`.trim();
  const titles = (p.titles || '').split(',').map((t) => t.trim()).filter(Boolean);

  document.title = `${full} | ${titles[0] || 'Portfolio'}`;
  set('heroGreeting', esc(p.greeting));
  set('heroName', `${esc(p.firstName)} <span>${esc(p.lastName)}</span>`);
  set('heroTitle', titles.map(esc).join(' <i class="hero-title-dot" aria-hidden="true"></i> '));
  set('heroDesc', esc(p.description));
  const photo = $('heroPhoto');
  if (photo) { photo.src = p.photo || ''; photo.alt = `Portrait of ${full}`; }
  const resume = $('resumeBtn');
  if (resume) { resume.href = p.resume || '#'; resume.hidden = !p.resume; }

  document.querySelectorAll('.js-logo').forEach((e) => { e.innerHTML = 'My<span>Portfolio</span>'; });
  document.querySelectorAll('.js-fullname').forEach((e) => { e.textContent = full; });
  const socials = [['github', 'fa-brands fa-github', 'GitHub'], ['linkedin', 'fa-brands fa-linkedin-in', 'LinkedIn'], ['facebook', 'fa-brands fa-facebook-f', 'Facebook']]
    .filter(([k]) => p[k])
    .map(([k, icon, name]) => `<a href="${url(p[k])}" target="_blank" rel="noopener noreferrer" aria-label="${name} profile"><i class="${icon}"></i></a>`).join('');
  document.querySelectorAll('.js-socials').forEach((e) => { e.innerHTML = socials; });

  set('aboutIntro', ((c.about || {}).intro || '').split(/\n\s*\n/).filter((t) => t.trim()).map((t) => `<p>${esc(t.trim())}</p>`).join(''));

  set('skillsGrid', (c.skills || []).map((cat) => `
    <div class="skill-category"><h4>${esc(cat.category)}</h4><ul class="skill-list">
      ${(cat.items || []).map((i) => `<li><span>${esc(i.name)}</span></li>`).join('')}
    </ul></div>`).join(''));

  const timeline = (list) => (list || []).map((t) => `
    <div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-content">
      <span class="timeline-date">${esc(t.date)}</span><h4>${esc(t.title)}</h4>
      <p class="timeline-org">${esc(t.org)}</p><p>${esc(t.text)}</p></div></div>`).join('');
  set('educationTimeline', timeline(c.education));
  set('experienceTimeline', timeline(c.experience || c.timeline));

  const DEFAULT_CATS = [{ id: 'web', label: 'Web Development' }, { id: 'system', label: 'System Development' }, { id: 'uiux', label: 'UI/UX Design' }];
  const cats = Array.isArray(c.projectCategories) ? c.projectCategories.filter((k) => k && k.id) : DEFAULT_CATS;
  const st = c.settings || {};
  const limit = (v) => { const n = parseInt(v, 10); return n > 0 ? n : 2; };
  const filters = $('projectFilters');
  if (filters) {
    filters.hidden = !cats.length;
    filters.innerHTML = cats.length
      ? [{ id: 'all', label: 'All Projects' }, ...cats].map((k, i) => `<button aria-selected="${i === 0}" class="filter-btn${i === 0 ? ' active' : ''}" data-filter="${esc(k.id)}" role="tab">${esc(k.label)}</button>`).join('')
      : '';
  }
  const pGrid = $('projectGrid'); if (pGrid) pGrid.dataset.limit = limit(st.projectsPreview);
  const cGrid = $('certGrid'); if (cGrid) cGrid.dataset.limit = limit(st.certificatesPreview);

  const projects = c.projects || [];
  window.PROJECT_DETAILS = projects.map((x) => ({
    title: x.title, image: x.image, images: Array.isArray(x.images) ? x.images.filter(Boolean) : [], description: x.description,
    tags: (x.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
  }));
  set('projectGrid', projects.map((x, i) => `
    <article class="project-card" data-category="${esc(x.category)}">
      <div class="project-thumb"><img src="${esc(x.image)}" alt="Screenshot of ${esc(x.title)}" loading="lazy"></div>
      <div class="project-body"><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p>
        <ul class="project-tags">${window.PROJECT_DETAILS[i].tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        <div class="project-links">
          ${x.liveUrl
            ? `<a href="${url(x.liveUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-small btn-primary">Live Preview</a>`
            : `<button class="btn btn-small btn-primary project-details-btn" data-project="${i}">View Details</button>`}
          ${x.liveUrl && window.PROJECT_DETAILS[i].images.length ? `<button class="btn btn-small btn-outline project-details-btn" data-project="${i}">Photos (${window.PROJECT_DETAILS[i].images.length + 1})</button>` : ''}
          ${x.sourceUrl ? `<a href="${url(x.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-small btn-outline">Source Code</a>` : ''}
        </div></div></article>`).join(''));

  const certs = c.certificates || [];
  window.CERTIFICATE_DETAILS = certs;
  set('certGrid', certs.map((x, i) => `
    <button class="certificate-card" data-cert="${i}" aria-label="View ${esc(x.title)} certificate">
      <div class="certificate-thumb"><img src="${esc(x.image)}" alt="${esc(x.title)} certificate" loading="lazy">
        <span class="certificate-zoom"><i class="fa-solid fa-magnifying-glass-plus"></i></span></div>
      <div class="certificate-body"><h3>${esc(x.title)}</h3><p class="certificate-issuer">${esc(x.issuer)}</p></div>
    </button>`).join(''));

  const k = c.contact || {};
  set('contactLead', esc(k.lead));
  set('contactDetails', [
    k.email && `<li><i class="fa-solid fa-envelope"></i><a href="mailto:${esc(k.email)}">${esc(k.email)}</a></li>`,
    k.phone && `<li><i class="fa-solid fa-phone"></i><a href="tel:${esc(k.phone.replace(/[^\d+]/g, ''))}">${esc(k.phone)}</a></li>`,
    k.location && `<li><i class="fa-solid fa-location-dot"></i><span>${esc(k.location)}</span></li>`,
  ].filter(Boolean).join(''));

  if (preview) {
    const bar = document.createElement('div');
    bar.textContent = 'Draft preview — visitors cannot see this until you publish';
    bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#FF6B00;color:#101010;text-align:center;padding:8px;font:600 0.85rem Inter,sans-serif';
    document.body.append(bar);
  }
}
