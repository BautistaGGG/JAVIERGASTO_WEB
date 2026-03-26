import { formatDate } from './shared';

export default function ActivityTimeline({ items }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <h3 className="text-sm font-extrabold text-gray-700 uppercase tracking-wide mb-3">Actividad reciente</h3>
      {items.length === 0 && <p className="text-xs text-gray-500">Todavia no hay actividad registrada.</p>}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
            <p className="text-xs font-semibold text-gray-800">{item.title}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{formatDate(item.at)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
