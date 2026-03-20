import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { formatPrice, getStockLabel } from '../data/products';
import {
  LayoutDashboard,
  Package,
  Tags,
  Award,
  MessageSquare,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  ArrowLeft,
  Menu,
  X,
  Save,
  Loader2,
  Mail,
  Search,
  Filter,
  CheckSquare,
  Square,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const DEFAULT_PRODUCT_FILTERS = {
  search: '',
  isActive: 'all',
  featured: 'all',
  stockStatus: 'all',
  categoryId: 'all',
  brandId: 'all',
  sortBy: 'id_desc',
  page: 1,
  pageSize: 10,
};

const DEFAULT_INQUIRY_FILTERS = {
  search: '',
  status: 'pending',
  source: 'all',
  dateFrom: '',
  dateTo: '',
  page: 1,
  pageSize: 8,
};

const REPLY_TEMPLATES = {
  quote_sent: 'Hola {{name}}, te enviamos la cotizacion solicitada por {{product}}. Cualquier ajuste, escribinos.',
  need_details: 'Hola {{name}}, para cotizar {{product}} necesitamos confirmar cantidad, plazo y lugar de entrega.',
  no_stock_alt: 'Hola {{name}}, hoy no tenemos stock de {{product}}, pero podemos ofrecerte alternativa equivalente.',
};

const canUseShortcutTarget = (target) => {
  const tagName = target?.tagName?.toLowerCase();
  return !(tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target?.isContentEditable);
};

const parseDateValue = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const match = String(value).trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  let year = Number(match[3]);
  if (year < 100) year += 2000;
  const candidate = new Date(year, month, day);
  return Number.isNaN(candidate.getTime()) ? null : candidate;
};

const formatDate = (value) => {
  const parsed = parseDateValue(value);
  if (!parsed) return value || '-';
  return parsed.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const buildTemplateMessage = (template, inquiry) =>
  template
    .replaceAll('{{name}}', inquiry?.name || 'cliente')
    .replaceAll('{{product}}', inquiry?.productName || 'el producto consultado');

function ConfirmModal({ open, title, description, confirmText = 'Confirmar', cancelText = 'Cancelar', danger = false, onConfirm, onCancel }) {
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
          <button type="button" onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
        <div className="px-5 pb-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${danger ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const safeCurrent = Math.max(1, Math.min(page, totalPages));
  const pages = [];
  for (let n = Math.max(1, safeCurrent - 2); n <= Math.min(totalPages, safeCurrent + 2); n += 1) pages.push(n);

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50/70">
      <p className="text-xs text-gray-500">Pagina {safeCurrent} de {totalPages}</p>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onPageChange(safeCurrent - 1)} disabled={safeCurrent === 1} className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-white disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500"><ChevronLeft size={14} /></button>
        {pages.map((n) => <button key={n} type="button" onClick={() => onPageChange(n)} className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-blue-500 ${n === safeCurrent ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}>{n}</button>)}
        <button type="button" onClick={() => onPageChange(safeCurrent + 1)} disabled={safeCurrent === totalPages} className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-white disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500"><ChevronRight size={14} /></button>
      </div>
    </div>
  );
}

