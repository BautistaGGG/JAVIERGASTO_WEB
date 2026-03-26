import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Truck, Shield, Clock, Star,
  Target, Eye, Users, Award, Building2,
  ChevronDown, Package, CreditCard, RefreshCw, FileText, HelpCircle, MessageCircle
} from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { WHATSAPP_NUMBER, COMPANY_NAME, categories } from '../data/products';
import { buildGeneralWhatsAppMessage, openTrackedWhatsApp } from '../services/productService';
import { SITE_INFO } from '../config/siteInfo';
import { useSeo } from '../hooks/useSeo';
import { useToast } from '../context/ToastContext';

const stats = [
  { value: '+15', label: 'Años de experiencia' },
  { value: '+500', label: 'Clientes activos' },
  { value: '+3.000', label: 'Productos' },
  { value: '99%', label: 'Satisfacción' },
];

const values = [
  { icon: Shield, title: 'Calidad garantizada', desc: 'Solo trabajamos con marcas líderes y productos certificados. Cada artículo cumple con las normas industriales vigentes.' },
  { icon: Clock, title: 'Agilidad', desc: 'Cotizaciones en menos de 1 hora. Despacho en 24-48hs hábiles. Tu operación no puede esperar.' },
  { icon: Users, title: 'Atención personalizada', desc: 'Asesores técnicos especializados que entienden las necesidades de tu industria.' },
  { icon: Truck, title: 'Logística confiable', desc: 'Red de distribución que cubre todo el país. Embalaje profesional y seguimiento en tiempo real.' },
  { icon: Award, title: 'Experiencia B2B', desc: 'Más de 15 años abasteciendo fábricas, constructoras, talleres y empresas de todos los rubros.' },
  { icon: Target, title: 'Compromiso', desc: 'Tu éxito es el nuestro. Trabajamos como socios estratégicos de tu cadena de suministros.' },
];

const clients = [
  'Constructora Del Plata', 'Metalúrgica San Martín', 'Industrias Patagónicas',
  'Grupo Constructor BA', 'Electromecánica Sur', 'Fábrica Nacional Aceros',
];

