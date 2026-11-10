const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('notegen_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.details = data.details || null;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Cannot connect to the server. Please verify the backend is running.');
    }
    throw error;
  }
}

export const api = {
  checkHealth: () => request('/api/health'),
  summarizeVideo: (payload) =>
    request('/api/videos/summarize', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getHistory: () => request('/api/videos/history'),
  getVideoById: (id) => request(`/api/videos/${id}`),
  deleteVideo: (id) =>
    request(`/api/videos/${id}`, {
      method: 'DELETE',
    }),
  register: (payload) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getMe: () => request('/api/auth/me'),
};
