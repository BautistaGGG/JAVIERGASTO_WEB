# Runbook Operativo

## 1. Incidente: panel admin no carga / Unauthorized
### Síntomas
- Errores `401` en `/api/contacts`, `/api/admin/metrics` o `/api/admin/audit`.
- Dashboard o consultas vacías.

### Diagnóstico rápido
- Revisar token en navegador (`industrialpro_token`).
- Verificar expiración de sesión (`industrialpro_session_expires_at`).
- Probar `POST /api/admin/login` y `GET /api/admin/metrics` con token nuevo.

### Acción
- Reingresar al panel admin (login nuevamente).
- Verificar variables `ADMIN_TOKEN_SECRET` y `ADMIN_TOKEN_SECRETS`.
- Si hubo rotación de secretos, mantener secreto anterior en `ADMIN_TOKEN_SECRETS` temporalmente.

## 2. Incidente: API caída o sin respuesta
### Síntomas
- Mensajes de API no disponible.
- `/api/health` responde error.

### Diagnóstico rápido
- Revisar proceso backend (`npm run server`).
- Revisar acceso al archivo SQLite (`server/database.db`).
- Revisar logs del backend y errores no controlados.

### Acción
- Reiniciar backend.
- Restaurar backup reciente si la DB está corrupta:
  - `npm run restore-db -- <archivo-backup.db>`
- Ejecutar `npm run init-db` solo si no hay datos productivos que preservar.

## 3. Incidente: CI falla en build/test
### Diagnóstico rápido
- Ejecutar local: `npm test` y `npm run build`.
- Validar versión Node con `npm run check-node`.

### Acción
- Corregir tests en rojo antes de merge.
- Verificar incompatibilidades de versión Node/acciones CI.

## 4. Mantenimiento preventivo semanal
- Ejecutar `npm run backup-db`.
- Revisar métricas de errores en dashboard admin.
- Verificar rutas críticas públicas (home, productos, contacto).
- Verificar login admin y cierre de sesión.
