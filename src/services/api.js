const API_URL = import.meta.env?.VITE_API_URL || '/api';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('industrialpro_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const error = new Error(payload.error || `HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' || !error.status) {
      console.warn(`[API] ${endpoint} unavailable`);
      return null;
    }
    throw error;
  }
}

export default apiFetch;

