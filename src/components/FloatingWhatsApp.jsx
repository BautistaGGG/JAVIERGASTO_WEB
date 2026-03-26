import { WHATSAPP_NUMBER } from '../data/products';
import { buildGeneralWhatsAppMessage, openTrackedWhatsApp } from '../services/productService';
import WhatsAppIcon from './WhatsAppIcon';
import { useToast } from '../context/ToastContext';

export default function FloatingWhatsApp() {
  const { addToast } = useToast();

  const handleClick = () => {
    const msg = buildGeneralWhatsAppMessage('browsing');
    openTrackedWhatsApp({
      phone: WHATSAPP_NUMBER,
      message: msg,
      source: 'floating_button',
    });
    addToast('Abriendo WhatsApp para contacto rapido.', 'info');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
      {/* Button */}
      <button
        onClick={handleClick}
        className="w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 floating-pulse"
        aria-label="Contactar por WhatsApp"
      >
        <WhatsAppIcon size={30} />
      </button>
    </div>
  );
}
