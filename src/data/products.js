export const WHATSAPP_NUMBER = '543329598306';
export const COMPANY_NAME = 'Industrial Pro';

export const categories = [
  { id: 1, name: 'Herramientas Eléctricas', slug: 'herramientas-electricas', icon: '🔧', color: 'from-blue-500 to-blue-700' },
  { id: 2, name: 'Herramientas Manuales', slug: 'herramientas-manuales', icon: '🛠️', color: 'from-emerald-500 to-emerald-700' },
  { id: 3, name: 'Seguridad Industrial', slug: 'seguridad-industrial', icon: '🦺', color: 'from-amber-500 to-amber-700' },
  { id: 4, name: 'Materiales de Construcción', slug: 'materiales-construccion', icon: '🧱', color: 'from-red-500 to-red-700' },
  { id: 5, name: 'Fijaciones y Anclajes', slug: 'fijaciones-anclajes', icon: '🔩', color: 'from-purple-500 to-purple-700' },
  { id: 6, name: 'Iluminación Industrial', slug: 'iluminacion-industrial', icon: '💡', color: 'from-yellow-500 to-orange-600' },
];

export const brands = [
  { id: 1, name: 'Bosch', isActive: true },
  { id: 2, name: 'DeWalt', isActive: true },
  { id: 3, name: 'Makita', isActive: true },
  { id: 4, name: 'Stanley', isActive: true },
  { id: 5, name: '3M', isActive: true },
  { id: 6, name: 'Philips', isActive: true },
];

export const products = [
  {
    id: 1,
    name: 'Taladro Percutor Bosch GSB 550 RE',
    price: 89500,
    category: 'Herramientas Eléctricas',
    categoryId: 1,
    brand: 'Bosch',
    brandId: 1,
    description: 'Taladro percutor profesional de 550W con velocidad variable y reversa. Ideal para perforación en concreto, madera y metal.',
    specs: { Potencia: '550W', Velocidad: '0-2800 RPM', Mandril: '13mm' },
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&h=600&fit=crop'
    ],
    stockStatus: 'in_stock',
    stock: 48,
    isActive: true,
    isFeatured: true,
    sku: 'BSH-GSB550',
    badge: 'bestseller',
  },
  {
    id: 2,
    name: 'Amoladora Angular DeWalt DWE4120',
    price: 125000,
    category: 'Herramientas Eléctricas',
    categoryId: 1,
    brand: 'DeWalt',
    brandId: 2,
    description: 'Amoladora angular de 4-1/2 con motor de 900W para corte y desbaste de metales.',
    specs: { Potencia: '900W', Disco: '115mm', Velocidad: '11000 RPM' },
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1530124566582-a45a7c30cba8?w=800&h=600&fit=crop'
    ],
    stockStatus: 'in_stock',
    stock: 25,
    isActive: true,
    isFeatured: true,
    sku: 'DWL-DWE4120',
    badge: null,
  },
  {
    id: 3,
    name: 'Sierra Circular Makita HS7010',
    price: 189000,
    category: 'Herramientas Eléctricas',
    categoryId: 1,
    brand: 'Makita',
    brandId: 3,
    description: 'Sierra circular profesional de 1800W para cortes precisos en madera.',
    specs: { Potencia: '1800W', Disco: '185mm', Velocidad: '5200 RPM' },
    image: 'https://images.unsplash.com/photo-1530124566582-a45a7c30cba8?w=400&h=300&fit=crop',
    images: ['https://images.unsplash.com/photo-1530124566582-a45a7c30cba8?w=800&h=600&fit=crop'],
    stockStatus: 'in_stock',
    stock: 12,
    isActive: true,
    isFeatured: false,
    sku: 'MKT-HS7010',
    badge: 'new',
  },
  {
    id: 4,
    name: 'Juego de Llaves Combinadas Stanley 12pz',
    price: 45900,
    category: 'Herramientas Manuales',
    categoryId: 2,
    brand: 'Stanley',
    brandId: 4,
    description: 'Set de 12 llaves combinadas en acero cromo-vanadio.',
    specs: { Material: 'Cromo-Vanadio', Piezas: '12', Medidas: '6-22mm' },
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f7aa?w=400&h=300&fit=crop',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85f7aa?w=800&h=600&fit=crop'],
    stockStatus: 'in_stock',
    stock: 85,
    isActive: true,
    isFeatured: true,
    sku: 'STN-LLC12',
    badge: 'bestseller',
  },
  {
    id: 5,
    name: 'Casco de Seguridad 3M H-700',
    price: 18500,
    category: 'Seguridad Industrial',
    categoryId: 3,
    brand: '3M',
    brandId: 5,
    description: 'Casco de seguridad industrial con suspensión de 4 puntos y ajuste ratchet.',
    specs: { Material: 'HDPE', Ajuste: 'Ratchet', Norma: 'IRAM 3620' },
    image: 'https://images.unsplash.com/photo-1590959651373-a3db0f38a961?w=400&h=300&fit=crop',
    images: ['https://images.unsplash.com/photo-1590959651373-a3db0f38a961?w=800&h=600&fit=crop'],
    stockStatus: 'in_stock',
    stock: 120,
    isActive: true,
    isFeatured: false,
    sku: '3M-H700',
    badge: null,
  },
  {
    id: 6,
    name: 'Proyector LED Industrial Philips 200W',
    price: 156000,
    category: 'Iluminación Industrial',
    categoryId: 6,
    brand: 'Philips',
    brandId: 6,
    description: 'Proyector LED de alta potencia para iluminación industrial y exterior.',
    specs: { Potencia: '200W', Flujo: '20.000 lm', IP: '65' },
    image: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=400&h=300&fit=crop',
    images: ['https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=800&h=600&fit=crop'],
    stockStatus: 'in_stock',
    stock: 18,
    isActive: true,
    isFeatured: true,
    sku: 'PHL-LED200',
    badge: 'sale',
  },
];

export const mockInquiries = [
  { id: 1, name: 'Juan Pérez', email: 'juan@empresa.com', phone: '+54 11 5555-1111', date: '2024-01-15', productId: 1, productName: 'Taladro Percutor Bosch GSB 550 RE', message: 'Necesito cotización por 20 unidades', status: 'pending', source: 'product_page' },
  { id: 2, name: 'María García', email: 'maria@constructora.com', phone: '+54 11 5555-2222', date: '2024-01-14', productId: 5, productName: 'Casco de Seguridad 3M H-700', message: 'Consulta disponibilidad talle L', status: 'replied', source: 'whatsapp' },
  { id: 3, name: 'Carlos López', email: 'carlos@industrias.com', phone: '+54 11 5555-3333', date: '2024-01-13', productId: 6, productName: 'Proyector LED Industrial Philips 200W', message: '50 unidades para planta', status: 'pending', source: 'contact_form' },
];

export const formatPrice = (price) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format(price);

export const getStockLabel = (status) => {
  const labels = {
    in_stock: { text: 'En stock', className: 'bg-green-100 text-green-800' },
    low_stock: { text: 'Últimas unidades', className: 'bg-amber-100 text-amber-800' },
    out_of_stock: { text: 'Sin stock', className: 'bg-red-100 text-red-800' },
    on_order: { text: 'Bajo pedido', className: 'bg-blue-100 text-blue-800' },
  };
  return labels[status] || labels.in_stock;
};

