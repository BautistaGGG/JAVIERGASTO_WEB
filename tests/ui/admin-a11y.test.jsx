import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ConfirmModal from '../../src/admin/components/ConfirmModal';
import AdminPanelV3 from '../../src/admin/AdminPanelV3';

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    logout: vi.fn(),
    user: { email: 'admin@industrialpro.com' },
  }),
}));

vi.mock('../../src/context/AdminContext', () => ({
  useAdmin: () => ({
    apiError: null,
    categories: [],
    addCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
    brands: [],
    addBrand: vi.fn(),
    updateBrand: vi.fn(),
    deleteBrand: vi.fn(),
    inquiries: [],
    getStats: () => ({
      totalProducts: 0,
      activeProducts: 0,
      featuredProducts: 0,
      outOfStock: 0,
      pendingInquiries: 0,
    }),
    apiMetrics: null,
    products: [],
    auditEvents: [],
    refreshAuditEvents: vi.fn(async () => []),
  }),
}));

vi.mock('../../src/context/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
  };
});

describe('Admin a11y smoke', () => {
  it('renderiza controles con aria-label en modal de confirmación', () => {
    render(
      <ConfirmModal
        open
        title="Confirmar"
        description="Descripcion"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: 'Cerrar confirmacion' })).toBeInTheDocument();
  });

  it('renderiza controles de menu accesibles en panel admin', () => {
    render(<AdminPanelV3 />);
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar menu' })).toBeInTheDocument();
  });
});

