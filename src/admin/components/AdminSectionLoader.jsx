import { Loader2 } from 'lucide-react';

export default function AdminSectionLoader({ label = 'Cargando datos...' }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500 shadow-sm">
      <div className="inline-flex items-center gap-2 font-semibold text-gray-700">
        <Loader2 size={16} className="animate-spin" />
        <span>{label}</span>
      </div>
    </div>
  );
}
