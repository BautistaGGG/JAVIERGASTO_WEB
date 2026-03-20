import { apiFetch, ensureApiResponse } from './api.js';

export const getContacts = async () => ensureApiResponse(await apiFetch('/contacts'), '/contacts');

export const createContact = async (payload) => ensureApiResponse(await apiFetch('/contacts', {
  method: 'POST',
  body: JSON.stringify(payload),
}), '/contacts');

export const updateContactStatus = async (id, status) => ensureApiResponse(await apiFetch(`/contacts/${id}/status`, {
  method: 'PUT',
  body: JSON.stringify({ status }),
}), `/contacts/${id}/status`);

export const submitContactForm = async (formData) => createContact({
  ...formData,
  source: formData.source || 'contact_form',
  productName: formData.productName || 'Consulta general',
});
