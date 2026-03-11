import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, ChevronRight, Plus, Minus, AlertTriangle, CheckCircle, FileText, Settings, Truck, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { products, formatPrice, getStockLabel, WHATSAPP_NUMBER } from '../data/products';
import { buildProductInquiryWhatsAppMessage, generateWhatsAppLink } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductBadge from '../components/ProductBadge';
import ShippingCalculator from '../components/ShippingCalculator';
import WhatsAppIcon from '../components/WhatsAppIcon';
import ShareButton from '../components/ShareButton';
import { SkeletonDetail } from '../components/SkeletonCard';

const getStockInfo = (product) => {
  if (stock === 0) return { text: 'Sin stock disponible', sub: 'Consultá por WhatsApp para pedido especial', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: 'alert' };
  if (stock <= 5) return { text: `¡Solo quedan ${stock} unidades!`, sub: 'Consultá ahora para asegurar tu pedido', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: 'alert' };
  if (stock <= 20) return { text: `${stock} unidades disponibles`, sub: 'Stock limitado • Entrega inmediata', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: 'check' };
  return { text: `${stock} unidades en stock`, sub: 'Disponibilidad inmediata • Gran stock', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: 'check' };
};

const TABS = [
  { id: 'description', label: 'Descripción', icon: FileText },
  { id: 'specs', label: 'Especificaciones', icon: Settings },
  { id: 'shipping', label: 'Envío', icon: Truck },
];

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    setLoading(true);
    setSelectedImage(0);
    setQuantity(1);
    setActiveTab('description');
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [id]);

  const product = products.find((p) => p.id === Number(id));

  if (loading) return <SkeletonDetail />;

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
          <Link to="/productos" className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
            ← Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const stock = getStockLabel(product.stockStatus);
  const related = products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.isActive).slice(0, 4);
  const images = product.images?.length > 0 ? product.images : [product.image];
  const stockInfo = getStockInfo(product);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1);
  };

  const handleWhatsApp = () => {
    const msg = buildProductInquiryWhatsAppMessage({
      name: product.name,
      sku: product.sku,
      priceText: formatPrice(product.price),
      quantity,
    });
    window.open(generateWhatsAppLink(WHATSAPP_NUMBER, msg), '_blank');
  };

  const nextImage = () => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  const prevImage = () => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumbs items={[
        { label: 'Productos', path: '/productos' },
        { label: product.category, path: `/productos?cat=${product.categoryId}` },
        { label: product.name },
      ]} />

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* Section */}
            <div className="p-4 md:p-6 lg:p-8 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200">
              {/* Section */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white mb-3 group">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = `https://placehold.co/800x600/1e40af/ffffff?text=${encodeURIComponent(product.name.slice(0, 20))}`;
                  }}
                />
                {/* Section */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {product.badge && <ProductBadge badge={product.badge} />}
                  {product.isFeatured && !product.badge && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-lg">
                      Destacado
                    </span>
                  )}
                </div>

                {/* Section */}
                {images.length > 1 && (
                  <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {selectedImage + 1} / {images.length}
                  </span>
                )}

                {/* Section */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Section */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === i ? 'border-blue-600 shadow-md scale-105' : 'border-gray-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { e.target.src = 'https://placehold.co/80x80/1e40af/ffffff?text=IP'; }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Section */}
            <div className="p-5 md:p-6 lg:p-8 flex flex-col">
              {/* Section */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">{product.brand}</span>
                    <span className="text-gray-300">?</span>
                    <span className="text-xs text-gray-500">SKU: {product.sku}</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>
                </div>
                <ShareButton product={product} variant="full" />
              </div>

              {/* Section */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${stock.className}`}>
                  {stock.text}
                </span>
                <span className="text-xs text-gray-400">{product.category}</span>
                {product.badge && <ProductBadge badge={product.badge} />}
              </div>

              {/* Section */}
              <div className="mt-5 pb-5 border-b border-gray-200">
                <p className="text-3xl md:text-4xl font-extrabold text-gray-900">{formatPrice(product.price)}</p>
                <p className="text-xs text-gray-400 mt-1">+ IVA • Precio unitario</p>
              </div>

              {/* Section */}
              <div className={`mt-4 flex items-start gap-3 p-3 rounded-xl border ${stockInfo.bg} ${stockInfo.border}`}>
                {stockInfo.icon === 'alert' ? (
                  <AlertTriangle size={18} className={`${stockInfo.color} shrink-0 mt-0.5`} />
                ) : (
                  <CheckCircle size={18} className={`${stockInfo.color} shrink-0 mt-0.5`} />
                )}
                <div>
                  <p className={`text-sm font-bold ${stockInfo.color}`}>{stockInfo.text}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stockInfo.sub}</p>
                </div>
              </div>

              {/* Section */}
              <div className="mt-auto pt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700">Cantidad:</span>
                  <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3 hover:bg-gray-200 transition-colors">
                      <Minus size={16} />
                    </button>
                    <span className="px-5 py-2 font-bold text-center min-w-[50px]">{quantity}</span>
                    <button onClick={() => setQuantity((q) => q + 1)} className="p-3 hover:bg-gray-200 transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-gray-400 ml-auto">{formatPrice(product.price * quantity)}</span>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all btn-press shadow-lg hover:shadow-xl ${
                    product.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <ShoppingCart size={20} />
                  {product.stock === 0 ? 'Sin stock' : 'Agregar a cotización'}
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all btn-press"
                >
                  <WhatsAppIcon size={18} />
                  Consultar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm animate-fade-in">
          {/* Section */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 tab-active-line" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section */}
          <div className="p-6 md:p-8 animate-fade-in" key={activeTab}>
            {/* Section */}
            {activeTab === 'description' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Descripción del producto</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">{product.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <Package size={20} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Calidad garantizada</p>
                      <p className="text-xs text-gray-500 mt-0.5">Productos originales con garantía de fábrica</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                    <Truck size={20} className="text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Envío a todo el país</p>
                      <p className="text-xs text-gray-500 mt-0.5">Entrega segura y en tiempo</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <CheckCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Soporte técnico</p>
                      <p className="text-xs text-gray-500 mt-0.5">Asesoramiento pre y post venta</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section */}
            {activeTab === 'specs' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Especificaciones Técnicas</h3>
                {product.specs ? (
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <table className="w-full">
                      <tbody>
                        {Object.entries(product.specs).map(([key, val], idx) => (
                          <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-5 py-3.5 text-sm font-semibold text-gray-600 w-1/3 border-r border-gray-200">
                              {key}
                            </td>
                            <td className="px-5 py-3.5 text-sm font-bold text-gray-900">
                              {val}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hay especificaciones disponibles para este producto.</p>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-800">
                    <span className="font-bold">¿Necesitás más información técnica?</span>{' '}
                    Nuestro equipo de asesores puede enviarte la ficha técnica completa.
                  </p>
                  <button
                    onClick={handleWhatsApp}
                    className="mt-3 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors btn-press"
                  >
                    <WhatsAppIcon size={14} />
                    Solicitar ficha técnica
                  </button>
                </div>
              </div>
            )}

            {/* Section */}
            {activeTab === 'shipping' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Información de envío</h3>
                <ShippingCalculator />

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-xl">
                    <h4 className="text-sm font-bold text-gray-900 mb-2">Retiro en sucursal</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Retirá tu pedido sin cargo en nuestra sucursal. Disponible dentro de las 24hs hábiles de confirmado el pago.
                    </p>
                    <p className="text-xs text-green-600 font-bold mt-2">Gratis</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-xl">
                    <h4 className="text-sm font-bold text-gray-900 mb-2">Envío a obra</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Realizamos entregas directas en obra para pedidos mayoristas. Consultá condiciones y costos con nuestro equipo.
                    </p>
                    <button
                      onClick={handleWhatsApp}
                      className="mt-2 text-xs text-green-600 font-bold hover:text-green-700 inline-flex items-center gap-1"
                    >
                      <WhatsAppIcon size={12} /> Consultar envío a obra
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs text-amber-800">
                    <span className="font-bold">Envío bonificado:</span> En pedidos mayoristas superiores a $500.000 el envío puede ser bonificado. Consultá con nuestro equipo comercial.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section */}
        {related.length > 0 && (
          <div className="mt-12 animate-fade-in">
            <h2 className="text-xl font-extrabold text-gray-900 mb-5">Productos relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


































































