-- ========================================================================
-- MIGRACIÓN: Separar perfiles en usuario y prestador
-- Ejecutar en Supabase SQL Editor
-- ========================================================================

-- 1. CREAR TABLA usuario
CREATE TABLE IF NOT EXISTS public.usuario (
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

-- 2. CREAR TABLA prestador
CREATE TABLE IF NOT EXISTS public.prestador (
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
CREATE INDEX IF NOT EXISTS idx_usuario_email ON public.usuario(email);
CREATE INDEX IF NOT EXISTS idx_prestador_email ON public.prestador(email);
CREATE INDEX IF NOT EXISTS idx_prestador_comuna ON public.prestador(comuna);
CREATE INDEX IF NOT EXISTS idx_prestador_activo ON public.prestador(activo);

-- 4. RLS - usuario
ALTER TABLE public.usuario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario ve su perfil" ON public.usuario;
CREATE POLICY "Usuario ve su perfil" ON public.usuario
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuario crea su perfil" ON public.usuario;
CREATE POLICY "Usuario crea su perfil" ON public.usuario
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuario actualiza su perfil" ON public.usuario;
CREATE POLICY "Usuario actualiza su perfil" ON public.usuario
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 5. RLS - prestador
ALTER TABLE public.prestador ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Prestador ve su perfil" ON public.prestador;
CREATE POLICY "Prestador ve su perfil" ON public.prestador
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Prestador crea su perfil" ON public.prestador;
CREATE POLICY "Prestador crea su perfil" ON public.prestador
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Prestador actualiza su perfil" ON public.prestador;
CREATE POLICY "Prestador actualiza su perfil" ON public.prestador
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 6. LECTURA PÚBLICA: perfiles de prestadores activos (para catálogo)
DROP POLICY IF EXISTS "Perfiles prestadores activos visibles públicamente" ON public.prestador;
CREATE POLICY "Perfiles prestadores activos visibles públicamente" ON public.prestador
  FOR SELECT USING (activo = TRUE);

-- 7. PERMISOS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.usuario TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.prestador TO authenticated;
GRANT SELECT ON public.prestador TO anon; -- solo perfiles activos via policy
REVOKE ALL ON public.usuario FROM anon;

-- 8. MIGRAR DATOS EXISTENTES de public.usuarios
-- Usuarios tipo 'usuario' -> usuario
INSERT INTO public.usuario (id, email, nombre, telefono, fecha_nacimiento, region, comuna, ciudad_sector, foto, fecha_registro)
SELECT id, email, nombre, telefono, fecha_nacimiento, region, comuna, ciudad_sector, foto, fecha_registro
FROM public.usuarios
WHERE tipo = 'usuario'
ON CONFLICT (id) DO NOTHING;

-- Usuarios tipo 'prestador' -> prestador
INSERT INTO public.prestador (id, email, nombre, rut, telefono, fecha_nacimiento, region, comuna, ciudad_sector, servicios, valor_hora, foto, foto_servicio, categoria, descripcion, fecha_registro, activo)
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
INSERT INTO public.usuario (id, email, nombre, telefono, fecha_nacimiento, region, comuna, ciudad_sector, foto, fecha_registro)
SELECT id, email, nombre, telefono, fecha_nacimiento, region, comuna, ciudad_sector, foto, fecha_registro
FROM public.usuarios
WHERE tipo = 'ambos'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.prestador (id, email, nombre, rut, telefono, fecha_nacimiento, region, comuna, ciudad_sector, servicios, valor_hora, foto, foto_servicio, categoria, descripcion, fecha_registro, activo)
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

-- 9. MIGRAR foto_servicio y categoria desde tabla servicios a prestador
UPDATE public.prestador pp
SET 
    foto_servicio = s.foto,
    categoria = s.categoria,
    descripcion = s.descripcion
FROM public.servicios s
WHERE s.prestador_id = pp.id
  AND s.activo = TRUE
  AND (pp.foto_servicio IS NULL OR pp.categoria = 'Otros');

-- 10. ACTUALIZAR FK en tabla servicios: prestador_id -> prestador.id (mismo UUID, solo semántica)
-- No requiere ALTER TABLE porque el UUID es el mismo (auth.users.id = prestador.id)
-- Solo confirmar que la constraint existente apunta a auth.users (lo hace)
-- Si se quiere cambiar explícitamente:
-- ALTER TABLE public.servicios DROP CONSTRAINT IF EXISTS servicios_prestador_id_fkey;
-- ALTER TABLE public.servicios ADD CONSTRAINT servicios_prestador_id_fkey 
--   FOREIGN KEY (prestador_id) REFERENCES public.prestador(id) ON DELETE CASCADE;

-- 11. ELIMINAR TRIGGERS LEGACY (metadata sync ya no necesario)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_user_metadata_update();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 12. OPCIONAL: Eliminar tabla legacy public.usuarios (descomentar tras verificar migración)
-- DROP TABLE IF EXISTS public.usuarios CASCADE;