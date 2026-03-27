# Preparación de Migración a DB Real

## Estado actual (base funcional)
- Backend con SQLite operativo (`server/database.db`) y repositorios para:
  - productos (`/api/products`)
  - categorías y marcas (`/api/categories`, `/api/brands`)
  - consultas (`/api/contacts`)
  - auth/admin (`/api/admin/*`)
- Frontend en modo API-first con fallback mock controlado por `VITE_ENABLE_MOCK_FALLBACK`.
- Admin single-user con sesión JWT y revocación de token.

## Contratos de datos que YA consume el frontend

## Producto (mínimo esperado)
- `id: number`
- `name: string`
- `description: string`
- `price: number`
- `stock: number`
- `stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order'`
- `categoryId: number | null`
- `brandId: number | null`
- `category: string`
- `brand: string`
- `sku: string`
- `isActive: boolean`
- `isFeatured: boolean`
- `showPrice: boolean`
- `image: string`
- `images: string[]`
- `specs: object`

## Consulta (contacto)
- `id: number`
- `name: string`
- `email: string` (aunque comercialmente se use WhatsApp)
- `phone: string`
- `message: string`
- `subject: string`
- `productId: number | null`
- `productName: string`
- `status: 'pending' | 'replied'`
- `source: 'contact_form' | 'whatsapp' | 'product_page'`
- `createdAt: string`

## Categoría / Marca
- Categoría: `id`, `name`, `slug`, `icon`, `color`
- Marca: `id`, `name`, `isActive`

## Validaciones críticas vigentes
- Producto: nombre obligatorio, precio >= 0, stock entero >= 0, `stockStatus` válido, `showPrice` boolean.
- Contacto: nombre obligatorio, email válido, mensaje >= 10 chars, teléfono opcional con formato.
- Admin: usuario y contraseña obligatorios.

## Brechas a resolver ANTES de integrar datos del cliente
1. **Fuente de verdad de email en contactos**
- Actualmente el formulario envía `email` fijo (`sin-email@whatsapp.local`) por flujo comercial WhatsApp.
- Decidir si el campo email queda opcional en DB real o se mantiene obligatorio técnico.

2. **Taxonomía definitiva**
- Confirmar catálogo final de categorías y marcas.
- Evitar reasignaciones automáticas si el cliente trae taxonomía distinta.

3. **SKU y unicidad**
- Ya existe índice único parcial para SKU no vacío.
- Definir política para productos sin SKU real (permitir vacío o generar SKU interno).

4. **Historial/versionado**
- El admin guarda metadatos/versiones en `specs.__admin`.
- Confirmar si se migra a tabla normalizada (`product_versions`) en fase posterior.

## Plan de migración sugerido (sin downtime lógico)
1. **Congelar contrato**
- Mantener respuestas JSON con el shape actual para no romper frontend.

2. **Carga de staging**
- Importar datos reales a entorno staging.
- Ejecutar script de normalización de categorías, marcas, SKU y stock status.

3. **Pruebas de compatibilidad**
- Ejecutar `npm run quality:ci`.
- QA manual de rutas críticas: Home, Productos, Detalle, Contacto, Admin CRUD.

4. **Cutover controlado**
- Desactivar fallback mock en producción (`VITE_ENABLE_MOCK_FALLBACK=false`).
- Ejecutar backup previo y post-migración.
- Monitorear errores `apiError`, 4xx/5xx y auditoría por 24-48h.

## Dudas a evacuar con cliente (bloqueantes de migración)
1. ¿El campo email en consultas se elimina funcionalmente o queda opcional para trazabilidad?
2. ¿Cuál es el listado final de categorías y marcas (nombres exactos)?
3. ¿Todos los productos tienen SKU válido?
4. ¿Qué política se usa para productos sin precio público (`showPrice=false`)?
5. ¿Se mantiene versionado de producto en admin como requisito operativo?
6. ¿Cuál será el volumen inicial (productos/consultas) para definir paginación y límites?

## Criterio de salida (ready para migrar)
- Pipeline local/CI en verde.
- Contrato API sin cambios breaking.
- Datos reales validados en staging.
- Decisiones de negocio cerradas en las 6 dudas anteriores.
