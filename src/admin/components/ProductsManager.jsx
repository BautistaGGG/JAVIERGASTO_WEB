import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, Pencil, Plus, Search, Trash2, Copy, History, Star, StarOff } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import Pagination from './Pagination';
import AdminSectionLoader from './AdminSectionLoader';
import { DEFAULT_PRODUCT_FILTERS, canUseShortcutTarget, formatDate } from './shared';
import { isFeatureEnabled } from '../../config/featureFlags';

const SORT_MAP = {
  id_desc: (a, b) => Number(b.id || 0) - Number(a.id || 0),
  id_asc: (a, b) => Number(a.id || 0) - Number(b.id || 0),
  name_asc: (a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'es'),
  name_desc: (a, b) => String(b.name || '').localeCompare(String(a.name || ''), 'es'),
  price_asc: (a, b) => Number(a.price || 0) - Number(b.price || 0),
  price_desc: (a, b) => Number(b.price || 0) - Number(a.price || 0),
  updated_desc: (a, b) => {
    const aTime = new Date(a?.specs?.__admin?.updatedAt || 0).getTime() || 0;
    const bTime = new Date(b?.specs?.__admin?.updatedAt || 0).getTime() || 0;
    return bTime - aTime;
  },
};

const STOCK_OPTIONS = [
  { value: 'in_stock', label: 'En stock' },
  { value: 'low_stock', label: 'Ultimas unidades' },
  { value: 'out_of_stock', label: 'Sin stock' },
  { value: 'on_order', label: 'Bajo pedido' },
];

const emptyForm = {
  id: null,
  name: '',
  sku: '',
  description: '',
  price: '',
  stock: '',
  stockStatus: 'in_stock',
  categoryId: '',
  brandId: '',
  isActive: true,
  isFeatured: false,
  showPrice: true,
  image: '',
};

const toSlug = (value = '') => String(value).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
const normalizeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function mapProductToForm(product) {
  return {
    id: product.id,
    name: product.name || '',
    sku: product.sku || '',
    description: product.description || '',
    price: String(product.price ?? ''),
    stock: String(product.stock ?? ''),
    stockStatus: product.stockStatus || 'in_stock',
    categoryId: String(product.categoryId || ''),
    brandId: String(product.brandId || ''),
    isActive: Boolean(product.isActive),
    isFeatured: Boolean(product.isFeatured),
    showPrice: product.showPrice !== false,
    image: product.image || '',
  };
}

