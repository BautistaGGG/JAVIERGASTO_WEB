import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingCart, X, ArrowLeft, GitCompareArrows, Plus } from 'lucide-react';
import { products, formatPrice, getStockLabel, WHATSAPP_NUMBER } from '../data/products';
import { buildComparisonWhatsAppMessage, openTrackedWhatsApp } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Breadcrumbs from '../components/Breadcrumbs';
import WhatsAppIcon from '../components/WhatsAppIcon';

const COMPARE_KEY = 'industrialpro_compare';

export function useComparator() {
  const { addToast } = useToast();
  const [compareIds, setCompareIds] = useState(() => {
    try {
      const saved = localStorage.getItem(COMPARE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(compareIds));
  }, [compareIds]);

  const toggleCompare = (id) => {
    let toastConfig = null;
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        toastConfig = { message: 'Producto quitado de comparacion.', type: 'info' };
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 4) {
        toastConfig = { message: 'Podes comparar hasta 4 productos.', type: 'warning' };
        return prev;
      }
      toastConfig = { message: 'Producto agregado a comparacion.', type: 'success' };
      return [...prev, id];
    });
    if (toastConfig) addToast(toastConfig.message, toastConfig.type);
  };

  const removeFromCompare = (id) => {
    setCompareIds((prev) => prev.filter((x) => x !== id));
    addToast('Producto quitado de comparacion.', 'info');
  };

  const clearCompare = () => {
    setCompareIds((prev) => {
      if (prev.length > 0) addToast('Comparacion limpiada.', 'info');
      return [];
    });
  };
  const isInCompare = (id) => compareIds.includes(id);

  return { compareIds, toggleCompare, removeFromCompare, clearCompare, isInCompare };
}

