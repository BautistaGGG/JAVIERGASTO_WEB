import { X, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';
import WhatsAppIcon from './WhatsAppIcon';

export default function CartSidebar({ open, onClose }) {
  const { items, removeFromCart, updateQuantity, getTotal, clearCart, sendQuoteByWhatsApp } = useCart();

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[60] animate-overlay-in backdrop-blur-sm" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col animate-sidebar-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Lista de Cotización</h2>
            {items.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">Lista vacía</h3>
              <p className="text-sm text-gray-500 mt-1">Agregá productos para armar tu cotización</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <div key={item.id} className="px-5 py-4 hover:bg-gray-50 transition-colors animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl bg-gray-100 shrink-0"
                      onError={(e) => {
                        e.target.src = `https://placehold.co/64x64/1e40af/ffffff?text=IP`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.brand}</p>
                      <p className="text-sm font-bold text-blue-700 mt-0.5">{formatPrice(item.price)}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-200 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-4 py-1 text-sm font-bold min-w-[40px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-200 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-5 space-y-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total estimado:</span>
              <span className="text-2xl font-extrabold text-gray-900">{formatPrice(getTotal())}</span>
            </div>
            <p className="text-[10px] text-gray-400">* Precios no incluyen IVA. Cotización sujeta a confirmación.</p>

            <button
              onClick={sendQuoteByWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-sm transition-all btn-press shadow-lg hover:shadow-xl"
            >
              <WhatsAppIcon size={20} />
              Enviar cotización por WhatsApp
            </button>

            <button
              onClick={clearCart}
              className="w-full text-sm text-gray-500 hover:text-red-600 py-2 font-medium transition-colors"
            >
              Vaciar lista
            </button>
          </div>
        )}
      </div>
    </>
  );
}
