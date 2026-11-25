/* =====================================================
   PORTFOLIO SCRIPT
   Vanilla JS — no frameworks, no build step.
===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  renderPortfolio();
  initMobileNav();
  initActiveNavLink();
  initScrollReveal();
  initAboutTabs();
  initProjectFilters();
  initProjectModal();
  initCertificateLightbox();
  initCertificateViewAll();
  initContactForm();
  initBackToTop();
  initCopyrightYear();
});

/* -----------------------------------------------------
   Mobile navigation toggle
----------------------------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu after a link is clicked (mobile UX)
  links.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* -----------------------------------------------------
   Active nav link highlighting on scroll
----------------------------------------------------- */
function initActiveNavLink() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const setActive = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle('active-link', link.getAttribute('href') === `#${id}`);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* -----------------------------------------------------
   Scroll reveal animations (fade + slide up on entry)
----------------------------------------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.about-block, .project-card, .certificate-card, .contact-grid > *, .hero-text, .hero-visual'
  );
  targets.forEach((el) => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

/* -----------------------------------------------------
   Project filtering by category + "View all" toggle
----------------------------------------------------- */
function initProjectFilters() {
  const filters = document.getElementById('projectFilters');
  const grid = document.getElementById('projectGrid');
  const cards = Array.from(document.querySelectorAll('.project-card'));
  const emptyState = document.getElementById('projectEmptyState');
  const wrap = document.getElementById('projectViewAllWrap');
  const toggle = document.getElementById('projectViewAll');
  if (!grid) return;

  const limit = parseInt(grid.dataset.limit, 10) || 2;
  let filter = 'all';
  let expanded = false;

  function apply() {
    const matching = cards.filter((c) => filter === 'all' || c.dataset.category === filter);
    cards.forEach((c) => c.classList.add('hidden-card'));
    matching.forEach((c, i) => c.classList.toggle('hidden-card', !expanded && i >= limit));

    if (emptyState) emptyState.hidden = matching.length !== 0;
    if (wrap) wrap.hidden = matching.length <= limit;
    if (toggle) {
      toggle.textContent = expanded ? 'Show less' : `View all (${matching.length})`;
      toggle.setAttribute('aria-expanded', String(expanded));
    }
  }

  if (filters) {
    filters.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filters.querySelectorAll('.filter-btn').forEach((b) => {
        const on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', String(on));
      });
      filter = btn.dataset.filter;
      expanded = false;
      apply();
    });
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      expanded = !expanded;
      apply();
      if (!expanded) document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
    });
  }

  apply();
}

/* -----------------------------------------------------
   Certificates "View all" toggle
----------------------------------------------------- */
function initCertificateViewAll() {
  const grid = document.getElementById('certGrid');
  const wrap = document.getElementById('certViewAllWrap');
  const toggle = document.getElementById('certViewAll');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.certificate-card'));
  const limit = parseInt(grid.dataset.limit, 10) || 2;
  let expanded = false;

  function apply() {
    cards.forEach((c, i) => c.classList.toggle('hidden-card', !expanded && i >= limit));
    if (wrap) wrap.hidden = cards.length <= limit;
    if (toggle) {
      toggle.textContent = expanded ? 'Show less' : `View all (${cards.length})`;
      toggle.setAttribute('aria-expanded', String(expanded));
    }
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      expanded = !expanded;
      apply();
      if (!expanded) document.getElementById('certificates').scrollIntoView({ behavior: 'smooth' });
    });
  }

  apply();
}

/* -----------------------------------------------------
   Project details modal
   (used when a project has no live demo link)
----------------------------------------------------- */

function initProjectModal() {
  const modal = document.getElementById('projectModal');
  const modalContent = document.getElementById('modalContent');
  const modalClose = document.getElementById('modalClose');
  const triggers = document.querySelectorAll('.project-details-btn');
  if (!modal || !modalContent || !triggers.length) return;

  let lastFocusedElement = null;

  function openModal(key) {
    const data = PROJECT_DETAILS[key];
    if (!data) return;

    const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    const photos = [data.image, ...(data.images || [])].filter(Boolean);
    const thumbs = photos.length > 1
      ? `<div class="modal-thumbs">${photos.map((src, n) => `<button type="button" class="modal-thumb${n === 0 ? ' active' : ''}" data-n="${n}" aria-label="Show photo ${n + 1}"><img src="${esc(src)}" alt=""></button>`).join('')}</div>`
      : '';

    modalContent.innerHTML = `
      <img class="modal-main-img" src="${esc(photos[0])}" alt="Screenshot of ${esc(data.title)}">
      ${thumbs}
      <h3 id="modalTitle">${esc(data.title)}</h3>
      <p>${esc(data.description)}</p>
      <ul class="project-tags">
        ${data.tags.map((tag) => `<li>${esc(tag)}</li>`).join('')}
      </ul>
    `;

    const main = modalContent.querySelector('.modal-main-img');
    modalContent.querySelectorAll('.modal-thumb').forEach((b) => {
      b.addEventListener('click', () => {
        main.src = photos[Number(b.dataset.n)];
        modalContent.querySelectorAll('.modal-thumb').forEach((x) => x.classList.toggle('active', x === b));
      });
    });

    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  triggers.forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.project));
  });

  modalClose.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
}

