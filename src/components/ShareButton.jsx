import { useState, useRef, useEffect } from 'react';
import { Share2, Link2, Check } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../data/products';
import { buildShareProductWhatsAppMessage, openTrackedWhatsApp } from '../services/productService';
import WhatsAppIcon from './WhatsAppIcon';
import { useToast } from '../context/ToastContext';

export default function ShareButton({ product, variant = 'icon' }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const { addToast } = useToast();

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
      addToast('Enlace copiado al portapapeles.', 'success');
      setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = productUrl;
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (!ok) throw new Error('copy_failed');
        setCopied(true);
        addToast('Enlace copiado al portapapeles.', 'success');
        setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
      } catch {
        addToast('No se pudo copiar el enlace. Probá de nuevo.', 'error');
      }
    }
  };

  const handleWhatsApp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const msg = buildShareProductWhatsAppMessage({ name: product.name, productUrl });
    openTrackedWhatsApp({
      phone: WHATSAPP_NUMBER,
      message: msg,
      source: 'share_button',
      metadata: { productId: product.id },
    });
    addToast(`Abriendo WhatsApp para compartir ${product.name}.`, 'info');
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
          className="flex items-center gap-2 px-4 py-2.5 border border-zinc-700 rounded-xl text-sm font-semibold text-zinc-200 hover:bg-zinc-800 transition-all btn-press"
        >
          <Share2 size={16} />
          Compartir
        </button>

        {open && (
          <div className="absolute bottom-full mb-2 right-0 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 p-2 min-w-[200px] z-50 animate-fade-in-up">
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors text-left"
            >
              {copied ? <Check size={16} className="text-zinc-200" /> : <Link2 size={16} className="text-zinc-500" />}
              <span className="text-sm font-medium text-zinc-200">
                {copied ? 'Link copiado' : 'Copiar enlace'}
              </span>
            </button>
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-green-950/40 transition-colors text-left"
            >
              <WhatsAppIcon size={16} />
              <span className="text-sm font-medium text-green-300">Enviar por WhatsApp</span>
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
        className="p-2 rounded-lg bg-zinc-900/90 text-zinc-300 hover:bg-red-600 hover:text-white shadow-lg transition-all"
        title="Compartir producto"
      >
        <Share2 size={16} />
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 right-0 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 p-1.5 min-w-[180px] z-50 animate-fade-in-up">
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-left"
          >
            {copied ? <Check size={14} className="text-zinc-200" /> : <Link2 size={14} className="text-zinc-500" />}
            <span className="text-xs font-medium text-zinc-200">
              {copied ? 'Copiado' : 'Copiar enlace'}
            </span>
          </button>
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-green-950/40 transition-colors text-left"
          >
            <WhatsAppIcon size={14} />
            <span className="text-xs font-medium text-green-300">Enviar por WhatsApp</span>
          </button>
        </div>
      )}
    </div>
  );
}



