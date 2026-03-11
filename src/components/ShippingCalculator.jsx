import { useState } from 'react';
import { MapPin, Truck } from 'lucide-react';
import { formatPrice } from '../data/products';

/**
 * Calculadora de env�o placeholder.
 * Puede conectarse m�s adelante a un proveedor log�stico real.
 */

const mockShippingRates = {
  // Buenos Aires y CABA
  '1': { zone: 'CABA / GBA', standard: 4500, express: 8900, time: '24-48hs', expressTime: '12-24hs' },
  '2': { zone: 'Buenos Aires Interior', standard: 6200, express: 11500, time: '2-3 días', expressTime: '24-48hs' },
  // Otras provincias
  '3': { zone: 'Zona Centro', standard: 8500, express: 15000, time: '3-5 días', expressTime: '2-3 días' },
  '5': { zone: 'Zona Cuyo', standard: 9800, express: 17500, time: '4-6 días', expressTime: '2-3 días' },
  '4': { zone: 'Zona Litoral', standard: 8900, express: 15500, time: '3-5 días', expressTime: '2-3 días' },
  '8': { zone: 'Patagonia', standard: 12500, express: 22000, time: '5-7 días', expressTime: '3-4 días' },
  '9': { zone: 'Patagonia Sur', standard: 15000, express: 25000, time: '6-8 días', expressTime: '4-5 días' },
};

function getShippingByCP(cp) {
  const prefix = cp.charAt(0);
  // CABA
  if (cp.startsWith('1') && parseInt(cp) >= 1000 && parseInt(cp) <= 1499) {
    return mockShippingRates['1'];
  }
  // GBA
  if (cp.startsWith('1') && parseInt(cp) >= 1500 && parseInt(cp) <= 1999) {
    return mockShippingRates['1'];
  }
  // Buenos Aires interior
  if (cp.startsWith('2') || (cp.startsWith('1') && parseInt(cp) >= 2000)) {
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

  const calculate = (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!cp.trim() || cp.trim().length < 4) {
      setError('Ingresá un código postal válido');
      return;
    }

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const rate = getShippingByCP(cp.trim());
      setResult(rate);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Truck size={18} className="text-blue-600" />
        <h4 className="text-sm font-bold text-gray-900">Calcular envío</h4>
      </div>

      <form onSubmit={calculate} className="flex gap-2">
        <div className="relative flex-1">
          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={cp}
            onChange={(e) => {
              setCp(e.target.value.replace(/\D/g, '').slice(0, 4));
              setResult(null);
              setError('');
            }}
            placeholder="Tu código postal"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={4}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 active:scale-[0.98] shrink-0"
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
          <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
            <MapPin size={12} />
            Zona: {result.zone}
          </p>

          {/* Standard */}
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-gray-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Envío estándar</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={10} /> Llega en {result.time}
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-gray-900">{formatPrice(result.standard)}</span>
          </div>

          {/* Express */}
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3 hover:border-blue-400 transition-colors">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Envío express</p>
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <Clock size={10} /> Llega en {result.expressTime}
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-blue-900">{formatPrice(result.express)}</span>
          </div>

          {/* Free shipping note */}
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
            <CheckCircle size={14} className="text-green-600 shrink-0 mt-0.5" />
            <p className="text-xs text-green-700">
              <strong>Envío bonificado</strong> en compras mayoristas. Consultá condiciones con nuestro equipo comercial.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}



