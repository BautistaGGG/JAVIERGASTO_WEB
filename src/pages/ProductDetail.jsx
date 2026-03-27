import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, ChevronRight, Plus, Minus, AlertTriangle, CheckCircle, FileText, Settings, Truck, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { products, formatPrice, getStockLabel, WHATSAPP_NUMBER } from '../data/products';
import { buildProductInquiryWhatsAppMessage, openTrackedWhatsApp } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductBadge from '../components/ProductBadge';
import ShippingCalculator from '../components/ShippingCalculator';
import WhatsAppIcon from '../components/WhatsAppIcon';
import ShareButton from '../components/ShareButton';
import { SkeletonDetail } from '../components/SkeletonCard';
import { useSeo } from '../hooks/useSeo';
import { useToast } from '../context/ToastContext';
import LazyImage from '../components/LazyImage';

const getStockInfo = (product) => {
  const stock = Number(product?.stock || 0);
  if (stock === 0) return { text: 'Sin stock disponible', sub: 'Consultá por WhatsApp para pedido especial', color: 'text-red-300', bg: 'bg-red-950/40', border: 'border-red-900/70', icon: 'alert' };
  if (stock <= 5) return { text: `¡Solo quedan ${stock} unidades!`, sub: 'Consultá ahora para asegurar tu pedido', color: 'text-zinc-200', bg: 'bg-zinc-950', border: 'border-zinc-800', icon: 'alert' };
  if (stock <= 20) return { text: `${stock} unidades disponibles`, sub: 'Stock limitado · Entrega inmediata', color: 'text-red-300', bg: 'bg-red-950/40', border: 'border-red-900/70', icon: 'check' };
  return { text: `${stock} unidades en stock`, sub: 'Disponibilidad inmediata · Gran stock', color: 'text-zinc-200', bg: 'bg-zinc-950', border: 'border-zinc-800', icon: 'check' };
};

