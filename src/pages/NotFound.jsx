import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../data/products';
import { buildGeneralWhatsAppMessage, generateWhatsAppLink } from '../services/productService';
import WhatsAppIcon from '../components/WhatsAppIcon';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center animate-fade-in">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-[120px] sm:text-[160px] font-black text-gray-100 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center animate-bounce-slow">
              <Search size={40} className="text-blue-600" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
          Página no encontrada
        </h2>
        <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto leading-relaxed mb-8">
          La página que buscás no existe o fue movida. Pero no te preocupes, podemos ayudarte a encontrar lo que necesitás.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            <Home size={18} />
            Ir al inicio
          </Link>
          <Link
            to="/productos"
            className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-700 px-6 py-3.5 rounded-xl font-bold text-sm transition-all"
          >
            <ArrowLeft size={18} />
            Ver catálogo
          </Link>
          <button
            onClick={() => {
              const msg = buildGeneralWhatsAppMessage('catalog_help');
              window.open(generateWhatsAppLink(WHATSAPP_NUMBER, msg), '_blank');
            }}
            className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg"
          >
            <WhatsAppIcon size={18} />
            Pedir ayuda
          </button>
        </div>

        {/* Fun extra */}
        <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-6 text-left">
          <h3 className="text-sm font-bold text-gray-900 mb-3">¿Qué podés hacer?</h3>
          <ul className="space-y-2.5">
            {[
              { text: 'Explorá nuestro catálogo completo', path: '/productos' },
              { text: 'Buscá por categoría o marca', path: '/productos' },
              { text: 'Escribinos por WhatsApp o formulario', path: '/contacto' },
            ].map((item) => (
              <li key={item.text}>
                <Link
                  to={item.path}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  • {item.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}





