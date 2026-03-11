import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, ChevronRight, ExternalLink } from 'lucide-react';
import { COMPANY_NAME, categories } from '../data/products';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId) => (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  const handleNosotrosClick = scrollToSection('nosotros');
  const handleFaqClick = scrollToSection('faq');

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="font-black text-sm text-white">IP</span>
              </div>
              <div>
                <span className="font-bold text-lg leading-none block">{COMPANY_NAME}</span>
                <span className="text-[10px] text-gray-400 leading-none">Insumos Industriales</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Distribuidor autorizado de insumos industriales. Más de 15 años abasteciendo fábricas, constructoras y empresas en todo el país con las mejores marcas.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-white">Navegación</h4>
            <nav className="space-y-2.5">
              <Link to="/" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors group">
                <ChevronRight size={14} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                Inicio
              </Link>
              <Link to="/productos" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors group">
                <ChevronRight size={14} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                Productos
              </Link>
              <a href="#nosotros" onClick={handleNosotrosClick} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors group cursor-pointer">
                <ChevronRight size={14} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                Nosotros
              </a>
              <Link to="/contacto" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors group">
                <ChevronRight size={14} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                Contacto
              </Link>
              <a href="#faq" onClick={handleFaqClick} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors group cursor-pointer">
                <ChevronRight size={14} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                Preguntas Frecuentes
              </a>
              <Link to="/comparar" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors group">
                <ChevronRight size={14} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                Comparador
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-white">Categorías</h4>
            <nav className="space-y-2.5">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/productos?cat=${cat.id}`}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors group"
                >
                  <span className="text-xs">{cat.icon}</span>
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-white">Contacto</h4>
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={14} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-300 font-medium">Dirección</p>
                  <p className="text-xs text-gray-500">Av. Industrial 1234, CABA</p>
                  <p className="text-xs text-gray-500">Buenos Aires, Argentina</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Phone size={14} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-300 font-medium">Teléfono</p>
                  <p className="text-xs text-gray-500">+54 11 1234-5678</p>
                  <p className="text-xs text-gray-500">+54 11 8765-4321</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Mail size={14} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-300 font-medium">Email</p>
                  <p className="text-xs text-gray-500">ventas@industrialpro.com</p>
                  <p className="text-xs text-gray-500">info@industrialpro.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Clock size={14} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-300 font-medium">Horario</p>
                  <p className="text-xs text-gray-500">Lun - Vie: 8:00 a 18:00</p>
                  <p className="text-xs text-gray-500">Sáb: 8:00 a 13:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-gray-500">
              <span>Condiciones comerciales sujetas a disponibilidad</span>
              <span className="hidden md:inline">•</span>
              <span>Precios + IVA</span>
              <span className="hidden md:inline">•</span>
              <span>Factura A y B</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>Datos fiscales: CUIT 30-12345678-9</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} {COMPANY_NAME}. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1">
                <ExternalLink size={10} />
                Panel Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
