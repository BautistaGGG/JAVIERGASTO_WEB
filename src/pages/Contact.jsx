import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, MapPin, Phone, Clock, CheckCircle2, AlertCircle, ArrowRight, Loader2, User, Briefcase, MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../data/products';
import { buildGeneralWhatsAppMessage, openTrackedWhatsApp, submitContactForm } from '../services/productService';
import { isApiUnavailableError } from '../services/api';
import { formatApiErrorMessage } from '../services/errorUtils';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { SITE_INFO } from '../config/siteInfo';
import { useSeo } from '../hooks/useSeo';
import { useToast } from '../context/ToastContext';
import { formatArgentinaPhoneInput, normalizeArgentinaPhone } from '../utils/phone';
import { trackWhatsAppClick } from '../services/trackingService';

const MIN_SUBMIT_FEEDBACK_MS = 1200;

const subjectOptions = [
  'Cotizacion de productos',
  'Consulta de disponibilidad',
  'Consulta tecnica',
  'Pedido por mayor',
  'Soporte postventa',
  'Cuenta B2B / Credito',
  'Otro',
];

const initialForm = {
  name: '',
  phone: '',
  subject: '',
  message: '',
  website: '',
};

const buildContactWhatsAppMessage = ({ message }) => String(message || '').trim();

