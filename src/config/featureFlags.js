const parseFlag = (value) => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return null;
};

const readFlag = (envKey, fallback) => {
  const value = parseFlag(import.meta.env?.[envKey]);
  if (value === null) return fallback;
  return value;
};

export const FEATURE_FLAGS = {
  ADMIN_PRODUCT_HISTORY: readFlag('VITE_FF_ADMIN_PRODUCT_HISTORY', true),
  ADMIN_PRODUCT_DUPLICATE: readFlag('VITE_FF_ADMIN_PRODUCT_DUPLICATE', true),
  ADMIN_BULK_ADVANCED: readFlag('VITE_FF_ADMIN_BULK_ADVANCED', true),
  SEO_DYNAMIC_CATEGORIES: readFlag('VITE_FF_SEO_DYNAMIC_CATEGORIES', true),
  UI_PROGRESSIVE_IMAGES: readFlag('VITE_FF_UI_PROGRESSIVE_IMAGES', true),
};

export const isFeatureEnabled = (flag) => Boolean(FEATURE_FLAGS[flag]);
