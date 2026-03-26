const glossaryItems = [
  {
    term: 'Dashboard',
    description: 'Resumen operativo con métricas, estado del panel y actividad reciente.',
  },
  {
    term: 'Productos',
    description: 'Alta, edición, baja lógica, filtros y control de estado/publicación de productos.',
  },
  {
    term: 'Categorías',
    description: 'Gestión de rubros para organizar productos y mejorar la navegación en catálogo.',
  },
  {
    term: 'Marcas',
    description: 'Administración de marcas visibles en filtros y fichas de producto.',
  },
  {
    term: 'Consultas',
    description: 'Triage de mensajes entrantes, cambio de estado y seguimiento de pendientes.',
  },
  {
    term: 'Auditoría',
    description: 'Registro de eventos administrativos para trazabilidad y control interno.',
  },
  {
    term: 'Toasts',
    description: 'Alertas visuales de éxito, error, aviso o información ante acciones del panel.',
  },
  {
    term: 'Confirmaciones seguras',
    description: 'Modal de confirmación para evitar acciones críticas por error (ej. eliminaciones).',
  },
];

export default function Glossary() {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="text-sm md:text-base font-extrabold text-gray-900">Glosario del panel</h2>
        <p className="text-xs text-gray-500 mt-1">
          Referencia rápida de funciones y características habilitadas en administración.
        </p>
      </div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        {glossaryItems.map((item) => (
          <article key={item.term} className="rounded-xl border border-gray-200 p-4 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-900">{item.term}</h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
