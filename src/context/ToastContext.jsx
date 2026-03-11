import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext();

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const lastToastMapRef = useRef(new Map());

  const addToast = useCallback((message, type = 'success', duration = 3000, dedupeMs = 1200) => {
    const safeMessage = String(message ?? '').trim();
    if (!safeMessage) return null;

    const dedupeKey = `${type}:${safeMessage}`;
    const now = Date.now();
    const lastAt = lastToastMapRef.current.get(dedupeKey) || 0;

    if (now - lastAt < dedupeMs) {
      return null;
    }

    lastToastMapRef.current.set(dedupeKey, now);

    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message: safeMessage, type, exiting: false }]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
