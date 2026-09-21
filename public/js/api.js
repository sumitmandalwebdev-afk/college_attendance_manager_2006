const API_BASE = ''; // same-origin: /api/*

const Api = {
  token() {
    return localStorage.getItem('cam_token');
  },
  setToken(t) {
    localStorage.setItem('cam_token', t);
  },
  clearToken() {
    localStorage.removeItem('cam_token');
    localStorage.removeItem('cam_admin');
  },
  admin() {
    const raw = localStorage.getItem('cam_admin');
    return raw ? JSON.parse(raw) : null;
  },
  setAdmin(a) {
    localStorage.setItem('cam_admin', JSON.stringify(a));
  },
  async request(path, { method = 'GET', body = null, auth = true } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && this.token()) headers['Authorization'] = `Bearer ${this.token()}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      this.clearToken();
      if (!location.pathname.endsWith('index.html') && location.pathname !== '/') {
        location.href = 'index.html';
      }
      throw new Error('Session expired');
    }

    let data = null;
    try { data = await res.json(); } catch (_) { /* no body */ }

    if (!res.ok) {
      throw new Error((data && data.detail) || `Request failed (${res.status})`);
    }
    return data;
  },
  get(path) { return this.request(path); },
  post(path, body) { return this.request(path, { method: 'POST', body }); },
  put(path, body) { return this.request(path, { method: 'PUT', body }); },
  patch(path, body) { return this.request(path, { method: 'PATCH', body }); },
  del(path) { return this.request(path, { method: 'DELETE' }); },
};
