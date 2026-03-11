import { apiFetch } from './api.js';

export const getContacts = async () => apiFetch('/contacts');

export const createContact = async (payload) => apiFetch('/contacts', {
  method: 'POST',
  body: JSON.stringify(payload),
});

export const updateContactStatus = async (id, status) => apiFetch(`/contacts/${id}/status`, {
  method: 'PUT',
  body: JSON.stringify({ status }),
});

export const submitContactForm = async (formData) => createContact({
  ...formData,
  source: formData.source || 'contact_form',
  productName: formData.productName || 'Consulta general',
});

