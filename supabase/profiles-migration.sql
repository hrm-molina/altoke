-- ========================================================================
-- MIGRACIÓN: Separar perfiles en perfil_usuario y perfil_prestador
-- Ejecutar en Supabase SQL Editor
-- ========================================================================

-- 1. CREAR TABLA perfil_usuario
CREATE TABLE IF NOT EXISTS public.perfil_usuario (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    region TEXT NOT NULL,
    comuna TEXT NOT NULL,
    ciudad_sector TEXT,
    foto TEXT,
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    
    -- REGLA: Validar mayor de 18 años
    CONSTRAINT check_mayor_edad_usuario CHECK (
        fecha_nacimiento <= (CURRENT_DATE - INTERVAL '18 years')
    )
);

-- 2. CREAR TABLA perfil_prestador
CREATE TABLE IF NOT EXISTS public.perfil_prestador (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    nombre TEXT NOT NULL,
    rut TEXT,
    telefono TEXT NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    region TEXT NOT NULL,
    comuna TEXT NOT NULL,
    ciudad_sector TEXT,
    servicios TEXT,
    valor_hora NUMERIC DEFAULT 0,
    foto TEXT,
    foto_servicio TEXT,
    categoria TEXT,
    descripcion TEXT,
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    activo BOOLEAN DEFAULT TRUE,
    
    -- REGLA: Validar mayor de 18 años
    CONSTRAINT check_mayor_edad_prestador CHECK (
        fecha_nacimiento <= (CURRENT_DATE - INTERVAL '18 years')
    )
);

-- 3. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_perfil_usuario_email ON public.perfil_usuario(email);
CREATE INDEX IF NOT EXISTS idx_perfil_prestador_email ON public.perfil_prestador(email);
CREATE INDEX IF NOT EXISTS idx_perfil_prestador_comuna ON public.perfil_prestador(comuna);
CREATE INDEX IF NOT EXISTS idx_perfil_prestador_activo ON public.perfil_prestador(activo);

-- 4. RLS - perfil_usuario
ALTER TABLE public.perfil_usuario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario ve su perfil" ON public.perfil_usuario;
CREATE POLICY "Usuario ve su perfil" ON public.perfil_usuario
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuario crea su perfil" ON public.perfil_usuario;
CREATE POLICY "Usuario crea su perfil" ON public.perfil_usuario
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuario actualiza su perfil" ON public.perfil_usuario;
CREATE POLICY "Usuario actualiza su perfil" ON public.perfil_usuario
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 5. RLS - perfil_prestador
ALTER TABLE public.perfil_prestador ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Prestador ve su perfil" ON public.perfil_prestador;
CREATE POLICY "Prestador ve su perfil" ON public.perfil_prestador
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Prestador crea su perfil" ON public.perfil_prestador;
CREATE POLICY "Prestador crea su perfil" ON public.perfil_prestador
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Prestador actualiza su perfil" ON public.perfil_prestador;
CREATE POLICY "Prestador actualiza su perfil" ON public.perfil_prestador
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 6. LECTURA PÚBLICA: perfiles de prestadores activos (para catálogo)
DROP POLICY IF EXISTS "Perfiles prestadores activos visibles públicamente" ON public.perfil_prestador;
CREATE POLICY "Perfiles prestadores activos visibles públicamente" ON public.perfil_prestador
  FOR SELECT USING (activo = TRUE);

-- 7. PERMISOS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.perfil_usuario TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.perfil_prestador TO authenticated;
GRANT SELECT ON public.perfil_prestador TO anon; -- solo perfiles activos via policy
REVOKE ALL ON public.perfil_usuario FROM anon;

-- 8. MIGRAR DATOS EXISTENTES de public.usuarios
-- Usuarios tipo 'usuario' -> perfil_usuario
INSERT INTO public.perfil_usuario (id, email, nombre, telefono, fecha_nacimiento, region, comuna, ciudad_sector, foto, fecha_registro)
SELECT id, email, nombre, telefono, fecha_nacimiento, region, comuna, ciudad_sector, foto, fecha_registro
FROM public.usuarios
WHERE tipo = 'usuario'
ON CONFLICT (id) DO NOTHING;

-- Usuarios tipo 'prestador' -> perfil_prestador
INSERT INTO public.perfil_prestador (id, email, nombre, rut, telefono, fecha_nacimiento, region, comuna, ciudad_sector, servicios, valor_hora, foto, foto_servicio, categoria, descripcion, fecha_registro, activo)
SELECT 
    id, email, nombre, rut, telefono, fecha_nacimiento, region, comuna, ciudad_sector, 
    servicios, valor_hora, foto, 
    NULL as foto_servicio,  -- se migrará después si existe en servicios
    'Otros' as categoria,   -- default
    'Servicio ofrecido por ' || nombre || ' en ' || comuna as descripcion,
    fecha_registro, TRUE
FROM public.usuarios
WHERE tipo = 'prestador'
ON CONFLICT (id) DO NOTHING;

-- Usuarios tipo 'ambos' -> AMBAS tablas
INSERT INTO public.perfil_usuario (id, email, nombre, telefono, fecha_nacimiento, region, comuna, ciudad_sector, foto, fecha_registro)
SELECT id, email, nombre, telefono, fecha_nacimiento, region, comuna, ciudad_sector, foto, fecha_registro
FROM public.usuarios
WHERE tipo = 'ambos'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.perfil_prestador (id, email, nombre, rut, telefono, fecha_nacimiento, region, comuna, ciudad_sector, servicios, valor_hora, foto, foto_servicio, categoria, descripcion, fecha_registro, activo)
SELECT 
    id, email, nombre, rut, telefono, fecha_nacimiento, region, comuna, ciudad_sector, 
    servicios, valor_hora, foto,
    NULL as foto_servicio,
    'Otros' as categoria,
    'Servicio ofrecido por ' || nombre || ' en ' || comuna as descripcion,
    fecha_registro, TRUE
FROM public.usuarios
WHERE tipo = 'ambos'
ON CONFLICT (id) DO NOTHING;

-- 9. MIGRAR foto_servicio y categoria desde tabla servicios a perfil_prestador
UPDATE public.perfil_prestador pp
SET 
    foto_servicio = s.foto,
    categoria = s.categoria,
    descripcion = s.descripcion
FROM public.servicios s
WHERE s.prestador_id = pp.id
  AND s.activo = TRUE
  AND (pp.foto_servicio IS NULL OR pp.categoria = 'Otros');

-- 10. ACTUALIZAR FK en tabla servicios: prestador_id -> perfil_prestador.id (mismo UUID, solo semántica)
-- No requiere ALTER TABLE porque el UUID es el mismo (auth.users.id = perfil_prestador.id)
-- Solo confirmar que la constraint existente apunta a auth.users (lo hace)
-- Si se quiere cambiar explícitamente:
-- ALTER TABLE public.servicios DROP CONSTRAINT IF EXISTS servicios_prestador_id_fkey;
-- ALTER TABLE public.servicios ADD CONSTRAINT servicios_prestador_id_fkey 
--   FOREIGN KEY (prestador_id) REFERENCES public.perfil_prestador(id) ON DELETE CASCADE;

-- 11. ELIMINAR TRIGGERS LEGACY (metadata sync ya no necesario)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_user_metadata_update();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 12. OPCIONAL: Eliminar tabla legacy public.usuarios (descomentar tras verificar migración)
-- DROP TABLE IF EXISTS public.usuarios CASCADE;