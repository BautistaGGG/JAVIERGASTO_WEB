import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, BookOpen, Clock, LayoutDashboard, LogOut, Menu, MessageSquare, Package, Tags, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import ConfirmModal from './components/ConfirmModal';
import AdminLogin from './components/AdminLogin';
import AdminSectionLoader from './components/AdminSectionLoader';
import { DEFAULT_INQUIRY_FILTERS, DEFAULT_PRODUCT_FILTERS } from './components/shared';
import BrandWordmark from '../components/BrandWordmark';

const Dashboard = lazy(() => import('./components/Dashboard'));
const ProductsManager = lazy(() => import('./components/ProductsManager'));
const SimpleManager = lazy(() => import('./components/SimpleManager'));
const InquiriesManager = lazy(() => import('./components/InquiriesManager'));
const AuditManager = lazy(() => import('./components/AuditManager'));
const Glossary = lazy(() => import('./components/Glossary'));

const TAB_IDS = ['dashboard', 'products', 'categories', 'brands', 'inquiries', 'audit', 'glossary'];
const createSearchParams = () => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');

const parseIntFilter = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.trunc(parsed));
};

const readFiltersFromQuery = (searchParams, defaults, prefix) => {
  const next = { ...defaults };
  for (const key of Object.keys(defaults)) {
    const raw = searchParams.get(`${prefix}${key}`);
    if (raw === null) continue;
    if (key === 'page' || key === 'pageSize') next[key] = parseIntFilter(raw, defaults[key]);
    else next[key] = raw;
  }
  return next;
};

const isEqualShallow = (a, b) => Object.keys(a).every((key) => String(a[key]) === String(b[key]));

