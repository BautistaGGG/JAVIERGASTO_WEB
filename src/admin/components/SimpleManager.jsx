import { useEffect, useRef, useState } from 'react';
import { Award, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import AdminSectionLoader from './AdminSectionLoader';
import { useAdmin } from '../../context/AdminContext';

const getSimpleDraftKey = (title, editing) => {
  const safeTitle = String(title || 'item').toLowerCase().replace(/\s+/g, '-');
  const mode = editing ? `edit:${editing}` : 'new';
  return `admin_simple_form_draft:${safeTitle}:${mode}`;
};

const readSimpleDraft = (title, editing) => {
  try {
    const raw = localStorage.getItem(getSimpleDraftKey(title, editing));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed.form || null : null;
  } catch {
    return null;
  }
};

const writeSimpleDraft = (title, editing, form) => {
  try {
    localStorage.setItem(getSimpleDraftKey(title, editing), JSON.stringify({ form, updatedAt: Date.now() }));
  } catch {
    // ignore localStorage write errors
  }
};

const clearSimpleDraft = (title, editing) => {
  try {
    localStorage.removeItem(getSimpleDraftKey(title, editing));
  } catch {
    // ignore localStorage write errors
  }
};

export default function SimpleManager({
  title,
  items,
  openLabel,
  onCreate,
  onUpdate,
  onDelete,
  getMainText,
  getSubText,
  requestConfirm,
  onActivity,
  isLoading = false,
}) {
  const { apiError } = useAdmin();
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '', color: 'from-red-500 to-red-700' });
  const lastFocusedRef = useRef(null);
  const nameInputRef = useRef(null);

  const openNew = () => {
    lastFocusedRef.current = document.activeElement;
    setEditing(null);
    const baseForm = { name: '', icon: '', color: 'from-red-500 to-red-700' };
    const draft = readSimpleDraft(title, null);
    setForm(draft ? { ...baseForm, ...draft } : baseForm);
    if (draft) addToast(`Se recupero un borrador de ${title.toLowerCase()}.`, 'info');
    setShowForm(true);
  };

  const openEdit = (item) => {
    lastFocusedRef.current = document.activeElement;
    setEditing(item.id);
    const baseForm = { name: item.name || '', icon: item.icon || '', color: item.color || 'from-red-500 to-red-700' };
    const draft = readSimpleDraft(title, item.id);
    setForm(draft ? { ...baseForm, ...draft } : baseForm);
    if (draft) addToast(`Se recupero un borrador para ${item.name || title}.`, 'info');
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  useEffect(() => {
    if (showForm) {
      nameInputRef.current?.focus();
      return;
    }
    if (lastFocusedRef.current && typeof lastFocusedRef.current.focus === 'function') {
      lastFocusedRef.current.focus();
      lastFocusedRef.current = null;
    }
  }, [showForm]);

  useEffect(() => {
    if (!showForm) return undefined;
    const timeout = setTimeout(() => {
      writeSimpleDraft(title, editing, form);
    }, 350);
    return () => clearTimeout(timeout);
  }, [showForm, title, editing, form]);

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (editing) await onUpdate(editing, form);
      else await onCreate(form);
      clearSimpleDraft(title, editing);
      addToast(`${title} guardada.`, 'success');
      onActivity(`${title} guardada: ${form.name}`);
      closeForm();
    } catch {
      addToast(`No se pudo guardar ${title.toLowerCase()}.${apiError ? ` ${apiError}` : ''}`, 'error');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    const target = items.find((item) => item.id === id);
    const approved = await requestConfirm({
      title: `Eliminar ${title.toLowerCase()}`,
      description: `Se eliminara la ${title.toLowerCase()} seleccionada.`,
      confirmText: 'Eliminar',
      danger: true,
    });
    if (!approved) return;

    setBusy(true);
    try {
      await onDelete(id);
      addToast(`${title} eliminada.`, 'success');
      onActivity(`${title} eliminada: ${target?.name || id}`);
    } catch {
      addToast(`No se pudo eliminar ${title.toLowerCase()}.${apiError ? ` ${apiError}` : ''}`, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold text-gray-900">Gestion de {title}</h2>
        <button type="button" onClick={openNew} className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold">
          <Plus size={16} /> {openLabel}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4" onClick={closeForm}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-200" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-bold">{editing ? 'Editar' : 'Nueva'} {title.toLowerCase()}</h3>
              <button type="button" aria-label="Cerrar formulario" onClick={closeForm} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={save} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre</label>
                <input ref={nameInputRef} value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm" required />
              </div>

              {form.color !== undefined && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Color Tailwind</label>
                  <input value={form.color} onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm" />
                </div>
              )}

              {form.icon !== undefined && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Icono (emoji)</label>
                  <input value={form.icon} onChange={(event) => setForm((prev) => ({ ...prev, icon: event.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm" />
                </div>
              )}

              <button type="submit" disabled={busy} className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                {busy ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> Guardar</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <AdminSectionLoader label={`Cargando ${title.toLowerCase()}...`} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${item.color ? `bg-gradient-to-br ${item.color}` : 'bg-gray-100'} flex items-center justify-center`}>
                    {item.icon ? <span>{item.icon}</span> : <Award size={18} className="text-gray-600" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{getMainText(item)}</p>
                    <p className="text-xs text-gray-500">{getSubText(item)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" aria-label="Editar elemento" onClick={() => openEdit(item)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Pencil size={14} />
                  </button>
                  <button type="button" aria-label="Eliminar elemento" onClick={() => remove(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