function ActivityTimeline({ items }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <h3 className="text-sm font-extrabold text-gray-700 uppercase tracking-wide mb-3">Actividad reciente</h3>
      {items.length === 0 && <p className="text-xs text-gray-500">Todavia no hay actividad registrada.</p>}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
            <p className="text-xs font-semibold text-gray-800">{item.title}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{formatDate(item.at)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminLogin() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('admin@industrialpro.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const result = await login(email, password);
    if (!result.success) setError(result.error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-black text-2xl">IP</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Panel de Administracion</h1>
          <p className="text-blue-300 text-sm mt-1">Industrial Pro</p>
        </div>
        <form onSubmit={onSubmit} className="bg-white rounded-2xl p-6 shadow-2xl space-y-4">
          {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200 font-medium">{error}</div>}
          <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Contrasena</label><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50">{loading ? <><Loader2 size={16} className="animate-spin" /> Ingresando...</> : 'Ingresar'}</button>
        </form>
      </div>
    </div>
  );
}
function Dashboard({ inquiries, activityLog }) {
  const { getStats, apiMetrics } = useAdmin();
  const stats = getStats();

  const pendingOlderThan48h = useMemo(() => {
    const now = Date.now();
    return inquiries.filter((inq) => {
      if (inq.status !== 'pending') return false;
      const created = parseDateValue(inq.createdAt || inq.updatedAt || inq.date);
      if (!created) return false;
      return now - created.getTime() > 48 * 60 * 60 * 1000;
    }).length;
  }, [inquiries]);

  const responseRate = useMemo(() => {
    if (!inquiries.length) return 0;
    const replied = inquiries.filter((inq) => inq.status === 'replied').length;
    return Math.round((replied / inquiries.length) * 100);
  }, [inquiries]);

  const topConsultedProduct = useMemo(() => {
    const counts = new Map();
    for (const inq of inquiries) {
      const key = (inq.productName || '').trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    let winner = '-';
    let winnerCount = 0;
    for (const [name, count] of counts.entries()) {
      if (count > winnerCount) {
        winner = name;
        winnerCount = count;
      }
    }
    return { name: winner, count: winnerCount };
  }, [inquiries]);

  const weeklyComparison = useMemo(() => {
    const now = new Date();
    const startCurrentWeek = new Date(now);
    const dayOffset = (startCurrentWeek.getDay() + 6) % 7;
    startCurrentWeek.setDate(startCurrentWeek.getDate() - dayOffset);
    startCurrentWeek.setHours(0, 0, 0, 0);

    const startPreviousWeek = new Date(startCurrentWeek);
    startPreviousWeek.setDate(startPreviousWeek.getDate() - 7);
    const endPreviousWeek = new Date(startCurrentWeek);
    const endCurrentWeek = new Date(startCurrentWeek);
    endCurrentWeek.setDate(endCurrentWeek.getDate() + 7);

    const inCurrent = inquiries.filter((inq) => {
      const date = parseDateValue(inq.createdAt || inq.updatedAt || inq.date);
      return date && date >= startCurrentWeek && date < endCurrentWeek;
    });

    const inPrevious = inquiries.filter((inq) => {
      const date = parseDateValue(inq.createdAt || inq.updatedAt || inq.date);
      return date && date >= startPreviousWeek && date < endPreviousWeek;
    });

    const currentTotal = inCurrent.length;
    const previousTotal = inPrevious.length;
    const currentReplied = inCurrent.filter((inq) => inq.status === 'replied').length;
    const previousReplied = inPrevious.filter((inq) => inq.status === 'replied').length;
    const currentRate = currentTotal ? Math.round((currentReplied / currentTotal) * 100) : 0;
    const previousRate = previousTotal ? Math.round((previousReplied / previousTotal) * 100) : 0;

    const calcDelta = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      currentTotal,
      previousTotal,
      currentRate,
      previousRate,
      totalDelta: calcDelta(currentTotal, previousTotal),
      rateDelta: currentRate - previousRate,
    };
  }, [inquiries]);

  const cards = [
    { label: 'Productos totales', value: stats.totalProducts, color: 'bg-blue-500', icon: Package },
    { label: 'Productos activos', value: stats.activeProducts, color: 'bg-green-500', icon: Eye },
    { label: 'Destacados', value: stats.featuredProducts, color: 'bg-amber-500', icon: Star },
    { label: 'Sin stock', value: stats.outOfStock, color: 'bg-red-500', icon: EyeOff },
    { label: 'Consultas pendientes', value: stats.pendingInquiries, color: 'bg-orange-500', icon: MessageSquare },
    { label: 'Consultas >48h', value: pendingOlderThan48h, color: 'bg-rose-500', icon: Clock },
    { label: 'Tasa de respuesta', value: `${responseRate}%`, color: 'bg-teal-500', icon: MessageSquare },
    { label: 'Top consultado', value: topConsultedProduct.count ? `${topConsultedProduct.count}` : '-', color: 'bg-indigo-500', icon: Package },
  ];

  const opCards = [
    { label: 'Disponibilidad API', value: apiMetrics ? `${apiMetrics.requests.availabilityPct}%` : '-', color: 'bg-emerald-500', icon: Eye },
    { label: 'P95 (ms)', value: apiMetrics ? apiMetrics.latency.p95Ms : '-', color: 'bg-cyan-500', icon: Clock },
    { label: 'Errores de ruta', value: apiMetrics ? apiMetrics.errors.route : '-', color: 'bg-rose-500', icon: MessageSquare },
    { label: 'Errores no controlados', value: apiMetrics ? apiMetrics.errors.unhandled : '-', color: 'bg-slate-600', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h3 className="text-sm font-extrabold text-gray-700 uppercase tracking-wide mb-3">Comparativa semanal</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3">
            <p className="text-xs text-blue-700 font-semibold">Consultas (esta semana vs pasada)</p>
            <p className="text-xl font-extrabold text-blue-900 mt-1">{weeklyComparison.currentTotal} / {weeklyComparison.previousTotal}</p>
            <p className={`text-xs mt-1 font-semibold ${weeklyComparison.totalDelta >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {weeklyComparison.totalDelta >= 0 ? '+' : ''}{weeklyComparison.totalDelta}% variacion
            </p>
          </div>
          <div className="rounded-xl border border-teal-100 bg-teal-50/70 px-4 py-3">
            <p className="text-xs text-teal-700 font-semibold">Tasa de respuesta</p>
            <p className="text-xl font-extrabold text-teal-900 mt-1">{weeklyComparison.currentRate}% / {weeklyComparison.previousRate}%</p>
            <p className={`text-xs mt-1 font-semibold ${weeklyComparison.rateDelta >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {weeklyComparison.rateDelta >= 0 ? '+' : ''}{weeklyComparison.rateDelta} pts
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-6">Dashboard</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center`}><c.icon size={18} className="text-white" /></div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900">{c.value}</p>
                  <p className="text-xs text-gray-500">{c.label}</p>
                  {c.label === 'Top consultado' && topConsultedProduct.count > 0 && <p className="text-[11px] text-gray-400 mt-0.5">{topConsultedProduct.name}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-extrabold text-gray-700 mb-3 uppercase tracking-wide">Salud API</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {opCards.map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center`}><c.icon size={18} className="text-white" /></div>
                <div><p className="text-2xl font-extrabold text-gray-900">{c.value}</p><p className="text-xs text-gray-500">{c.label}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ActivityTimeline items={activityLog} />
    </div>
  );
}

function ProductsManager({ filters, setFilters, requestConfirm, onActivity }) {
  const { products, addProduct, updateProduct, deleteProduct, categories, brands } = useAdmin();
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formBusy, setFormBusy] = useState(false);
  const [busyIds, setBusyIds] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const searchRef = useRef(null);
  const [form, setForm] = useState({ name: '', price: '', categoryId: '', brandId: '', description: '', image: '', sku: '', stockStatus: 'in_stock' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === '/' && canUseShortcutTarget(event.target)) { event.preventDefault(); searchRef.current?.focus(); }
      if (event.key.toLowerCase() === 'n' && canUseShortcutTarget(event.target)) { event.preventDefault(); openNew(); }
      if (event.key === 'Escape' && showForm) { event.preventDefault(); setShowForm(false); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showForm]);

  const filteredProducts = useMemo(() => {
    const text = filters.search.trim().toLowerCase();
    const parsed = products.filter((p) => {
      if (filters.isActive !== 'all' && Boolean(p.isActive) !== (filters.isActive === 'active')) return false;
      if (filters.featured !== 'all' && Boolean(p.isFeatured) !== (filters.featured === 'featured')) return false;
      if (filters.stockStatus !== 'all' && p.stockStatus !== filters.stockStatus) return false;
      if (filters.categoryId !== 'all' && Number(p.categoryId) !== Number(filters.categoryId)) return false;
      if (filters.brandId !== 'all' && Number(p.brandId) !== Number(filters.brandId)) return false;
      if (text && !`${p.name || ''} ${p.sku || ''} ${p.brand || ''}`.toLowerCase().includes(text)) return false;
      return true;
    });
    const sorted = [...parsed];
    switch (filters.sortBy) {
      case 'name_asc': sorted.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''))); break;
      case 'name_desc': sorted.sort((a, b) => String(b.name || '').localeCompare(String(a.name || ''))); break;
      case 'price_asc': sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0)); break;
      case 'price_desc': sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0)); break;
      case 'id_asc': sorted.sort((a, b) => Number(a.id || 0) - Number(b.id || 0)); break;
      default: sorted.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    }
    return sorted;
  }, [products, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / filters.pageSize));
  const safePage = Math.min(filters.page, totalPages);
  const paginated = useMemo(() => filteredProducts.slice((safePage - 1) * filters.pageSize, safePage * filters.pageSize), [filteredProducts, safePage, filters.pageSize]);
  useEffect(() => { if (safePage !== filters.page) setFilters((prev) => ({ ...prev, page: safePage })); }, [safePage, filters.page, setFilters]);

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  const resetFilters = () => setFilters({ ...DEFAULT_PRODUCT_FILTERS });

  const openNew = () => {
    setEditingId(null);
    setFormErrors({});
    setForm({ name: '', price: '', categoryId: '', brandId: '', description: '', image: '', sku: '', stockStatus: 'in_stock' });
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setFormErrors({});
    setForm({ name: p.name || '', price: String(p.price ?? ''), categoryId: String(p.categoryId ?? ''), brandId: String(p.brandId ?? ''), description: p.description || '', image: p.image || '', sku: p.sku || '', stockStatus: p.stockStatus || 'in_stock' });
    setShowForm(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'El nombre es obligatorio.';
    const numericPrice = Number(form.price);
    if (!form.price || Number.isNaN(numericPrice) || numericPrice <= 0) errors.price = 'El precio debe ser mayor a 0.';
    if (!form.categoryId) errors.categoryId = 'Selecciona una categoria.';
    if (!form.brandId) errors.brandId = 'Selecciona una marca.';
    if (!form.sku.trim()) errors.sku = 'El SKU es obligatorio.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const onSave = async (event) => {
    event.preventDefault();
    if (!validateForm()) { addToast('Revisa los campos marcados en rojo.', 'warning'); return; }
    const category = categories.find((item) => item.id === Number(form.categoryId));
    const brand = brands.find((item) => item.id === Number(form.brandId));
    const payload = { name: form.name.trim(), price: Number(form.price), categoryId: Number(form.categoryId), brandId: Number(form.brandId), category: category?.name || '', brand: brand?.name || '', description: form.description.trim(), image: form.image.trim(), sku: form.sku.trim(), stockStatus: form.stockStatus };
    setFormBusy(true);
    try {
      const result = editingId ? await updateProduct(editingId, payload) : await addProduct(payload);
      if (result) { addToast(editingId ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.', 'success'); onActivity(editingId ? `Producto actualizado: ${payload.name}` : `Producto creado: ${payload.name}`); setShowForm(false); }
      else addToast(editingId ? 'No se pudo actualizar el producto.' : 'No se pudo crear el producto.', 'error');
    } finally { setFormBusy(false); }
  };

  const runRowAction = async (id, action, okMsg, errMsg, activityText) => {
    setBusyIds((prev) => [...prev, id]);
    try { await action(); addToast(okMsg, 'success'); if (activityText) onActivity(activityText); }
    catch { addToast(errMsg, 'error'); }
    finally { setBusyIds((prev) => prev.filter((current) => current !== id)); }
  };

  const onDelete = async (id) => {
    const target = products.find((p) => p.id === id);
    const approved = await requestConfirm({ title: 'Eliminar producto', description: 'Esta accion no se puede deshacer. Se eliminara el producto seleccionado.', confirmText: 'Eliminar', danger: true });
    if (!approved) return;
    await runRowAction(id, async () => deleteProduct(id), 'Producto eliminado.', 'No se pudo eliminar el producto.', `Producto eliminado: ${target?.name || id}`);
  };

  const toggleSelection = (id) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  const idsOnPage = paginated.map((p) => p.id);
  const pageAllSelected = paginated.length > 0 && idsOnPage.every((id) => selectedIds.includes(id));
  const togglePageSelection = () => {
    if (pageAllSelected) setSelectedIds((prev) => prev.filter((id) => !idsOnPage.includes(id)));
    else setSelectedIds((prev) => [...new Set([...prev, ...idsOnPage])]);
  };

  const onBulkAction = async (label, updater) => {
    if (!selectedIds.length) return;
    setBulkBusy(true);
    try { await Promise.all(selectedIds.map((id) => updater(id))); addToast(`Se actualizaron ${selectedIds.length} productos.`, 'success'); onActivity(`Accion masiva (${label}) sobre ${selectedIds.length} productos`); }
    catch { addToast('No se pudo completar la accion masiva.', 'error'); }
    finally { setBulkBusy(false); }
  };

  const onBulkDelete = async () => {
    if (!selectedIds.length) return;
    const approved = await requestConfirm({ title: 'Eliminar seleccion', description: `Se eliminaran ${selectedIds.length} productos seleccionados. Esta accion no se puede deshacer.`, confirmText: 'Eliminar seleccion', danger: true });
    if (!approved) return;
    setBulkBusy(true);
    try { await Promise.all(selectedIds.map((id) => deleteProduct(id))); addToast(`Se eliminaron ${selectedIds.length} productos.`, 'success'); onActivity(`Eliminacion masiva de ${selectedIds.length} productos`); setSelectedIds([]); }
    catch { addToast('No se pudo eliminar toda la seleccion.', 'error'); }
    finally { setBulkBusy(false); }
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5"><div><h2 className="text-xl font-extrabold text-gray-900">Gestion de Productos</h2><p className="text-xs text-gray-500 mt-1">Atajos: <kbd className="px-1 py-0.5 bg-gray-100 rounded">N</kbd> nuevo, <kbd className="px-1 py-0.5 bg-gray-100 rounded">/</kbd> buscar, <kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> cerrar.</p></div><button type="button" onClick={openNew} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold"><Plus size={16} /> Nuevo producto</button></div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm"><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3"><label className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input ref={searchRef} type="text" value={filters.search} onChange={(event) => setFilter('search', event.target.value)} placeholder="Buscar por nombre, SKU o marca" className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm" /></label><select value={filters.isActive} onChange={(event) => setFilter('isActive', event.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm"><option value="all">Estado: todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select><select value={filters.featured} onChange={(event) => setFilter('featured', event.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm"><option value="all">Destacado: todos</option><option value="featured">Destacados</option><option value="not_featured">No destacados</option></select><select value={filters.stockStatus} onChange={(event) => setFilter('stockStatus', event.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm"><option value="all">Stock: todos</option><option value="in_stock">En stock</option><option value="low_stock">Ultimas unidades</option><option value="out_of_stock">Sin stock</option><option value="on_order">Bajo pedido</option></select><select value={filters.categoryId} onChange={(event) => setFilter('categoryId', event.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm"><option value="all">Categoria: todas</option>{categories.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}</select><select value={filters.brandId} onChange={(event) => setFilter('brandId', event.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm"><option value="all">Marca: todas</option>{brands.map((b) => <option key={b.id} value={String(b.id)}>{b.name}</option>)}</select><select value={filters.sortBy} onChange={(event) => setFilter('sortBy', event.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm"><option value="id_desc">Orden: mas recientes</option><option value="id_asc">Orden: mas antiguos</option><option value="name_asc">Nombre A-Z</option><option value="name_desc">Nombre Z-A</option><option value="price_asc">Precio menor a mayor</option><option value="price_desc">Precio mayor a menor</option></select><button type="button" onClick={resetFilters} className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl px-3 py-2.5 text-sm font-semibold"><Filter size={15} /> Limpiar filtros</button></div><div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500"><span>{filteredProducts.length} resultados</span><span>{selectedIds.length} seleccionados</span></div></div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"><div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center gap-2 bg-gray-50/50"><button type="button" onClick={togglePageSelection} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-100">{pageAllSelected ? <CheckSquare size={14} /> : <Square size={14} />} Seleccionar pagina</button><button type="button" disabled={bulkBusy || !selectedIds.length} onClick={() => onBulkAction('activar', (id) => updateProduct(id, { isActive: true }))} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-40">Activar</button><button type="button" disabled={bulkBusy || !selectedIds.length} onClick={() => onBulkAction('desactivar', (id) => updateProduct(id, { isActive: false }))} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40">Desactivar</button><button type="button" disabled={bulkBusy || !selectedIds.length} onClick={() => onBulkAction('destacar', (id) => updateProduct(id, { isFeatured: true }))} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40">Destacar</button><button type="button" disabled={bulkBusy || !selectedIds.length} onClick={() => onBulkAction('quitar destacado', (id) => updateProduct(id, { isFeatured: false }))} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-600 text-white hover:bg-slate-700 disabled:opacity-40">Quitar destacado</button><button type="button" disabled={bulkBusy || !selectedIds.length} onClick={() => onBulkAction('stock bajo pedido', (id) => updateProduct(id, { stockStatus: 'on_order' }))} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-40">Bajo pedido</button><button type="button" disabled={bulkBusy || !selectedIds.length} onClick={onBulkDelete} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40">Eliminar seleccion</button></div>
      <div className="md:hidden p-3 space-y-3">{paginated.map((p) => { const st = getStockLabel(p.stockStatus); const rowBusy = busyIds.includes(p.id); return <div key={p.id} className="rounded-xl border border-gray-200 bg-white p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-gray-900">{p.name}</p><p className="text-xs text-gray-500 mt-0.5">{p.brand} · {p.sku}</p><p className="text-xs text-gray-500">{p.category}</p></div><button type="button" onClick={() => toggleSelection(p.id)} className="text-gray-600">{selectedIds.includes(p.id) ? <CheckSquare size={16} /> : <Square size={16} />}</button></div><div className="mt-2 flex items-center justify-between"><p className="text-sm font-extrabold text-gray-900">{formatPrice(p.price)}</p><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.className}`}>{st.text}</span></div><div className="mt-3 grid grid-cols-4 gap-2"><button type="button" disabled={rowBusy} onClick={() => runRowAction(p.id, async () => updateProduct(p.id, { isActive: !p.isActive }), 'Estado actualizado.', 'No se pudo actualizar.', `Cambio de estado: ${p.name}`)} className="py-1.5 rounded-lg border text-xs">{p.isActive ? 'Activo' : 'Inactivo'}</button><button type="button" disabled={rowBusy} onClick={() => runRowAction(p.id, async () => updateProduct(p.id, { isFeatured: !p.isFeatured }), 'Destacado actualizado.', 'No se pudo actualizar.', `Cambio destacado: ${p.name}`)} className="py-1.5 rounded-lg border text-xs">{p.isFeatured ? 'Dest.' : 'Normal'}</button><button type="button" disabled={rowBusy} onClick={() => openEdit(p)} className="py-1.5 rounded-lg border text-xs">Editar</button><button type="button" disabled={rowBusy} onClick={() => onDelete(p.id)} className="py-1.5 rounded-lg border border-red-200 text-red-600 text-xs">Borrar</button></div></div>; })}</div>
      <div className="hidden md:block overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-gray-50 border-b border-gray-200"><th className="w-10 px-3 py-3 text-left" /><th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Producto</th><th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Categoria</th><th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Precio</th><th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Stock</th><th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Estado</th><th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Acciones</th></tr></thead><tbody className="divide-y divide-gray-100">{paginated.map((p) => { const st = getStockLabel(p.stockStatus); const rowBusy = busyIds.includes(p.id); return <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${!p.isActive ? 'opacity-60' : ''}`}><td className="px-3 py-3"><button type="button" onClick={() => toggleSelection(p.id)} className="text-gray-600 hover:text-blue-600">{selectedIds.includes(p.id) ? <CheckSquare size={16} /> : <Square size={16} />}</button></td><td className="px-4 py-3"><div className="flex items-center gap-3"><img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" onError={(event) => { event.currentTarget.src = 'https://placehold.co/40x40/1e40af/ffffff?text=IP'; }} /><div><p className="font-semibold text-gray-900 text-xs">{p.name}</p><p className="text-xs text-gray-500">{p.brand} · {p.sku}</p></div></div></td><td className="px-4 py-3 text-xs text-gray-600">{p.category}</td><td className="px-4 py-3 font-bold text-gray-900 text-xs">{formatPrice(p.price)}</td><td className="px-4 py-3 text-center"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.className}`}>{st.text}</span></td><td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-1"><button type="button" disabled={rowBusy} onClick={() => runRowAction(p.id, async () => updateProduct(p.id, { isActive: !p.isActive }), 'Estado actualizado.', 'No se pudo actualizar el estado.', `Cambio de estado: ${p.name}`)} className={`p-1.5 rounded-lg ${p.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>{p.isActive ? <Eye size={14} /> : <EyeOff size={14} />}</button><button type="button" disabled={rowBusy} onClick={() => runRowAction(p.id, async () => updateProduct(p.id, { isFeatured: !p.isFeatured }), 'Destacado actualizado.', 'No se pudo actualizar destacado.', `Cambio destacado: ${p.name}`)} className={`p-1.5 rounded-lg ${p.isFeatured ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:bg-gray-100'}`}>{p.isFeatured ? <Star size={14} /> : <StarOff size={14} />}</button></div></td><td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><button type="button" disabled={rowBusy} onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={14} /></button><button type="button" disabled={rowBusy} onClick={() => onDelete(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button></div></td></tr>; })}</tbody></table></div>
      {paginated.length === 0 && <div className="px-4 py-10 text-center text-gray-500 text-sm">No hay resultados para los filtros actuales. <button type="button" onClick={resetFilters} className="text-blue-600 hover:text-blue-700 font-semibold">Limpiar filtros</button></div>}
      <Pagination page={safePage} totalPages={totalPages} onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))} /></div>

      {showForm && <div className="fixed inset-0 bg-black/50 z-[70] flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowForm(false)}><div className="bg-white rounded-2xl w-full max-w-lg my-8 shadow-2xl border border-gray-200" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true"><div className="flex items-center justify-between px-5 py-4 border-b"><h3 className="font-bold text-gray-900">{editingId ? 'Editar producto' : 'Nuevo producto'}</h3><button type="button" onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button></div><form onSubmit={onSave} className="p-5 space-y-3"><div><label className="block text-xs font-semibold text-gray-600 mb-1">Nombre</label><input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} className={`w-full px-3 py-2.5 border rounded-xl text-sm ${formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} required />{formErrors.name && <p className="text-[11px] text-red-600 mt-1">{formErrors.name}</p>}</div><div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-semibold text-gray-600 mb-1">Precio</label><input type="number" value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))} className={`w-full px-3 py-2.5 border rounded-xl text-sm ${formErrors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} required />{formErrors.price && <p className="text-[11px] text-red-600 mt-1">{formErrors.price}</p>}</div><div><label className="block text-xs font-semibold text-gray-600 mb-1">SKU</label><input value={form.sku} onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))} className={`w-full px-3 py-2.5 border rounded-xl text-sm ${formErrors.sku ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} required />{formErrors.sku && <p className="text-[11px] text-red-600 mt-1">{formErrors.sku}</p>}</div></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-semibold text-gray-600 mb-1">Categoria</label><select value={form.categoryId} onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))} className={`w-full px-3 py-2.5 border rounded-xl text-sm ${formErrors.categoryId ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} required><option value="">Seleccionar</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div><div><label className="block text-xs font-semibold text-gray-600 mb-1">Marca</label><select value={form.brandId} onChange={(event) => setForm((prev) => ({ ...prev, brandId: event.target.value }))} className={`w-full px-3 py-2.5 border rounded-xl text-sm ${formErrors.brandId ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} required><option value="">Seleccionar</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div></div><div><label className="block text-xs font-semibold text-gray-600 mb-1">Disponibilidad</label><select value={form.stockStatus} onChange={(event) => setForm((prev) => ({ ...prev, stockStatus: event.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm"><option value="in_stock">En stock</option><option value="low_stock">Ultimas unidades</option><option value="out_of_stock">Sin stock</option><option value="on_order">Bajo pedido</option></select></div><div><label className="block text-xs font-semibold text-gray-600 mb-1">URL de imagen</label><input value={form.image} onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm" placeholder="https://..." /></div><div><label className="block text-xs font-semibold text-gray-600 mb-1">Descripcion</label><textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} rows={3} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm resize-none" /></div><button type="submit" disabled={formBusy} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">{formBusy ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> {editingId ? 'Guardar cambios' : 'Crear producto'}</>}</button></form></div></div>}
    </div>
  );
}

function SimpleManager({ title, items, openLabel, onCreate, onUpdate, onDelete, getMainText, getSubText, requestConfirm, onActivity }) {
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '', color: 'from-blue-500 to-blue-700' });
  const openNew = () => { setEditing(null); setForm({ name: '', icon: '', color: 'from-blue-500 to-blue-700' }); setShowForm(true); };
  const openEdit = (item) => { setEditing(item.id); setForm({ name: item.name || '', icon: item.icon || '', color: item.color || 'from-blue-500 to-blue-700' }); setShowForm(true); };
  const save = async (event) => { event.preventDefault(); setBusy(true); try { if (editing) await onUpdate(editing, form); else await onCreate(form); addToast(`${title} guardada.`, 'success'); onActivity(`${title} guardada: ${form.name}`); setShowForm(false); } catch { addToast(`No se pudo guardar ${title.toLowerCase()}.`, 'error'); } finally { setBusy(false); } };
  const remove = async (id) => { const target = items.find((item) => item.id === id); const approved = await requestConfirm({ title: `Eliminar ${title.toLowerCase()}`, description: `Se eliminara la ${title.toLowerCase()} seleccionada.`, confirmText: 'Eliminar', danger: true }); if (!approved) return; setBusy(true); try { await onDelete(id); addToast(`${title} eliminada.`, 'success'); onActivity(`${title} eliminada: ${target?.name || id}`); } catch { addToast(`No se pudo eliminar ${title.toLowerCase()}.`, 'error'); } finally { setBusy(false); } };
  return (
    <div><div className="flex items-center justify-between mb-6"><h2 className="text-xl font-extrabold text-gray-900">Gestion de {title}</h2><button type="button" onClick={openNew} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold"><Plus size={16} /> {openLabel}</button></div>{showForm && <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4" onClick={() => setShowForm(false)}><div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-200" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between px-5 py-4 border-b"><h3 className="font-bold">{editing ? 'Editar' : 'Nueva'} {title.toLowerCase()}</h3><button type="button" onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button></div><form onSubmit={save} className="p-5 space-y-3"><div><label className="block text-xs font-semibold text-gray-600 mb-1">Nombre</label><input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm" required /></div>{form.color !== undefined && <div><label className="block text-xs font-semibold text-gray-600 mb-1">Color Tailwind</label><input value={form.color} onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm" /></div>}{form.icon !== undefined && <div><label className="block text-xs font-semibold text-gray-600 mb-1">Icono (emoji)</label><input value={form.icon} onChange={(event) => setForm((prev) => ({ ...prev, icon: event.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm" /></div>}<button type="submit" disabled={busy} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">{busy ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> Guardar</>}</button></form></div></div>}<div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"><div className="divide-y divide-gray-100">{items.map((item) => <div key={item.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl ${item.color ? `bg-gradient-to-br ${item.color}` : 'bg-gray-100'} flex items-center justify-center`}>{item.icon ? <span>{item.icon}</span> : <Award size={18} className="text-gray-600" />}</div><div><p className="font-semibold text-gray-900 text-sm">{getMainText(item)}</p><p className="text-xs text-gray-500">{getSubText(item)}</p></div></div><div className="flex items-center gap-1"><button type="button" onClick={() => openEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={14} /></button><button type="button" onClick={() => remove(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button></div></div>)}</div></div></div>
  );
}
function InquiriesManager({ filters, setFilters, onActivity }) {
  const { inquiries, updateInquiryStatus } = useAdmin();
  const { addToast } = useToast();
  const [expandedId, setExpandedId] = useState(null);
  const [busyIds, setBusyIds] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState('quote_sent');
  const [criticalOnly, setCriticalOnly] = useState(false);
  const sourceLabels = {
    contact_form: { text: 'Formulario', className: 'bg-blue-100 text-blue-800' },
    whatsapp: { text: 'WhatsApp', className: 'bg-green-100 text-green-800' },
    product_page: { text: 'Producto', className: 'bg-purple-100 text-purple-800' },
  };

  const getSlaInfo = useCallback((item) => {
    if (item.status === 'replied') return { label: 'Respondida', className: 'bg-green-100 text-green-800', isCritical: false };
    const date = parseDateValue(item.createdAt || item.updatedAt || item.date);
    if (!date) return { label: 'Sin fecha', className: 'bg-gray-100 text-gray-700', isCritical: false };
    const ageHours = (Date.now() - date.getTime()) / (1000 * 60 * 60);
    if (ageHours > 48) return { label: '>48h', className: 'bg-red-100 text-red-800', isCritical: true };
    if (ageHours > 24) return { label: '24-48h', className: 'bg-amber-100 text-amber-800', isCritical: false };
    return { label: '<24h', className: 'bg-emerald-100 text-emerald-800', isCritical: false };
  }, []);

  const filtered = useMemo(() => {
    const text = filters.search.trim().toLowerCase();
    const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const to = filters.dateTo ? new Date(filters.dateTo) : null;
    if (to) to.setHours(23, 59, 59, 999);
    return inquiries.filter((item) => {
      if (filters.status !== 'all' && item.status !== filters.status) return false;
      if (filters.source !== 'all' && item.source !== filters.source) return false;
      if (criticalOnly && !getSlaInfo(item).isCritical) return false;
      if (text && !`${item.name || ''} ${item.email || ''} ${item.subject || ''} ${item.message || ''} ${item.productName || ''}`.toLowerCase().includes(text)) return false;
      const date = parseDateValue(item.createdAt || item.updatedAt || item.date);
      if (from && (!date || date < from)) return false;
      if (to && (!date || date > to)) return false;
      return true;
    }).sort((a, b) => (parseDateValue(b.createdAt || b.updatedAt || b.date)?.getTime() || 0) - (parseDateValue(a.createdAt || a.updatedAt || a.date)?.getTime() || 0));
  }, [inquiries, filters, criticalOnly, getSlaInfo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / filters.pageSize));
  const safePage = Math.min(filters.page, totalPages);
  const pageItems = useMemo(() => filtered.slice((safePage - 1) * filters.pageSize, safePage * filters.pageSize), [filtered, safePage, filters.pageSize]);
  useEffect(() => { if (safePage !== filters.page) setFilters((prev) => ({ ...prev, page: safePage })); }, [safePage, filters.page, setFilters]);

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  const resetFilters = () => {
    setCriticalOnly(false);
    setFilters({ ...DEFAULT_INQUIRY_FILTERS });
  };

  const formatDateInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const applyPreset = (preset) => {
    if (preset === 'critical_pending') {
      setCriticalOnly(true);
      setFilters((prev) => ({ ...prev, status: 'pending', source: 'all', search: '', dateFrom: '', dateTo: '', page: 1 }));
      return;
    }
    if (preset === 'replied_today') {
      const today = formatDateInput(new Date());
      setCriticalOnly(false);
      setFilters((prev) => ({ ...prev, status: 'replied', source: 'all', search: '', dateFrom: today, dateTo: today, page: 1 }));
      return;
    }
    if (preset === 'whatsapp_pending') {
      setCriticalOnly(false);
      setFilters((prev) => ({ ...prev, status: 'pending', source: 'whatsapp', search: '', dateFrom: '', dateTo: '', page: 1 }));
    }
  };

  const setStatus = async (item, status) => {
    setBusyIds((prev) => [...prev, item.id]);
    try { await updateInquiryStatus(item.id, status); addToast('Estado de consulta actualizado.', 'success'); onActivity(`Consulta ${status === 'replied' ? 'respondida' : 'pendiente'}: ${item.name}`); }
    catch { addToast('No se pudo actualizar la consulta.', 'error'); }
    finally { setBusyIds((prev) => prev.filter((id) => id !== item.id)); }
  };

  const expanded = filtered.find((item) => item.id === expandedId) || null;
  const expandedIndex = filtered.findIndex((item) => item.id === expandedId);
  const goToAdjacent = (dir) => { if (expandedIndex < 0) return; const next = filtered[expandedIndex + dir]; if (next) setExpandedId(next.id); };
  const templateBody = expanded ? buildTemplateMessage(REPLY_TEMPLATES[activeTemplate], expanded) : '';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
        <h2 className="text-xl font-extrabold text-gray-900">Consultas Recibidas</h2>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">{inquiries.filter((i) => i.status === 'pending').length} pendientes</span>
          <span className="text-gray-400">·</span>
          <span>{inquiries.length} total</span>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <label className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={filters.search} onChange={(event) => setFilter('search', event.target.value)} placeholder="Buscar por nombre, email, asunto o mensaje" className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm" />
          </label>
          <select value={filters.status} onChange={(event) => setFilter('status', event.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm"><option value="pending">Solo pendientes</option><option value="replied">Solo respondidas</option><option value="all">Todos los estados</option></select>
          <select value={filters.source} onChange={(event) => setFilter('source', event.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm"><option value="all">Origen: todos</option><option value="contact_form">Formulario</option><option value="whatsapp">WhatsApp</option><option value="product_page">Producto</option></select>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">Desde<input type="date" value={filters.dateFrom} onChange={(event) => setFilter('dateFrom', event.target.value)} className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-sm" /></label>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">Hasta<input type="date" value={filters.dateTo} onChange={(event) => setFilter('dateTo', event.target.value)} className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-sm" /></label>
          <button type="button" onClick={resetFilters} className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl px-3 py-2.5 text-sm font-semibold"><Filter size={15} /> Limpiar filtros</button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => applyPreset('critical_pending')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${criticalOnly ? 'bg-red-600 text-white border-red-600' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}>Pendientes criticas</button>
          <button type="button" onClick={() => applyPreset('replied_today')} className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">Respondidas hoy</button>
          <button type="button" onClick={() => applyPreset('whatsapp_pending')} className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-green-50 text-green-700 border-green-200 hover:bg-green-100">WhatsApp pendientes</button>
          {criticalOnly && <span className="text-[11px] font-semibold text-red-700 bg-red-100 border border-red-200 px-2 py-1 rounded-lg">Solo SLA &gt;48h</span>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase hidden lg:table-cell">Motivo</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Producto</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Fecha</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase">SLA</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Origen</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.map((inq) => {
                const src = sourceLabels[inq.source] || sourceLabels.product_page;
                const sla = getSlaInfo(inq);
                const rowBusy = busyIds.includes(inq.id);
                const nextStatus = inq.status === 'pending' ? 'replied' : 'pending';
                const criticalRow = inq.status === 'pending' && sla.isCritical;
                return (
                  <tr key={inq.id} className={`hover:bg-gray-50 transition-colors cursor-pointer ${criticalRow ? 'bg-red-50/40' : ''}`} onClick={() => setExpandedId(inq.id)}>
                    <td className="px-4 py-3"><p className="font-semibold text-gray-900 text-xs">{inq.name}</p></td>
                    <td className="px-4 py-3 text-xs text-gray-600">{inq.email}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 hidden lg:table-cell">{inq.subject || '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[150px] truncate">{inq.productName || '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(inq.createdAt || inq.updatedAt || inq.date)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sla.className}`}>{sla.label}</span>
                    </td>
                    <td className="px-4 py-3 text-center"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${src.className}`}>{src.text}</span></td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        disabled={rowBusy}
                        onClick={(event) => { event.stopPropagation(); setStatus(inq, nextStatus); }}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full disabled:opacity-60 ${inq.status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                      >
                        {inq.status === 'pending' ? 'Pendiente' : 'Respondida'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="md:hidden p-3 space-y-3">
          {pageItems.map((inq) => {
            const src = sourceLabels[inq.source] || sourceLabels.product_page;
            const sla = getSlaInfo(inq);
            const rowBusy = busyIds.includes(inq.id);
            const criticalRow = inq.status === 'pending' && sla.isCritical;
            return (
              <div key={inq.id} className={`rounded-xl border bg-white p-3 ${criticalRow ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{inq.name}</p>
                    <p className="text-xs text-gray-500">{inq.email}</p>
                    <p className="text-xs text-gray-500">{formatDate(inq.createdAt || inq.updatedAt || inq.date)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${src.className}`}>{src.text}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sla.className}`}>SLA {sla.label}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">{inq.subject || '-'}</p>
                {criticalRow && <p className="text-[11px] font-semibold text-red-700 mt-1">Prioridad alta: pendiente por mas de 48h.</p>}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setExpandedId(inq.id)} className="py-1.5 rounded-lg border text-xs">Ver detalle</button>
                  <button
                    type="button"
                    disabled={rowBusy}
                    onClick={() => setStatus(inq, inq.status === 'pending' ? 'replied' : 'pending')}
                    className="py-1.5 rounded-lg border text-xs disabled:opacity-60"
                  >
                    {inq.status === 'pending' ? 'Marcar respondida' : 'Marcar pendiente'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {pageItems.length === 0 && <div className="px-4 py-10 text-center text-gray-500 text-sm">No hay consultas para los filtros actuales. <button type="button" onClick={resetFilters} className="text-blue-600 hover:text-blue-700 font-semibold">Limpiar filtros</button></div>}
        <Pagination page={safePage} totalPages={totalPages} onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))} />
      </div>

      {expanded && <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4" onClick={() => setExpandedId(null)}><div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between px-5 py-4 border-b"><h3 className="font-bold text-gray-900 text-sm">Detalle de consulta</h3><button type="button" onClick={() => setExpandedId(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button></div><div className="p-5 space-y-3"><div className="grid grid-cols-2 gap-3"><div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Nombre</p><p className="text-sm font-semibold text-gray-900">{expanded.name}</p></div><div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Email</p><a href={`mailto:${expanded.email}`} className="text-sm text-blue-600 hover:underline">{expanded.email}</a></div><div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Fecha</p><p className="text-sm text-gray-700">{formatDate(expanded.createdAt || expanded.updatedAt || expanded.date)}</p></div><div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Motivo</p><p className="text-sm text-gray-700">{expanded.subject || '-'}</p></div></div><div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Producto consultado</p><p className="text-sm text-gray-700">{expanded.productName || '-'}</p></div><div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Mensaje</p><p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl leading-relaxed">{expanded.message || '-'}</p></div><div><p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Plantillas rapidas</p><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setActiveTemplate('quote_sent')} className={`px-2.5 py-1.5 rounded-lg text-xs ${activeTemplate === 'quote_sent' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Presupuesto enviado</button><button type="button" onClick={() => setActiveTemplate('need_details')} className={`px-2.5 py-1.5 rounded-lg text-xs ${activeTemplate === 'need_details' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Faltan datos</button><button type="button" onClick={() => setActiveTemplate('no_stock_alt')} className={`px-2.5 py-1.5 rounded-lg text-xs ${activeTemplate === 'no_stock_alt' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Sin stock / alternativa</button></div><p className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-2 mt-2">{templateBody}</p></div><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => goToAdjacent(-1)} disabled={expandedIndex <= 0} className="px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40">Anterior</button><button type="button" onClick={() => goToAdjacent(1)} disabled={expandedIndex < 0 || expandedIndex >= filtered.length - 1} className="px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40">Siguiente</button></div><div className="flex gap-2 pt-2"><button type="button" onClick={() => setStatus(expanded, expanded.status === 'pending' ? 'replied' : 'pending')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm ${expanded.status === 'pending' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}>{expanded.status === 'pending' ? 'Marcar como respondida' : 'Marcar como pendiente'}</button><a href={`mailto:${expanded.email}?subject=Re: ${expanded.subject || 'Consulta'} - Industrial Pro&body=${encodeURIComponent(`Hola ${expanded.name},\n\n${templateBody}\n\nSaludos.`)}`} onClick={() => onActivity(`Respuesta por plantilla enviada a ${expanded.name}`)} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-1.5"><Mail size={14} /> Responder</a></div></div></div></div>}
    </div>
  );
}

export default function AdminPanelV3() {
  const { isAuthenticated, logout, user } = useAuth();
  const { apiError, categories, addCategory, updateCategory, deleteCategory, brands, addBrand, updateBrand, deleteBrand, inquiries } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productFilters, setProductFilters] = useState({ ...DEFAULT_PRODUCT_FILTERS });
  const [inquiryFilters, setInquiryFilters] = useState({ ...DEFAULT_INQUIRY_FILTERS });
  const [activityLog, setActivityLog] = useState(() => { try { const raw = localStorage.getItem('admin_activity_log'); const parsed = raw ? JSON.parse(raw) : []; return Array.isArray(parsed) ? parsed : []; } catch { return []; } });

  const onActivity = useCallback((title) => {
    setActivityLog((prev) => {
      const next = [{ id: `${Date.now()}-${Math.random()}`, title, at: new Date().toISOString() }, ...prev].slice(0, 20);
      try { localStorage.setItem('admin_activity_log', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const confirmResolverRef = useRef(null);
  const [confirmState, setConfirmState] = useState({ open: false, title: '', description: '', confirmText: 'Confirmar', danger: false });
  const requestConfirm = useCallback((config) => new Promise((resolve) => { confirmResolverRef.current = resolve; setConfirmState({ open: true, title: config.title || 'Confirmar accion', description: config.description || '', confirmText: config.confirmText || 'Confirmar', danger: Boolean(config.danger) }); }), []);
  const closeConfirm = useCallback((approved) => { if (confirmResolverRef.current) { confirmResolverRef.current(approved); confirmResolverRef.current = null; } setConfirmState((prev) => ({ ...prev, open: false })); }, []);

  if (!isAuthenticated) return <AdminLogin />;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'categories', label: 'Categorias', icon: Tags },
    { id: 'brands', label: 'Marcas', icon: Award },
    { id: 'inquiries', label: 'Consultas', icon: MessageSquare },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard inquiries={inquiries} activityLog={activityLog} />;
      case 'products': return <ProductsManager filters={productFilters} setFilters={setProductFilters} requestConfirm={requestConfirm} onActivity={onActivity} />;
      case 'categories': return <SimpleManager title="Categorias" items={categories} openLabel="Nueva" onCreate={addCategory} onUpdate={updateCategory} onDelete={deleteCategory} getMainText={(item) => item.name} getSubText={(item) => item.slug || ''} requestConfirm={requestConfirm} onActivity={onActivity} />;
      case 'brands': return <SimpleManager title="Marcas" items={brands} openLabel="Nueva" onCreate={addBrand} onUpdate={updateBrand} onDelete={deleteBrand} getMainText={(item) => item.name} getSubText={(item) => (item.isActive ? 'Activa' : 'Inactiva')} requestConfirm={requestConfirm} onActivity={onActivity} />;
      case 'inquiries': return <InquiriesManager filters={inquiryFilters} setFilters={setInquiryFilters} onActivity={onActivity} />;
      default: return <Dashboard inquiries={inquiries} activityLog={activityLog} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}><div className="flex items-center justify-between px-5 py-5 border-b border-slate-700"><div className="flex items-center gap-2"><div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center"><span className="font-black text-sm">IP</span></div><div><span className="font-bold text-sm block leading-none">Admin Panel</span><span className="text-[10px] text-slate-400">Industrial Pro</span></div></div><button type="button" onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-slate-700 rounded"><X size={18} /></button></div><nav className="flex-1 px-3 py-4 space-y-1">{tabs.map((tab) => <button type="button" key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><tab.icon size={18} />{tab.label}</button>)}</nav><div className="px-3 py-4 border-t border-slate-700 space-y-2"><Link to="/" className="flex items-center gap-2 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-sm transition-all"><ArrowLeft size={16} /> Volver al sitio</Link><button type="button" onClick={logout} className="w-full flex items-center gap-2 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-xl text-sm transition-all"><LogOut size={16} /> Cerrar sesion</button></div></aside>
      <div className="flex-1 flex flex-col min-w-0"><header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30"><button type="button" onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"><Menu size={20} /></button><div className="hidden lg:block"><h3 className="text-sm font-semibold text-gray-900">{tabs.find((item) => item.id === activeTab)?.label}</h3></div><div className="flex items-center gap-2"><span className="text-xs text-gray-500 hidden sm:block">{user?.email}</span><div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center"><span className="text-white text-xs font-bold">A</span></div></div></header><main className="flex-1 p-4 lg:p-6 overflow-y-auto">{apiError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{apiError}</div>}{renderTab()}</main></div>
      <ConfirmModal open={confirmState.open} title={confirmState.title} description={confirmState.description} confirmText={confirmState.confirmText} danger={confirmState.danger} onConfirm={() => closeConfirm(true)} onCancel={() => closeConfirm(false)} />
    </div>
  );
}