const TABS = [
  { id: 'description', label: 'Descripción', icon: FileText },
  { id: 'specs', label: 'Especificaciones', icon: Settings },
  { id: 'shipping', label: 'Envío', icon: Truck },
];

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToast } = useToast();
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
  const productSchema = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku || undefined,
    image: [product.image, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean),
    description: product.description || '',
    brand: { '@type': 'Brand', name: product.brand || 'Hidraulica Gasto' },
    category: product.category || undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'ARS',
      price: Number(product.price || 0),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: `${window.location.origin}/producto/${product.id}`,
    },
  } : null;
  useSeo({
    title: product ? `${product.name} | Hidráulica Gastó` : 'Producto | Hidráulica Gastó',
    description: product?.description || 'Detalle de producto industrial y consulta técnica.',
    image: product?.image,
    path: product ? `/producto/${product.id}` : '/producto',
    structuredData: productSchema,
    structuredDataId: product ? `product-${product.id}` : 'product-fallback',
  });

  if (loading) return <SkeletonDetail />;

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Producto no encontrado</h2>
          <Link to="/productos" className="text-red-400 hover:text-red-300 font-semibold text-sm">
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
  const showPrice = product.showPrice !== false;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1);
  };

  const handleWhatsApp = () => {
    const msg = buildProductInquiryWhatsAppMessage({
      name: product.name,
      sku: product.sku,
      priceText: showPrice ? formatPrice(product.price) : 'Precio a consultar',
      quantity,
    });
    openTrackedWhatsApp({
      phone: WHATSAPP_NUMBER,
      message: msg,
      source: 'product_detail',
      metadata: { productId: product.id, quantity },
    });
    addToast(`Abriendo WhatsApp para ${product.name}.`, 'info');
  };

  const nextImage = () => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  const prevImage = () => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));

  return (
    <div className="min-h-screen bg-zinc-950">
      <Breadcrumbs items={[
        { label: 'Productos', path: '/productos' },
        { label: product.category, path: `/productos?cat=${product.categoryId}` },
        { label: product.name },
      ]} />

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-sm animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* Section */}
            <div className="p-4 md:p-6 lg:p-8 bg-zinc-950 border-b lg:border-b-0 lg:border-r border-zinc-800">
              {/* Section */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 mb-3 group">
                <LazyImage
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  onError={(e) => {
                    e.target.src = `https://placehold.co/800x600/1e40af/ffffff?text=${encodeURIComponent(product.name.slice(0, 20))}`;
                  }}
                />
                {/* Section */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {product.badge && <ProductBadge badge={product.badge} />}
                  {product.isFeatured && !product.badge && (
                    <span className="bg-zinc-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-lg">
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
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-zinc-900/90 hover:bg-zinc-900 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-zinc-900/90 hover:bg-zinc-900 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
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
                        selectedImage === i ? 'border-red-600 shadow-md scale-105' : 'border-zinc-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <LazyImage
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                        sizes="80px"
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
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wide">{product.brand}</span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-xs text-zinc-400">SKU: {product.sku}</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-extrabold text-zinc-100 leading-tight">{product.name}</h1>
                </div>
                <ShareButton product={product} variant="full" />
              </div>

              {/* Section */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${stock.className}`}>
                  {stock.text}
                </span>
                <span className="text-xs text-zinc-500">{product.category}</span>
                {product.badge && <ProductBadge badge={product.badge} />}
              </div>

              {/* Section */}
              <div className="mt-5 pb-5 border-b border-zinc-800">
                <p className="text-3xl md:text-4xl font-extrabold text-zinc-100">{showPrice ? formatPrice(product.price) : "Precio a consultar"}</p>
                <p className="text-xs text-zinc-500 mt-1">{showPrice ? '+ IVA · Precio unitario' : 'Contactanos por WhatsApp'}</p>
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
                  <p className="text-xs text-zinc-400 mt-0.5">{stockInfo.sub}</p>
                </div>
              </div>

              {/* Section */}
              <div className="mt-auto pt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-zinc-200">Cantidad:</span>
                  <div className="flex items-center bg-zinc-800 rounded-xl overflow-hidden">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3 hover:bg-zinc-700 transition-colors">
                      <Minus size={16} />
                    </button>
                    <span className="px-5 py-2 font-bold text-center min-w-[50px]">{quantity}</span>
                    <button onClick={() => setQuantity((q) => q + 1)} className="p-3 hover:bg-zinc-700 transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-zinc-500 ml-auto">{showPrice ? formatPrice(product.price * quantity) : "A cotizar"}</span>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all btn-press shadow-lg hover:shadow-xl ${
                    product.stock === 0
                      ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
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
        <div className="mt-8 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-sm animate-fade-in">
          {/* Section */}
          <div className="border-b border-zinc-800">
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
                        ? 'text-red-600'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 tab-active-line" />
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
                <h3 className="text-lg font-bold text-zinc-100 mb-4">Descripción del producto</h3>
                <p className="text-sm text-zinc-300 leading-relaxed mb-6">{product.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-red-950/40 rounded-xl border border-red-900/70">
                    <Package size={20} className="text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-zinc-100">Calidad garantizada</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Productos originales con garantía de fábrica</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                    <Truck size={20} className="text-zinc-300 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-zinc-100">Envío a todo el país</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Entrega segura y en tiempo</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                    <CheckCircle size={20} className="text-zinc-300 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-zinc-100">Soporte técnico</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Asesoramiento pre y post venta</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section */}
            {activeTab === 'specs' && (
              <div>
                <h3 className="text-lg font-bold text-zinc-100 mb-4">Especificaciones Técnicas</h3>
                {product.specs ? (
                  <div className="overflow-hidden rounded-xl border border-zinc-800">
                    <table className="w-full">
                      <tbody>
                        {Object.entries(product.specs).map(([key, val], idx) => (
                          <tr key={key} className={idx % 2 === 0 ? 'bg-zinc-950' : 'bg-zinc-900'}>
                            <td className="px-5 py-3.5 text-sm font-semibold text-zinc-300 w-1/3 border-r border-zinc-800">
                              {key}
                            </td>
                            <td className="px-5 py-3.5 text-sm font-bold text-zinc-100">
                              {val}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">No hay especificaciones disponibles para este producto.</p>
                )}

                <div className="mt-6 p-4 bg-red-950/40 rounded-xl border border-red-900/70">
                  <p className="text-sm text-red-200">
                    <span className="font-bold">¿Necesitás más información técnica?</span>{' '}
                    Nuestro equipo de asesores puede enviarte la ficha técnica completa.
                  </p>
                  <button
                    onClick={handleWhatsApp}
                    className="mt-3 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors btn-press"
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
                <h3 className="text-lg font-bold text-zinc-100 mb-4">Información de envío</h3>
                <ShippingCalculator />

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-zinc-800 rounded-xl">
                    <h4 className="text-sm font-bold text-zinc-100 mb-2">Retiro en sucursal</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Retirá tu pedido sin cargo en nuestra sucursal. Disponible dentro de las 24hs hábiles de confirmado el pago.
                    </p>
                    <p className="text-xs text-zinc-300 font-bold mt-2">Gratis</p>
                  </div>
                  <div className="p-4 border border-zinc-800 rounded-xl">
                    <h4 className="text-sm font-bold text-zinc-100 mb-2">Envío a obra</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Realizamos entregas directas en obra para pedidos mayoristas. Consultá condiciones y costos con nuestro equipo.
                    </p>
                    <button
                      onClick={handleWhatsApp}
                      className="mt-2 text-xs text-green-400 font-bold hover:text-green-300 inline-flex items-center gap-1"
                    >
                      <WhatsAppIcon size={12} /> Consultar envío a obra
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                  <p className="text-xs text-zinc-200">
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
            <h2 className="text-xl font-extrabold text-zinc-100 mb-5">Productos relacionados</h2>
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
