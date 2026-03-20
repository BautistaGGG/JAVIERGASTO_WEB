# Tasks: Proxima Ola de Ejecucion (Post-MVP Funcional)

## Phase 1: Runtime and CI Reliability

- [x] 1.1 Actualizar runtime a Node `20.19+` o `22.12+` en entorno local y despliegue (repositorio preparado: engines + .nvmrc; pendiente aplicar en host)
- [x] 1.2 Agregar chequeo de version de Node al inicio de `npm test`/`npm run build`
- [x] 1.3 Crear pipeline CI (build + test + artifact) para rama principal

## Phase 2: Auth and Security Reinforcement

- [x] 2.1 Persistir revocacion de tokens admin en almacenamiento durable (tabla SQLite o archivo firmado)
- [x] 2.2 Definir rotacion operativa de `ADMIN_TOKEN_SECRET` y procedimiento sin downtime
- [x] 2.3 Agregar auditoria de eventos admin (login, logout, CRUD) con trazabilidad por `requestId`

## Phase 3: Product and Contact Robustness

- [x] 3.1 Agregar validaciones de unicidad y consistencia para SKU y relaciones categoria/marca
- [x] 3.2 Agregar paginacion y filtros server-side para `/api/contacts`
- [x] 3.3 Implementar endpoint de healthcheck tecnico (`/api/health`) con estado de DB

## Phase 4: UX and Observability

- [x] 4.1 Mostrar `requestId` en errores de UI para soporte tecnico
- [x] 4.2 Agregar tablero basico de metricas (errores, latencia, disponibilidad) usando logs existentes
- [x] 4.3 Automatizar smoke post-deploy en script unico con salida resumida

## Phase 5: Data and Disaster Recovery

- [x] 5.1 Automatizar backups programados (task scheduler/cron) con retencion de 14 dias
- [x] 5.2 Probar restore real en entorno de staging y registrar tiempos de recuperacion
- [x] 5.3 Definir RPO/RTO objetivo y documentar plan de continuidad




