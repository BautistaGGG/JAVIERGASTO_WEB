import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import SearchAutocomplete from './SearchAutocomplete';
import BrandWordmark from './BrandWordmark';

export default function Navbar({ onCartClick }) {
  const { getItemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [prevCount, setPrevCount] = useState(0);
  const [cartPop, setCartPop] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const count = getItemCount();

  // Animate cart counter on change
  useEffect(() => {
    if (count > prevCount) {
      setCartPop(true);
      const t = setTimeout(() => setCartPop(false), 400);
      return () => clearTimeout(t);
    }
    setPrevCount(count);
  }, [count]);

  useEffect(() => {
    setPrevCount(count);
  }, []);

  // Generic scroll-to-section handler
  const handleScrollTo = (sectionId) => (e) => {
    e.preventDefault();
    setMenuOpen(false);

    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50 shadow-sm">
      {/* Main navbar */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <BrandWordmark textClassName="text-base sm:text-lg" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/productos" className="px-3 py-2 text-sm font-medium text-zinc-200 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-all">
              Productos
            </Link>
            <a
              href="#faq"
              onClick={handleScrollTo('faq')}
              className="px-3 py-2 text-sm font-medium text-zinc-200 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-all cursor-pointer"
            >
              Preguntas Frecuentes
            </a>
            <a
              href="#nosotros"
              onClick={handleScrollTo('nosotros')}
              className="px-3 py-2 text-sm font-medium text-zinc-200 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-all cursor-pointer"
            >
              Nosotros
            </a>
            <Link to="/contacto" className="px-3 py-2 text-sm font-medium text-zinc-200 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-all">
              Contacto
            </Link>
          </div>

          {/* Desktop search with autocomplete */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
            <SearchAutocomplete />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="lg:hidden p-2.5 text-zinc-300 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-all"
            >
              <Search size={22} />
            </button>

            <button
              onClick={onCartClick}
              className="relative p-2.5 text-zinc-300 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-all"
            >
              <ShoppingCart size={22} />
              {count > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-lg ${cartPop ? 'animate-cart-pop' : ''}`}>
                  {count}
                </span>
              )}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2.5 text-zinc-300 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-all"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search with autocomplete */}
      {searchOpen && (
        <div className="lg:hidden border-t border-zinc-800 p-3 bg-zinc-950 animate-fade-in">
          <SearchAutocomplete mobile onNavigate={() => setSearchOpen(false)} />
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-900 shadow-lg animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            <Link to="/productos" onClick={() => setMenuOpen(false)} className="block px-3 py-3 text-zinc-200 hover:bg-zinc-800 rounded-xl font-medium">
              Productos
            </Link>
            <a
              href="#faq"
              onClick={handleScrollTo('faq')}
              className="block px-3 py-3 text-zinc-200 hover:bg-zinc-800 rounded-xl font-medium cursor-pointer"
            >
              Preguntas Frecuentes
            </a>
            <a
              href="#nosotros"
              onClick={handleScrollTo('nosotros')}
              className="block px-3 py-3 text-zinc-200 hover:bg-zinc-800 rounded-xl font-medium cursor-pointer"
            >
              Nosotros
            </a>
            <Link to="/contacto" onClick={() => setMenuOpen(false)} className="block px-3 py-3 text-zinc-200 hover:bg-zinc-800 rounded-xl font-medium">
              Contacto
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}


