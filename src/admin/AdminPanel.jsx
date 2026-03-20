/**
 * Panel de Administraci�n Completo
 *
 * Administra productos, categor�as, marcas y consultas sobre la API REST.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { formatPrice, getStockLabel } from '../data/products';
import {
  LayoutDashboard, Package, Tags, Award, MessageSquare, LogOut, Plus, Pencil, Trash2, Eye, EyeOff,
  Star, StarOff, ArrowLeft, Menu, X, Save, Loader2, ChevronDown, Mail
} from 'lucide-react';

// ============ ADMIN LOGIN ============
function AdminLogin() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('admin@industrialpro.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
          <p className="text-blue-300 text-sm mt-1">Industrial Pro</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-2xl space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200 font-medium">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Ingresando...</> : 'Ingresar'}
          </button>
          <p className="text-xs text-gray-400 text-center mt-3">
            Demo: admin@industrialpro.com / admin123
          </p>
        </form>

        <div className="text-center mt-6">
          <Link to="/" className="text-blue-300 hover:text-white text-sm transition-colors flex items-center justify-center gap-1">
            <ArrowLeft size={14} /> Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============ DASHBOARD ============
function Dashboard() {
  const { getStats, apiMetrics } = useAdmin();
  const stats = getStats();

  const cards = [
    { label: 'Productos totales', value: stats.totalProducts, color: 'bg-blue-500', icon: Package },
    { label: 'Productos activos', value: stats.activeProducts, color: 'bg-green-500', icon: Eye },
    { label: 'Destacados', value: stats.featuredProducts, color: 'bg-amber-500', icon: Star },
    { label: 'Sin stock', value: stats.outOfStock, color: 'bg-red-500', icon: EyeOff },
    { label: 'Categorías', value: stats.totalCategories, color: 'bg-purple-500', icon: Tags },
    { label: 'Marcas', value: stats.totalBrands, color: 'bg-indigo-500', icon: Award },
    { label: 'Consultas pendientes', value: stats.pendingInquiries, color: 'bg-orange-500', icon: MessageSquare },
    { label: 'Consultas totales', value: stats.totalInquiries, color: 'bg-teal-500', icon: MessageSquare },
  ];
  const operationalCards = [
    { label: 'Disponibilidad API', value: apiMetrics ? `${apiMetrics.requests.availabilityPct}%` : '-', color: 'bg-emerald-500', icon: Eye },
    { label: 'P95 (ms)', value: apiMetrics ? apiMetrics.latency.p95Ms : '-', color: 'bg-cyan-500', icon: Clock },
    { label: 'Errores de ruta', value: apiMetrics ? apiMetrics.errors.route : '-', color: 'bg-rose-500', icon: MessageSquare },
    { label: 'Errores no controlados', value: apiMetrics ? apiMetrics.errors.unhandled : '-', color: 'bg-slate-600', icon: MessageSquare },
  ];

  return (
    <div>
      <h2 className="text-xl font-extrabold text-gray-900 mb-6">Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center`}>
                <c.icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{c.value}</p>
                <p className="text-xs text-gray-500">{c.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-extrabold text-gray-700 mt-8 mb-3 uppercase tracking-wide">Salud API</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {operationalCards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center`}>
                <c.icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{c.value}</p>
                <p className="text-xs text-gray-500">{c.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ PRODUCTS MANAGER ============
function ProductsManager() {
  const { products, addProduct, updateProduct, deleteProduct, toggleProductActive, toggleProductFeatured, updateStockStatus, categories, brands } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', category: '', categoryId: '', brand: '', brandId: '', description: '', image: '', sku: '', stockStatus: 'in_stock' });

  const openNew = () => {
    setForm({ name: '', price: '', category: '', categoryId: '', brand: '', brandId: '', description: '', image: '', sku: '', stockStatus: 'in_stock' });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({ name: p.name, price: p.price, category: p.category, categoryId: p.categoryId, brand: p.brand, brandId: p.brandId, description: p.description || '', image: p.image || '', sku: p.sku || '', stockStatus: p.stockStatus || 'in_stock' });
    setEditing(p.id);
    setShowForm(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const cat = categories.find((c) => c.id === Number(form.categoryId));
    const br = brands.find((b) => b.id === Number(form.brandId));
    const data = { ...form, price: Number(form.price), categoryId: Number(form.categoryId), brandId: Number(form.brandId), category: cat?.name || '', brand: br?.name || '' };

    if (editing) {
      updateProduct(editing, data);
    } else {
      addProduct(data);
    }
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h2 className="text-xl font-extrabold text-gray-900">Gestión de Productos</h2>
        <button onClick={openNew} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all">
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg my-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-bold text-gray-900">{editing ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Precio</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">SKU</label>
                  <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Categoría</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Seleccionar</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Marca</label>
                  <select value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Seleccionar</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Disponibilidad</label>
                <select value={form.stockStatus} onChange={(e) => setForm({ ...form, stockStatus: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="in_stock">En stock</option>
                  <option value="low_stock">Últimas unidades</option>
                  <option value="out_of_stock">Sin stock</option>
                  <option value="on_order">Bajo pedido</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">URL de imagen</label>
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Descripción</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all">
                <Save size={16} /> {editing ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Producto</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase hidden md:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Precio</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase hidden sm:table-cell">Stock</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Estado</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => {
                const st = getStockLabel(p.stockStatus);
                return (
                  <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${!p.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0 hidden sm:block"
                          onError={(e) => { e.target.src = 'https://placehold.co/40x40/1e40af/ffffff?text=IP'; }} />
                        <div>
                          <p className="font-semibold text-gray-900 text-xs">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.brand} · {p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 hidden md:table-cell">{p.category}</td>
                    <td className="px-4 py-3 font-bold text-gray-900 text-xs">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.className}`}>{st.text}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => toggleProductActive(p.id)} title={p.isActive ? 'Desactivar' : 'Activar'}
                          className={`p-1.5 rounded-lg transition-colors ${p.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                          {p.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button onClick={() => toggleProductFeatured(p.id)} title={p.isFeatured ? 'Quitar destacado' : 'Destacar'}
                          className={`p-1.5 rounded-lg transition-colors ${p.isFeatured ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                          {p.isFeatured ? <Star size={14} /> : <StarOff size={14} />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => { if (confirm('¿Eliminar este producto?')) deleteProduct(p.id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============ CATEGORIES MANAGER ============
function CategoriesManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '', color: 'from-blue-500 to-blue-700' });

  const openNew = () => { setForm({ name: '', icon: '📦', color: 'from-blue-500 to-blue-700' }); setEditing(null); setShowForm(true); };
  const openEdit = (c) => { setForm({ name: c.name, icon: c.icon || '', color: c.color || '' }); setEditing(c.id); setShowForm(true); };

  const handleSave = (e) => {
    e.preventDefault();
    if (editing) updateCategory(editing, form);
    else addCategory(form);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold text-gray-900">Gestión de Categorías</h2>
        <button onClick={openNew} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all">
          <Plus size={16} /> Nueva
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-bold">{editing ? 'Editar' : 'Nueva'} Categoría</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ícono (emoji)</label>
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <Save size={16} /> Guardar
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-100">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-lg`}>{c.icon}</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                <button onClick={() => { if (confirm('¿Eliminar?')) deleteCategory(c.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ BRANDS MANAGER ============
function BrandsManager() {
  const { brands, addBrand, updateBrand, deleteBrand } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '' });

  const openNew = () => { setForm({ name: '' }); setEditing(null); setShowForm(true); };
  const openEdit = (b) => { setForm({ name: b.name }); setEditing(b.id); setShowForm(true); };

  const handleSave = (e) => {
    e.preventDefault();
    if (editing) updateBrand(editing, form);
    else addBrand(form);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold text-gray-900">Gestión de Marcas</h2>
        <button onClick={openNew} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all">
          <Plus size={16} /> Nueva
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-bold">{editing ? 'Editar' : 'Nueva'} Marca</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <Save size={16} /> Guardar
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-100">
          {brands.map((b) => (
            <div key={b.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Award size={18} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{b.name}</p>
                  <p className="text-xs text-gray-500">{b.isActive ? 'Activa' : 'Inactiva'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(b)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                <button onClick={() => { if (confirm('¿Eliminar?')) deleteBrand(b.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ INQUIRIES MANAGER ============
function InquiriesManager() {
  const { inquiries, updateInquiryStatus } = useAdmin();
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const sourceLabels = {
    contact_form: { text: 'Formulario', className: 'bg-blue-100 text-blue-800' },
    whatsapp: { text: 'WhatsApp', className: 'bg-green-100 text-green-800' },
    product_page: { text: 'Producto', className: 'bg-purple-100 text-purple-800' },
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h2 className="text-xl font-extrabold text-gray-900">Consultas Recibidas</h2>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
            {inquiries.filter((i) => i.status === 'pending').length} pendientes
          </span>
          <span className="text-gray-400">·</span>
          <span>{inquiries.length} total</span>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase hidden lg:table-cell">Motivo</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Producto</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase hidden xl:table-cell">Mensaje</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Fecha</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase hidden sm:table-cell">Origen</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inquiries.map((inq) => {
                const src = sourceLabels[inq.source] || sourceLabels.product_page;
                return (
                  <tr key={inq.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleExpand(inq.id)}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 text-xs">{inq.name}</p>
                      {inq.company && <p className="text-[10px] text-gray-400 mt-0.5">{inq.company}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 hidden md:table-cell">
                      <p>{inq.email}</p>
                      {inq.phone && <p className="text-gray-400 mt-0.5">{inq.phone}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 hidden lg:table-cell">{inq.subject || '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[150px] truncate">{inq.productName}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate hidden xl:table-cell">{inq.message}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{inq.date}</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${src.className}`}>{src.text}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateInquiryStatus(inq.id, inq.status === 'pending' ? 'replied' : 'pending');
                        }}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                          inq.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {inq.status === 'pending' ? 'Pendiente' : 'Respondida'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {inquiries.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No hay consultas recibidas todavía
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded detail modal */}
      {expandedId && (() => {
        const inq = inquiries.find((i) => i.id === expandedId);
        if (!inq) return null;
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setExpandedId(null)}>
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h3 className="font-bold text-gray-900 text-sm">Detalle de consulta</h3>
                <button onClick={() => setExpandedId(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Nombre</p>
                    <p className="text-sm font-semibold text-gray-900">{inq.name}</p>
                  </div>
                  {inq.company && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Empresa</p>
                      <p className="text-sm text-gray-700">{inq.company}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Email</p>
                    <a href={`mailto:${inq.email}`} className="text-sm text-blue-600 hover:underline">{inq.email}</a>
                  </div>
                  {inq.phone && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Teléfono</p>
                      <p className="text-sm text-gray-700">{inq.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Fecha</p>
                    <p className="text-sm text-gray-700">{inq.date}</p>
                  </div>
                  {inq.subject && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Motivo</p>
                      <p className="text-sm text-gray-700">{inq.subject}</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Producto consultado</p>
                  <p className="text-sm text-gray-700">{inq.productName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Mensaje</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl leading-relaxed">{inq.message}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      updateInquiryStatus(inq.id, inq.status === 'pending' ? 'replied' : 'pending');
                      setExpandedId(null);
                    }}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      inq.status === 'pending'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    {inq.status === 'pending' ? 'Marcar como respondida' : 'Marcar como pendiente'}
                  </button>
                  <a
                    href={`mailto:${inq.email}?subject=Re: ${inq.subject || 'Consulta'} - Industrial Pro&body=Hola ${inq.name},%0A%0AGracias por tu consulta sobre ${inq.productName}.%0A%0A`}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-1.5"
                  >
                    <Mail size={14} /> Responder
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ============ MAIN ADMIN PANEL ============
export default function AdminPanel() {
  const { isAuthenticated, logout, user } = useAuth();
  const { apiError } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return <AdminLogin />;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'categories', label: 'Categorías', icon: Tags },
    { id: 'brands', label: 'Marcas', icon: Award },
    { id: 'inquiries', label: 'Consultas', icon: MessageSquare },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <ProductsManager />;
      case 'categories': return <CategoriesManager />;
      case 'brands': return <BrandsManager />;
      case 'inquiries': return <InquiriesManager />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="font-black text-sm">IP</span>
            </div>
            <div>
              <span className="font-bold text-sm block leading-none">Admin Panel</span>
              <span className="text-[10px] text-slate-400">Industrial Pro</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-slate-700 rounded"><X size={18} /></button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700 space-y-2">
          <Link to="/" className="flex items-center gap-2 px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-sm transition-all">
            <ArrowLeft size={16} /> Volver al sitio
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-xl text-sm transition-all">
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl">
            <Menu size={20} />
          </button>
          <div className="hidden lg:block">
            <h3 className="text-sm font-semibold text-gray-900">{tabs.find((t) => t.id === activeTab)?.label}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:block">{user?.email}</span>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {apiError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {apiError}
            </div>
          )}
          {renderTab()}
        </main>
      </div>
    </div>
  );
}







