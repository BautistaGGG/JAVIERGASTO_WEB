# Tasks: Siguiente Ola (Post-Plan Actual)

Fecha: 2026-03-20

## Objetivo
Pasar de base MVP robusta a operacion productiva con datos reales y mayor gobernanza operativa.

## Fase A: Datos Reales (cuando se habilite DB real)
- [ ] A.1 Definir modelo de datos objetivo (productos, marcas, categorias, consultas, auditoria).
- [ ] A.2 Diseñar migracion de SQLite local a entorno de datos productivo (incluyendo backups y rollback).
- [ ] A.3 Implementar capa de repositorio para desacoplar servicio de acceso a datos mock/local.
- [ ] A.4 Crear scripts de migracion + seed inicial productivo.
- [ ] A.5 Ejecutar prueba de migracion en staging con checklist de validacion.

## Fase B: Hardening Operativo
- [ ] B.1 Configurar monitoreo activo (disponibilidad API, error rate, latencia p95) con alertas.
- [ ] B.2 Automatizar backup externo/offsite y verificacion de integridad de backup.
- [ ] B.3 Definir runbook de incidentes con responsables y escalamiento.

## Fase C: Producto y Admin UX
- [ ] C.1 Mejorar buscador admin (filtros combinados, orden, persistencia de estado).
- [ ] C.2 Agregar exportacion CSV de contactos filtrados.
- [ ] C.3 Añadir confirmaciones/guardrails para operaciones destructivas en productos.

## Fase D: Calidad y Release
- [ ] D.1 Agregar pruebas de integracion API para escenarios de auth + CRUD + restore.
- [ ] D.2 Definir smoke E2E de frontend (playwright/cypress) para rutas clave.
- [ ] D.3 Establecer criterio de release (build + test + smoke obligatorios).
