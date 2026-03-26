import { apiFetch } from './api.js';

export async function trackWhatsAppClick(source, metadata = {}) {
  const payload = {
    source: String(source || 'unknown'),
    metadata: metadata && typeof metadata === 'object' ? metadata : {},
  };

  try {
    await apiFetch('/events/whatsapp-click', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    // tracking failures should never block UX
  }
}
