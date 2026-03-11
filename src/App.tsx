import { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import ToastContainer from './components/Toast';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import AdminPanel from './admin/AdminPanel';
import Contact from './pages/Contact';
import Comparator from './pages/Comparator';
import NotFound from './pages/NotFound';

function PublicLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <>
      <Navbar onCartClick={() => setCartOpen(true)} />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      <div className="page-enter">
        <Outlet />
      </div>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AdminProvider>
            <CartProvider>
              <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                <ToastContainer />
                <Routes>
                  <Route path="/admin/*" element={<AdminPanel />} />
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/productos" element={<Products />} />
                    <Route path="/producto/:id" element={<ProductDetail />} />
                    <Route path="/contacto" element={<Contact />} />
                    <Route path="/comparar" element={<Comparator />} />
                    <Route path="*" element={<NotFound />} />
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
