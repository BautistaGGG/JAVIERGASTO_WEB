import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { products as mockProducts, categories as mockCategories, brands as mockBrands, mockInquiries } from '../data/products';
import { isMockFallbackEnabled } from '../config/runtime.js';
import { apiFetch, ensureApiResponse, isApiUnavailableError } from '../services/api';
import { formatApiErrorMessage } from '../services/errorUtils';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const mockFallbackEnabled = isMockFallbackEnabled();
  const [products, setProducts] = useState(mockFallbackEnabled ? [...mockProducts] : []);
  const [categories, setCategories] = useState(mockFallbackEnabled ? [...mockCategories] : []);
  const [brands, setBrands] = useState(mockFallbackEnabled ? [...mockBrands] : []);
  const [inquiries, setInquiries] = useState(mockFallbackEnabled ? [...mockInquiries] : []);
  const [auditEvents, setAuditEvents] = useState([]);
  const [apiMetrics, setApiMetrics] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadingState, setLoadingState] = useState({
    core: false,
    inquiries: false,
    metrics: false,
    audit: false,
  });

  const loadedRef = useRef({
    core: false,
    inquiries: false,
    metrics: false,
    audit: false,
  });

  const inFlightRef = useRef({
    core: null,
    inquiries: null,
    metrics: null,
    audit: null,
  });

  const setUnavailableMessage = () => {
    setApiError('No se pudo conectar con la API de administracion.');
  };

  const setApiErrorFromError = (error, fallback) => {
    setApiError(formatApiErrorMessage(error, fallback));
  };

  const parseInquiryList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  };

  const setLoading = (key, value) => {
    setLoadingState((prev) => ({ ...prev, [key]: value }));
  };

  const withAuthToken = () => {
    const token = localStorage.getItem('industrialpro_token');
    return typeof token === 'string' && token.length > 0;
  };

  const loadCoreData = useCallback(async ({ force = false } = {}) => {
    if (!force && loadedRef.current.core) return true;
    if (!force && inFlightRef.current.core) return inFlightRef.current.core;

    const request = (async () => {
      setLoading('core', true);
      try {
        const [prods, cats, brs] = await Promise.all([
          apiFetch('/products?all=true'),
          apiFetch('/categories'),
          apiFetch('/brands'),
        ]);

        const safeProducts = ensureApiResponse(prods, '/products?all=true');
        const safeCategories = ensureApiResponse(cats, '/categories');
        const safeBrands = ensureApiResponse(brs, '/brands');

        setProducts(safeProducts);
        setCategories(safeCategories);
        setBrands(safeBrands);
        setApiError(null);
        loadedRef.current.core = true;
        return true;
      } catch (error) {
        if (!mockFallbackEnabled) {
          if (isApiUnavailableError(error)) setUnavailableMessage();
          else setApiErrorFromError(error, 'No se pudo cargar el panel de administracion');
          return false;
        }
        return true;
      } finally {
        setLoading('core', false);
        setDataLoaded(true);
        inFlightRef.current.core = null;
      }
    })();

    inFlightRef.current.core = request;
    return request;
  }, [mockFallbackEnabled]);

  const loadInquiries = useCallback(async ({ force = false } = {}) => {
    if (!isAuthenticated || !withAuthToken()) return [];
    if (!force && loadedRef.current.inquiries) return [];
    if (!force && inFlightRef.current.inquiries) return inFlightRef.current.inquiries;

    const request = (async () => {
      setLoading('inquiries', true);
      try {
        const result = await apiFetch('/contacts');
        if (result !== null) {
          const parsed = parseInquiryList(result);
          setInquiries(parsed);
          setApiError(null);
          loadedRef.current.inquiries = true;
          return parsed;
        }
        return [];
      } catch (error) {
        if (!mockFallbackEnabled) {
          if (isApiUnavailableError(error)) setUnavailableMessage();
          else setApiErrorFromError(error, 'No se pudieron cargar las consultas');
        }
        return [];
      } finally {
        setLoading('inquiries', false);
        inFlightRef.current.inquiries = null;
      }
    })();

    inFlightRef.current.inquiries = request;
    return request;
  }, [isAuthenticated, mockFallbackEnabled]);

  const loadMetrics = useCallback(async ({ force = false } = {}) => {
    if (!isAuthenticated || !withAuthToken()) return null;
    if (!force && loadedRef.current.metrics) return null;
    if (!force && inFlightRef.current.metrics) return inFlightRef.current.metrics;

    const request = (async () => {
      setLoading('metrics', true);
      try {
        const result = await apiFetch('/admin/metrics');
        if (result !== null) {
          setApiMetrics(result);
          setApiError(null);
          loadedRef.current.metrics = true;
          return result;
        }
        return null;
      } catch (error) {
        if (!mockFallbackEnabled) {
          if (isApiUnavailableError(error)) setUnavailableMessage();
          else setApiErrorFromError(error, 'No se pudieron cargar las metricas');
        }
        return null;
      } finally {
        setLoading('metrics', false);
        inFlightRef.current.metrics = null;
      }
    })();

    inFlightRef.current.metrics = request;
    return request;
  }, [isAuthenticated, mockFallbackEnabled]);

  const loadAuditEvents = useCallback(async ({ force = false } = {}) => {
    if (!isAuthenticated || !withAuthToken()) return [];
    if (!force && loadedRef.current.audit) return [];
    if (!force && inFlightRef.current.audit) return inFlightRef.current.audit;

    const request = (async () => {
      setLoading('audit', true);
      try {
        const result = await apiFetch('/admin/audit?limit=80');
        if (result?.items) {
          setAuditEvents(result.items);
          loadedRef.current.audit = true;
          setApiError(null);
          return result.items;
        }
        return [];
      } catch (error) {
        if (!mockFallbackEnabled) {
          if (isApiUnavailableError(error)) setUnavailableMessage();
          else setApiErrorFromError(error, 'No se pudo cargar la auditoria');
        }
        return [];
      } finally {
        setLoading('audit', false);
        inFlightRef.current.audit = null;
      }
    })();

    inFlightRef.current.audit = request;
    return request;
  }, [isAuthenticated, mockFallbackEnabled]);

  const refreshAdminData = useCallback(async () => {
    await loadCoreData({ force: true });
    if (isAuthenticated) {
      await Promise.all([
        loadInquiries({ force: true }),
        loadMetrics({ force: true }),
        loadAuditEvents({ force: true }),
      ]);
    }
  }, [isAuthenticated, loadAuditEvents, loadCoreData, loadInquiries, loadMetrics]);

  useEffect(() => {
    if (!isAdminRoute || !isAuthenticated) return;
    void loadCoreData();
  }, [isAdminRoute, isAuthenticated, loadCoreData]);

  useEffect(() => {
    if (isAuthenticated) return;

    loadedRef.current.inquiries = false;
    loadedRef.current.metrics = false;
    loadedRef.current.audit = false;
    inFlightRef.current.inquiries = null;
    inFlightRef.current.metrics = null;
    inFlightRef.current.audit = null;

    setApiMetrics(null);
    setAuditEvents([]);
    setInquiries(mockFallbackEnabled ? [...mockInquiries] : []);
  }, [isAuthenticated, mockFallbackEnabled]);

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

  const updateProductPublishStatus = async (id, publishStatus) => {
    const safeStatus = ['draft', 'published', 'archived'].includes(publishStatus) ? publishStatus : 'draft';
    return updateProduct(id, { publishStatus: safeStatus, isActive: safeStatus === 'published' });
  };

  const restoreProductPreviousVersion = async (id) => {
    try {
      const result = await apiFetch(`/products/${id}/restore-previous`, {
        method: 'POST',
      });
      if (result === null) {
        if (!mockFallbackEnabled) {
          setUnavailableMessage();
          return null;
        }
        return null;
      }
      setProducts((prev) => prev.map((product) => (product.id === id ? result : product)));
      setApiError(null);
      return result;
    } catch (error) {
      if (!mockFallbackEnabled) {
        if (isApiUnavailableError(error)) setUnavailableMessage();
        else setApiErrorFromError(error, 'No se pudo restaurar la version anterior');
      }
      return null;
    }
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
        else setApiErrorFromError(error, 'No se pudo crear la categoria');
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
        else setApiErrorFromError(error, 'No se pudo actualizar la categoria');
        return;
      }
    }
    setCategories((prev) => prev.map((category) => (category.id === id ? { ...category, ...updates } : category)));
  };

  const deleteCategory = async (id) => {
    let fallbackCategory = null;
    let deletionApplied = false;

    try {
      const result = await apiFetch(`/categories/${id}`, { method: 'DELETE' });
      if (result === null) {
        if (!mockFallbackEnabled) {
          setUnavailableMessage();
          return;
        }
      } else {
        setApiError(null);
        fallbackCategory = result?.reassignedTo || null;
        deletionApplied = true;
      }
    } catch (error) {
      if (!mockFallbackEnabled) {
        if (isApiUnavailableError(error)) setUnavailableMessage();
        else setApiErrorFromError(error, 'No se pudo eliminar la categoria');
        return;
      }
    }

    setCategories((prev) => prev.filter((category) => category.id !== id));

    if (fallbackCategory || deletionApplied) {
      const fallbackId = fallbackCategory?.id ?? null;
      const fallbackName = fallbackCategory?.name ?? '';
      setProducts((prev) => prev.map((product) => (
        Number(product.categoryId) === Number(id)
          ? { ...product, categoryId: fallbackId, category: fallbackName || product.category }
          : product
      )));
    }
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

  const refreshAuditEvents = async () => loadAuditEvents({ force: true });

  return (
    <AdminContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductPublishStatus,
        restoreProductPreviousVersion,
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
        loadingState,
        auditEvents,
        refreshAuditEvents,
        loadInquiries,
        loadMetrics,
        loadAuditEvents,
        refreshAdminData,
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
