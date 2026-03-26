import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const safeCurrent = Math.max(1, Math.min(page, totalPages));
  const pages = [];
  for (let n = Math.max(1, safeCurrent - 2); n <= Math.min(totalPages, safeCurrent + 2); n += 1) pages.push(n);

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50/70">
      <p className="text-xs text-gray-500">Pagina {safeCurrent} de {totalPages}</p>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onPageChange(safeCurrent - 1)} disabled={safeCurrent === 1} className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-white disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-red-500"><ChevronLeft size={14} /></button>
        {pages.map((n) => <button key={n} type="button" onClick={() => onPageChange(n)} className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-red-500 ${n === safeCurrent ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}>{n}</button>)}
        <button type="button" onClick={() => onPageChange(safeCurrent + 1)} disabled={safeCurrent === totalPages} className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-white disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-red-500"><ChevronRight size={14} /></button>
      </div>
    </div>
  );
}
