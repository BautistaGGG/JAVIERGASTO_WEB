import { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('industrialpro_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('industrialpro_auth', JSON.stringify(user));
    } else {
      localStorage.removeItem('industrialpro_auth');
    }
  }, [user]);

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

      if (result?.success && result.token) {
        localStorage.setItem('industrialpro_token', result.token);
        setUser(result.user);
        return { success: true, user: result.user };
      }

      return { success: false, error: result?.error || 'Credenciales incorrectas' };
    } catch (error) {
      if (error.status === 401) {
        return { success: false, error: 'Credenciales incorrectas' };
      }
      return { success: false, error: 'No se pudo conectar con el servidor' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiFetch('/admin/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem('industrialpro_token');
    setUser(null);
  };

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
