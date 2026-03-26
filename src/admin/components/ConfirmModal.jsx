import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function ConfirmModal({ open, title, description, confirmText = 'Confirmar', cancelText = 'Cancelar', danger = false, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <button type="button" aria-label="Cerrar confirmacion" onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
        <div className="px-5 pb-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500">
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${danger ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-gray-700 hover:bg-gray-800 focus:ring-gray-500'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
