import { useMemo, useState } from 'react';
import { Clock, RefreshCcw, Search } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import AdminSectionLoader from './AdminSectionLoader';
import { formatDate } from './shared';

export default function AuditManager() {
  const { auditEvents, refreshAuditEvents, loadingState } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return auditEvents;
    return auditEvents.filter((event) =>
      `${event.action || ''} ${event.entity || ''} ${event.actor || ''} ${event.detail || ''}`.toLowerCase().includes(term)
    );
  }, [auditEvents, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900">Auditoría de acciones</h2>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            refreshAuditEvents().finally(() => setLoading(false));
          }}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      <label className="relative block">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por acción, entidad, actor o detalle"
          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </label>

      {!auditEvents.length && loadingState.audit ? (
        <AdminSectionLoader label="Cargando auditoria..." />
      ) : (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filtered.map((event) => (
            <div key={event.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-gray-800">{event.action}</p>
                <p className="text-[11px] text-gray-500 inline-flex items-center gap-1"><Clock size={12} /> {formatDate(event.at)}</p>
              </div>
              <p className="text-xs text-gray-600 mt-1">{event.detail || '-'}</p>
              <p className="text-[11px] text-gray-400 mt-1">Actor: {event.actor || '-'} · Entidad: {event.entity || '-'} · ID: {event.entityId ?? '-'}</p>
            </div>
          ))}
        </div>
        {!filtered.length && <div className="px-4 py-10 text-center text-sm text-gray-500">Sin eventos para los filtros actuales.</div>}
      </div>
      )}
    </div>
  );
}
