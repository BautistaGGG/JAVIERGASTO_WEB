import { Link } from 'react-router-dom';
import { MapPin, Clock, ExternalLink } from 'lucide-react';
import { COMPANY_NAME, categories } from '../data/products';
import { SITE_INFO } from '../config/siteInfo';
import BrandWordmark from './BrandWordmark';
import WhatsAppIcon from './WhatsAppIcon';

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4">
              <BrandWordmark />
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed mb-5">
              Distribuidor autorizado de insumos industriales. Mas de 15 anos abasteciendo fabricas, constructoras y empresas en todo el pais con las mejores marcas.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-white">Categorias</h4>
            <nav className="space-y-2.5">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/productos?cat=${cat.id}`}
                  className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors group"
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
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <WhatsAppIcon size={14} />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 font-medium">WhatsApp</p>
                  {SITE_INFO.phones.map((phone) => (
                    <p key={phone} className="text-xs text-zinc-400">{phone}</p>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={14} className="text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 font-medium">Direccion</p>
                  <p className="text-xs text-zinc-400">{SITE_INFO.address.line1}</p>
                  <p className="text-xs text-zinc-400">{SITE_INFO.address.city}, {SITE_INFO.address.province}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Clock size={14} className="text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 font-medium">Horario</p>
                  {SITE_INFO.hours.map((hourLine) => (
                    <p key={hourLine} className="text-xs text-zinc-400">{hourLine}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-zinc-400">
              © {new Date().getFullYear()} {COMPANY_NAME}. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-xs text-zinc-300 hover:text-zinc-500 transition-colors flex items-center gap-1">
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
