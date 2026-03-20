# Tasks: MVP avanzado a pagina funcional

## Phase 1: Foundation / Platform Stability

- [x] 1.1 Definir runtime objetivo y documentar prerequisitos de entorno en `README.md` (Node 20.19+ o 22 LTS, scripts y pasos de arranque)
- [x] 1.2 Completar variables de entorno base en `.env.example` para frontend y backend (`VITE_API_URL`, `VITE_ENABLE_MOCK_FALLBACK`, `PORT`, credenciales admin)
- [x] 1.3 Crear modulo de configuracion runtime para frontend en `src/config/runtime.js` (flags por entorno, fallback mock habilitado por defecto solo en dev)
- [x] 1.4 Verificar pipeline local de calidad (`npm test`, `npm run build`) y registrar resultado en `docs/`

## Phase 2: API-First Migration (Public + Admin)

- [x] 2.1 Actualizar `src/services/productService.js` para usar fallback mock solo cuando el flag runtime lo permita
- [x] 2.2 Actualizar `src/context/AdminContext.jsx` para inicializar estado sin mock en produccion y evitar fallback silencioso cuando este deshabilitado
- [x] 2.3 Ajustar manejo de errores en servicios de contacto/admin para no ocultar indisponibilidad de API en produccion
- [x] 2.4 Ejecutar smoke funcional manual: home, listado, detalle, contacto, login admin, CRUD productos, categorias, marcas y estado de consultas
- [x] 2.4.a Ejecutar smoke API automatizado y registrar evidencia en `docs/smoke-api.md`

## Phase 3: Security and Backend Hardening

- [x] 3.1 Reemplazar autenticacion en memoria de `server/auth.js` por sesion persistente o JWT con expiracion (single-admin)
- [x] 3.2 Agregar rate limiting y hardening de headers/CORS en `server/server.js`
- [x] 3.3 Estandarizar respuesta de errores y logging backend en rutas `server/routes/*.js`
- [x] 3.4 Definir politica de backup/restore para `server/database.db` y documentar runbook

## Phase 4: Verification and Release

- [x] 4.1 Expandir pruebas automatizadas para cubrir rutas REST criticas (products, contacts, taxonomy, admin)
- [x] 4.2 Agregar pruebas de integracion UI para flujo publico y admin
- [x] 4.3 Preparar despliegue productivo y checklist de release (build, env, migracion DB, smoke post-deploy)

## Phase 5: Operations and Documentation

- [x] 5.1 Normalizar documentacion tecnica y operativa en `README.md` y `docs/`
- [x] 5.2 Crear guia de operacion diaria (arranque, rollback, backup, troubleshooting)
- [x] 5.3 Definir metricas minimas de salud y monitoreo para la aplicacion



