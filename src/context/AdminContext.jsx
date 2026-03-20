import { createContext, useContext, useEffect, useState } from 'react';
import { products as mockProducts, categories as mockCategories, brands as mockBrands, mockInquiries } from '../data/products';
import { isMockFallbackEnabled } from '../config/runtime.js';
import { apiFetch, ensureApiResponse, isApiUnavailableError } from '../services/api';
import { formatApiErrorMessage } from '../services/errorUtils';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const mockFallbackEnabled = isMockFallbackEnabled();
  const [products, setProducts] = useState(mockFallbackEnabled ? [...mockProducts] : []);
  const [categories, setCategories] = useState(mockFallbackEnabled ? [...mockCategories] : []);
  const [brands, setBrands] = useState(mockFallbackEnabled ? [...mockBrands] : []);
  const [inquiries, setInquiries] = useState(mockFallbackEnabled ? [...mockInquiries] : []);
  const [apiMetrics, setApiMetrics] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const setUnavailableMessage = () => {
    setApiError('No se pudo conectar con la API de administración.');
  };

  const setApiErrorFromError = (error, fallback) => {
    setApiError(formatApiErrorMessage(error, fallback));
  };

  const parseInquiryList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  };

  useEffect(() => {
    const loadFromAPI = async () => {
      try {
        const [prods, cats, brs, inqs, metrics] = await Promise.all([
          apiFetch('/products?all=true'),
          apiFetch('/categories'),
          apiFetch('/brands'),
          apiFetch('/contacts').catch(() => null),
          apiFetch('/admin/metrics').catch(() => null),
        ]);

        const safeProducts = ensureApiResponse(prods, '/products?all=true');
        const safeCategories = ensureApiResponse(cats, '/categories');
        const safeBrands = ensureApiResponse(brs, '/brands');

        setProducts(safeProducts);
        setCategories(safeCategories);
        setBrands(safeBrands);
        if (inqs !== null) setInquiries(parseInquiryList(inqs));
        if (metrics !== null) setApiMetrics(metrics);
        setApiError(null);
      } catch (error) {
        if (!mockFallbackEnabled) {
          console.error('AdminContext: backend unavailable and mock fallback disabled', error);
          if (isApiUnavailableError(error)) setUnavailableMessage();
          else setApiErrorFromError(error, 'No se pudo cargar el panel de administración');
          return;
        }
        console.warn('AdminContext: backend unavailable, using fallback data');
      } finally {
        setDataLoaded(true);
      }
    };

    loadFromAPI();
  }, []);

  const addProduct = async (product) => {
    let newProduct;
    try {
      const result = await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify(product),
      });
      if (result === null) {
        if (!mockFallbackEnabled) {
          setUnavailableMessage();
          return null;
        }
        newProduct = { ...product, id: Date.now(), isActive: true };
      } else {
        newProduct = result;
        setApiError(null);
      }
    } catch (error) {
      if (!mockFallbackEnabled) {
        if (isApiUnavailableError(error)) setUnavailableMessage();
        else setApiErrorFromError(error, 'No se pudo crear el producto');
        return null;
      }
      newProduct = { ...product, id: Date.now(), isActive: true };
    }
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = async (id, updates) => {
    try {
      const result = await apiFetch(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (result === null) {
        if (!mockFallbackEnabled) {
          setUnavailableMessage();
          return null;
        }
      }
      if (result) {
        setApiError(null);
        setProducts((prev) => prev.map((product) => (product.id === id ? result : product)));
        return result;
      }
    } catch (error) {
      if (!mockFallbackEnabled) {
        if (isApiUnavailableError(error)) setUnavailableMessage();
        else setApiErrorFromError(error, 'No se pudo actualizar el producto');
        return null;
      }
    }

    setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, ...updates } : product)));
    return { id, ...updates };
  };

  const deleteProduct = async (id) => {
    try {
      const result = await apiFetch(`/products/${id}`, { method: 'DELETE' });
      if (result === null) {
        if (!mockFallbackEnabled) {
          setUnavailableMessage();
          return;
        }
      } else {
        setApiError(null);
      }
    } catch (error) {
      if (!mockFallbackEnabled) {
        if (isApiUnavailableError(error)) setUnavailableMessage();
        else setApiErrorFromError(error, 'No se pudo eliminar el producto');
        return;
      }
    }
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const toggleProductActive = async (id) => {
    const product = products.find((item) => item.id === id);
    if (!product) return;
    const nextActive = !product.isActive;
    await updateProduct(id, { isActive: nextActive });
  };

  const toggleProductFeatured = async (id) => {
    const product = products.find((item) => item.id === id);
    if (!product) return;
    const nextFeatured = !product.isFeatured;
    await updateProduct(id, { isFeatured: nextFeatured });
  };

  const updateStockStatus = async (id, status) => {
    await updateProduct(id, { stockStatus: status });
  };

  const addCategory = async (category) => {
    let newCategory;
    try {
      const result = await apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify(category),
      });
      if (result === null) {
        if (!mockFallbackEnabled) {
          setUnavailableMessage();
          return null;
        }
        newCategory = { ...category, id: Date.now(), slug: category.name.toLowerCase().replace(/\s+/g, '-') };
      } else {
        newCategory = result;
        setApiError(null);
      }
    } catch (error) {
      if (!mockFallbackEnabled) {
        if (isApiUnavailableError(error)) setUnavailableMessage();
        else setApiErrorFromError(error, 'No se pudo crear la categoría');
        return null;
      }
      newCategory = { ...category, id: Date.now(), slug: category.name.toLowerCase().replace(/\s+/g, '-') };
    }
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = async (id, updates) => {
    try {
      const result = await apiFetch(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (result === null) {
        if (!mockFallbackEnabled) {
          setUnavailableMessage();
          return;
        }
      }
      if (result) {
        setApiError(null);
        setCategories((prev) => prev.map((category) => (category.id === id ? result : category)));
        setProducts((prev) => prev.map((product) => (
          product.categoryId === id ? { ...product, category: result.name } : product
        )));
        return;
      }
    } catch (error) {
      if (!mockFallbackEnabled) {
        if (isApiUnavailableError(error)) setUnavailableMessage();
        else setApiErrorFromError(error, 'No se pudo actualizar la categoría');
        return;
      }
    }
    setCategories((prev) => prev.map((category) => (category.id === id ? { ...category, ...updates } : category)));
  };

  const deleteCategory = async (id) => {
    try {
      const result = await apiFetch(`/categories/${id}`, { method: 'DELETE' });
      if (result === null) {
        if (!mockFallbackEnabled) {
          setUnavailableMessage();
          return;
        }
      } else {
        setApiError(null);
      }
    } catch (error) {
      if (!mockFallbackEnabled) {
        if (isApiUnavailableError(error)) setUnavailableMessage();
        else setApiErrorFromError(error, 'No se pudo eliminar la categoría');
        return;
      }
    }
    setCategories((prev) => prev.filter((category) => category.id !== id));
  };

  const addBrand = async (brand) => {
    let newBrand;
    try {
      const result = await apiFetch('/brands', {
        method: 'POST',
        body: JSON.stringify(brand),
      });
      if (result === null) {
        if (!mockFallbackEnabled) {
          setUnavailableMessage();
          return null;
        }
        newBrand = { ...brand, id: Date.now(), isActive: true };
      } else {
        newBrand = result;
        setApiError(null);
      }
    } catch (error) {
      if (!mockFallbackEnabled) {
        if (isApiUnavailableError(error)) setUnavailableMessage();
        else setApiErrorFromError(error, 'No se pudo crear la marca');
        return null;
      }
      newBrand = { ...brand, id: Date.now(), isActive: true };
    }
    setBrands((prev) => [...prev, newBrand]);
    return newBrand;
  };

  const updateBrand = async (id, updates) => {
    try {
      const result = await apiFetch(`/brands/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (result === null) {
        if (!mockFallbackEnabled) {
          setUnavailableMessage();
          return;
        }
      }
      if (result) {
        setApiError(null);
        setBrands((prev) => prev.map((brand) => (brand.id === id ? result : brand)));
        setProducts((prev) => prev.map((product) => (
          product.brandId === id ? { ...product, brand: result.name } : product
        )));
        return;
      }
    } catch (error) {
      if (!mockFallbackEnabled) {
        if (isApiUnavailableError(error)) setUnavailableMessage();
        else setApiErrorFromError(error, 'No se pudo actualizar la marca');
        return;
      }
    }
    setBrands((prev) => prev.map((brand) => (brand.id === id ? { ...brand, ...updates } : brand)));
  };

  const deleteBrand = async (id) => {
    try {
      const result = await apiFetch(`/brands/${id}`, { method: 'DELETE' });
      if (result === null) {
        if (!mockFallbackEnabled) {
          setUnavailableMessage();
          return;
        }
      } else {
        setApiError(null);
      }
    } catch (error) {
      if (!mockFallbackEnabled) {
        if (isApiUnavailableError(error)) setUnavailableMessage();
        else setApiErrorFromError(error, 'No se pudo eliminar la marca');
        return;
      }
    }
    setBrands((prev) => prev.filter((brand) => brand.id !== id));
  };

  const addInquiry = async (inquiry) => {
    let newInquiry;
    try {
      const result = await apiFetch('/contacts', {
        method: 'POST',
        body: JSON.stringify(inquiry),
      });
      if (result === null) {
        if (!mockFallbackEnabled) {
          setUnavailableMessage();
          return null;
        }
        newInquiry = { ...inquiry, id: inquiry.id || Date.now(), status: inquiry.status || 'pending' };
      } else {
        newInquiry = result;
        setApiError(null);
      }
    } catch (error) {
      if (!mockFallbackEnabled) {
        if (isApiUnavailableError(error)) setUnavailableMessage();
        else setApiErrorFromError(error, 'No se pudo crear la consulta');
        return null;
      }
      newInquiry = { ...inquiry, id: inquiry.id || Date.now(), status: inquiry.status || 'pending' };
    }
    setInquiries((prev) => [newInquiry, ...prev]);
    return newInquiry;
  };

  const updateInquiryStatus = async (id, status) => {
    try {
      const result = await apiFetch(`/contacts/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (result === null) {
        if (!mockFallbackEnabled) {
          setUnavailableMessage();
          return;
        }
      }
      if (result) {
        setApiError(null);
        setInquiries((prev) => prev.map((inquiry) => (inquiry.id === id ? result : inquiry)));
        return;
      }
    } catch (error) {
      if (!mockFallbackEnabled) {
        if (isApiUnavailableError(error)) setUnavailableMessage();
        else setApiErrorFromError(error, 'No se pudo actualizar la consulta');
        return;
      }
    }
    setInquiries((prev) => prev.map((inquiry) => (inquiry.id === id ? { ...inquiry, status } : inquiry)));
  };

  const getStats = () => ({
    totalProducts: products.length,
    activeProducts: products.filter((product) => product.isActive).length,
    featuredProducts: products.filter((product) => product.isFeatured).length,
    outOfStock: products.filter((product) => product.stockStatus === 'out_of_stock').length,
    totalCategories: categories.length,
    totalBrands: brands.length,
    pendingInquiries: inquiries.filter((inquiry) => inquiry.status === 'pending').length,
    totalInquiries: inquiries.length,
  });

  return (
    <AdminContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductActive,
        toggleProductFeatured,
        updateStockStatus,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        brands,
        addBrand,
        updateBrand,
        deleteBrand,
        inquiries,
        addInquiry,
        updateInquiryStatus,
        getStats,
        apiMetrics,
        apiError,
        dataLoaded,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
};
