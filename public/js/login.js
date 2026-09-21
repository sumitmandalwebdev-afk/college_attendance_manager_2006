if (Api.token()) {
  location.href = 'dashboard.html';
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';
  btn.disabled = true;
  btn.textContent = 'Signing in…';

  try {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const res = await Api.request('/api/auth/login', { method: 'POST', body: { email, password }, auth: false });
    Api.setToken(res.token);
    Api.setAdmin(res.admin);
    location.href = 'dashboard.html';
  } catch (err) {
    errorEl.textContent = err.message || 'Login failed';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
});
