import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import ToastContainer from './components/Toast';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import { logClientError } from './services/clientLogger';
import { logClientMetric } from './services/clientLogger';

const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const AdminPanel = lazy(() => import('./admin/AdminPanelV3'));
const Contact = lazy(() => import('./pages/Contact'));
const Comparator = lazy(() => import('./pages/Comparator'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RouteMetrics() {
  const location = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    logClientMetric({
      name: 'page.view',
      value: 1,
      unit: 'count',
      tags: {
        path: location.pathname,
        navType,
      },
    });
  }, [location.pathname, navType]);

  return null;
}

function RouteFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center px-4" aria-live="polite" aria-busy="true">
      <div className="text-sm font-semibold text-zinc-300">Cargando sección...</div>
    </div>
  );
}

function PublicLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-[120] bg-white text-black px-3 py-2 rounded-md">
        Saltar al contenido
      </a>
      <Navbar onCartClick={() => setCartOpen(true)} />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      <main id="main-content" className="page-enter" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.hash]);

  return null;
}

function App() {
  useEffect(() => {
    const onWindowError = (event) => {
      logClientError({
        source: 'window.error',
        message: event?.message || 'Unhandled window error',
        extra: { filename: event?.filename, lineno: event?.lineno, colno: event?.colno },
      });
    };

    const onUnhandledRejection = (event) => {
      const reason = event?.reason;
      logClientError({
        source: 'window.unhandledrejection',
        message: reason?.message || String(reason || 'Unhandled promise rejection'),
        requestId: reason?.requestId,
      });
    };

    window.addEventListener('error', onWindowError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onWindowError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AdminProvider>
            <CartProvider>
              <div className="min-h-screen bg-zinc-950" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                <ScrollToTop />
                <RouteMetrics />
                <ToastContainer />
                <Routes>
                  <Route path="/admin/*" element={<Suspense fallback={<RouteFallback />}><AdminPanel /></Suspense>} />
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Suspense fallback={<RouteFallback />}><Home /></Suspense>} />
                    <Route path="/productos" element={<Suspense fallback={<RouteFallback />}><Products /></Suspense>} />
                    <Route path="/producto/:id" element={<Suspense fallback={<RouteFallback />}><ProductDetail /></Suspense>} />
                    <Route path="/contacto" element={<Suspense fallback={<RouteFallback />}><Contact /></Suspense>} />
                    <Route path="/comparar" element={<Suspense fallback={<RouteFallback />}><Comparator /></Suspense>} />
                    <Route path="*" element={<Suspense fallback={<RouteFallback />}><NotFound /></Suspense>} />
                  </Route>
                </Routes>
              </div>
            </CartProvider>
          </AdminProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
