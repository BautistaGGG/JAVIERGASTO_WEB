# QA Manual Admin - Rutas Criticas

## 1) Login y sesion
- Abrir `/admin`.
- Validar login con credenciales admin.
- Validar logout y retorno a pantalla de login.

## 2) Productos - filtros y acciones
- Buscar por nombre/SKU/marca.
- Combinar filtros (estado + destacado + stock + categoria + marca).
- Verificar paginacion y cambio de pagina.
- Seleccionar pagina y ejecutar accion masiva `Activar`.

## 3) Productos - modal y atajos
- Presionar `N` y validar apertura de modal.
- Presionar `Esc` y validar cierre de modal.
- Presionar `/` y validar foco en buscador.
- Verificar que al cerrar modal vuelve foco al boton que lo abrio.

## 4) Consultas - triage
- Ver por defecto `Solo pendientes`.
- Cambiar estado desde tabla (`Pendiente/Respondida`).
- Abrir detalle y cambiar estado desde modal.
- Presionar `Esc` y validar cierre del modal de detalle.

## 5) Accesibilidad minima
- Navegar con `Tab` en sidebar, tabla y modales.
- Confirmar foco visible en controles principales.
- Confirmar `aria-label` en botones icon-only (menu, cerrar modal, editar/eliminar).

