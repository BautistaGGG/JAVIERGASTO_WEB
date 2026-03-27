import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch, ensureApiResponse, isApiUnavailableError } from '../services/api';
import { formatApiErrorMessage } from '../services/errorUtils';

const AuthContext = createContext();
const SESSION_CHECK_INTERVAL_MS = 30_000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Seguridad UX: no restaurar sesion automaticamente al abrir el panel.
    localStorage.removeItem('industrialpro_auth');
  }, []);

  const login = async (email, password) => {
    setLoading(true);

    try {
      const result = await apiFetch('/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          username: email,
          email,
          password,
        }),
      });
      const payload = ensureApiResponse(result, '/admin/login');

      if (payload.success && payload.token) {
        localStorage.setItem('industrialpro_token', payload.token);
        if (payload.expiresAt) {
          localStorage.setItem('industrialpro_session_expires_at', payload.expiresAt);
          setSessionExpiresAt(payload.expiresAt);
        } else {
          localStorage.removeItem('industrialpro_session_expires_at');
          setSessionExpiresAt(null);
        }
        setUser(payload.user);
        return { success: true, user: payload.user };
      }

      const payloadError = typeof payload.error === 'string' ? payload.error : payload.error?.message;
      return { success: false, error: payloadError || 'Credenciales incorrectas' };
    } catch (error) {
      if (error.status === 401) {
        return { success: false, error: 'Credenciales incorrectas' };
      }
      if (isApiUnavailableError(error)) {
        return { success: false, error: formatApiErrorMessage(error, 'No se pudo conectar con la API de administración') };
      }
      return { success: false, error: formatApiErrorMessage(error, 'No se pudo conectar con el servidor') };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    apiFetch('/admin/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem('industrialpro_token');
    localStorage.removeItem('industrialpro_auth');
    localStorage.removeItem('industrialpro_session_expires_at');
    setSessionExpiresAt(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!user || !sessionExpiresAt) return undefined;

    const checkSessionExpiration = () => {
      const expiresAtTs = new Date(sessionExpiresAt).getTime();
      if (!Number.isFinite(expiresAtTs)) {
        logout();
        return;
      }
      if (Date.now() >= expiresAtTs) {
        logout();
      }
    };

    checkSessionExpiration();
    const interval = setInterval(checkSessionExpiration, SESSION_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [logout, sessionExpiresAt, user]);

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin, loading, sessionExpiresAt }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
