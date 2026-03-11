import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, X } from 'lucide-react';
import { products, formatPrice } from '../data/products';

export default function SearchAutocomplete({ onNavigate, mobile = false }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const results = query.trim().length >= 2
    ? products
        .filter((product) => {
          if (!product.isActive) return false;
          const normalized = query.toLowerCase();
          return (
            product.name.toLowerCase().includes(normalized) ||
            product.brand.toLowerCase().includes(normalized) ||
            product.sku.toLowerCase().includes(normalized) ||
            product.category.toLowerCase().includes(normalized)
          );
        })
        .slice(0, 6)
    : [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedIndex(-1);
    setOpen(query.trim().length >= 2);
  }, [query]);

  const goToProduct = (product) => {
    setQuery('');
    setOpen(false);
    navigate(`/producto/${product.id}`);
    if (onNavigate) onNavigate();
  };

  const goToSearch = () => {
    if (!query.trim()) return;
    navigate(`/productos?q=${encodeURIComponent(query.trim())}`);
    setQuery('');
    setOpen(false);
    if (onNavigate) onNavigate();
  };

  const handleKeyDown = (event) => {
    if (!open) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        goToProduct(results[selectedIndex]);
      } else {
        goToSearch();
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${mobile ? 'w-full' : 'flex-1 max-w-md'}`}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          goToSearch();
        }}
        className="relative"
      >
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => { if (query.trim().length >= 2) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar productos, marcas..."
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-[100] animate-fade-in-up">
          {results.length === 0 ? (
            <div className="px-4 py-4">
              <p className="text-sm font-medium text-gray-700">No encontramos resultados para "{query}".</p>
              <p className="text-xs text-gray-500 mt-1">Probá con otra marca, nombre o SKU.</p>
            </div>
          ) : results.map((product, index) => (
            <button
              key={product.id}
              onClick={() => goToProduct(product)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
              } ${index > 0 ? 'border-t border-gray-100' : ''}`}
            >
              <img
                src={product.image}
                alt=""
                className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                onError={(event) => { event.target.src = 'https://placehold.co/40x40/1e40af/ffffff?text=IP'; }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-500">{product.brand} · {product.category}</p>
              </div>
              <span className="text-sm font-bold text-blue-700 shrink-0">{formatPrice(product.price)}</span>
            </button>
          ))}
          <button
            onClick={goToSearch}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 border-t border-gray-200 transition-colors"
          >
            Ver todos los resultados para "{query}"
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
