const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-+()]{7,20}$/;

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isValidEmail = (value) => typeof value === 'string' && EMAIL_REGEX.test(value.trim());
const isValidNumber = (value) => value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value));

export function validateAdminLogin(payload = {}) {
  const errors = [];
  const username = payload.username || payload.email;

  if (!isNonEmptyString(username)) errors.push('El usuario es obligatorio');
  if (!isNonEmptyString(payload.password)) errors.push('La contraseña es obligatoria');

  return errors;
}

export function validateProductPayload(payload = {}, { partial = false } = {}) {
  const errors = [];

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'name')) {
    if (!isNonEmptyString(payload.name)) errors.push('El nombre del producto es obligatorio');
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'price')) {
    if (!isValidNumber(payload.price) || Number(payload.price) < 0) errors.push('El precio debe ser un número válido mayor o igual a 0');
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'stock')) {
    if (!Number.isInteger(Number(payload.stock)) || Number(payload.stock) < 0) errors.push('El stock debe ser un entero mayor o igual a 0');
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'category') && !isNonEmptyString(payload.category)) {
    errors.push('La categoría no puede estar vacía');
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'brand') && !isNonEmptyString(payload.brand)) {
    errors.push('La marca no puede estar vacía');
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'stockStatus')) {
    const allowed = ['in_stock', 'low_stock', 'out_of_stock', 'on_order'];
    if (!allowed.includes(payload.stockStatus)) errors.push('El estado de stock no es válido');
  }

  if (
    Object.prototype.hasOwnProperty.call(payload, 'showPrice') &&
    typeof payload.showPrice !== 'boolean'
  ) {
    errors.push('El valor de mostrar precio debe ser booleano');
  }

  return errors;
}

export function validateContactPayload(payload = {}) {
  const errors = [];

  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim();
  const message = String(payload.message || '').trim();
  const phone = payload.phone !== undefined && payload.phone !== null ? String(payload.phone).trim() : '';
  const subject = payload.subject !== undefined && payload.subject !== null ? String(payload.subject).trim() : '';
  const honeypot = payload.website !== undefined && payload.website !== null ? String(payload.website).trim() : '';

  if (honeypot.length > 0) errors.push('Solicitud inválida');

  if (!isNonEmptyString(name)) errors.push('El nombre es obligatorio');
  if (name.length > 120) errors.push('El nombre excede el máximo permitido');

  if (!isValidEmail(email)) errors.push('El email no es válido');
  if (email.length > 254) errors.push('El email excede el máximo permitido');

  if (!isNonEmptyString(message) || message.length < 10) errors.push('El mensaje debe tener al menos 10 caracteres');
  if (message.length > 2000) errors.push('El mensaje excede el máximo permitido');

  if (phone && !PHONE_REGEX.test(phone)) {
    errors.push('El teléfono no es válido');
  }

  if (subject.length > 120) errors.push('El asunto excede el máximo permitido');

  return errors;
}

export function validateInquiryStatus(status) {
  return ['pending', 'replied'].includes(status) ? [] : ['El estado de la consulta no es válido'];
}

export function validateCategoryPayload(payload = {}, { partial = false } = {}) {
  const errors = [];
  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'name')) {
    if (!isNonEmptyString(payload.name)) errors.push('El nombre de la categoría es obligatorio');
  }
  return errors;
}

export function validateBrandPayload(payload = {}, { partial = false } = {}) {
  const errors = [];
  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'name')) {
    if (!isNonEmptyString(payload.name)) errors.push('El nombre de la marca es obligatorio');
  }
  return errors;
}
