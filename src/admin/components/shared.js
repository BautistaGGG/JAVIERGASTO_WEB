export const DEFAULT_PRODUCT_FILTERS = {
  search: '',
  isActive: 'all',
  featured: 'all',
  stockStatus: 'all',
  categoryId: 'all',
  brandId: 'all',
  sortBy: 'id_desc',
  page: 1,
  pageSize: 10,
};

export const DEFAULT_INQUIRY_FILTERS = {
  search: '',
  status: 'pending',
  source: 'all',
  dateFrom: '',
  dateTo: '',
  page: 1,
  pageSize: 8,
};

export const REPLY_TEMPLATES = {
  quote_sent: 'Hola {{name}}, te enviamos la cotizacion solicitada por {{product}}. Cualquier ajuste, escribinos.',
  need_details: 'Hola {{name}}, para cotizar {{product}} necesitamos confirmar cantidad, plazo y lugar de entrega.',
  no_stock_alt: 'Hola {{name}}, hoy no tenemos stock de {{product}}, pero podemos ofrecerte alternativa equivalente.',
};

export const canUseShortcutTarget = (target) => {
  const tagName = target?.tagName?.toLowerCase();
  return !(tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target?.isContentEditable);
};

export const parseDateValue = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const match = String(value).trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  let year = Number(match[3]);
  if (year < 100) year += 2000;
  const candidate = new Date(year, month, day);
  return Number.isNaN(candidate.getTime()) ? null : candidate;
};

export const formatDate = (value) => {
  const parsed = parseDateValue(value);
  if (!parsed) return value || '-';
  return parsed.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const buildTemplateMessage = (template, inquiry) =>
  template
    .replaceAll('{{name}}', inquiry?.name || 'cliente')
    .replaceAll('{{product}}', inquiry?.productName || 'el producto consultado');
