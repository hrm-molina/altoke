-- ========================================================================
-- AL TOKE - SCHEMA OFICIAL DE BASE DE DATOS SUPABASE (POSTGRESQL)
-- ========================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: USUARIOS
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('usuario', 'prestador')),
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
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    
    -- REGLA DE ORO: Validar que sea mayor de 18 años a nivel de base de datos
    CONSTRAINT check_mayor_de_edad CHECK (
        fecha_nacimiento <= (CURRENT_DATE - INTERVAL '18 years')
    )
);

-- 3. TABLA: SERVICIOS PUBLICADOS
CREATE TABLE IF NOT EXISTS public.servicios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prestador_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    categoria TEXT NOT NULL,
    precio NUMERIC NOT NULL DEFAULT 5000,
    rating NUMERIC(2,1) DEFAULT 5.0,
    resenas INTEGER DEFAULT 0,
    comuna TEXT NOT NULL,
    region TEXT NOT NULL,
    sector TEXT,
    foto TEXT,
    fecha_publicacion DATE DEFAULT CURRENT_DATE,
    nombre_prestador TEXT NOT NULL,
    foto_prestador TEXT,
    telefono TEXT NOT NULL,
    email_prestador TEXT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: CALIFICACIONES / RESEÑAS
CREATE TABLE IF NOT EXISTS public.calificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    servicio_id UUID REFERENCES public.servicios(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    titulo_servicio TEXT NOT NULL,
    nombre_cliente TEXT NOT NULL,
    email_cliente TEXT,
    nombre_prestador TEXT,
    email_prestador TEXT,
    calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    resena TEXT,
    fecha TIMESTAMPTZ DEFAULT NOW(),

    -- REGLA ANTI AUTO-CALIFICACIÓN A NIVEL DE BD:
    -- El cliente no puede tener el mismo email que el prestador
    CONSTRAINT check_anti_auto_calificacion CHECK (
        email_cliente IS NULL OR 
        email_prestador IS NULL OR 
        LOWER(email_cliente) != LOWER(email_prestador)
    )
);

-- 5. TABLA: ALERTAS DE CONTRATACIÓN
CREATE TABLE IF NOT EXISTS public.alertas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    servicio_id UUID REFERENCES public.servicios(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo_servicio TEXT NOT NULL,
    nombre_prestador TEXT NOT NULL,
    categoria TEXT NOT NULL,
    comuna TEXT NOT NULL,
    telefono TEXT NOT NULL,
    atendida BOOLEAN DEFAULT FALSE,
    fecha TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ÍNDICES DE RENDIMIENTO (Búsqueda rápida como Yapo)
CREATE INDEX IF NOT EXISTS idx_servicios_categoria ON public.servicios(categoria);
CREATE INDEX IF NOT EXISTS idx_servicios_region_comuna ON public.servicios(region, comuna);
CREATE INDEX IF NOT EXISTS idx_servicios_prestador ON public.servicios(prestador_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_servicio ON public.calificaciones(servicio_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);

-- 7. TRIGGER AUTOMÁTICO: Recalcular promedio de estrellas y total de reseñas
CREATE OR REPLACE FUNCTION actualizar_rating_servicio()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.servicios
    SET 
        rating = ROUND((SELECT AVG(calificacion) FROM public.calificaciones WHERE servicio_id = NEW.servicio_id)::numeric, 1),
        resenas = (SELECT COUNT(*) FROM public.calificaciones WHERE servicio_id = NEW.servicio_id)
    WHERE id = NEW.servicio_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_actualizar_rating ON public.calificaciones;
CREATE TRIGGER trg_actualizar_rating
AFTER INSERT OR UPDATE ON public.calificaciones
FOR EACH ROW
EXECUTE FUNCTION actualizar_rating_servicio();

-- 8. PERMISOS DE ROLES (Necesarios para que Supabase permita el acceso a la API)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- 9. POLÍTICAS DE SEGURIDAD (Row Level Security - RLS)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;

-- Lectura y gestión de usuarios
DROP POLICY IF EXISTS "Permitir registro de usuarios" ON public.usuarios;
CREATE POLICY "Permitir registro de usuarios" ON public.usuarios FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Permitir leer usuarios" ON public.usuarios;
CREATE POLICY "Permitir leer usuarios" ON public.usuarios FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Permitir actualizar usuarios" ON public.usuarios;
CREATE POLICY "Permitir actualizar usuarios" ON public.usuarios FOR UPDATE USING (TRUE);

-- Servicios
DROP POLICY IF EXISTS "Servicios visibles públicamente" ON public.servicios;
CREATE POLICY "Servicios visibles públicamente" ON public.servicios FOR SELECT USING (activo = TRUE);

DROP POLICY IF EXISTS "Permitir publicar servicios" ON public.servicios;
CREATE POLICY "Permitir publicar servicios" ON public.servicios FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Permitir actualizar servicios" ON public.servicios;
CREATE POLICY "Permitir actualizar servicios" ON public.servicios FOR UPDATE USING (TRUE);

DROP POLICY IF EXISTS "Permitir eliminar servicios" ON public.servicios;
CREATE POLICY "Permitir eliminar servicios" ON public.servicios FOR DELETE USING (TRUE);

-- Reseñas / Calificaciones
DROP POLICY IF EXISTS "Reseñas visibles públicamente" ON public.calificaciones;
CREATE POLICY "Reseñas visibles públicamente" ON public.calificaciones FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Permitir calificar servicios" ON public.calificaciones;
CREATE POLICY "Permitir calificar servicios" ON public.calificaciones FOR INSERT WITH CHECK (TRUE);

-- Alertas
DROP POLICY IF EXISTS "Gestionar alertas" ON public.alertas;
CREATE POLICY "Gestionar alertas" ON public.alertas FOR ALL USING (TRUE);

