import { apiFetch } from './api.js';
import { createContact, getContacts, submitContactForm, updateContactStatus } from './contactService.js';
import { products, categories, brands, mockInquiries } from '../data/products.js';

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAllProducts = async () => {
  const data = await apiFetch('/products');
  if (data) return data;
  await delay();
  return products.filter((product) => product.isActive);
};

export const getProductById = async (id) => {
  const data = await apiFetch(`/products/${id}`);
  if (data) return data;
  await delay();
  return products.find((product) => product.id === Number(id)) || null;
};

export const getProductsByCategory = async (categoryId) => {
  const data = await apiFetch(`/products?category=${categoryId}`);
  if (data) return data;
  await delay();
  return products.filter((product) => product.categoryId === Number(categoryId) && product.isActive);
};

export const getFeaturedProducts = async () => {
  const data = await apiFetch('/products?featured=true');
  if (data) return data;
  await delay();
  return products.filter((product) => product.isFeatured && product.isActive);
};

export const searchProducts = async (query) => {
  const data = await apiFetch(`/products?search=${encodeURIComponent(query)}`);
  if (data) return data;
  await delay();
  const normalized = query.toLowerCase();
  return products.filter((product) =>
    product.isActive && (
      product.name.toLowerCase().includes(normalized) ||
      product.description.toLowerCase().includes(normalized) ||
      product.brand.toLowerCase().includes(normalized) ||
      product.category.toLowerCase().includes(normalized)
    )
  );
};

export const getAllCategories = async () => {
  const data = await apiFetch('/categories');
  if (data) return data;
  await delay();
  return [...categories];
};

export const getAllBrands = async () => {
  const data = await apiFetch('/brands');
  if (data) return data;
  await delay();
  return [...brands];
};

export const getInquiries = async () => {
  try {
    const data = await getContacts();
    if (data) return data;
  } catch {
  }
  await delay();
  return [...mockInquiries];
};

export const createInquiry = async (inquiry) => {
  try {
    const data = await createContact(inquiry);
    if (data) return data;
  } catch {
  }
  await delay();
  return { ...inquiry, id: Date.now(), status: inquiry.status || 'pending' };
};

export const adminCreateProduct = async (product) => {
  try {
    const data = await apiFetch('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    if (data) return data;
  } catch {
  }
  await delay();
  return { ...product, id: Date.now() };
};

export const adminUpdateProduct = async (id, updates) => {
  try {
    const data = await apiFetch(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (data) return data;
  } catch {
  }
  await delay();
  return { id, ...updates };
};

export const adminDeleteProduct = async (id) => {
  try {
    const data = await apiFetch(`/products/${id}`, { method: 'DELETE' });
    if (data) return data;
  } catch {
  }
  await delay();
  return { success: true };
};

export { getContacts, submitContactForm, updateContactStatus };

export const generateWhatsAppLink = (phone, message) => {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
};

const cleanText = (value) => String(value ?? '').trim();

export const buildGeneralWhatsAppMessage = (context = 'default') => {
  const messages = {
    default: 'Hola, quiero consultar sobre sus productos industriales. ¿Podrían asesorarme?',
    browsing: 'Hola, estoy navegando su catálogo online y me gustaría hacer una consulta.',
    contact: 'Hola, quiero hacer una consulta sobre sus productos industriales. ¿Podrían asesorarme?',
    catalog_help: 'Hola, necesito ayuda para encontrar un producto en su catálogo.',
  };

  return messages[context] || messages.default;
};

export const buildProductInquiryWhatsAppMessage = ({ name, sku, priceText, quantity } = {}) => {
  const safeName = cleanText(name) || 'Producto';
  const safeSku = cleanText(sku) || 'N/A';
  const safePrice = cleanText(priceText) || 'Consultar';
  const safeQty = Number.isFinite(Number(quantity)) ? Number(quantity) : null;

  if (safeQty && safeQty > 0) {
    return [
      'Hola, quiero consultar por:',
      '',
      `*${safeName}*`,
      `SKU: ${safeSku}`,
      `Precio: ${safePrice}`,
      `Cantidad: ${safeQty}`,
      '',
      '¿Podrían darme más información?',
    ].join('\n');
  }

  return `Hola, quiero consultar por: *${safeName}* (SKU: ${safeSku}) - ${safePrice}`;
};

export const buildShareProductWhatsAppMessage = ({ name, productUrl } = {}) => {
  const safeName = cleanText(name) || 'este producto';
  const safeUrl = cleanText(productUrl);
  if (!safeUrl) return `Mirá este producto: *${safeName}*`;
  return `Mirá este producto: *${safeName}*\n${safeUrl}`;
};

export const buildCartQuoteWhatsAppMessage = ({ items = [], formatPrice }) => {
  const formatter = typeof formatPrice === 'function' ? formatPrice : (value) => String(value);

  const productLines = items
    .map((item) => {
      const quantity = Number(item.quantity) || 0;
      const lineTotal = (Number(item.price) || 0) * quantity;
      return `• ${cleanText(item.name) || 'Producto'} x${quantity} - ${formatter(lineTotal)}`;
    })
    .join('\n');

  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);

  return [
    'Hola, quiero cotizar los siguientes productos:',
    '',
    productLines || 'Sin productos',
    '',
    `Total estimado: ${formatter(total)}`,
    '',
    'Aguardo su respuesta. ¡Gracias!',
  ].join('\n');
};

export const buildComparisonWhatsAppMessage = (compareProducts = []) => {
  const names = compareProducts
    .map((product) => `• ${cleanText(product?.name) || 'Producto'}`)
    .join('\n');

  return [
    'Hola, estoy comparando estos productos y necesito asesoramiento:',
    '',
    names || '• Sin productos',
    '',
    '¿Podrían ayudarme a elegir?',
  ].join('\n');
};



