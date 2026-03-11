import { createContext, useContext, useEffect, useState } from 'react';
import { products as mockProducts, categories as mockCategories, brands as mockBrands, mockInquiries } from '../data/products';
import { apiFetch } from '../services/api';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [products, setProducts] = useState([...mockProducts]);
  const [categories, setCategories] = useState([...mockCategories]);
  const [brands, setBrands] = useState([...mockBrands]);
  const [inquiries, setInquiries] = useState([...mockInquiries]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const loadFromAPI = async () => {
      try {
        const [prods, cats, brs, inqs] = await Promise.all([
          apiFetch('/products?all=true'),
          apiFetch('/categories'),
          apiFetch('/brands'),
          apiFetch('/contacts').catch(() => null),
        ]);

        if (prods) setProducts(prods);
        if (cats) setCategories(cats);
        if (brs) setBrands(brs);
        if (inqs) setInquiries(inqs);
      } catch {
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
      newProduct = result || { ...product, id: Date.now(), isActive: true };
    } catch {
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
      if (result) {
        setProducts((prev) => prev.map((product) => (product.id === id ? result : product)));
        return result;
      }
    } catch {
    }

    setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, ...updates } : product)));
    return { id, ...updates };
  };

  const deleteProduct = async (id) => {
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
    } catch {
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
      newCategory = result || { ...category, id: Date.now(), slug: category.name.toLowerCase().replace(/\s+/g, '-') };
    } catch {
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
      if (result) {
        setCategories((prev) => prev.map((category) => (category.id === id ? result : category)));
        setProducts((prev) => prev.map((product) => (
          product.categoryId === id ? { ...product, category: result.name } : product
        )));
        return;
      }
    } catch {
    }
    setCategories((prev) => prev.map((category) => (category.id === id ? { ...category, ...updates } : category)));
  };

  const deleteCategory = async (id) => {
    try {
      await apiFetch(`/categories/${id}`, { method: 'DELETE' });
    } catch {
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
      newBrand = result || { ...brand, id: Date.now(), isActive: true };
    } catch {
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
      if (result) {
        setBrands((prev) => prev.map((brand) => (brand.id === id ? result : brand)));
        setProducts((prev) => prev.map((product) => (
          product.brandId === id ? { ...product, brand: result.name } : product
        )));
        return;
      }
    } catch {
    }
    setBrands((prev) => prev.map((brand) => (brand.id === id ? { ...brand, ...updates } : brand)));
  };

  const deleteBrand = async (id) => {
    try {
      await apiFetch(`/brands/${id}`, { method: 'DELETE' });
    } catch {
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
      newInquiry = result || { ...inquiry, id: inquiry.id || Date.now(), status: inquiry.status || 'pending' };
    } catch {
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
      if (result) {
        setInquiries((prev) => prev.map((inquiry) => (inquiry.id === id ? result : inquiry)));
        return;
      }
    } catch {
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
