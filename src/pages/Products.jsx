import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, SlidersHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown, ArrowUpDown, RotateCcw } from 'lucide-react';
import { products as allProducts, categories, brands, formatPrice } from '../data/products';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';
import SkeletonCard from '../components/SkeletonCard';
import { useComparator, CompareBar } from './Comparator';

const PRODUCTS_PER_PAGE = 8;

const SORT_OPTIONS = [
  { value: 'default', label: 'Relevancia' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'name_asc', label: 'A - Z' },
  { value: 'name_desc', label: 'Z - A' },
  { value: 'stock_desc', label: 'Mayor stock' },
];

const STOCK_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'in_stock', label: 'En stock' },
  { value: 'low_stock', label: 'Últimas unidades' },
  { value: 'out_of_stock', label: 'Sin stock' },
];

const PRICE_RANGES = [
  { value: '', label: 'Todos los precios', min: 0, max: Infinity },
  { value: '0-25000', label: 'Hasta $25.000', min: 0, max: 25000 },
  { value: '25000-50000', label: '$25.000 - $50.000', min: 25000, max: 50000 },
  { value: '50000-100000', label: '$50.000 - $100.000', min: 50000, max: 100000 },
  { value: '100000-200000', label: '$100.000 - $200.000', min: 100000, max: 200000 },
  { value: '200000-plus', label: 'Más de $200.000', min: 200000, max: Infinity },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') || '');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedStock, setSelectedStock] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { compareIds, toggleCompare, isInCompare, clearCompare } = useComparator();

  // Sidebar sections collapsed state
  const [sidebarSections, setSidebarSections] = useState({
    category: true,
    brand: true,
    price: true,
    stock: true,
  });

  const toggleSection = (section) => {
    setSidebarSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('cat');
    if (q) setSearch(q);
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [search, selectedCategory, selectedBrand, selectedStock, selectedPriceRange]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedBrand, selectedStock, selectedPriceRange, sortBy]);

  const filtered = useMemo(() => {
    let result = allProducts.filter((p) => {
      if (!p.isActive) return false;
      if (search) {
        const q = search.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (selectedCategory && p.categoryId !== Number(selectedCategory)) return false;
      if (selectedBrand && p.brandId !== Number(selectedBrand)) return false;
      if (selectedStock && p.stockStatus !== selectedStock) return false;
      if (selectedPriceRange) {
        const range = PRICE_RANGES.find(r => r.value === selectedPriceRange);
        if (range && (p.price < range.min || p.price > range.max)) return false;
      }
      return true;
    });

    // Sort
    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'name_asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name_desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      default: break;
    }

    return result;
  }, [search, selectedCategory, selectedBrand, selectedStock, selectedPriceRange, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filtered.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filtered, currentPage]);

  const goToPage = (page) => {
    const p = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedStock('');
    setSelectedPriceRange('');
    setSortBy('default');
    setSearchParams({});
  };

  const hasFilters = search || selectedCategory || selectedBrand || selectedStock || selectedPriceRange;
  const activeCatName = selectedCategory ? categories.find((c) => c.id === Number(selectedCategory))?.name : null;
  const activeFilterCount = [selectedCategory, selectedBrand, selectedStock, selectedPriceRange, search].filter(Boolean).length;

  const breadcrumbItems = [];
  if (activeCatName) {
    breadcrumbItems.push({ label: 'Productos', path: '/productos' });
    breadcrumbItems.push({ label: activeCatName });
  } else {
    breadcrumbItems.push({ label: 'Todos los Productos' });
  }

  // Category product counts
  const catCounts = useMemo(() => {
    const counts = {};
    allProducts.filter(p => p.isActive).forEach(p => {
      counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
    });
    return counts;
  }, []);

  // Brand product counts
  const brandCounts = useMemo(() => {
    const counts = {};
    allProducts.filter(p => p.isActive).forEach(p => {
      counts[p.brandId] = (counts[p.brandId] || 0) + 1;
    });
    return counts;
  }, []);

  /* Sidebar filter panel */
  const FilterPanel = ({ isMobile = false }) => (
    <div className={isMobile ? 'space-y-4' : 'space-y-1'}>
      {/* Section */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-bold text-gray-800">Categorías</span>
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${sidebarSections.category ? 'rotate-180' : ''}`} />
        </button>
        {sidebarSections.category && (
          <div className="p-3 space-y-1">
            <button
              onClick={() => setSelectedCategory('')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                !selectedCategory ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Todas <span className="text-xs text-gray-400 ml-1">({allProducts.filter(p => p.isActive).length})</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(selectedCategory === String(c.id) ? '' : String(c.id))}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                  selectedCategory === String(c.id) ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{c.icon}</span>
                <span className="flex-1">{c.name}</span>
                <span className="text-xs text-gray-400">({catCounts[c.id] || 0})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Section */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('brand')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-bold text-gray-800">Marcas</span>
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${sidebarSections.brand ? 'rotate-180' : ''}`} />
        </button>
        {sidebarSections.brand && (
          <div className="p-3 space-y-1">
            <button
              onClick={() => setSelectedBrand('')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                !selectedBrand ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Todas
            </button>
            {brands.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBrand(selectedBrand === String(b.id) ? '' : String(b.id))}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                  selectedBrand === String(b.id) ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{b.name}</span>
                <span className="text-xs text-gray-400">({brandCounts[b.id] || 0})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Section */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-bold text-gray-800">Precio</span>
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${sidebarSections.price ? 'rotate-180' : ''}`} />
        </button>
        {sidebarSections.price && (
          <div className="p-3 space-y-1">
            {PRICE_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedPriceRange(selectedPriceRange === range.value ? '' : range.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedPriceRange === range.value ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Section */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('stock')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-bold text-gray-800">Disponibilidad</span>
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${sidebarSections.stock ? 'rotate-180' : ''}`} />
        </button>
        {sidebarSections.stock && (
          <div className="p-3 space-y-1">
            {STOCK_FILTERS.map((sf) => (
              <button
                key={sf.value}
                onClick={() => setSelectedStock(selectedStock === sf.value ? '' : sf.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedStock === sf.value ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumbs items={breadcrumbItems} />

      {/* Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            {activeCatName || 'Todos los Productos'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Cargando...' : `${filtered.length} producto${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Section */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          {/* Section */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, marca, SKU..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Section */}
          <div className="hidden md:flex items-center gap-2">
            <ArrowUpDown size={14} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px] transition-all"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div className="flex gap-2 md:hidden">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium bg-white transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filtros
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-3 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {hasFilters && !loading && (
          <div className="mb-4">
            <button
              onClick={clearFilters}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-xl font-semibold transition-colors"
            >
              <RotateCcw size={14} />
              Limpiar todos los filtros
            </button>
          </div>
        )}

        {/* Section */}
        {showMobileFilters && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 animate-overlay-in" onClick={() => setShowMobileFilters(false)} />
            <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-50 overflow-y-auto animate-fade-in-up shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10">
                <h3 className="text-lg font-bold text-gray-900">Filtros</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4">
                <FilterPanel isMobile />
              </div>
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-colors"
                >
                  Ver {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Section */}
        {hasFilters && !loading && (
          <div className="flex flex-wrap gap-2 mb-5 animate-fade-in">
            {search && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                Búsqueda: &quot;{search}&quot;
                <button onClick={() => setSearch('')}><X size={12} /></button>
              </span>
            )}
            {activeCatName && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                {activeCatName}
                <button onClick={() => setSelectedCategory('')}><X size={12} /></button>
              </span>
            )}
            {selectedBrand && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                {brands.find((b) => b.id === Number(selectedBrand))?.name}
                <button onClick={() => setSelectedBrand('')}><X size={12} /></button>
              </span>
            )}
            {selectedPriceRange && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                {PRICE_RANGES.find(r => r.value === selectedPriceRange)?.label}
                <button onClick={() => setSelectedPriceRange('')}><X size={12} /></button>
              </span>
            )}
            {selectedStock && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                {STOCK_FILTERS.find(s => s.value === selectedStock)?.label}
                <button onClick={() => setSelectedStock('')}><X size={12} /></button>
              </span>
            )}
          </div>
        )}

        {/* Section */}
        <div className="flex gap-6">
          {/* Section */}
          <aside className="hidden lg:block w-[260px] shrink-0">
            <div className="sticky top-24">
              <FilterPanel />
            </div>
          </aside>

          {/* Section */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isInCompare={isInCompare(product.id)}
                      onToggleCompare={toggleCompare}
                    />
                  ))}
                </div>

                {/* Section */}
                {totalPages > 1 && (
                  <div className="mt-10 mb-4">
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-500">
                        Mostrando{' '}
                        <span className="font-semibold text-gray-700">
                          {(currentPage - 1) * PRODUCTS_PER_PAGE + 1}
                        </span>
                        {' - '}
                        <span className="font-semibold text-gray-700">
                          {Math.min(currentPage * PRODUCTS_PER_PAGE, filtered.length)}
                        </span>
                        {' de '}
                        <span className="font-semibold text-gray-700">{filtered.length}</span>
                        {' productos'}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className={`p-2.5 rounded-xl transition-all ${
                          currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        <ChevronsLeft size={18} />
                      </button>
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2.5 rounded-xl transition-all ${
                          currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, idx) =>
                          page === '...' ? (
                            <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">...</span>
                          ) : (
                            <button
                              key={page}
                              onClick={() => goToPage(page)}
                              className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                              }`}
                            >
                              {page}
                            </button>
                          )
                        )}
                      </div>
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2.5 rounded-xl transition-all ${
                          currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        <ChevronRight size={18} />
                      </button>
                      <button
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className={`p-2.5 rounded-xl transition-all ${
                          currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        <ChevronsRight size={18} />
                      </button>
                    </div>

                    {/* Section */}
                    <div className="flex sm:hidden items-center justify-between mt-4 px-2">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                        }`}
                      >
                        <ChevronLeft size={16} /> Anterior
                      </button>
                      <span className="text-sm font-bold text-gray-700">{currentPage} / {totalPages}</span>
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                        }`}
                      >
                        Siguiente <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">No se encontraron productos</h3>
                <p className="text-sm text-gray-500 mt-1">Probá con otros términos o filtros</p>
                <button onClick={clearFilters} className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors">
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <CompareBar compareIds={compareIds} onClear={clearCompare} />
      {compareIds.length > 0 && <div className="h-16" />}
    </div>
  );
}