/* -----------------------------------------------------
   Certificate lightbox
   Click a certificate card to view the full-size image.
----------------------------------------------------- */

function initCertificateLightbox() {
  const modal = document.getElementById('certificateModal');
  const modalContent = document.getElementById('certModalContent');
  const modalClose = document.getElementById('certModalClose');
  const triggers = document.querySelectorAll('.certificate-card');
  if (!modal || !modalContent || !triggers.length) return;

  let lastFocusedElement = null;

  function openModal(key) {
    const data = CERTIFICATE_DETAILS[key];
    if (!data) return;

    modalContent.innerHTML = `
      <img src="${data.image}" alt="${data.title} certificate">
      <h3 id="certModalTitle">${data.title}</h3>
      <p>${data.issuer}</p>
    `;

    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  triggers.forEach((card) => {
    card.addEventListener('click', () => openModal(card.dataset.cert));
  });

  modalClose.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
}

/* -----------------------------------------------------
   Contact form validation + submission
   Sends messages to the email set in Admin → Contact, using
   FormSubmit (https://formsubmit.co) — no backend required.

   FIRST TIME ONLY: after the site is online, send one test
   message. FormSubmit emails you an activation link — click
   "Activate Form". After that, every message lands in your inbox.
   (Must be tested from the live website, not by opening the
   file from your computer.)
----------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');
  if (!form) return;

  const siteEmail = ((window.PORTFOLIO_CONTENT || {}).contact || {}).email || 'mkyngc@gmail.com';
  const FORM_ENDPOINT = 'https://formsubmit.co/ajax/' + encodeURIComponent(siteEmail.trim());

  const fields = {
    name: { input: document.getElementById('fullName'), error: document.getElementById('nameError') },
    email: { input: document.getElementById('email'), error: document.getElementById('emailError') },
    subject: { input: document.getElementById('subject'), error: document.getElementById('subjectError') },
    message: { input: document.getElementById('message'), error: document.getElementById('messageError') },
  };

  function validate() {
    let isValid = true;

    const checks = [
      { key: 'name', test: (v) => v.trim().length >= 2, msg: 'Please enter your full name.' },
      { key: 'email', test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: 'Please enter a valid email address.' },
      { key: 'subject', test: (v) => v.trim().length >= 3, msg: 'Please enter a subject.' },
      { key: 'message', test: (v) => v.trim().length >= 10, msg: 'Message should be at least 10 characters.' },
    ];

    checks.forEach(({ key, test, msg }) => {
      const { input, error } = fields[key];
      const group = input.closest('.form-group');
      const value = input.value;

      if (!test(value)) {
        group.classList.add('has-error');
        error.textContent = msg;
        isValid = false;
      } else {
        group.classList.remove('has-error');
        error.textContent = '';
      }
    });

    return isValid;
  }

  // Clear individual field errors as the user types
  Object.values(fields).forEach(({ input }) => {
    input.addEventListener('input', () => {
      input.closest('.form-group').classList.remove('has-error');
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validate()) {
      feedback.textContent = 'Please fix the highlighted fields.';
      feedback.className = 'form-feedback error';
      return;
    }

    const submitBtn = form.querySelector('.form-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.btn-spinner');

    submitBtn.disabled = true;
    spinner.hidden = false;
    btnText.textContent = 'Sending...';
    feedback.textContent = '';
    feedback.className = 'form-feedback';

    try {
      const data = Object.fromEntries(new FormData(form).entries());
      if (data._honey) throw new Error('spam');
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || String(result.success) === 'false') throw new Error(result.message || 'Request failed');

      feedback.textContent = "Thanks — your message is on its way. I'll reply soon.";
      feedback.className = 'form-feedback success';
      form.reset();
    } catch (err) {
      feedback.textContent =
        "Something went wrong sending that. Please email me directly, or try again in a moment.";
      feedback.className = 'form-feedback error';
    } finally {
      submitBtn.disabled = false;
      spinner.hidden = true;
      btnText.textContent = 'Send Message';
    }
  });
}

/* -----------------------------------------------------
   Back-to-top button
----------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* -----------------------------------------------------
   Auto-updating copyright year
----------------------------------------------------- */
function initCopyrightYear() {
  const el = document.getElementById('currentYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* -----------------------------------------------------
   About tabs: switch between Skills and Education & Experience
----------------------------------------------------- */
function initAboutTabs() {
  const tabs = Array.from(document.querySelectorAll('.about-tab'));
  if (!tabs.length) return;

  function select(tab) {
    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !active;
    });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      select(next);
      next.focus();
    });
  });
}