export default function Contact() {
  const { addToast } = useToast();
  const [form, setForm] = useState({ ...initialForm });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useSeo({
    title: 'Contacto | Hidraulica Gasto',
    description: 'Contacta a Hidraulica Gasto para cotizaciones, disponibilidad y soporte comercial.',
    path: '/contacto',
  });

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio';

    if (!form.phone.trim()) {
      newErrors.phone = 'El telefono es obligatorio';
    } else if (!normalizeArgentinaPhone(form.phone).ok) {
      newErrors.phone = 'Ingresa un WhatsApp valido de Argentina';
    }

    if (!form.subject) newErrors.subject = 'Selecciona un motivo';

    if (!form.message.trim()) {
      newErrors.message = 'El mensaje es obligatorio';
    } else if (form.message.trim().length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === 'phone' ? formatArgentinaPhoneInput(value) : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');

    if (!validate()) {
      addToast('Revisa los campos marcados en el formulario.', 'warning');
      return;
    }

    setSubmitting(true);
    const submitStart = Date.now();

    try {
      const normalizedPhone = normalizeArgentinaPhone(form.phone.trim());
      const payload = {
        name: form.name.trim(),
        email: 'sin-email@whatsapp.local',
        phone: normalizedPhone.ok ? normalizedPhone.e164 : form.phone.trim(),
        subject: form.subject,
        message: form.message.trim(),
        website: form.website,
      };
      await submitContactForm(payload);

      const elapsed = Date.now() - submitStart;
      if (elapsed < MIN_SUBMIT_FEEDBACK_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_SUBMIT_FEEDBACK_MS - elapsed));
      }

      const whatsappMessage = buildContactWhatsAppMessage(payload);
      const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
      void trackWhatsAppClick('contact_form_submit_redirect', { hasSubject: Boolean(payload.subject) });
      window.location.assign(whatsappHref);
      return;
    } catch (error) {
      if (isApiUnavailableError(error)) {
        const message = formatApiErrorMessage(error, 'No se pudo conectar con la API. Intenta nuevamente en unos minutos.');
        setSubmitError(message);
        addToast(message, 'error');
      } else {
        const message = formatApiErrorMessage(error, 'La consulta se guardo, pero no pudimos abrir WhatsApp automaticamente.');
        setSubmitError(message);
        addToast(message, 'warning');
        setSubmitted(true);
        setForm({ ...initialForm });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const msg = buildGeneralWhatsAppMessage('contact');
    openTrackedWhatsApp({
      phone: WHATSAPP_NUMBER,
      message: msg,
      source: 'contact_page',
      metadata: { hasFormData: Boolean(form.name || form.phone || form.subject || form.message) },
    });
    addToast('Abriendo WhatsApp para tu consulta.', 'info');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="bg-zinc-900 rounded-3xl p-8 md:p-12 shadow-lg border border-zinc-800">
            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-zinc-300" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 mb-3">Consulta enviada con exito</h1>
            <div className="bg-green-950/40 border border-green-900/70 rounded-xl p-4 mb-8 max-w-md mx-auto">
              <p className="text-green-200 text-sm font-medium">Te contactaremos a la brevedad</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setSubmitted(false)}
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all"
              >
                <Send size={16} />
                Enviar otra consulta
              </button>
              <Link
                to="/productos"
                className="inline-flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-6 py-3.5 rounded-xl font-bold text-sm transition-all"
              >
                Ver productos
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <section className="bg-gradient-to-br from-black via-red-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">Contactanos</h1>
            <p className="text-red-200/80 mt-3 text-sm md:text-base leading-relaxed">
              Completá el formulario y te vamos a responder por WhatsApp en menos de 24 horas habiles.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-zinc-800 bg-zinc-950/50">
                <h2 className="text-lg font-extrabold text-zinc-100">Formulario de consulta</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Los campos marcados con <span className="text-red-500">*</span> son obligatorios</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input id="website" name="website" type="text" value={form.website} onChange={handleChange} tabIndex={-1} autoComplete="off" />
                </div>

                {submitError && (
                  <div className="flex items-start gap-3 bg-red-950/40 border border-red-900/70 text-red-200 px-4 py-3.5 rounded-xl">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{submitError}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="flex items-center gap-1.5 text-sm font-semibold text-zinc-200 mb-1.5">
                    <User size={14} className="text-zinc-500" />
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ej: Juan Perez"
                    maxLength={120}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-zinc-700 bg-zinc-900'}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="flex items-center gap-1.5 text-sm font-semibold text-zinc-200 mb-1.5">
                    <Phone size={14} className="text-zinc-500" />
                    Telefono <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Ej: +54 9 11 1234 5678"
                    maxLength={24}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${errors.phone ? 'border-red-400 bg-red-50' : 'border-zinc-700 bg-zinc-900'}`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.phone}</p>}
                  {!errors.phone && <p className="text-zinc-500 text-xs mt-1">Formato recomendado: +54 9 11 1234 5678</p>}
                </div>

                <div>
                  <label htmlFor="subject" className="flex items-center gap-1.5 text-sm font-semibold text-zinc-200 mb-1.5">
                    <Briefcase size={14} className="text-zinc-500" />
                    Motivo de consulta <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none bg-no-repeat bg-right ${errors.subject ? 'border-red-400 bg-red-50' : 'border-zinc-700 bg-zinc-900'}`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 12px center',
                    }}
                  >
                    <option value="">Seleccionar motivo</option>
                    {subjectOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {errors.subject && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.subject}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="flex items-center gap-1.5 text-sm font-semibold text-zinc-200 mb-1.5">
                    <MessageCircle size={14} className="text-zinc-500" />
                    Mensaje <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Describi tu consulta con detalle: cantidades, plazos, especificaciones tecnicas y productos de interes."
                    rows={6}
                    maxLength={2000}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all ${errors.message ? 'border-red-400 bg-red-50' : 'border-zinc-700 bg-zinc-900'}`}
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.message}</p>}
                  <p className="text-xs text-zinc-500 mt-1.5">{form.message.length}/2000 caracteres</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-4 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Enviando mensaje...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Enviar consulta
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                  >
                    <WhatsAppIcon size={18} />
                    WhatsApp
                  </button>
                </div>

                {submitting && (
                  <p className="text-xs text-zinc-400 text-center -mt-1">Enviando mensaje, aguardá un instante...</p>
                )}

                <p className="text-xs text-zinc-500 text-center pt-1">Tu informacion es confidencial y no sera compartida con terceros.</p>
              </form>
            </div>

            <div className="mt-6 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800">
                <h3 className="text-base font-extrabold text-zinc-100">Ubicacion</h3>
                <p className="text-xs text-zinc-400 mt-1">{SITE_INFO.address.line1}, {SITE_INFO.address.city}, {SITE_INFO.address.province}.</p>
              </div>
              <div className="relative w-full h-[300px] md:h-[380px]">
                <iframe
                  title={`Mapa - ${SITE_INFO.address.line1}`}
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

          <div className="space-y-5">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm p-6">
              <h3 className="text-base font-extrabold text-zinc-100 mb-5">Informacion de contacto</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-950/40 rounded-xl flex items-center justify-center shrink-0">
                    <WhatsAppIcon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">WhatsApp</p>
                    {SITE_INFO.phones.map((phone) => (
                      <p key={phone} className="text-xs text-zinc-400 mt-0.5">{phone}</p>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-950/40 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">Direccion</p>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      {SITE_INFO.address.line1}<br />
                      {SITE_INFO.address.postalCode} {SITE_INFO.address.city}<br />
                      Provincia de {SITE_INFO.address.province}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-950/40 rounded-xl flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">Horario de atencion</p>
                    {SITE_INFO.hours.map((hourLine) => (
                      <p key={hourLine} className="text-xs text-zinc-400 mt-0.5">{hourLine}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-gradient-to-r from-gray-800 to-zinc-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
          <h2 className="text-xl md:text-2xl font-extrabold">Preferis armar tu lista y cotizar por WhatsApp?</h2>
          <p className="text-zinc-500 mt-2 text-sm max-w-lg mx-auto">
            Explora nuestro catalogo, agrega productos a tu lista y envia la cotizacion completa con un solo click.
          </p>
          <Link
            to="/productos"
            className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-3.5 rounded-xl font-bold text-sm mt-6 transition-all shadow-lg"
          >
            Ver catalogo completo
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

