import { useState, useRef, useEffect } from 'react';
import { Share2, Link2, Check, X } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../data/products';
import { buildShareProductWhatsAppMessage, generateWhatsAppLink } from '../services/productService';
import WhatsAppIcon from './WhatsAppIcon';

export default function ShareButton({ product, variant = 'icon' }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  const productUrl = `${window.location.origin}/producto/${product.id}`;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = productUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
    }
  };

  const handleWhatsApp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const msg = buildShareProductWhatsAppMessage({ name: product.name, productUrl });
    window.open(generateWhatsAppLink(WHATSAPP_NUMBER, msg), '_blank');
    setOpen(false);
  };

  const toggleOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(!open);
  };

  if (variant === 'full') {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={toggleOpen}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all btn-press"
        >
          <Share2 size={16} />
          Compartir
        </button>

        {open && (
          <div className="absolute bottom-full mb-2 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 min-w-[200px] z-50 animate-fade-in-up">
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              {copied ? <Check size={16} className="text-green-600" /> : <Link2 size={16} className="text-gray-500" />}
              <span className="text-sm font-medium text-gray-700">
                {copied ? '?Link copiado!' : 'Copiar enlace'}
              </span>
            </button>
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-green-50 transition-colors text-left"
            >
              <WhatsAppIcon size={16} className="text-green-600" />
              <span className="text-sm font-medium text-gray-700">Enviar por WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Icon variant (for cards)
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleOpen}
        className="p-2 rounded-lg bg-white/90 text-gray-600 hover:bg-blue-600 hover:text-white shadow-lg transition-all"
        title="Compartir producto"
      >
        <Share2 size={16} />
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-1.5 min-w-[180px] z-50 animate-fade-in-up">
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Link2 size={14} className="text-gray-500" />}
            <span className="text-xs font-medium text-gray-700">
              {copied ? '?Copiado!' : 'Copiar enlace'}
            </span>
          </button>
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors text-left"
          >
            <WhatsAppIcon size={14} className="text-green-600" />
            <span className="text-xs font-medium text-gray-700">Enviar por WhatsApp</span>
          </button>
        </div>
      )}
    </div>
  );
}


