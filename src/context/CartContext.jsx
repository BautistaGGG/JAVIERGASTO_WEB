import { createContext, useContext, useState, useEffect } from 'react';
import { WHATSAPP_NUMBER, formatPrice } from '../data/products';
import { buildCartQuoteWhatsAppMessage, generateWhatsAppLink } from '../services/productService';
import { useToast } from './ToastContext';

const CartContext = createContext();

const CART_KEY = 'industrialpro_cart';

const loadCart = () => {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    const existing = items.find((item) => item.id === product.id);

    if (existing) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
      addToast(`Se actualizó la cantidad de ${product.name}`, 'info');
      return;
    }

    setItems((prev) => [...prev, { ...product, quantity }]);
    addToast(`${product.name} agregado a cotización`, 'success');
  };

  const removeFromCart = (productId) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === productId);
      if (item) addToast(`${item.name} eliminado de la lista`, 'warning');
      return prev.filter((i) => i.id !== productId);
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    addToast('Lista de cotización vaciada', 'info');
  };

  const getTotal = () =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getItemCount = () =>
    items.reduce((sum, item) => sum + item.quantity, 0);

  const sendQuoteByWhatsApp = () => {
    if (items.length === 0) return;

    const message = buildCartQuoteWhatsAppMessage({ items, formatPrice });
    const link = generateWhatsAppLink(WHATSAPP_NUMBER, message);

    window.open(link, '_blank');
    addToast('Cotización enviada por WhatsApp', 'success');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
        sendQuoteByWhatsApp,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
