# Scripts de Utilidad y Diagnóstico — AlTokeChile

Este directorio contiene herramientas de automatización, diagnóstico de base de datos y validación de despliegue para AlTokeChile.

---

## 🚀 Scripts de CI / Despliegue (Producción)

### `validate-deploy-config.mjs`
- **Comando:** `npm run validate:deploy` (se ejecuta automáticamente en `prebuild`).
- **Propósito:** Guardia de estabilidad. Valida la sintaxis y claves permitidas en `vercel.json` y la configuración de despliegue antes de construir o subir a producción, evitando fallos silenciosos de Vercel (p. ej. error 494 o formatos inválidos de runtime).

---

## 🗄️ Migraciones y Base de Datos

### `run-schema.mjs`
- **Uso:** `node scripts/run-schema.mjs`
- **Propósito:** Aplica migraciones SQL de forma segura vía conexión directa Postgres (`DATABASE_URL`), incluyendo tablas de contactos, aceptación de términos y triggers.

### `check-rls.mjs`
- **Uso:** `node scripts/check-rls.mjs`
- **Propósito:** Consulta y lista el estado actual de las políticas de Row Level Security (RLS) en la base de datos de Supabase.

### `fix-tipo-constraint.mjs`
- **Uso:** `node scripts/fix-tipo-constraint.mjs`
- **Propósito:** Ajusta constraints de roles en perfiles de usuario.

---

## 🔍 Diagnóstico e Integridad

### `full-diagnose.mjs`
- **Uso:** `node scripts/full-diagnose.mjs`
- **Propósito:** Ejecuta un diagnóstico integral de conexión, perfiles y tablas de Supabase.

### `diagnose-users.mjs` & `repair-users.mjs`
- **Uso:** `node scripts/diagnose-users.mjs` / `node scripts/repair-users.mjs`
- **Propósito:** Detecta discrepancias entre usuarios en `auth.users` y sus filas en `public.usuario` o `public.prestador`, permitiendo reparar perfiles huérfanos.

### `clean-foto-metadata.mjs`
- **Uso:** `node scripts/clean-foto-metadata.mjs`
- **Propósito:** Sanea metadatos de autenticación en `auth.users` eliminando cadenas base64 pesadas para prevenir el error `494 Request Header Too Large` en Vercel.

### `check-servicios.mjs`
- **Uso:** `node scripts/check-servicios.mjs`
- **Propósito:** Verifica la coherencia de servicios publicados.

### `check-auth-log.mjs`
- **Uso:** `node scripts/check-auth-log.mjs`
- **Propósito:** Inspecciona registros de auditoría de autenticación de Supabase.

---

## 🧪 Pruebas de Triggers

- `sync-trigger.mjs` / `test-sync-trigger.mjs`: Configuración y verificación del trigger de sincronización.
- `test-signup-trigger.mjs`: Inserta un usuario temporal de prueba para verificar que el trigger cree su perfil automáticamente y limpia los datos creados.
- `restore-test.mjs`: Restaura estado de pruebas.
