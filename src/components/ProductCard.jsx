import { Link } from 'react-router-dom';
import { ShoppingCart, Package, GitCompareArrows } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, getStockLabel, WHATSAPP_NUMBER } from '../data/products';
import { buildProductInquiryWhatsAppMessage, generateWhatsAppLink } from '../services/productService';
import ProductBadge from './ProductBadge';
import LazyImage from './LazyImage';
import WhatsAppIcon from './WhatsAppIcon';
import ShareButton from './ShareButton';

const getStockDisplay = (product) => {
  const stock = product.stock ?? 0;
  if (stock === 0) return { text: 'Sin stock', color: 'text-red-600', bg: 'bg-red-50', icon: '⛔', accent: 'border-red-200' };
  if (stock <= 5) return { text: `¡Solo ${stock} disponibles!`, color: 'text-amber-700', bg: 'bg-amber-50', icon: '⚠️', accent: 'border-amber-200' };
  if (stock <= 20) return { text: `${stock} unidades disponibles`, color: 'text-blue-700', bg: 'bg-blue-50', icon: '📦', accent: 'border-blue-200' };
  return { text: `${stock} unidades en stock`, color: 'text-green-700', bg: 'bg-green-50', icon: '✅', accent: 'border-green-200' };
};

export default function ProductCard({ product, isInCompare, onToggleCompare }) {
  const { addToCart } = useCart();
  const stockLabel = getStockLabel(product.stockStatus);
  const stockDisplay = getStockDisplay(product);

  const handleWhatsApp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const msg = buildProductInquiryWhatsAppMessage({
      name: product.name,
      sku: product.sku,
      priceText: formatPrice(product.price),
    });
    window.open(generateWhatsAppLink(WHATSAPP_NUMBER, msg), '_blank');
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) addToCart(product);
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleCompare) onToggleCompare(product.id);
  };

  return (
    <Link to={`/producto/${product.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm card-hover h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <LazyImage
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover img-zoom"
            fallbackText={product.name.slice(0, 15)}
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.badge && <ProductBadge badge={product.badge} />}
            {product.isFeatured && !product.badge && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-lg">
                Destacado
              </span>
            )}
          </div>
          <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${stockLabel.className}`}>
            {stockLabel.text}
          </span>

          <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
            <ShareButton product={product} variant="icon" />
            {onToggleCompare && (
              <button
                onClick={handleCompare}
                className={`p-2 rounded-lg shadow-lg transition-all ${
                  isInCompare
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/90 text-gray-600 hover:bg-blue-600 hover:text-white'
                }`}
                title={isInCompare ? 'Quitar de comparación' : 'Agregar a comparación'}
              >
                <GitCompareArrows size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{product.brand}</span>
          <h3 className="text-sm font-bold text-gray-900 mt-1 line-clamp-2 group-hover:text-blue-700 transition-colors leading-snug">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{product.category}</p>

          <div className="mt-auto pt-3">
            <p className="text-2xl font-extrabold text-gray-900">{formatPrice(product.price)}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">+ IVA | Precio unitario</p>
          </div>

          <div className={`mt-2 flex items-center gap-1.5 px-3 py-2 rounded-lg border ${stockDisplay.bg} ${stockDisplay.accent}`}>
            <Package size={13} className={stockDisplay.color} />
            <span className={`text-xs font-semibold ${stockDisplay.color}`}>
              {stockDisplay.text}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all btn-press shadow-sm hover:shadow-md ${
                product.stock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <ShoppingCart size={16} />
              {product.stock === 0 ? 'Sin stock' : 'Agregar a cotización'}
            </button>
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-xs font-semibold transition-all btn-press"
            >
              <WhatsAppIcon size={14} />
              Consultar por WhatsApp
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
