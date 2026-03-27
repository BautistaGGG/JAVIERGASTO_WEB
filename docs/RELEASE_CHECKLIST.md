# Checklist de Release

## 1. Pre-release técnico
- Ejecutar `npm install`.
- Ejecutar `npm run check-node`.
- Ejecutar `npm test`.
- Ejecutar `npm run build`.
- Verificar que no haya errores de lint runtime en consola del navegador.

## 2. API y seguridad
- Confirmar `ADMIN_TOKEN_SECRET` fuerte en `.env` productivo.
- Confirmar `ADMIN_TOKEN_TTL_SECONDS` acorde a operación.
- Confirmar `CORS_ORIGINS` restringido al dominio real.
- Verificar login admin y cierre de sesión.
- Verificar expiración de sesión en panel admin.

## 3. Smoke funcional
- Home carga sin errores visuales.
- Productos: búsqueda, filtros y orden funcionan.
- Contacto: envío de formulario y CTA de WhatsApp.
- Admin:
  - Login obligatorio.
  - Dashboard carga métricas.
  - CRUD de productos.
  - Gestión de consultas.
  - Auditoría de eventos.

## 4. QA UX
- Desktop y mobile en rutas críticas.
- Contraste y foco de inputs/selects.
- Estados vacíos y loaders visibles.
- Navegación por teclado en modales y acciones clave.

## 5. Post-deploy
- Ejecutar `npm run smoke:postdeploy`.
- Verificar `/api/health`.
- Verificar registros de errores (`apiMetrics.errors` en admin).
- Crear backup de DB con `npm run backup-db`.
