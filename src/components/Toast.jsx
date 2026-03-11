import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const config = {
  success: {
    icon: CheckCircle,
    bg: 'bg-green-600',
    border: 'border-green-500',
    text: 'text-white',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-600',
    border: 'border-red-500',
    text: 'text-white',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-600',
    border: 'border-blue-500',
    text: 'text-white',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-500',
    border: 'border-amber-400',
    text: 'text-white',
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const c = config[toast.type] || config.success;
        const Icon = c.icon;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${c.bg} ${c.border} ${c.text} ${
              toast.exiting ? 'animate-toast-out' : 'animate-toast-in'
            }`}
          >
            <Icon size={20} className="shrink-0" />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
