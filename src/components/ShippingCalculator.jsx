import { useState } from 'react';
import { MapPin, Truck, Clock, CheckCircle } from 'lucide-react';
import { formatPrice } from '../data/products';
import { useToast } from '../context/ToastContext';

/**
 * Calculadora de envio placeholder.
 * Puede conectarse mas adelante a un proveedor logistico real.
 */

const mockShippingRates = {
  // Buenos Aires y CABA
  '1': { zone: 'CABA / GBA', standard: 4500, express: 8900, time: '24-48hs', expressTime: '12-24hs' },
  '2': { zone: 'Buenos Aires Interior', standard: 6200, express: 11500, time: '2-3 dias', expressTime: '24-48hs' },
  // Otras provincias
  '3': { zone: 'Zona Centro', standard: 8500, express: 15000, time: '3-5 dias', expressTime: '2-3 dias' },
  '5': { zone: 'Zona Cuyo', standard: 9800, express: 17500, time: '4-6 dias', expressTime: '2-3 dias' },
  '4': { zone: 'Zona Litoral', standard: 8900, express: 15500, time: '3-5 dias', expressTime: '2-3 dias' },
  '8': { zone: 'Patagonia', standard: 12500, express: 22000, time: '5-7 dias', expressTime: '3-4 dias' },
  '9': { zone: 'Patagonia Sur', standard: 15000, express: 25000, time: '6-8 dias', expressTime: '4-5 dias' },
};

function getShippingByCP(cp) {
  const prefix = cp.charAt(0);
  // CABA
  if (cp.startsWith('1') && parseInt(cp, 10) >= 1000 && parseInt(cp, 10) <= 1499) {
    return mockShippingRates['1'];
  }
  // GBA
  if (cp.startsWith('1') && parseInt(cp, 10) >= 1500 && parseInt(cp, 10) <= 1999) {
    return mockShippingRates['1'];
  }
  // Buenos Aires interior
  if (cp.startsWith('2') || (cp.startsWith('1') && parseInt(cp, 10) >= 2000)) {
    return mockShippingRates['2'];
  }
  // Try by first digit
  if (mockShippingRates[prefix]) {
    return mockShippingRates[prefix];
  }
  // Default
  return mockShippingRates['3'];
}

export default function ShippingCalculator() {
  const [cp, setCp] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  const calculate = (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!cp.trim() || cp.trim().length < 4) {
      const message = 'Ingresa un codigo postal valido.';
      setError(message);
      addToast(message, 'warning');
      return;
    }

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const rate = getShippingByCP(cp.trim());
      setResult(rate);
      setLoading(false);
      addToast(`Envio calculado para ${rate.zone}.`, 'success');
    }, 800);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Truck size={18} className="text-red-600" />
        <h4 className="text-sm font-bold text-zinc-100">Calcular envio</h4>
      </div>

      <form onSubmit={calculate} className="flex gap-2">
        <div className="relative flex-1">
          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={cp}
            onChange={(e) => {
              setCp(e.target.value.replace(/\D/g, '').slice(0, 4));
              setResult(null);
              setError('');
            }}
            placeholder="Tu codigo postal"
            className="w-full pl-9 pr-3 py-2.5 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-zinc-900 text-zinc-100"
            maxLength={4}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 active:scale-[0.98] shrink-0"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Calcular'
          )}
        </button>
      </form>

      {error && (
        <p className="text-xs text-red-500 mt-2 font-medium">{error}</p>
      )}

      {result && (
        <div className="mt-3 space-y-2 animate-fade-in-up">
          <p className="text-xs text-zinc-400 font-medium flex items-center gap-1">
            <MapPin size={12} />
            Zona: {result.zone}
          </p>

          {/* Standard */}
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-red-800 transition-colors">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-zinc-400" />
              <div>
                <p className="text-sm font-semibold text-zinc-100">Envio estandar</p>
                <p className="text-xs text-zinc-400 flex items-center gap-1">
                  <Clock size={10} /> Llega en {result.time}
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-zinc-100">{formatPrice(result.standard)}</span>
          </div>

          {/* Express */}
          <div className="flex items-center justify-between bg-red-950/40 border border-red-900/70 rounded-lg p-3 hover:border-red-700 transition-colors">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-300">Envio express</p>
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <Clock size={10} /> Llega en {result.expressTime}
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-red-300">{formatPrice(result.express)}</span>
          </div>

          {/* Free shipping note */}
          <div className="flex items-start gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-3">
            <CheckCircle size={14} className="text-zinc-300 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-300">
              <strong>Envio bonificado</strong> en compras mayoristas. Consulta condiciones con nuestro equipo comercial.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
