import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Send, MapPin, Phone, Mail, Clock, CheckCircle2,
  AlertCircle, ArrowRight, Loader2, User, Briefcase, MessageCircle
} from 'lucide-react';
import { WHATSAPP_NUMBER } from '../data/products';
import { buildGeneralWhatsAppMessage, generateWhatsAppLink, submitContactForm } from '../services/productService';
import { isApiUnavailableError } from '../services/api';
import { formatApiErrorMessage } from '../services/errorUtils';
import WhatsAppIcon from '../components/WhatsAppIcon';

const CONTACT_EMAIL = 'ventas@industrialpro.com';

const subjectOptions = [
  'Cotización de productos',
  'Consulta de disponibilidad',
  'Consulta técnica',
  'Pedido por mayor',
  'Soporte postventa',
  'Cuenta B2B / Crédito',
  'Otro',
];

const initialForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

export default function Contact() {
  const [form, setForm] = useState({ ...initialForm });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!form.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Ingresá un email válido';
    }
    if (!form.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!/^[\d\s\-+()]{7,20}$/.test(form.phone)) {
      newErrors.phone = 'Ingresá un teléfono válido';
    }
    if (!form.subject) newErrors.subject = 'Seleccioná un motivo';
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
    setForm((prev) => ({ ...prev, [name]: value }));
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

    if (!validate()) return;

    setSubmitting(true);

    try {
      await submitContactForm({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject,
        message: form.message.trim(),
      });

      setSubmitted(true);
      setForm({ ...initialForm });
    } catch (error) {
      if (isApiUnavailableError(error)) {
        setSubmitError(formatApiErrorMessage(error, 'No se pudo conectar con la API. Intentá nuevamente en unos minutos.'));
      } else {
        setSubmitError(formatApiErrorMessage(error, 'Hubo un error al enviar tu consulta. Por favor intentá nuevamente.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const msg = buildGeneralWhatsAppMessage('contact');
    window.open(generateWhatsAppLink(WHATSAPP_NUMBER, msg), '_blank');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
              ¡Consulta enviada con éxito!
            </h1>
            <p className="text-gray-500 mb-2 text-sm md:text-base leading-relaxed max-w-md mx-auto">
              Recibimos tu mensaje correctamente. Nuestro equipo te contactará a la brevedad
              al email que proporcionaste.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 max-w-md mx-auto">
              <p className="text-blue-800 text-sm font-medium">
                Te responderemos en menos de <strong>24 horas hábiles</strong>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setSubmitted(false)}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all"
              >
                <Send size={16} />
                Enviar otra consulta
              </button>
              <Link
                to="/productos"
                className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3.5 rounded-xl font-bold text-sm transition-all"
              >
                Ver productos
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-gray-400 text-xs mb-3">¿Necesitás respuesta inmediata?</p>
              <button
                onClick={handleWhatsApp}
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold text-sm transition-colors"
              >
                <WhatsAppIcon size={16} />
                Contactanos por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              Contactanos
            </h1>
            <p className="text-blue-200/80 mt-3 text-sm md:text-base leading-relaxed">
              Completá el formulario y nuestro equipo comercial te contactará en menos de 24 horas hábiles.
              También podés escribirnos por WhatsApp para respuesta inmediata.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-extrabold text-gray-900">Formulario de consulta</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Los campos marcados con <span className="text-red-500">*</span> son obligatorios
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {submitError && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{submitError}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                    <User size={14} className="text-gray-400" />
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ej: Juan Pérez"
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                      <Mail size={14} className="text-gray-400" />
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Ej: juan@empresa.com"
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                      <Phone size={14} className="text-gray-400" />
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Ej: +54 11 1234-5678"
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                    <Briefcase size={14} className="text-gray-400" />
                    Motivo de consulta <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-no-repeat bg-right ${
                      errors.subject ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
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
                  {errors.subject && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.subject}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                    <MessageCircle size={14} className="text-gray-400" />
                    Mensaje <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Describí tu consulta con el mayor detalle posible: cantidades, plazos, especificaciones técnicas, productos de interés..."
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all ${
                      errors.message ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1.5">
                    {form.message.length}/1000 caracteres
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-4 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Enviando consulta...
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
                    className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-4 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                  >
                    <WhatsAppIcon size={18} />
                    WhatsApp
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center pt-1">
                  Tu información es confidencial y no será compartida con terceros.
                </p>
              </form>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-base font-extrabold text-gray-900 mb-5">Información de contacto</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Dirección</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      Av. Industrial 1234, Piso 3<br />
                      CABA, Buenos Aires<br />
                      Argentina (C1414)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Teléfono</p>
                    <p className="text-xs text-gray-500 mt-0.5">+54 11 1234-5678</p>
                    <p className="text-xs text-gray-500">+54 11 8765-4321</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Email</p>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium">
                      {CONTACT_EMAIL}
                    </a>
                    <p className="text-xs text-gray-500 mt-0.5">Respondemos en menos de 24 hs hábiles</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Horario de atención</p>
                    <p className="text-xs text-gray-500 mt-0.5">Lunes a Viernes: 8:00 - 18:00</p>
                    <p className="text-xs text-gray-500">Sábados: 9:00 - 13:00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <WhatsAppIcon size={24} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">¿Necesitás respuesta ya?</h3>
                  <p className="text-green-100 text-xs">Escribinos por WhatsApp</p>
                </div>
              </div>
              <p className="text-green-100 text-xs mb-4 leading-relaxed">
                Nuestro equipo comercial está disponible para atenderte de forma inmediata durante el horario laboral.
              </p>
              <button
                onClick={handleWhatsApp}
                className="w-full bg-white text-green-700 hover:bg-green-50 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <WhatsAppIcon size={16} />
                Abrir WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
          <h2 className="text-xl md:text-2xl font-extrabold">¿Preferís armar tu lista y cotizar por WhatsApp?</h2>
          <p className="text-slate-300 mt-2 text-sm max-w-lg mx-auto">
            Explorá nuestro catálogo, agregá productos a tu lista y enviá la cotización completa con un solo click.
          </p>
          <Link
            to="/productos"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold text-sm mt-6 transition-all shadow-lg"
          >
            Ver catálogo completo
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}


