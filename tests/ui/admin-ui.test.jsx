import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProductsManager from '../../src/admin/components/ProductsManager';
import InquiriesManager from '../../src/admin/components/InquiriesManager';

const updateProductMock = vi.fn(async () => ({}));
const addProductMock = vi.fn(async () => ({}));
const deleteProductMock = vi.fn(async () => ({}));
const updateInquiryStatusMock = vi.fn(async () => ({}));
const addToastMock = vi.fn();

vi.mock('../../src/context/AdminContext', () => ({
  useAdmin: () => ({
    products: [
      {
        id: 1,
        name: 'Taladro Pro',
        price: 120000,
        category: 'Herramientas',
        categoryId: 1,
        brand: 'Bosch',
        brandId: 1,
        image: 'https://example.com/1.jpg',
        sku: 'TAL-001',
        stockStatus: 'in_stock',
        isActive: true,
        isFeatured: false,
      },
      {
        id: 2,
        name: 'Amoladora X',
        price: 98000,
        category: 'Herramientas',
        categoryId: 1,
        brand: 'Makita',
        brandId: 2,
        image: 'https://example.com/2.jpg',
        sku: 'AMO-002',
        stockStatus: 'on_order',
        isActive: false,
        isFeatured: true,
      },
    ],
    categories: [{ id: 1, name: 'Herramientas' }],
    brands: [{ id: 1, name: 'Bosch' }, { id: 2, name: 'Makita' }],
    addProduct: addProductMock,
    updateProduct: updateProductMock,
    deleteProduct: deleteProductMock,
    inquiries: [
      {
        id: 11,
        name: 'Juan',
        email: 'juan@mail.com',
        subject: 'Consulta precio',
        message: 'Necesito precio por mayor',
        productName: 'Taladro Pro',
        source: 'contact_form',
        status: 'pending',
        createdAt: '2026-03-20T10:00:00.000Z',
      },
      {
        id: 12,
        name: 'Ana',
        email: 'ana@mail.com',
        subject: 'Stock',
        message: 'Tienen disponibilidad?',
        productName: 'Amoladora X',
        source: 'whatsapp',
        status: 'replied',
        createdAt: '2026-03-19T10:00:00.000Z',
      },
    ],
    updateInquiryStatus: updateInquiryStatusMock,
  }),
}));

vi.mock('../../src/context/ToastContext', () => ({
  useToast: () => ({ addToast: addToastMock }),
}));

function ProductsHarness() {
  const [filters, setFilters] = useState({
    search: '',
    isActive: 'all',
    featured: 'all',
    stockStatus: 'all',
    categoryId: 'all',
    brandId: 'all',
    sortBy: 'id_desc',
    page: 1,
    pageSize: 10,
  });
  return (
    <ProductsManager
      filters={filters}
      setFilters={setFilters}
      requestConfirm={async () => true}
      onActivity={() => {}}
    />
  );
}

function InquiriesHarness() {
  const [filters, setFilters] = useState({
    search: '',
    status: 'pending',
    source: 'all',
    dateFrom: '',
    dateTo: '',
    page: 1,
    pageSize: 8,
  });
  return <InquiriesManager filters={filters} setFilters={setFilters} onActivity={() => {}} />;
}

describe('Admin UI interaction smoke', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filtra productos por texto y dispara atajos / N Esc', async () => {
    const user = userEvent.setup();
    render(<ProductsHarness />);

    const search = screen.getByPlaceholderText('Buscar por nombre, SKU o marca');
    await user.type(search, 'Taladro');
    expect(screen.getAllByText('Taladro Pro').length).toBeGreaterThan(0);
    const visibleAmoladoraRows = screen.queryAllByText('Amoladora X').filter((node) => node.tagName !== 'OPTION');
    expect(visibleAmoladoraRows.length).toBe(0);

    fireEvent.keyDown(window, { key: 'n' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    const trigger = screen.getByText('Nuevo producto');
    trigger.focus();
    fireEvent.keyDown(window, { key: 'n' });
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('ejecuta acciones masivas de productos', async () => {
    const user = userEvent.setup();
    render(<ProductsHarness />);

    await user.click(screen.getAllByRole('button', { name: /Seleccionar Taladro Pro/i })[0]);
    await user.click(screen.getAllByRole('button', { name: /Seleccionar Amoladora X/i })[0]);
    await user.click(screen.getAllByRole('button', { name: 'Activar' })[0]);

    await waitFor(() => expect(updateProductMock).toHaveBeenCalledTimes(2));
    expect(updateProductMock).toHaveBeenCalledWith(1, { isActive: true });
    expect(updateProductMock).toHaveBeenCalledWith(2, { isActive: true });
  });

  it('cambia estado de consulta desde lista y desde detalle', async () => {
    const user = userEvent.setup();
    render(<InquiriesHarness />);

    await user.click(screen.getByRole('button', { name: 'Pendiente' }));
    await waitFor(() => expect(updateInquiryStatusMock).toHaveBeenCalledWith(11, 'replied'));

    await user.click(screen.getByRole('button', { name: 'Ver detalle' }));
    await user.click(screen.getByRole('button', { name: /Marcar como respondida/i }));
    await waitFor(() => expect(updateInquiryStatusMock).toHaveBeenCalledWith(11, 'replied'));
  });
});
