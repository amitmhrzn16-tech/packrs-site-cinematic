// Admin API client. Tokens are stored in localStorage and attached as Bearer.
const BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/v1\/?$/, '');
const ADMIN_BASE = `${BASE}/admin`;
const TOKEN_KEY = 'packrs_admin_token';

export const adminToken = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function call(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = { Accept: 'application/json' };
  if (!isForm) headers['Content-Type'] = 'application/json';
  const t = adminToken.get();
  if (t) headers.Authorization = `Bearer ${t}`;

  const res = await fetch(`${ADMIN_BASE}${path}`, {
    method,
    headers,
    body: isForm ? body : (body ? JSON.stringify(body) : undefined),
  });

  if (res.status === 401) {
    adminToken.clear();
    if (window.location.pathname !== '/admin/login') {
      window.location.href = '/admin/login';
    }
    throw new Error('Unauthorized');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || data.errors?.[Object.keys(data.errors || {})[0]]?.[0] || `HTTP ${res.status}`;
    throw Object.assign(new Error(msg), { status: res.status, data });
  }
  return data;
}

export const adminApi = {
  // Auth
  login:  (email, password) => call('/login', { method: 'POST', body: { email, password } }),
  me:     () => call('/me'),
  logout: () => call('/logout', { method: 'POST' }),

  // Bookings
  bookings: {
    list:   (params = '') => call(`/bookings${params ? `?${params}` : ''}`),
    update: (id, body) => call(`/bookings/${id}`, { method: 'PATCH', body }),
    remove: (id) => call(`/bookings/${id}`, { method: 'DELETE' }),
  },

  // Rates
  rates: {
    list:   (params = '') => call(`/rates${params ? `?${params}` : ''}`),
    create: (body) => call('/rates', { method: 'POST', body }),
    update: (id, body) => call(`/rates/${id}`, { method: 'PATCH', body }),
    remove: (id) => call(`/rates/${id}`, { method: 'DELETE' }),
    upload: (file, mode = 'upsert') => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('mode', mode);
      return call('/rates/upload', { method: 'POST', body: fd, isForm: true });
    },
  },

  // Site content
  content: {
    list:   (page) => call(`/content${page ? `?page=${encodeURIComponent(page)}` : ''}`),
    save:   (body) => call('/content', { method: 'POST', body }),
    update: (id, body) => call(`/content/${id}`, { method: 'PATCH', body }),
    remove: (id) => call(`/content/${id}`, { method: 'DELETE' }),
  },

  // SEO
  seo: {
    list:   () => call('/seo'),
    show:   (slug) => call(`/seo/${encodeURIComponent(slug)}`),
    save:   (body) => call('/seo', { method: 'POST', body }),
    remove: (slug) => call(`/seo/${encodeURIComponent(slug)}`, { method: 'DELETE' }),
  },

  // Slack
  slack: {
    show:   () => call('/slack'),
    update: (body) => call('/slack', { method: 'PATCH', body }),
    test:   () => call('/slack/test', { method: 'POST' }),
  },

  // Analytics
  analytics: {
    dashboard: () => call('/analytics/dashboard'),
  },

  // Users
  users: {
    list:   () => call('/users'),
    create: (body) => call('/users', { method: 'POST', body }),
    update: (id, body) => call(`/users/${id}`, { method: 'PATCH', body }),
    remove: (id) => call(`/users/${id}`, { method: 'DELETE' }),
  },

  // Media (image uploads for content blocks)
  media: {
    list:   () => call('/media'),
    upload: (file) => {
      const fd = new FormData();
      fd.append('file', file);
      return call('/media', { method: 'POST', body: fd, isForm: true });
    },
    remove: (path) => call('/media', { method: 'DELETE', body: { path } }),
  },
};
