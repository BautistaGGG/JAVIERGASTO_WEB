const glossaryItems = [
  {
    term: 'Panel general',
    description: 'Vista rapida del estado del negocio: productos, consultas y alertas de seguimiento.',
    example: 'Ejemplo: si ves "Consultas >48h", priorizas responder esas consultas hoy para bajar demora.'
  },
  {
    term: 'Productos',
    description: 'Modulo para crear, editar, activar/desactivar, destacar y administrar precio visible de cada producto.',
    example: 'Ejemplo: dejas "Mostrar precio" desactivado para productos a cotizar por WhatsApp.'
  },
  {
    term: 'Categorias',
    description: 'Agrupa productos por rubro para que el cliente filtre mejor en la web.',
    example: 'Ejemplo: crear "Hidraulica" hace que los productos aparezcan bajo ese filtro en /productos.'
  },
  {
    term: 'Marcas',
    description: 'Administra fabricantes/proveedores disponibles para asignar a productos.',
    example: 'Ejemplo: si agregas "Parker", luego podes asignarla al crear o editar productos.'
  },
  {
    term: 'Consultas',
    description: 'Bandeja de mensajes entrantes con filtros, estado pendiente/respondida y respuesta por WhatsApp.',
    example: 'Ejemplo: marcas una consulta como "respondida" cuando ya escribiste al cliente por WhatsApp.'
  },
  {
    term: 'Auditoria',
    description: 'Registro cronologico de acciones administrativas para trazabilidad.',
    example: 'Ejemplo: podes verificar quien elimino un producto y en que fecha exacta.'
  },
  {
    term: 'Acciones masivas',
    description: 'Permite aplicar cambios en lote sobre varios productos seleccionados.',
    example: 'Ejemplo: seleccionar 15 productos y aplicar "Bajo pedido" en una sola accion.'
  },
  {
    term: 'Borrador / Publicado / Archivado',
    description: 'Estados de publicacion para controlar si un producto se muestra o no en la web publica.',
    example: 'Ejemplo: un producto en "Borrador" no se publica hasta que lo pases a "Publicado".'
  },
  {
    term: 'Toasts',
    description: 'Mensajes breves de confirmacion o error despues de una accion.',
    example: 'Ejemplo: al guardar un producto aparece "Producto actualizado" para confirmar que salio bien.'
  },
  {
    term: 'Confirmacion segura',
    description: 'Modal de confirmacion para acciones criticas que no deberian ejecutarse por error.',
    example: 'Ejemplo: antes de eliminar un producto, el sistema pide confirmar.'
  },
];

export default function Glossary() {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="text-sm md:text-base font-extrabold text-gray-900">Glosario del panel</h2>
        <p className="text-xs text-gray-500 mt-1">
          Referencia rapida de funciones habilitadas, con ejemplos para usar el panel sin dudas.
        </p>
      </div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        {glossaryItems.map((item) => (
          <article key={item.term} className="rounded-xl border border-gray-200 p-4 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-900">{item.term}</h3>
            <p className="text-xs text-gray-700 mt-1 leading-relaxed">{item.description}</p>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              <span className="font-semibold text-gray-700">{item.example.split(':')[0]}:</span>{item.example.slice(item.example.indexOf(':') + 1)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