export function CompareBar({ compareIds, onClear }) {
  if (compareIds.length === 0) return null;

  const compareProducts = compareIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t-2 border-red-600 shadow-2xl z-50 animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0 overflow-x-auto">
            <GitCompareArrows size={20} className="text-red-600 shrink-0" />
            <span className="text-sm font-bold text-zinc-100 shrink-0">
              Comparar ({compareIds.length}/4):
            </span>
            <div className="flex gap-2">
              {compareProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-1.5 bg-red-950/50 rounded-lg px-2 py-1 shrink-0">
                  <img src={p.image} alt="" className="w-6 h-6 rounded object-cover"
                    onError={(e) => { e.target.src = 'https://placehold.co/24x24/1e40af/ffffff?text=IP'; }} />
                  <span className="text-xs font-medium text-red-300 max-w-[100px] truncate">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/comparar?ids=${compareIds.join(',')}`}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center gap-1.5"
            >
              <GitCompareArrows size={16} />
              Comparar
            </Link>
            <button
              onClick={onClear}
              className="p-2.5 text-zinc-500 hover:text-red-500 hover:bg-red-950/50 rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Comparator() {
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const ids = (searchParams.get('ids') || '')
    .split(',')
    .map(Number)
    .filter(Boolean);

  const compareProducts = ids
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  if (compareProducts.length < 2) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-zinc-950 px-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <GitCompareArrows size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl font-extrabold text-zinc-100 mb-2">Seleccioná al menos 2 productos</h2>
          <p className="text-sm text-zinc-400 mb-6">Volvé al catálogo y usá el botón de comparar en cada producto</p>
          <Link
            to="/productos"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all"
          >
            <ArrowLeft size={16} /> Ir al catálogo
          </Link>
        </div>
      </div>
    );
  }

  // Collect all spec keys
  const allSpecKeys = [...new Set(compareProducts.flatMap((p) => Object.keys(p.specs || {})))];

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Breadcrumbs items={[
        { label: 'Productos', path: '/productos' },
        { label: 'Comparar productos' },
      ]} />

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100">Comparar Productos</h1>
            <p className="text-sm text-zinc-400 mt-1">Comparando {compareProducts.length} productos</p>
          </div>
          <Link
            to="/productos"
            className="text-sm text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
          >
            <Plus size={14} /> Agregar más
          </Link>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${compareProducts.length}, minmax(200px, 1fr))` }}>
              {/* Images */}
              {compareProducts.map((p) => (
                <div key={p.id} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden animate-fade-in-up">
                  <div className="aspect-[4/3] overflow-hidden bg-zinc-800">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = `https://placehold.co/400x300/1e40af/ffffff?text=${encodeURIComponent(p.name.slice(0, 15))}`; }}
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-bold text-red-400 uppercase">{p.brand}</span>
                    <h3 className="text-sm font-bold text-zinc-100 mt-1 leading-snug">{p.name}</h3>
                    <p className="text-2xl font-extrabold text-zinc-100 mt-2">{p.showPrice === false ? 'Precio a consultar' : formatPrice(p.price)}</p>
                    <p className="text-[10px] text-zinc-500">{p.showPrice === false ? 'Consultar por WhatsApp' : '+ IVA'}</p>
                    <button
                      onClick={() => handleAddToCart(p)}
                      className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold mt-3 transition-all active:scale-[0.98]"
                    >
                      <ShoppingCart size={14} />
                      Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Specs Rows */}
            <div className="mt-6 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              {/* Stock */}
              <div className={`grid border-b border-zinc-800`} style={{ gridTemplateColumns: `180px repeat(${compareProducts.length}, 1fr)` }}>
                <div className="px-4 py-3 bg-zinc-950 text-xs font-bold text-zinc-300 flex items-center">Disponibilidad</div>
                {compareProducts.map((p) => {
                  const s = getStockLabel(p.stockStatus);
                  return (
                    <div key={p.id} className="px-4 py-3 flex items-center border-l border-zinc-800">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.className}`}>{s.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Category */}
              <div className={`grid border-b border-zinc-800`} style={{ gridTemplateColumns: `180px repeat(${compareProducts.length}, 1fr)` }}>
                <div className="px-4 py-3 bg-zinc-950 text-xs font-bold text-zinc-300 flex items-center">Categoría</div>
                {compareProducts.map((p) => (
                  <div key={p.id} className="px-4 py-3 text-sm text-zinc-300 border-l border-zinc-800 flex items-center">{p.category}</div>
                ))}
              </div>

              {/* SKU */}
              <div className={`grid border-b border-zinc-800`} style={{ gridTemplateColumns: `180px repeat(${compareProducts.length}, 1fr)` }}>
                <div className="px-4 py-3 bg-zinc-950 text-xs font-bold text-zinc-300 flex items-center">SKU</div>
                {compareProducts.map((p) => (
                  <div key={p.id} className="px-4 py-3 text-sm text-zinc-400 font-mono border-l border-zinc-800 flex items-center">{p.sku}</div>
                ))}
              </div>

              {/* Dynamic specs */}
              {allSpecKeys.map((key) => (
                <div key={key} className={`grid border-b border-zinc-800 last:border-b-0`} style={{ gridTemplateColumns: `180px repeat(${compareProducts.length}, 1fr)` }}>
                  <div className="px-4 py-3 bg-zinc-950 text-xs font-bold text-zinc-300 flex items-center">{key}</div>
                  {compareProducts.map((p) => (
                    <div key={p.id} className="px-4 py-3 text-sm text-zinc-300 border-l border-zinc-800 flex items-center">
                      {p.specs?.[key] || <span className="text-zinc-500">—</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <div className="mt-6 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center">
              <h3 className="text-base font-bold text-zinc-100 mb-2">¿Necesitás ayuda para decidir?</h3>
              <p className="text-sm text-zinc-300 mb-4">Nuestros asesores técnicos pueden orientarte según tu aplicación</p>
              <button
                onClick={() => {
                  const msg = buildComparisonWhatsAppMessage(compareProducts);
                  openTrackedWhatsApp({
                    phone: WHATSAPP_NUMBER,
                    message: msg,
                    source: 'compare_cta',
                    metadata: { comparedCount: compareProducts.length },
                  });
                  addToast('Abriendo WhatsApp para asesorarte en la comparacion.', 'info');
                }}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all"
              >
                <WhatsAppIcon size={16} />
                Consultar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}