export default function AdminPanelV3() {
  const { isAuthenticated, logout, user } = useAuth();
  const {
    apiError,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    brands,
    addBrand,
    updateBrand,
    deleteBrand,
    inquiries,
    dataLoaded,
    loadingState,
    loadInquiries,
    loadMetrics,
    loadAuditEvents,
  } = useAdmin();
  const safeLoadingState = loadingState || { core: false, inquiries: false, metrics: false, audit: false };
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeBrands = Array.isArray(brands) ? brands : [];
  const safeInquiries = Array.isArray(inquiries) ? inquiries : [];
  const [searchParams, setSearchParams] = useState(() => createSearchParams());

  const updateSearchParams = useCallback((nextParams, { replace = true } = {}) => {
    const nextSearch = nextParams.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash || ''}`;
    if (replace) window.history.replaceState(window.history.state, '', nextUrl);
    else window.history.pushState(window.history.state, '', nextUrl);
    setSearchParams(new URLSearchParams(nextSearch));
  }, []);

  const [activeTab, setActiveTab] = useState(() => {
    const fromUrl = searchParams.get('tab');
    return TAB_IDS.includes(fromUrl) ? fromUrl : 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productFilters, setProductFilters] = useState(() => readFiltersFromQuery(searchParams, DEFAULT_PRODUCT_FILTERS, 'p_'));
  const [inquiryFilters, setInquiryFilters] = useState(() => readFiltersFromQuery(searchParams, DEFAULT_INQUIRY_FILTERS, 'q_'));
  const [activityLog, setActivityLog] = useState(() => {
    try {
      const raw = localStorage.getItem('admin_activity_log');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const querySnapshot = useMemo(() => searchParams.toString(), [searchParams]);

  useEffect(() => {
    const onPopState = () => setSearchParams(createSearchParams());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    const nextTab = TAB_IDS.includes(tabFromUrl) ? tabFromUrl : 'dashboard';
    setActiveTab((prev) => (prev === nextTab ? prev : nextTab));

    const nextProductFilters = readFiltersFromQuery(searchParams, DEFAULT_PRODUCT_FILTERS, 'p_');
    setProductFilters((prev) => (isEqualShallow(nextProductFilters, prev) ? prev : nextProductFilters));

    const nextInquiryFilters = readFiltersFromQuery(searchParams, DEFAULT_INQUIRY_FILTERS, 'q_');
    setInquiryFilters((prev) => (isEqualShallow(nextInquiryFilters, prev) ? prev : nextInquiryFilters));
  }, [searchParams]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', activeTab);

    for (const [key, value] of Object.entries(productFilters)) {
      nextParams.set(`p_${key}`, String(value));
    }

    for (const [key, value] of Object.entries(inquiryFilters)) {
      nextParams.set(`q_${key}`, String(value));
    }

    const nextSnapshot = nextParams.toString();
    if (nextSnapshot !== querySnapshot) {
      updateSearchParams(nextParams, { replace: true });
    }
  }, [activeTab, inquiryFilters, productFilters, querySnapshot, searchParams, updateSearchParams]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'dashboard') {
      if (typeof loadInquiries === 'function') void loadInquiries();
      if (typeof loadMetrics === 'function') void loadMetrics();
      return;
    }
    if (activeTab === 'inquiries') {
      if (typeof loadInquiries === 'function') void loadInquiries();
      return;
    }
    if (activeTab === 'audit') {
      if (typeof loadAuditEvents === 'function') void loadAuditEvents();
    }
  }, [activeTab, isAuthenticated, loadAuditEvents, loadInquiries, loadMetrics]);

  const onActivity = useCallback((title) => {
    setActivityLog((prev) => {
      const next = [{ id: `${Date.now()}-${Math.random()}`, title, at: new Date().toISOString() }, ...prev].slice(0, 20);
      try {
        localStorage.setItem('admin_activity_log', JSON.stringify(next));
      } catch {
      }
      return next;
    });
  }, []);

  const confirmResolverRef = useRef(null);
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    description: '',
    confirmText: 'Confirmar',
    danger: false,
  });

  const requestConfirm = useCallback((config) => {
    return new Promise((resolve) => {
      confirmResolverRef.current = resolve;
      setConfirmState({
        open: true,
        title: config.title || 'Confirmar accion',
        description: config.description || '',
        confirmText: config.confirmText || 'Confirmar',
        danger: Boolean(config.danger),
      });
    });
  }, []);

  const closeConfirm = useCallback((approved) => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(approved);
      confirmResolverRef.current = null;
    }
    setConfirmState((prev) => ({ ...prev, open: false }));
  }, []);

  if (!isAuthenticated) return <AdminLogin />;

  const tabs = [
    { id: 'dashboard', label: 'Panel general', icon: LayoutDashboard },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'categories', label: 'Categorias', icon: Tags },
    { id: 'brands', label: 'Marcas', icon: Award },
    { id: 'inquiries', label: 'Consultas', icon: MessageSquare },
    { id: 'audit', label: 'Auditoria', icon: Clock },
    { id: 'glossary', label: 'Glosario', icon: BookOpen },
  ];

  const renderTab = () => {
    if (!dataLoaded) {
      return <AdminSectionLoader label="Cargando datos base del panel..." />;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Suspense fallback={<AdminSectionLoader label="Cargando panel general..." />}>
            <Dashboard inquiries={safeInquiries} activityLog={activityLog} />
          </Suspense>
        );
      case 'products':
        return (
          <Suspense fallback={<AdminSectionLoader label="Cargando productos..." />}>
            <ProductsManager filters={productFilters} setFilters={setProductFilters} requestConfirm={requestConfirm} onActivity={onActivity} />
          </Suspense>
        );
      case 'categories':
        return (
          <Suspense fallback={<AdminSectionLoader label="Cargando categorias..." />}>
            <SimpleManager
              title="Categorias"
              items={safeCategories}
              openLabel="Nueva"
              onCreate={addCategory}
              onUpdate={updateCategory}
              onDelete={deleteCategory}
              getMainText={(item) => item.name}
              getSubText={(item) => item.slug || ''}
              requestConfirm={requestConfirm}
              onActivity={onActivity}
              isLoading={!dataLoaded && safeLoadingState.core}
            />
          </Suspense>
        );
      case 'brands':
        return (
          <Suspense fallback={<AdminSectionLoader label="Cargando marcas..." />}>
            <SimpleManager
              title="Marcas"
              items={safeBrands}
              openLabel="Nueva"
              onCreate={addBrand}
              onUpdate={updateBrand}
              onDelete={deleteBrand}
              getMainText={(item) => item.name}
              getSubText={(item) => (item.isActive ? 'Activa' : 'Inactiva')}
              requestConfirm={requestConfirm}
              onActivity={onActivity}
              isLoading={!dataLoaded && safeLoadingState.core}
            />
          </Suspense>
        );
      case 'inquiries':
        return (
          <Suspense fallback={<AdminSectionLoader label="Cargando consultas..." />}>
            <InquiriesManager filters={inquiryFilters} setFilters={setInquiryFilters} onActivity={onActivity} />
          </Suspense>
        );
      case 'audit':
        return (
          <Suspense fallback={<AdminSectionLoader label="Cargando auditoria..." />}>
            <AuditManager />
          </Suspense>
        );
      case 'glossary':
        return (
          <Suspense fallback={<AdminSectionLoader label="Cargando glosario..." />}>
            <Glossary />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<AdminSectionLoader label="Cargando panel general..." />}>
            <Dashboard inquiries={inquiries} activityLog={activityLog} />
          </Suspense>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
              <span className="font-black text-sm">HG</span>
            </div>
            <div>
              <span className="font-bold text-sm block leading-none">Admin Panel</span>
              <BrandWordmark compact textClassName="text-[11px]" />
            </div>
          </div>
          <button
            type="button"
            aria-label="Cerrar menu"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-gray-700 rounded"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                const nextParams = new URLSearchParams(searchParams);
                nextParams.set('tab', tab.id);
                updateSearchParams(nextParams, { replace: true });
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-700 space-y-2">
          <Link to="/" className="flex items-center gap-2 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl text-sm transition-all">
            <ArrowLeft size={16} /> Volver al sitio
          </Link>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-xl text-sm transition-all"
          >
            <LogOut size={16} /> Cerrar sesion
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <button type="button" aria-label="Abrir menu" onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl">
            <Menu size={20} />
          </button>
          <div className="hidden lg:block">
            <h3 className="text-sm font-semibold text-gray-900">{tabs.find((item) => item.id === activeTab)?.label}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:block">{user?.email}</span>
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {apiError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{apiError}</div>}
          {renderTab()}
        </main>
      </div>

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        confirmText={confirmState.confirmText}
        danger={confirmState.danger}
        onConfirm={() => closeConfirm(true)}
        onCancel={() => closeConfirm(false)}
      />
    </div>
  );
}
