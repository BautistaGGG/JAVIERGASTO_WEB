import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Eye, Filter, Search, X } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import Pagination from './Pagination';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import AdminSectionLoader from './AdminSectionLoader';
import { trackWhatsAppClick } from '../../services/trackingService';
import { DEFAULT_INQUIRY_FILTERS, formatDate, parseDateValue } from './shared';

export default function InquiriesManager({ filters, setFilters, onActivity }) {
  const { inquiries, updateInquiryStatus, loadingState, apiError } = useAdmin();
  const { addToast } = useToast();
  const [expandedId, setExpandedId] = useState(null);
  const [busyIds, setBusyIds] = useState([]);
  const expandedCloseTargetRef = useRef(null);

  const filtered = useMemo(() => {
    const text = filters.search.trim().toLowerCase();
    const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const to = filters.dateTo ? new Date(filters.dateTo) : null;
    if (to) to.setHours(23, 59, 59, 999);

    return inquiries
      .filter((item) => {
        if (filters.status !== 'all' && item.status !== filters.status) return false;
        if (filters.source !== 'all' && item.source !== filters.source) return false;
        const blob = `${item.name || ''} ${item.email || ''} ${item.phone || ''} ${item.subject || ''} ${item.message || ''} ${item.productName || ''}`.toLowerCase();
        if (text && !blob.includes(text)) return false;

        const date = parseDateValue(item.createdAt || item.updatedAt || item.date);
        if (from && (!date || date < from)) return false;
        if (to && (!date || date > to)) return false;
        return true;
      })
      .sort((a, b) => (parseDateValue(b.createdAt || b.updatedAt || b.date)?.getTime() || 0) - (parseDateValue(a.createdAt || a.updatedAt || a.date)?.getTime() || 0));
  }, [inquiries, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / filters.pageSize));
  const safePage = Math.min(filters.page, totalPages);
  const pageItems = useMemo(() => filtered.slice((safePage - 1) * filters.pageSize, safePage * filters.pageSize), [filtered, safePage, filters.pageSize]);

  useEffect(() => {
    if (safePage !== filters.page) setFilters((prev) => ({ ...prev, page: safePage }));
  }, [safePage, filters.page, setFilters]);

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  const resetFilters = () => {
    setFilters({ ...DEFAULT_INQUIRY_FILTERS });
  };

  const formatDateInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const applyPreset = (preset) => {
    if (preset === 'replied_today') {
      const today = formatDateInput(new Date());
      setFilters((prev) => ({ ...prev, status: 'replied', source: 'all', search: '', dateFrom: today, dateTo: today, page: 1 }));
      return;
    }

    if (preset === 'whatsapp_pending') {
      setFilters((prev) => ({ ...prev, status: 'pending', source: 'whatsapp', search: '', dateFrom: '', dateTo: '', page: 1 }));
    }
  };

  const setStatus = async (item, status) => {
    setBusyIds((prev) => [...prev, item.id]);
    try {
      await updateInquiryStatus(item.id, status);
      addToast('Estado de consulta actualizado.', 'success');
      onActivity(`Consulta ${status === 'replied' ? 'respondida' : 'pendiente'}: ${item.name}`);
    } catch {
      addToast(`No se pudo actualizar la consulta.${apiError ? ` ${apiError}` : ''}`, 'error');
    } finally {
      setBusyIds((prev) => prev.filter((id) => id !== item.id));
    }
  };

  const closeExpanded = () => setExpandedId(null);

  const openExpanded = (id, trigger = null) => {
    expandedCloseTargetRef.current = trigger || document.activeElement;
    setExpandedId(id);
  };

  useEffect(() => {
    if (expandedId !== null) return;
    if (expandedCloseTargetRef.current && typeof expandedCloseTargetRef.current.focus === 'function') {
      expandedCloseTargetRef.current.focus();
      expandedCloseTargetRef.current = null;
    }
  }, [expandedId]);

  useEffect(() => {
    if (expandedId === null) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeExpanded();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [expandedId]);

  const expanded = filtered.find((item) => item.id === expandedId) || null;
  const expandedIndex = filtered.findIndex((item) => item.id === expandedId);
  const goToAdjacent = (dir) => {
    if (expandedIndex < 0) return;
    const next = filtered[expandedIndex + dir];
    if (next) setExpandedId(next.id);
  };

  const normalizedPhone = expanded?.phone ? String(expanded.phone).replace(/[^\d]/g, '') : '';
  const canReplyByWhatsApp = normalizedPhone.length >= 7;
  const whatsappReplyHref = canReplyByWhatsApp
    ? `https://wa.me/${normalizedPhone}`
    : '';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-3">
        <h2 className="text-xl font-extrabold text-gray-900">Consultas Recibidas</h2>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full font-bold">{inquiries.filter((i) => i.status === 'pending').length} pendientes</span>
          <span className="text-gray-400">&middot;</span>
          <span>{inquiries.length} total</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <label className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={filters.search} onChange={(event) => setFilter('search', event.target.value)} placeholder="Buscar por nombre, WhatsApp, asunto o mensaje" className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
          </label>
          <select value={filters.status} onChange={(event) => setFilter('status', event.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"><option value="pending">Solo pendientes</option><option value="replied">Solo respondidas</option><option value="all">Todos los estados</option></select>
          <select value={filters.source} onChange={(event) => setFilter('source', event.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"><option value="all">Origen: todos</option><option value="contact_form">Formulario</option><option value="whatsapp">WhatsApp</option><option value="product_page">Producto</option></select>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">Desde<input type="date" value={filters.dateFrom} onChange={(event) => setFilter('dateFrom', event.target.value)} className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" /></label>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">Hasta<input type="date" value={filters.dateTo} onChange={(event) => setFilter('dateTo', event.target.value)} className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" /></label>
          <button type="button" onClick={resetFilters} className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl px-3 py-2.5 text-sm font-semibold"><Filter size={15} /> Limpiar filtros</button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => applyPreset('replied_today')} className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-red-50 text-red-700 border-red-200 hover:bg-red-100">Respondidas hoy</button>
          <button type="button" onClick={() => applyPreset('whatsapp_pending')} className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100">WhatsApp pendientes</button>
        </div>
      </div>

      {!inquiries.length && loadingState.inquiries ? (
        <AdminSectionLoader label="Cargando consultas..." />
      ) : (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Contacto</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase hidden lg:table-cell">Motivo</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Producto</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Fecha</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Estado</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.map((inq) => {
                const rowBusy = busyIds.includes(inq.id);

                return (
                  <tr key={inq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3"><p className="font-semibold text-gray-900 text-xs">{inq.name}</p></td>
                    <td className="px-4 py-3 text-xs text-gray-600">{inq.phone || inq.email || '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 hidden lg:table-cell">{inq.subject || '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[150px] truncate">{inq.productName || '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(inq.createdAt || inq.updatedAt || inq.date)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${inq.status === 'pending' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        {inq.status === 'pending' ? 'Pendiente' : 'Respondida'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={(event) => openExpanded(inq.id, event.currentTarget)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-100"
                        >
                          <Eye size={13} /> Detalle
                        </button>
                        <button
                          type="button"
                          disabled={rowBusy || inq.status === 'replied'}
                          onClick={() => setStatus(inq, 'replied')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check size={13} /> Marcar respondida
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="md:hidden p-3 space-y-3">
          {pageItems.map((inq) => {
            const rowBusy = busyIds.includes(inq.id);

            return (
              <div key={inq.id} className="rounded-xl border bg-white p-3 border-gray-200">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{inq.name}</p>
                    <p className="text-xs text-gray-500">{inq.phone || inq.email || '-'}</p>
                    <p className="text-xs text-gray-500">{formatDate(inq.createdAt || inq.updatedAt || inq.date)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inq.status === 'pending' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{inq.status === 'pending' ? 'Pendiente' : 'Respondida'}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">{inq.subject || '-'}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" onClick={(event) => openExpanded(inq.id, event.currentTarget)} className="inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 bg-white">
                    <Eye size={13} /> Ver detalle
                  </button>
                  <button
                    type="button"
                    disabled={rowBusy || inq.status === 'replied'}
                    onClick={() => setStatus(inq, 'replied')}
                    className="inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <Check size={13} /> Marcar respondida
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {pageItems.length === 0 && <div className="px-4 py-10 text-center text-gray-500 text-sm">No hay consultas para los filtros actuales. <button type="button" onClick={resetFilters} className="text-red-600 hover:text-red-700 font-semibold">Limpiar filtros</button></div>}
        <Pagination page={safePage} totalPages={totalPages} onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))} />
      </div>
      )}

      {expanded && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4" onClick={closeExpanded}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-bold text-gray-900 text-sm">Detalle de consulta</h3>
              <button type="button" aria-label="Cerrar detalle de consulta" onClick={closeExpanded} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Nombre</p>
                  <p className="text-sm font-semibold text-gray-900">{expanded.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">WhatsApp</p>
                  <p className="text-sm text-gray-900">{expanded.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Fecha</p>
                  <p className="text-sm text-gray-700">{formatDate(expanded.createdAt || expanded.updatedAt || expanded.date)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Motivo</p>
                  <p className="text-sm text-gray-700">{expanded.subject || '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Producto consultado</p>
                <p className="text-sm text-gray-700">{expanded.productName || '-'}</p>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Mensaje</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl leading-relaxed">{expanded.message || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => goToAdjacent(-1)} disabled={expandedIndex <= 0} className="px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40">Anterior</button>
                <button type="button" onClick={() => goToAdjacent(1)} disabled={expandedIndex < 0 || expandedIndex >= filtered.length - 1} className="px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40">Siguiente</button>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setStatus(expanded, expanded.status === 'pending' ? 'replied' : 'pending')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm ${expanded.status === 'pending' ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'}`}>
                  {expanded.status === 'pending' ? 'Marcar como respondida' : 'Marcar como pendiente'}
                </button>

                {canReplyByWhatsApp ? (
                  <a
                    href={whatsappReplyHref}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      onActivity(`Respuesta por WhatsApp iniciada para ${expanded.name}`);
                      void trackWhatsAppClick('admin_inquiry_reply', { inquiryId: expanded.id });
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-1.5"
                  >
                    <WhatsAppIcon size={14} className="bg-white rounded-full" /> Responder
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => addToast('La consulta no tiene un telefono valido para WhatsApp.', 'warning')}
                    className="px-4 py-2.5 bg-gray-300 text-gray-600 rounded-xl font-bold text-sm flex items-center gap-1.5"
                  >
                    <WhatsAppIcon size={14} className="bg-white rounded-full" /> Sin WhatsApp
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