export default function ProductsManager({ filters, setFilters, requestConfirm, onActivity }) {
  const {
    products,
    categories,
    brands,
    loadingState,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive,
    toggleProductFeatured,
    updateStockStatus,
  } = useAdmin();
  const { addToast } = useToast();
  const searchRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyProduct, setHistoryProduct] = useState(null);
  const modalReturnFocusRef = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [bulkPanelOpen, setBulkPanelOpen] = useState(false);
  const [bulkState, setBulkState] = useState({ pricePercent: '', brandId: '', categoryId: '', stockStatus: '', showPrice: 'noop' });

  const duplicateEnabled = isFeatureEnabled('ADMIN_PRODUCT_DUPLICATE');
  const historyEnabled = isFeatureEnabled('ADMIN_PRODUCT_HISTORY');
  const advancedBulkEnabled = isFeatureEnabled('ADMIN_BULK_ADVANCED');

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  const clearFilters = () => {
    setFilters({ ...DEFAULT_PRODUCT_FILTERS });
    setSelectedIds([]);
  };

  const safeLoadingState = loadingState || { core: false };

  const filteredProducts = useMemo(() => {
    const text = String(filters.search || '').trim().toLowerCase();
    const sorter = SORT_MAP[filters.sortBy] || SORT_MAP.id_desc;
    return [...products]
      .filter((item) => {
        if (filters.isActive !== 'all') {
          const activeFlag = filters.isActive === 'true';
          if (Boolean(item.isActive) !== activeFlag) return false;
        }
        if (filters.featured !== 'all') {
          const featuredFlag = filters.featured === 'true';
          if (Boolean(item.isFeatured) !== featuredFlag) return false;
        }
        if (filters.stockStatus !== 'all' && item.stockStatus !== filters.stockStatus) return false;
        if (filters.categoryId !== 'all' && Number(item.categoryId || 0) !== Number(filters.categoryId || 0)) return false;
        if (filters.brandId !== 'all' && Number(item.brandId || 0) !== Number(filters.brandId || 0)) return false;
        if (!text) return true;
        return `${item.name || ''} ${item.sku || ''} ${item.brand || ''}`.toLowerCase().includes(text);
      })
      .sort(sorter);
  }, [products, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / Number(filters.pageSize || 10)));
  const safePage = Math.max(1, Math.min(Number(filters.page || 1), totalPages));
  const pageItems = useMemo(() => {
    const pageSize = Number(filters.pageSize || 10);
    const start = (safePage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, filters.pageSize, safePage]);

  useEffect(() => {
    if (safePage !== filters.page) setFilters((prev) => ({ ...prev, page: safePage }));
  }, [safePage, filters.page, setFilters]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setModalOpen(false);
        setHistoryOpen(false);
      }
      if (!canUseShortcutTarget(event.target)) return;
      if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        modalReturnFocusRef.current = document.activeElement;
        setErrors({});
        setForm({ ...emptyForm });
        setModalOpen(true);
      }
      if (event.key === '/') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (modalOpen) return;
    if (modalReturnFocusRef.current && typeof modalReturnFocusRef.current.focus === 'function') {
      modalReturnFocusRef.current.focus();
      modalReturnFocusRef.current = null;
    }
  }, [modalOpen]);

  const categoryById = useMemo(() => {
    const map = new Map();
    categories.forEach((item) => map.set(Number(item.id), item.name));
    return map;
  }, [categories]);

  const brandById = useMemo(() => {
    const map = new Map();
    brands.forEach((item) => map.set(Number(item.id), item.name));
    return map;
  }, [brands]);

  const validateForm = (candidate) => {
    const nextErrors = {};
    if (!String(candidate.name || '').trim()) nextErrors.name = 'Ingresa un nombre.';
    if (!String(candidate.sku || '').trim()) nextErrors.sku = 'Ingresa SKU.';
    if (!String(candidate.categoryId || '').trim()) nextErrors.categoryId = 'Selecciona una categoria.';
    if (!String(candidate.brandId || '').trim()) nextErrors.brandId = 'Selecciona una marca.';
    const price = normalizeNumber(candidate.price, NaN);
    if (!Number.isFinite(price) || price < 0) nextErrors.price = 'Precio invalido.';
    const stock = normalizeNumber(candidate.stock, NaN);
    if (!Number.isFinite(stock) || stock < 0) nextErrors.stock = 'Stock invalido.';
    return nextErrors;
  };

  const submitForm = async (event) => {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      addToast('Revisa los campos marcados.', 'warning');
      return;
    }

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim(),
      price: normalizeNumber(form.price, 0),
      stock: normalizeNumber(form.stock, 0),
      stockStatus: form.stockStatus,
      categoryId: Number(form.categoryId),
      brandId: Number(form.brandId),
      category: categoryById.get(Number(form.categoryId)) || '',
      brand: brandById.get(Number(form.brandId)) || '',
      isActive: Boolean(form.isActive),
      isFeatured: Boolean(form.isFeatured),
      showPrice: Boolean(form.showPrice),
      image: form.image?.trim() || '',
      publishStatus: form.isActive ? 'published' : 'draft',
    };

    setSaving(true);
    try {
      if (form.id) {
        await updateProduct(form.id, payload);
        onActivity(`Producto editado: ${payload.name}`);
        addToast('Producto actualizado.', 'success');
      } else {
        await addProduct(payload);
        onActivity(`Producto creado: ${payload.name}`);
        addToast('Producto creado.', 'success');
      }
      setModalOpen(false);
    } catch {
      addToast('No se pudo guardar el producto.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (product) => {
    const approved = await requestConfirm({ title: 'Eliminar producto', description: `Se va a eliminar "${product.name}". Esta accion no se puede deshacer.`, confirmText: 'Eliminar', danger: true });
    if (!approved) return;
    try {
      await deleteProduct(product.id);
      onActivity(`Producto eliminado: ${product.name}`);
      addToast('Producto eliminado.', 'success');
      setSelectedIds((prev) => prev.filter((id) => id !== product.id));
    } catch {
      addToast('No se pudo eliminar el producto.', 'error');
    }
  };

  const onDuplicate = async (product) => {
    if (!duplicateEnabled) return;
    const payload = {
      ...product,
      name: `${product.name} (Copia)`,
      sku: `${product.sku || toSlug(product.name)}-copy-${Date.now().toString().slice(-4)}`,
      image: product.image || '',
      publishStatus: 'draft',
      isActive: false,
      isFeatured: false,
    };
    delete payload.id;
    try {
      await addProduct(payload);
      onActivity(`Producto duplicado: ${product.name}`);
      addToast('Producto duplicado en borrador.', 'success');
    } catch {
      addToast('No se pudo duplicar el producto.', 'error');
    }
  };

  const onToggleShowPrice = async (product) => {
    try {
      await updateProduct(product.id, { showPrice: product.showPrice === false });
      addToast('Visibilidad de precio actualizada.', 'success');
    } catch {
      addToast('No se pudo actualizar visibilidad de precio.', 'error');
    }
  };

  const allPageSelected = pageItems.length > 0 && pageItems.every((item) => selectedIds.includes(item.id));
  const toggleSelectPage = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageItems.some((item) => item.id === id)));
      return;
    }
    const set = new Set(selectedIds);
    pageItems.forEach((item) => set.add(item.id));
    setSelectedIds(Array.from(set));
  };

  const toggleSingleSelection = (id) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  const selectedProducts = useMemo(() => products.filter((item) => selectedIds.includes(item.id)), [products, selectedIds]);

  const runBulk = async (type) => {
    if (selectedProducts.length === 0) {
      addToast('Selecciona al menos un producto.', 'warning');
      return;
    }
    setBulkSaving(true);
    try {
      if (type === 'active') {
        await Promise.all(selectedProducts.map((item) => updateProduct(item.id, { isActive: true })));
      } else if (type === 'inactive') {
        await Promise.all(selectedProducts.map((item) => updateProduct(item.id, { isActive: false })));
      } else if (type === 'featured') {
        await Promise.all(selectedProducts.map((item) => updateProduct(item.id, { isFeatured: true })));
      } else if (type === 'unfeatured') {
        await Promise.all(selectedProducts.map((item) => updateProduct(item.id, { isFeatured: false })));
      } else if (type === 'on_order') {
        await Promise.all(selectedProducts.map((item) => updateStockStatus(item.id, 'on_order')));
      } else if (type === 'delete') {
        const approved = await requestConfirm({ title: 'Eliminar seleccion', description: `Se eliminaran ${selectedProducts.length} productos.`, confirmText: 'Eliminar', danger: true });
        if (!approved) return;
        await Promise.all(selectedProducts.map((item) => deleteProduct(item.id)));
        setSelectedIds([]);
      }
      addToast('Accion masiva aplicada.', 'success');
      onActivity(`Accion masiva: ${type} (${selectedProducts.length})`);
    } catch {
      addToast('No se pudo ejecutar la accion masiva.', 'error');
    } finally {
      setBulkSaving(false);
    }
  };

  const applyAdvancedBulk = async () => {
    if (!advancedBulkEnabled) return;
    if (selectedProducts.length === 0) {
      addToast('Selecciona productos para editar en lote.', 'warning');
      return;
    }
    const pct = bulkState.pricePercent.trim() === '' ? null : normalizeNumber(bulkState.pricePercent, 0);
    if (pct !== null && (!Number.isFinite(pct) || Math.abs(pct) > 90)) {
      addToast('El porcentaje debe estar entre -90 y 90.', 'warning');
      return;
    }
    setBulkSaving(true);
    try {
      await Promise.all(selectedProducts.map((item) => {
        const updates = {};
        if (pct !== null) updates.price = Math.max(0, Math.round(Number(item.price || 0) * (1 + pct / 100)));
        if (bulkState.brandId) {
          updates.brandId = Number(bulkState.brandId);
          updates.brand = brandById.get(Number(bulkState.brandId)) || item.brand;
        }
        if (bulkState.categoryId) {
          updates.categoryId = Number(bulkState.categoryId);
          updates.category = categoryById.get(Number(bulkState.categoryId)) || item.category;
        }
        if (bulkState.stockStatus) updates.stockStatus = bulkState.stockStatus;
        if (bulkState.showPrice === 'show') updates.showPrice = true;
        if (bulkState.showPrice === 'hide') updates.showPrice = false;
        return Object.keys(updates).length === 0 ? Promise.resolve() : updateProduct(item.id, updates);
      }));
      addToast('Edicion masiva aplicada.', 'success');
      onActivity(`Edicion masiva avanzada (${selectedProducts.length})`);
      setBulkPanelOpen(false);
    } catch {
      addToast('No se pudo aplicar la edicion masiva.', 'error');
    } finally {
      setBulkSaving(false);
    }
  };

  const openEditModal = (product) => {
    setErrors({});
    setForm(mapProductToForm(product));
    setModalOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h2 className="text-xl font-extrabold text-gray-900">Gestion de productos</h2>
        <button type="button" onClick={() => { setErrors({}); setForm({ ...emptyForm }); setModalOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">
          <Plus size={16} />
          Nuevo producto
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <label className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input ref={searchRef} value={filters.search} onChange={(event) => setFilter('search', event.target.value)} placeholder="Buscar por nombre, SKU o marca" className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-500" />
          </label>
          <select value={filters.isActive} onChange={(event) => setFilter('isActive', event.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900"><option value="all">Estado: todos</option><option value="true">Activos</option><option value="false">Inactivos</option></select>
          <select value={filters.featured} onChange={(event) => setFilter('featured', event.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900"><option value="all">Destacado: todos</option><option value="true">Destacados</option><option value="false">No destacados</option></select>
          <select value={filters.stockStatus} onChange={(event) => setFilter('stockStatus', event.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900"><option value="all">Stock: todos</option>{STOCK_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
          <select value={filters.categoryId} onChange={(event) => setFilter('categoryId', event.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900"><option value="all">Categoria: todas</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <select value={filters.brandId} onChange={(event) => setFilter('brandId', event.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900"><option value="all">Marca: todas</option>{brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <select value={filters.sortBy} onChange={(event) => setFilter('sortBy', event.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900"><option value="id_desc">Orden: mas recientes</option><option value="name_asc">Nombre A-Z</option><option value="name_desc">Nombre Z-A</option><option value="price_asc">Precio menor</option><option value="price_desc">Precio mayor</option><option value="updated_desc">Ultima actualizacion</option></select>
          <button type="button" onClick={clearFilters} className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Limpiar filtros</button>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm"><span className="text-gray-600">{filteredProducts.length} resultados</span><span className="text-gray-500">{selectedIds.length} seleccionados</span></div>
      </div>

      <div className="mt-3 rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="p-3 flex flex-wrap gap-2 border-b border-gray-200">
          <button type="button" onClick={toggleSelectPage} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">{allPageSelected ? 'Deseleccionar pagina' : 'Seleccionar producto'}</button>
          <button type="button" disabled={bulkSaving} onClick={() => runBulk('active')} className="rounded-lg bg-gray-700 px-3 py-1.5 text-sm font-bold text-white disabled:opacity-60">Activar</button>
          <button type="button" disabled={bulkSaving} onClick={() => runBulk('inactive')} className="rounded-lg bg-gray-600 px-3 py-1.5 text-sm font-bold text-white disabled:opacity-60">Desactivar</button>
          <button type="button" disabled={bulkSaving} onClick={() => runBulk('featured')} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-bold text-white disabled:opacity-60">Destacar</button>
          <button type="button" disabled={bulkSaving} onClick={() => runBulk('unfeatured')} className="rounded-lg bg-gray-700 px-3 py-1.5 text-sm font-bold text-white disabled:opacity-60">Quitar destacado</button>
          <button type="button" disabled={bulkSaving} onClick={() => runBulk('on_order')} className="rounded-lg bg-gray-700 px-3 py-1.5 text-sm font-bold text-white disabled:opacity-60">Bajo pedido</button>
          {advancedBulkEnabled && <button type="button" onClick={() => setBulkPanelOpen((prev) => !prev)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Edicion masiva avanzada</button>}
          <button type="button" disabled={bulkSaving} onClick={() => runBulk('delete')} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-bold text-white disabled:opacity-60">Eliminar seleccion</button>
        </div>

        {advancedBulkEnabled && bulkPanelOpen && (
          <div className="p-3 border-b border-gray-200 bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
            <input type="number" value={bulkState.pricePercent} onChange={(event) => setBulkState((prev) => ({ ...prev, pricePercent: event.target.value }))} placeholder="% precio (+/-)" className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500" />
            <select value={bulkState.brandId} onChange={(event) => setBulkState((prev) => ({ ...prev, brandId: event.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"><option value="">Marca (sin cambio)</option>{brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            <select value={bulkState.categoryId} onChange={(event) => setBulkState((prev) => ({ ...prev, categoryId: event.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"><option value="">Categoria (sin cambio)</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            <select value={bulkState.stockStatus} onChange={(event) => setBulkState((prev) => ({ ...prev, stockStatus: event.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"><option value="">Stock (sin cambio)</option>{STOCK_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
            <select value={bulkState.showPrice} onChange={(event) => setBulkState((prev) => ({ ...prev, showPrice: event.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"><option value="noop">Precio (sin cambio)</option><option value="show">Mostrar precio</option><option value="hide">Ocultar precio</option></select>
            <button type="button" disabled={bulkSaving} onClick={applyAdvancedBulk} className="lg:col-span-5 rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-60">Aplicar cambios avanzados</button>
          </div>
        )}

        {safeLoadingState.core ? (
          <div className="p-4"><AdminSectionLoader label="Cargando productos..." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-3"></th>
                  <th className="text-left px-3 py-3 text-xs font-bold text-gray-600 uppercase">Producto</th>
                  <th className="text-left px-3 py-3 text-xs font-bold text-gray-600 uppercase">Categoria</th>
                  <th className="text-left px-3 py-3 text-xs font-bold text-gray-600 uppercase">Precio</th>
                  <th className="text-left px-3 py-3 text-xs font-bold text-gray-600 uppercase">Stock</th>
                  <th className="text-left px-3 py-3 text-xs font-bold text-gray-600 uppercase">Estado</th>
                  <th className="text-right px-3 py-3 text-xs font-bold text-gray-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((product) => {
                  const selected = selectedIds.includes(product.id);
                  const priceVisible = product.showPrice !== false;
                  return (
                    <tr key={product.id}>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => toggleSingleSelection(product.id)}
                          aria-label={`Seleccionar ${product.name}`}
                          className={`inline-flex h-5 w-5 items-center justify-center rounded border ${selected ? 'border-red-600 bg-red-600 text-white' : 'border-gray-400 bg-white text-transparent'}`}
                        >
                          ✓
                        </button>
                      </td>
                      <td className="px-3 py-3"><p className="font-semibold text-gray-900">{product.name}</p><p className="text-xs text-gray-500">{product.brand} · {product.sku || 'Sin SKU'}</p></td>
                      <td className="px-3 py-3 text-gray-700">{product.category || '-'}</td>
                      <td className="px-3 py-3 text-gray-900 font-semibold">{priceVisible ? `$ ${Number(product.price || 0).toLocaleString('es-AR')}` : 'Oculto'}</td>
                      <td className="px-3 py-3 text-gray-700">{product.stockStatus || 'in_stock'}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => toggleProductActive(product.id)} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${product.isActive ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-700'}`}>{product.isActive ? <Eye size={12} /> : <EyeOff size={12} />}{product.isActive ? 'Activo' : 'Inactivo'}</button>
                          <button type="button" onClick={() => toggleProductFeatured(product.id)} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${product.isFeatured ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{product.isFeatured ? <Star size={12} /> : <StarOff size={12} />}{product.isFeatured ? 'Destacado' : 'Normal'}</button>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" title={priceVisible ? 'Ocultar precio' : 'Mostrar precio'} onClick={() => onToggleShowPrice(product)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900">{priceVisible ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                          {historyEnabled && <button type="button" title="Historial" onClick={() => { setHistoryProduct(product); setHistoryOpen(true); }} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"><History size={16} /></button>}
                          {duplicateEnabled && <button type="button" title="Duplicar" onClick={() => onDuplicate(product)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"><Copy size={16} /></button>}
                          <button type="button" title="Editar" onClick={() => openEditModal(product)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"><Pencil size={16} /></button>
                          <button type="button" title="Eliminar" onClick={() => onDelete(product)} className="p-2 rounded-lg text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pageItems.length === 0 && !safeLoadingState.core && <div className="px-4 py-10 text-center text-sm text-gray-500">No hay productos para estos filtros. <button type="button" onClick={clearFilters} className="text-red-600 font-semibold">Limpiar filtros</button></div>}
        <Pagination page={safePage} totalPages={totalPages} onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))} />
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4" onClick={() => !saving && setModalOpen(false)}>
          <div role="dialog" aria-modal="true" className="w-full max-w-2xl rounded-2xl bg-white border border-gray-200 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200"><h3 className="text-lg font-bold text-gray-900">{form.id ? 'Editar producto' : 'Nuevo producto'}</h3></div>
            <form onSubmit={submitForm} className="p-5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="md:col-span-2 text-sm font-semibold text-gray-700">Nombre<input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} className={`mt-1 w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 placeholder:text-gray-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />{errors.name && <span className="text-xs text-red-600">{errors.name}</span>}</label>
                <label className="text-sm font-semibold text-gray-700">Precio<input type="number" value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))} className={`mt-1 w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 placeholder:text-gray-500 ${errors.price ? 'border-red-500' : 'border-gray-300'}`} />{errors.price && <span className="text-xs text-red-600">{errors.price}</span>}</label>
                <label className="text-sm font-semibold text-gray-700">SKU<input value={form.sku} onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))} className={`mt-1 w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 placeholder:text-gray-500 ${errors.sku ? 'border-red-500' : 'border-gray-300'}`} />{errors.sku && <span className="text-xs text-red-600">{errors.sku}</span>}</label>
                <label className="text-sm font-semibold text-gray-700">Stock<input type="number" value={form.stock} onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))} className={`mt-1 w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 placeholder:text-gray-500 ${errors.stock ? 'border-red-500' : 'border-gray-300'}`} />{errors.stock && <span className="text-xs text-red-600">{errors.stock}</span>}</label>
                <label className="text-sm font-semibold text-gray-700">Categoria<select value={form.categoryId} onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))} className={`mt-1 w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}`}><option value="">Seleccionar categoria</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{errors.categoryId && <span className="text-xs text-red-600">{errors.categoryId}</span>}</label>
                <label className="text-sm font-semibold text-gray-700">Marca<select value={form.brandId} onChange={(event) => setForm((prev) => ({ ...prev, brandId: event.target.value }))} className={`mt-1 w-full px-3 py-2.5 border rounded-xl text-sm text-gray-900 ${errors.brandId ? 'border-red-500' : 'border-gray-300'}`}><option value="">Seleccionar marca</option>{brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{errors.brandId && <span className="text-xs text-red-600">{errors.brandId}</span>}</label>
                <label className="text-sm font-semibold text-gray-700">Estado stock<select value={form.stockStatus} onChange={(event) => setForm((prev) => ({ ...prev, stockStatus: event.target.value }))} className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900">{STOCK_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
                <label className="md:col-span-2 text-sm font-semibold text-gray-700">Imagen URL<input value={form.image} onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))} className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-500" /></label>
                <label className="md:col-span-2 text-sm font-semibold text-gray-700">Descripcion<textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} rows={3} className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-500" /></label>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-700"><label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))} /> Activo</label><label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm((prev) => ({ ...prev, isFeatured: event.target.checked }))} /> Destacado</label><label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.showPrice} onChange={(event) => setForm((prev) => ({ ...prev, showPrice: event.target.checked }))} /> Mostrar precio</label></div>
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => !saving && setModalOpen(false)} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancelar</button><button type="submit" disabled={saving} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">{saving ? 'Guardando...' : 'Guardar'}</button></div>
            </form>
          </div>
        </div>
      )}

      {historyOpen && historyProduct && (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4" onClick={() => setHistoryOpen(false)}>
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-gray-200 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200"><h3 className="text-lg font-bold text-gray-900">Historial de cambios</h3><p className="text-sm text-gray-500 mt-0.5">{historyProduct.name}</p></div>
            <div className="max-h-[60vh] overflow-y-auto p-5">
              {Array.isArray(historyProduct?.specs?.__admin?.versions) && historyProduct.specs.__admin.versions.length > 0 ? (
                <div className="space-y-3">{historyProduct.specs.__admin.versions.map((version, idx) => (<div key={`${historyProduct.id}-${idx}`} className="rounded-xl border border-gray-200 bg-gray-50 p-3"><p className="text-sm font-bold text-gray-900">Version anterior #{historyProduct.specs.__admin.version - idx - 1}</p><p className="text-xs text-gray-600">{formatDate(version.savedAt)} · {version.reason || 'update'}</p><div className="mt-2 text-xs text-gray-700 grid grid-cols-2 gap-2"><span>Precio: $ {Number(version.price || 0).toLocaleString('es-AR')}</span><span>Stock: {version.stock ?? '-'}</span><span>Estado: {version.publishStatus || '-'}</span><span>Precio visible: {version.showPrice === false ? 'No' : 'Si'}</span></div></div>))}</div>
              ) : (
                <p className="text-sm text-gray-600">Este producto aun no tiene versiones guardadas.</p>
              )}
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex justify-end"><button type="button" onClick={() => setHistoryOpen(false)} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cerrar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

