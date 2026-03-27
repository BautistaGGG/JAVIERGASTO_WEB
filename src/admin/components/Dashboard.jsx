import { useMemo } from 'react';
import { Clock, Eye, EyeOff, MessageSquare, Package, Star } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import ActivityTimeline from './ActivityTimeline';
import AdminSectionLoader from './AdminSectionLoader';
import { parseDateValue } from './shared';

export default function Dashboard({ inquiries, activityLog }) {
  const { getStats, apiError, products, loadingState } = useAdmin();
  const stats = getStats();

  const pendingOlderThan48h = useMemo(() => {
    const now = Date.now();
    return inquiries.filter((inq) => {
      if (inq.status !== 'pending') return false;
      const created = parseDateValue(inq.createdAt || inq.updatedAt || inq.date);
      if (!created) return false;
      return now - created.getTime() > 48 * 60 * 60 * 1000;
    }).length;
  }, [inquiries]);

  const responseRate = useMemo(() => {
    if (!inquiries.length) return 0;
    const replied = inquiries.filter((inq) => inq.status === 'replied').length;
    return Math.round((replied / inquiries.length) * 100);
  }, [inquiries]);

  const topConsultedProduct = useMemo(() => {
    const counts = new Map();
    for (const inq of inquiries) {
      const key = (inq.productName || '').trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    let winner = '-';
    let winnerCount = 0;
    for (const [name, count] of counts.entries()) {
      if (count > winnerCount) {
        winner = name;
        winnerCount = count;
      }
    }
    return { name: winner, count: winnerCount };
  }, [inquiries]);

  const weeklyComparison = useMemo(() => {
    const now = new Date();
    const startCurrentWeek = new Date(now);
    const dayOffset = (startCurrentWeek.getDay() + 6) % 7;
    startCurrentWeek.setDate(startCurrentWeek.getDate() - dayOffset);
    startCurrentWeek.setHours(0, 0, 0, 0);

    const startPreviousWeek = new Date(startCurrentWeek);
    startPreviousWeek.setDate(startPreviousWeek.getDate() - 7);
    const endPreviousWeek = new Date(startCurrentWeek);
    const endCurrentWeek = new Date(startCurrentWeek);
    endCurrentWeek.setDate(endCurrentWeek.getDate() + 7);

    const inCurrent = inquiries.filter((inq) => {
      const date = parseDateValue(inq.createdAt || inq.updatedAt || inq.date);
      return date && date >= startCurrentWeek && date < endCurrentWeek;
    });

    const inPrevious = inquiries.filter((inq) => {
      const date = parseDateValue(inq.createdAt || inq.updatedAt || inq.date);
      return date && date >= startPreviousWeek && date < endPreviousWeek;
    });

    const currentTotal = inCurrent.length;
    const previousTotal = inPrevious.length;
    const currentReplied = inCurrent.filter((inq) => inq.status === 'replied').length;
    const previousReplied = inPrevious.filter((inq) => inq.status === 'replied').length;
    const currentRate = currentTotal ? Math.round((currentReplied / currentTotal) * 100) : 0;
    const previousRate = previousTotal ? Math.round((previousReplied / previousTotal) * 100) : 0;

    const calcDelta = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      currentTotal,
      previousTotal,
      currentRate,
      previousRate,
      totalDelta: calcDelta(currentTotal, previousTotal),
      rateDelta: currentRate - previousRate,
    };
  }, [inquiries]);

  const cards = [
    { label: 'Productos totales', value: stats.totalProducts, color: 'bg-red-500', icon: Package },
    { label: 'Productos activos', value: stats.activeProducts, color: 'bg-gray-500', icon: Eye },
    { label: 'Destacados', value: stats.featuredProducts, color: 'bg-gray-500', icon: Star },
    { label: 'Sin stock', value: stats.outOfStock, color: 'bg-red-500', icon: EyeOff },
    { label: 'Consultas pendientes', value: stats.pendingInquiries, color: 'bg-gray-700', icon: MessageSquare },
    { label: 'Consultas >48h', value: pendingOlderThan48h, color: 'bg-red-700', icon: Clock },
    { label: 'Tasa de respuesta', value: `${responseRate}%`, color: 'bg-gray-500', icon: MessageSquare },
    { label: 'Top consultado', value: topConsultedProduct.count ? `${topConsultedProduct.count}` : '-', color: 'bg-red-500', icon: Package },
  ];

  const operationalAlerts = useMemo(() => {
    const alerts = [];
    const drafts = products.filter((product) => product.publishStatus === 'draft').length;
    const archived = products.filter((product) => product.publishStatus === 'archived').length;
    if (apiError) alerts.push({ id: 'api', level: 'critical', text: apiError });
    if (pendingOlderThan48h > 0) alerts.push({ id: 'sla', level: 'warning', text: `${pendingOlderThan48h} consultas superan SLA de 48h.` });
    if (drafts > 0) alerts.push({ id: 'drafts', level: 'info', text: `${drafts} productos en borrador pendientes de publicacion.` });
    if (archived > 0) alerts.push({ id: 'archived', level: 'info', text: `${archived} productos archivados.` });
    return alerts.slice(0, 6);
  }, [apiError, pendingOlderThan48h, products]);

  if (!inquiries.length && loadingState.inquiries) {
    return <AdminSectionLoader label="Cargando metricas y consultas..." />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h3 className="text-sm font-extrabold text-gray-700 uppercase tracking-wide mb-3">Comparativa semanal</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-red-100 bg-red-50/70 px-4 py-3">
            <p className="text-xs text-red-700 font-semibold">Consultas (esta semana vs pasada)</p>
            <p className="text-xl font-extrabold text-red-900 mt-1">{weeklyComparison.currentTotal} / {weeklyComparison.previousTotal}</p>
            <p className={`text-xs mt-1 font-semibold ${weeklyComparison.totalDelta >= 0 ? 'text-gray-700' : 'text-red-700'}`}>
              {weeklyComparison.totalDelta >= 0 ? '+' : ''}{weeklyComparison.totalDelta}% variacion
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3">
            <p className="text-xs text-gray-700 font-semibold">Tasa de respuesta</p>
            <p className="text-xl font-extrabold text-gray-900 mt-1">{weeklyComparison.currentRate}% / {weeklyComparison.previousRate}%</p>
            <p className={`text-xs mt-1 font-semibold ${weeklyComparison.rateDelta >= 0 ? 'text-gray-700' : 'text-red-700'}`}>
              {weeklyComparison.rateDelta >= 0 ? '+' : ''}{weeklyComparison.rateDelta} pts
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-6">Panel general</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center`}><c.icon size={18} className="text-white" /></div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900">{c.value}</p>
                  <p className="text-xs text-gray-500">{c.label}</p>
                  {c.label === 'Top consultado' && topConsultedProduct.count > 0 && <p className="text-[11px] text-gray-400 mt-0.5">{topConsultedProduct.name}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h3 className="text-sm font-extrabold text-gray-700 uppercase tracking-wide mb-3">Alertas operativas</h3>
        {operationalAlerts.length === 0 && <p className="text-xs text-gray-500">Sin alertas activas.</p>}
        <div className="space-y-2">
          {operationalAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg px-3 py-2 text-xs font-semibold border ${alert.level === 'critical' ? 'bg-red-50 border-red-200 text-red-700' : alert.level === 'warning' ? 'bg-gray-100 border-gray-300 text-gray-700' : 'bg-white border-gray-200 text-gray-600'}`}
            >
              {alert.text}
            </div>
          ))}
        </div>
      </div>

      <ActivityTimeline items={activityLog} />
    </div>
  );
}
