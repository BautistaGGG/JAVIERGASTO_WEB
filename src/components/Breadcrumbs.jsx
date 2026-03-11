import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumbs component
 * @param {{ items: Array<{label: string, path?: string}> }} props
 */
export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="bg-white border-b border-gray-200" aria-label="Breadcrumb">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <ol className="flex items-center gap-1.5 text-sm flex-wrap">
          <li>
            <Link
              to="/"
              className="text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <Home size={14} />
              <span className="hidden sm:inline">Inicio</span>
            </Link>
          </li>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className="flex items-center gap-1.5 min-w-0">
                <ChevronRight size={12} className="text-gray-300 shrink-0" />
                {isLast || !item.path ? (
                  <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className="text-gray-500 hover:text-blue-600 transition-colors truncate max-w-[150px] sm:max-w-none"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
