import { WHATSAPP_NUMBER } from '../data/products';
import { buildGeneralWhatsAppMessage, generateWhatsAppLink } from '../services/productService';
import WhatsAppIcon from './WhatsAppIcon';

export default function FloatingWhatsApp() {

  const handleClick = () => {
    const msg = buildGeneralWhatsAppMessage('browsing');
    window.open(generateWhatsAppLink(WHATSAPP_NUMBER, msg), '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">

      {/* Button */}
      <button
        onClick={handleClick}
        className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 floating-pulse"
        aria-label="Contactar por WhatsApp"
      >
        <WhatsAppIcon size={30} className="text-white" />
      </button>
    </div>
  );
}





