const badgeConfig = {
  new: {
    label: 'Nuevo',
    className: 'bg-emerald-500 text-white',
  },
  bestseller: {
    label: 'Más vendido',
    className: 'bg-blue-600 text-white',
  },
  sale: {
    label: 'Oferta',
    className: 'bg-red-600 text-white',
  },
  limited: {
    label: 'Últimas unidades',
    className: 'bg-amber-500 text-white',
  },
  exclusive: {
    label: 'Exclusivo',
    className: 'bg-purple-600 text-white',
  },
};

export default function ProductBadge({ badge }) {
  if (!badge) return null;
  const config = badgeConfig[badge];
  if (!config) return null;

  return (
    <span
      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-lg ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export { badgeConfig };
