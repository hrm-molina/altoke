-- ========================================================================
-- CONSOLIDACIÓN: Todo el perfil del prestador (incluido su servicio) vive
-- en la única tabla public.perfil_prestador. Se elimina public.servicios.
--
-- ORDEN DE EJECUCIÓN:
--   1) profiles-migration.sql       (crea perfil_usuario / perfil_prestador)
--   2) prestador-consolidation.sql  (este archivo)
-- ========================================================================

-- 1. Columnas de catálogo/reseñas que faltaban en perfil_prestador
ALTER TABLE public.perfil_prestador
    ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 5.0,
    ADD COLUMN IF NOT EXISTS resenas INTEGER DEFAULT 0;

-- 2. Migrar datos del catálogo viejo (servicios) hacia perfil_prestador
UPDATE public.perfil_prestador pp
SET
    servicios      = COALESCE(pp.servicios, s.titulo),
    descripcion    = COALESCE(pp.descripcion, s.descripcion),
    categoria      = COALESCE(pp.categoria, s.categoria),
    valor_hora     = CASE
                       WHEN COALESCE(pp.valor_hora, 0) = 0 THEN COALESCE(s.precio, 0)
                       ELSE pp.valor_hora
                     END,
    foto_servicio  = COALESCE(pp.foto_servicio, s.foto),
    ciudad_sector  = COALESCE(pp.ciudad_sector, s.sector),
    comuna         = COALESCE(pp.comuna, s.comuna),
    region         = COALESCE(pp.region, s.region),
    rating         = COALESCE(s.rating, pp.rating),
    resenas        = COALESCE(s.resenas, pp.resenas)
FROM public.servicios s
WHERE s.prestador_id = pp.id;

-- 3. Eliminar la tabla servicios (todo quedó en perfil_prestador)
DROP TABLE IF EXISTS public.servicios CASCADE;

-- 4. Asegurar RLS/perfil activo visible en el catálogo (idempotente)
ALTER TABLE public.perfil_prestador ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Perfiles prestadores activos visibles públicamente" ON public.perfil_prestador;
CREATE POLICY "Perfiles prestadores activos visibles públicamente" ON public.perfil_prestador
  FOR SELECT USING (activo = TRUE);

GRANT SELECT ON public.perfil_prestador TO anon;
GRANT SELECT, INSERT, UPDATE ON public.perfil_prestador TO authenticated;
