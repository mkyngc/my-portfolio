/* LOGIN PAGE SCRIPT — admin sign-in. NOTE: client-side only; it keeps casual visitors
   out of the dashboard but is not real security (see README). */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const emailError = document.getElementById('loginEmailError');
  const passwordError = document.getElementById('loginPasswordError');
  const feedback = document.getElementById('loginFeedback');
  const remember = document.getElementById('rememberMe');
  const toggle = document.getElementById('passwordToggle');
  const submitBtn = form.querySelector('.login-submit');
  const btnText = submitBtn.querySelector('.btn-text');
  const spinner = submitBtn.querySelector('.btn-spinner');

  // Where to go after a successful sign-in
  const REDIRECT_URL = 'admin.html';

  // Admin account. The password is stored as a SHA-256 hash (generate a new one
  // in Admin > Publish & Security). Default password: password123 — change it!
  const ADMIN_EMAIL = 'admin@example.com';
  const ADMIN_HASH = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f';

  /* ---- Show / hide password ---- */
  toggle.addEventListener('click', () => {
    const show = passwordInput.type === 'password';
    passwordInput.type = show ? 'text' : 'password';
    toggle.setAttribute('aria-pressed', String(show));
    toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    toggle.querySelector('i').className = show ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
  });

  /* ---- Pre-fill remembered email ---- */
  try {
    const saved = localStorage.getItem('rememberedEmail');
    if (saved) {
      emailInput.value = saved;
      remember.checked = true;
    }
  } catch (_) { /* storage unavailable — ignore */ }

  /* ---- Validation ---- */
  function setError(input, errorEl, message) {
    const group = input.closest('.form-group');
    group.classList.toggle('has-error', Boolean(message));
    errorEl.textContent = message || '';
  }

  function validate() {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
    const passOk = passwordInput.value.length >= 6;

    setError(emailInput, emailError, emailOk ? '' : 'Please enter a valid email address.');
    setError(passwordInput, passwordError, passOk ? '' : 'Password must be at least 6 characters.');

    return emailOk && passOk;
  }

  [emailInput, passwordInput].forEach((input) => {
    input.addEventListener('input', () => {
      input.closest('.form-group').classList.remove('has-error');
      (input === emailInput ? emailError : passwordError).textContent = '';
    });
  });

  /* ---- Admin check (client-side) ---- */
  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  async function authenticate(email, password) {
    try {
      return email.toLowerCase() === ADMIN_EMAIL && (await sha256(password)) === ADMIN_HASH;
    } catch (_) { return false; }
  }

  /* ---- Submit ---- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedback.textContent = '';
    feedback.className = 'form-feedback';

    if (!validate()) return;

    submitBtn.disabled = true;
    spinner.hidden = false;
    btnText.textContent = 'Signing in...';

    const ok = await authenticate(emailInput.value.trim(), passwordInput.value);

    if (ok) {
      try {
        sessionStorage.setItem('adminSession', '1');
        if (remember.checked) localStorage.setItem('rememberedEmail', emailInput.value.trim());
        else localStorage.removeItem('rememberedEmail');
      } catch (_) { /* storage unavailable — ignore */ }

      feedback.textContent = 'Signed in! Redirecting...';
      feedback.className = 'form-feedback success';
      setTimeout(() => { window.location.href = REDIRECT_URL; }, 700);
    } else {
      feedback.textContent = 'Incorrect email or password. Please try again.';
      feedback.className = 'form-feedback error';
      submitBtn.disabled = false;
      spinner.hidden = true;
      btnText.textContent = 'Sign In';
      passwordInput.value = '';
      passwordInput.focus();
    }
  });

  /* ---- Links that need a back-end ---- */
  ['forgotLink', 'signupLink'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      feedback.textContent = 'This feature needs a back-end connected first.';
      feedback.className = 'form-feedback error';
    });
  });
});
