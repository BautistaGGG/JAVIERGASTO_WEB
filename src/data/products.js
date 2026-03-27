export const WHATSAPP_NUMBER = '543329598306';
export const COMPANY_NAME = 'Hidráulica Gastó';

export const categories = [
  { id: 1, name: 'Hidráulica', slug: 'hidraulica', icon: '💧', color: 'from-red-500 to-red-700' },
  { id: 2, name: 'Neumática', slug: 'neumatica', icon: '🌬️', color: 'from-gray-500 to-gray-700' },
];

export const brands = [
  { id: 1, name: 'Parker', isActive: true },
  { id: 2, name: 'Rexroth', isActive: true },
  { id: 3, name: 'Festo', isActive: true },
  { id: 4, name: 'SMC', isActive: true },
  { id: 5, name: 'Eaton', isActive: true },
  { id: 6, name: 'Norgren', isActive: true },
];

export const products = [
  {
    id: 1,
    name: 'Bomba Hidráulica de Engranajes 25 L/min',
    price: 89500,
    category: 'Hidráulica',
    categoryId: 1,
    brand: 'Parker',
    brandId: 1,
    description: 'Bomba hidráulica industrial para unidades de potencia y circuitos de trabajo continuo.',
    specs: { Caudal: '25 L/min', Presion: '210 bar', Conexion: '1/2"' },
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&h=600&fit=crop'
    ],
    stockStatus: 'in_stock',
    showPrice: true,
    stock: 48,
    isActive: true,
    isFeatured: true,
    sku: 'PRK-BHE25',
    badge: 'bestseller',
  },
  {
    id: 2,
    name: 'Cilindro Hidráulico Doble Efecto 80x500',
    price: 125000,
    category: 'Hidráulica',
    categoryId: 1,
    brand: 'Rexroth',
    brandId: 2,
    description: 'Cilindro hidráulico robusto para aplicaciones de fuerza en maquinaria industrial.',
    specs: { Diametro: '80 mm', Carrera: '500 mm', Presion: '250 bar' },
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1530124566582-a45a7c30cba8?w=800&h=600&fit=crop'
    ],
    stockStatus: 'in_stock',
    showPrice: true,
    stock: 25,
    isActive: true,
    isFeatured: true,
    sku: 'RXT-CH8050',
    badge: null,
  },
  {
    id: 3,
    name: 'Válvula Direccional Hidráulica 4/3 CETOP 3',
    price: 189000,
    category: 'Hidráulica',
    categoryId: 2,
    brand: 'Eaton',
    brandId: 3,
    description: 'Válvula direccional para control de actuadores hidráulicos en tableros de potencia.',
    specs: { Configuracion: '4/3', Montaje: 'CETOP 3', Caudal: '60 L/min' },
    image: 'https://images.unsplash.com/photo-1530124566582-a45a7c30cba8?w=400&h=300&fit=crop',
    images: ['https://images.unsplash.com/photo-1530124566582-a45a7c30cba8?w=800&h=600&fit=crop'],
    stockStatus: 'in_stock',
    showPrice: true,
    stock: 12,
    isActive: true,
    isFeatured: false,
    sku: 'EAT-VD43C3',
    badge: 'new',
  },
  {
    id: 4,
    name: 'FRL Neumático 1/2" con Regulador',
    price: 45900,
    category: 'Neumática',
    categoryId: 2,
    brand: 'SMC',
    brandId: 4,
    description: 'Unidad de mantenimiento neumático para filtrado, regulación y lubricación de línea.',
    specs: { Conexion: '1/2"', Presion: '0.5-10 bar', Filtrado: '5 micras' },
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f7aa?w=400&h=300&fit=crop',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85f7aa?w=800&h=600&fit=crop'],
    stockStatus: 'in_stock',
    showPrice: true,
    stock: 85,
    isActive: true,
    isFeatured: true,
    sku: 'SMC-FRL12',
    badge: 'bestseller',
  },
  {
    id: 5,
    name: 'Válvula Solenoide Neumática 5/2 24VDC',
    price: 18500,
    category: 'Neumática',
    categoryId: 2,
    brand: 'Festo',
    brandId: 5,
    description: 'Electroválvula neumática para automatización industrial con respuesta rápida.',
    specs: { Configuracion: '5/2', Tension: '24VDC', Conexion: '1/4"' },
    image: 'https://images.unsplash.com/photo-1590959651373-a3db0f38a961?w=400&h=300&fit=crop',
    images: ['https://images.unsplash.com/photo-1590959651373-a3db0f38a961?w=800&h=600&fit=crop'],
    stockStatus: 'in_stock',
    showPrice: true,
    stock: 120,
    isActive: true,
    isFeatured: false,
    sku: 'FES-VS5224',
    badge: null,
  },
  {
    id: 6,
    name: 'Cilindro Neumático ISO 63x250',
    price: 156000,
    category: 'Neumática',
    categoryId: 2,
    brand: 'Norgren',
    brandId: 6,
    description: 'Actuador neumático ISO para líneas de producción y automatismos.',
    specs: { Diametro: '63 mm', Carrera: '250 mm', Presion: '1-10 bar' },
    image: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=400&h=300&fit=crop',
    images: ['https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=800&h=600&fit=crop'],
    stockStatus: 'in_stock',
    showPrice: true,
    stock: 18,
    isActive: true,
    isFeatured: true,
    sku: 'NRG-CN6325',
    badge: 'sale',
  },
];

export const mockInquiries = [
  { id: 1, name: 'Juan Pérez', email: 'juan@empresa.com', phone: '+54 11 5555-1111', date: '2024-01-15', productId: 1, productName: 'Bomba Hidráulica de Engranajes 25 L/min', message: 'Necesito cotización por 20 unidades', status: 'pending', source: 'product_page' },
  { id: 2, name: 'María García', email: 'maria@constructora.com', phone: '+54 11 5555-2222', date: '2024-01-14', productId: 5, productName: 'Válvula Solenoide Neumática 5/2 24VDC', message: 'Consulta disponibilidad inmediata', status: 'replied', source: 'whatsapp' },
  { id: 3, name: 'Carlos López', email: 'carlos@industrias.com', phone: '+54 11 5555-3333', date: '2024-01-13', productId: 6, productName: 'Cilindro Neumático ISO 63x250', message: '50 unidades para línea de producción', status: 'pending', source: 'contact_form' },
];

export const formatPrice = (price) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format(price);

export const getStockLabel = (status) => {
  const labels = {
    in_stock: { text: 'En stock', className: 'bg-gray-100 text-gray-800' },
    low_stock: { text: 'Últimas unidades', className: 'bg-gray-100 text-gray-800' },
    out_of_stock: { text: 'Sin stock', className: 'bg-red-100 text-red-800' },
    on_order: { text: 'Bajo pedido', className: 'bg-red-100 text-red-800' },
  };
  return labels[status] || labels.in_stock;
};