const faqSections = [
  {
    title: 'Pedidos y Cotizaciones',
    icon: FileText,
    color: 'bg-red-100 text-red-600',
    questions: [
      { q: '¿Cómo puedo solicitar una cotización?', a: 'Podés armar tu lista de productos desde nuestro catálogo y enviarla por WhatsApp con un solo clic. También podés completar nuestro formulario de contacto. Respondemos en menos de 1 hora hábil.' },
      { q: '¿Hay un pedido mínimo?', a: 'No hay pedido mínimo para cotizar. Sin embargo, para acceder a precios mayoristas recomendamos consultar por cantidades superiores a 10 unidades. Los precios publicados son referenciales y pueden variar según volumen.' },
      { q: '¿Los precios incluyen IVA?', a: 'Los precios publicados en la web son sin IVA. En la cotización final se desglosará el monto neto, el IVA correspondiente y el total. Emitimos factura A y B según tu condición fiscal.' },
    ]
  },
  {
    title: 'Envíos y Entregas',
    icon: Truck,
    color: 'bg-zinc-800 text-zinc-300',
    questions: [
      { q: '¿Hacen envíos a todo el país?', a: 'Sí, realizamos envíos a todo el territorio nacional. Contamos con logística propia en CABA y GBA, y trabajamos con operadores logísticos de confianza para el interior del país.' },
      { q: '¿Cuánto tarda la entrega?', a: 'Para CABA y GBA, el plazo de entrega es de 24 a 48 horas hábiles una vez confirmado el pago. Para el interior, de 3 a 7 días hábiles según la localidad.' },
      { q: '¿Puedo retirar en local?', a: `Sí, ofrecemos retiro sin cargo en ${SITE_INFO.address.line1}, ${SITE_INFO.address.city} (${SITE_INFO.address.province}). Coordinamos día y horario una vez confirmado el pedido. Horarios: ${SITE_INFO.hours.join(' / ')}.` },
    ]
  },
  {
    title: 'Formas de Pago',
    icon: CreditCard,
    color: 'bg-red-100 text-red-600',
    questions: [
      { q: '¿Qué formas de pago aceptan?', a: 'Aceptamos transferencia bancaria, depósito, cheque electrónico (e-cheq), y tarjetas de crédito/débito. Para clientes recurrentes ofrecemos cuenta corriente con condiciones especiales.' },
      { q: '¿Ofrecen crédito o cuenta corriente?', a: 'Sí, para clientes B2B con historial ofrecemos línea de crédito y cuenta corriente a 30/60 días. Requiere apertura de cuenta con documentación comercial.' },
      { q: '¿Emiten factura?', a: 'Emitimos factura A (Responsable Inscripto) y factura B (Consumidor Final / Monotributista). Toda la facturación es electrónica y se comparte por WhatsApp al momento del despacho.' },
    ]
  },
  {
    title: 'Productos y Garantía',
    icon: Package,
    color: 'bg-zinc-800 text-zinc-300',
    questions: [
      { q: '¿Todos los productos están en stock?', a: 'Mantenemos actualizado el stock en tiempo real en nuestra web. Cada producto indica su disponibilidad: "En stock", "Últimas unidades", "Sin stock" o "Bajo pedido".' },
      { q: '¿Los productos tienen garantía?', a: 'Todos nuestros productos cuentan con garantía oficial de fábrica. El plazo varía según el fabricante (generalmente 6 a 24 meses). Somos distribuidor autorizado de todas las marcas que comercializamos.' },
      { q: '¿Puedo pedir algo que no está en la web?', a: 'Sí. Trabajamos con un catálogo ampliado de más de 10.000 productos. Si necesitás algo que no está publicado, consultá por WhatsApp y te lo cotizamos.' },
    ]
  },
  {
    title: 'Devoluciones',
    icon: RefreshCw,
    color: 'bg-red-100 text-red-600',
    questions: [
      { q: '¿Puedo devolver un producto?', a: 'Aceptamos devoluciones dentro de los 10 días hábiles de recibido el producto, siempre que está sin uso, en su embalaje original y con factura.' },
      { q: '¿Qué hago si el producto llegó dañado?', a: 'Contactanos dentro de las 48 horas de recibido con fotos del producto y el embalaje. Gestionamos el reemplazo o la nota de crédito sin costo adicional.' },
    ]
  },
];

function AccordionItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className={`border rounded-xl transition-all duration-300 ${isOpen ? 'border-red-900/70 bg-red-950/40 shadow-sm' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'}`}>
      <button onClick={onToggle} className="w-full flex items-start gap-3 p-4 text-left">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${isOpen ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
          <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
                <span className={`text-sm font-semibold leading-snug transition-colors ${isOpen ? 'text-red-300' : 'text-zinc-100'}`}>
          {question}
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4 pl-[52px]">
          <p className="text-sm text-zinc-300 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [openItems, setOpenItems] = useState({});
  const { addToast } = useToast();
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE_INFO.businessName,
    telephone: SITE_INFO.phones[0],
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_INFO.address.line1,
      addressLocality: SITE_INFO.address.city,
      addressRegion: SITE_INFO.address.province,
      postalCode: SITE_INFO.address.postalCode,
      addressCountry: SITE_INFO.address.country,
    },
    url: window.location.origin,
  };
  useSeo({
    title: 'Hidráulica Gastó | Insumos Industriales B2B',
    description: 'Catálogo industrial, cotizaciones rápidas y asesoramiento técnico para empresas.',
    path: '/',
    structuredData: localBusinessSchema,
    structuredDataId: 'local-business',
  });

  const toggleItem = (sectionIdx, questionIdx) => {
    const key = `${sectionIdx}-${questionIdx}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContactWhatsApp = () => {
    const msg = buildGeneralWhatsAppMessage();
    openTrackedWhatsApp({
      phone: WHATSAPP_NUMBER,
      message: msg,
      source: 'home_cta',
    });
    addToast('Abriendo WhatsApp para asesorarte.', 'info');
  };

  return (
    <div className="min-h-screen">
      <section className="relative text-white overflow-hidden min-h-[520px] md:min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&h=800&fit=crop&crop=center"
            alt="Equipo de trabajo industrial"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-zinc-900/80 to-zinc-900/40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 lg:py-32 relative w-full">
          <div className="max-w-3xl animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-red-600/30 border border-red-400/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
              <Star size={14} className="text-zinc-500" />
              <span className="text-xs font-semibold text-red-200">Distribuidor autorizado · +15 años de experiencia</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
              Insumos Industriales
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-zinc-200">
                para tu empresa
              </span>
            </h1>
            <p className="text-lg md:text-xl text-red-100/90 mt-5 max-w-xl leading-relaxed">
              Las mejores marcas en herramientas, seguridad y materiales. Cotizá al instante y recibí asesoramiento personalizado.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                to="/productos"
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-xl btn-press"
              >
                Ver Productos
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Envíos a todo el país', desc: 'Logística propia y tercerizada' },
              { icon: Shield, title: 'Garantía oficial', desc: 'Productos originales certificados' },
              { icon: Clock, title: 'Cotización inmediata', desc: 'Respuesta en menos de 1 hora' },
              { icon: MessageCircle, title: 'Soporte B2B', desc: 'Atención personalizada' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 group">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-red-600 transition-colors duration-300">
                  <Icon size={20} className="text-red-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-100">{title}</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-100">Categorías</h2>
            <p className="text-zinc-400 mt-2 text-sm">Encontrá lo que necesitás por rubro</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto stagger-children">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/productos?cat=${cat.id}`}
                className="group w-[170px] bg-zinc-900 rounded-2xl p-5 text-center border border-zinc-800 hover:border-red-300 card-hover"
              >
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {cat.icon}
                </div>
                <h3 className="text-xs font-bold text-zinc-100 group-hover:text-red-300 transition-colors leading-tight">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="nosotros" className="scroll-mt-20">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1400&h=600&fit=crop&crop=center"
              alt="Equipo profesional trabajando en planta industrial"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-zinc-900/85 to-zinc-900/60" />
          </div>
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
            <div className="max-w-2xl animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-red-600/30 border border-red-400/30 rounded-full px-4 py-1.5 mb-5 backdrop-blur-sm">
                <Building2 size={14} className="text-red-300" />
                <span className="text-xs font-semibold text-red-200">Sobre {COMPANY_NAME}</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight">
                Tu socio estratégico en
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-zinc-200">
                  insumos industriales
                </span>
              </h2>
              <p className="text-lg text-red-100/80 mt-4 leading-relaxed max-w-xl">
                Desde 2008 abastecemos empresas de todo el país con las mejores marcas, asesoramiento técnico y la agilidad que tu operación necesita.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl md:text-4xl font-black text-red-600">{s.value}</p>
                  <p className="text-sm text-zinc-400 mt-1 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="py-14 md:py-20 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="mb-5 rounded-xl overflow-hidden border border-zinc-800">
                  <img
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&h=500&fit=crop&crop=center"
                    alt="Planificacion de objetivos industriales"
                    className="w-full h-36 object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                  <Target size={24} className="text-red-600" />
                </div>
                <h3 className="text-xl font-extrabold text-zinc-100 mb-3">Nuestra Misión</h3>
                <p className="text-zinc-300 leading-relaxed">
                  Proveer insumos industriales de alta calidad con agilidad, precio justo y asesoramiento técnico especializado,
                  contribuyendo a la productividad y seguridad de cada empresa que confía en nosotros.
                </p>
              </div>
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="mb-5 rounded-xl overflow-hidden border border-zinc-800">
                  <img
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=500&fit=crop&crop=center"
                    alt="Vision estrategica y crecimiento empresarial"
                    className="w-full h-36 object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4">
                  <Eye size={24} className="text-zinc-300" />
                </div>
                <h3 className="text-xl font-extrabold text-zinc-100 mb-3">Nuestra Visión</h3>
                <p className="text-zinc-300 leading-relaxed">
                  Ser la plataforma B2B de referencia en insumos industriales en Argentina,
                  reconocida por la calidad de nuestros productos, la excelencia en el servicio y la innovación tecnológica.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="py-14 md:py-20 bg-zinc-900">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-100">¿Por qué elegirnos?</h2>
              <p className="text-zinc-400 mt-2">Lo que nos diferencia en el mercado industrial</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((v) => {
                const Icon = v.icon;
                return (
                  <div key={v.title} className="bg-zinc-950 rounded-2xl p-6 border border-zinc-800 hover:border-red-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-600 transition-colors duration-300">
                      <Icon size={22} className="text-red-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-100 mb-2">{v.title}</h3>
                    <p className="text-sm text-zinc-300 leading-relaxed">{v.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="py-14 md:py-20 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-100">Empresas que confían en nosotros</h2>
              <p className="text-zinc-400 mt-2">Algunas de las empresas que nos eligen como proveedores</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {clients.map((name) => (
                <div
                  key={name}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-center text-center hover:border-red-300 hover:shadow-md transition-all duration-300"
                >
                  <div>
                    <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center text-zinc-500">
                      <Building2 size={20} />
                    </div>
                    <span className="text-xs font-bold text-zinc-200 leading-tight block">{name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 py-14 md:py-20 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HelpCircle size={28} className="text-red-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-100">Preguntas Frecuentes</h2>
            <p className="text-zinc-400 mt-2 text-sm max-w-xl mx-auto">
              Encontrá respuestas a las consultas más comunes sobre pedidos, envíos, formas de pago y más.
            </p>
          </div>

          <div className="space-y-8">
            {faqSections.map((section, sIdx) => {
              const Icon = section.icon;
              return (
                <div key={sIdx} className="animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${section.color}`}>
                      <Icon size={18} />
                    </div>
                    <h3 className="text-base md:text-lg font-extrabold text-zinc-100">{section.title}</h3>
                  </div>
                  <div className="space-y-2">
                    {section.questions.map((item, qIdx) => (
                      <AccordionItem
                        key={qIdx}
                        question={item.q}
                        answer={item.a}
                        isOpen={!!openItems[`${sIdx}-${qIdx}`]}
                        onToggle={() => toggleItem(sIdx, qIdx)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 md:p-10 text-center text-white">
            <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <WhatsAppIcon size={24} />
            </div>
            <h3 className="text-xl md:text-2xl font-extrabold mb-2">¿No encontraste lo que buscabas?</h3>
            <p className="text-zinc-300 text-sm mb-6 max-w-md mx-auto">
              Nuestro equipo está disponible para resolver cualquier consulta. Respondemos en menos de 1 hora.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleContactWhatsApp}
                className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all btn-press shadow-lg"
              >
                <WhatsAppIcon size={18} />
                Consultar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-100">Dónde Estamos</h2>
            <p className="text-zinc-400 mt-2 text-sm">
              {SITE_INFO.address.line1}, {SITE_INFO.address.city}, {SITE_INFO.address.province}.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-lg">
            <div className="relative w-full h-[300px] md:h-[420px]">
              <iframe
                title={`Ubicacion ${SITE_INFO.businessName} - ${SITE_INFO.address.line1}`}
                src={SITE_INFO.mapsEmbedUrl}
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-red-700 to-red-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-14 md:py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold">¿Necesitás una cotización personalizada?</h2>
          <p className="text-red-200 mt-3 max-w-xl mx-auto text-sm md:text-base">
            Armá tu lista de productos y enviala por WhatsApp para recibir asesoramiento inmediato.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              to="/productos"
              className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-red-200 px-8 py-4 rounded-xl font-bold text-sm transition-all hover:bg-zinc-800 shadow-lg btn-press border border-zinc-700"
            >
              Explorar catálogo
              <ArrowRight size={16} />
            </Link>
            <button
              onClick={handleContactWhatsApp}
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-lg border border-green-500/40 btn-press"
            >
              <WhatsAppIcon size={16} />
              Escribir por WhatsApp
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}





