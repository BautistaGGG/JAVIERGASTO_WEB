import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminPanelV3 from '../../src/admin/AdminPanelV3';

const loadInquiriesMock = vi.fn(async () => ({}));
const loadMetricsMock = vi.fn(async () => ({}));
const loadAuditEventsMock = vi.fn(async () => ({}));

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    logout: vi.fn(),
    user: { email: 'admin@example.com' },
  }),
}));

vi.mock('../../src/context/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

vi.mock('../../src/services/trackingService', () => ({
  trackWhatsAppClick: vi.fn(async () => ({})),
}));

vi.mock('../../src/context/AdminContext', () => ({
  useAdmin: () => ({
    apiError: null,
    categories: [],
    addCategory: vi.fn(async () => ({})),
    updateCategory: vi.fn(async () => ({})),
    deleteCategory: vi.fn(async () => ({})),
    brands: [],
    addBrand: vi.fn(async () => ({})),
    updateBrand: vi.fn(async () => ({})),
    deleteBrand: vi.fn(async () => ({})),
    inquiries: [
      {
        id: 1,
        name: 'Cliente 1',
        phone: '+54 11 4444 4444',
        subject: 'Consulta tecnica',
        message: 'Mensaje de prueba',
        productName: 'Producto A',
        source: 'whatsapp',
        status: 'pending',
        createdAt: '2026-03-25T12:00:00.000Z',
      },
      {
        id: 2,
        name: 'Cliente 2',
        phone: '+54 11 5555 5555',
        subject: 'Stock',
        message: 'Consulta por stock',
        productName: 'Producto B',
        source: 'contact_form',
        status: 'replied',
        createdAt: '2026-03-26T12:00:00.000Z',
      },
    ],
    dataLoaded: true,
    loadingState: { core: false, inquiries: false, metrics: false, audit: false },
    loadInquiries: loadInquiriesMock,
    loadMetrics: loadMetricsMock,
    loadAuditEvents: loadAuditEventsMock,
    updateInquiryStatus: vi.fn(async () => ({})),
  }),
}));

describe('AdminPanelV3 - filtros de consultas no generan loop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/admin?tab=inquiries');
  });

  it('aplica Respondidas hoy y WhatsApp pendientes sin crashear ni cambiar de tab', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/admin?tab=inquiries']}>
        <AdminPanelV3 />
      </MemoryRouter>,
    );

    const consultasTab = await screen.findByRole('button', { name: 'Consultas' });
    await user.click(consultasTab);
    await screen.findByText('Consultas Recibidas');
    await user.click(screen.getByRole('button', { name: 'Respondidas hoy' }));
    await waitFor(() => expect(window.location.search).toContain('tab=inquiries'));

    await user.click(screen.getByRole('button', { name: 'WhatsApp pendientes' }));
    await waitFor(() => {
      expect(window.location.search).toContain('tab=inquiries');
      expect(window.location.search).toContain('q_status=pending');
      expect(window.location.search).toContain('q_source=whatsapp');
    });

    expect(screen.getByText('Consultas Recibidas')).toBeInTheDocument();
  });
});
