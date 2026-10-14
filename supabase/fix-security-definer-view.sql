-- ========================================================================
-- SOLUCIÓN: Resolver advertencia "Security Definer View" en public.prestadores_publicos
-- Ejecutar en Supabase SQL Editor
-- ========================================================================

-- Opción 1 (Directa y recomendada por Supabase):
-- Cambiar la vista para que use los permisos del invocador (security_invoker = true)
ALTER VIEW public.prestadores_publicos SET (security_invoker = true);

-- Asegurar permisos de consulta para usuarios anónimos y registrados
GRANT SELECT ON public.prestadores_publicos TO anon, authenticated;
