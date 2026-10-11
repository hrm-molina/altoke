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
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- REGLA: Categorías prohibidas a nivel de BD
    CONSTRAINT check_categoria_permitida CHECK (
        LOWER(categoria) NOT IN ('cuidado de niños', 'compañia', 'compania')
    )
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

-- 5b. TABLA: CONTACTOS / RECLAMOS (Canal oficial Decreto N° 6/2021)
CREATE TABLE IF NOT EXISTS public.contactos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    asunto TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT,
    fecha TIMESTAMPTZ DEFAULT NOW(),
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'resuelto', 'cerrado')),
    respuesta TEXT,
    fecha_respuesta TIMESTAMPTZ
);

-- 5c. TABLA: ACEPTACIÓN DE TÉRMINOS (Trazabilidad consentimiento - Ley 19.628 Art. 12, D.6/2021 Art. 4)
CREATE TABLE IF NOT EXISTS public.terms_acceptance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    email TEXT,
    version TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('usuario', 'prestador')),
    ip TEXT,
    user_agent TEXT,
    fecha TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ÍNDICES DE RENDIMIENTO (Búsqueda rápida como Yapo)
CREATE INDEX IF NOT EXISTS idx_servicios_categoria ON public.servicios(categoria);
CREATE INDEX IF NOT EXISTS idx_servicios_region_comuna ON public.servicios(region, comuna);
CREATE INDEX IF NOT EXISTS idx_servicios_prestador ON public.servicios(prestador_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_servicio ON public.calificaciones(servicio_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);

-- 7. TRIGGER AUTOMÁTICO: Recalcular promedio de estrellas y total de reseñas (incluso al borrar)
CREATE OR REPLACE FUNCTION actualizar_rating_servicio()
RETURNS TRIGGER AS $$
DECLARE
    target_id UUID;
    avg_val NUMERIC;
    count_val INTEGER;
BEGIN
    target_id := COALESCE(NEW.servicio_id, OLD.servicio_id);
    IF target_id IS NOT NULL THEN
        SELECT 
            COALESCE(ROUND(AVG(calificacion)::numeric, 1), 5.0),
            COUNT(*)
        INTO avg_val, count_val
        FROM public.calificaciones
        WHERE servicio_id = target_id;

        UPDATE public.servicios
        SET 
            rating = avg_val,
            resenas = count_val
        WHERE id = target_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_actualizar_rating ON public.calificaciones;
CREATE TRIGGER trg_actualizar_rating
AFTER INSERT OR UPDATE OR DELETE ON public.calificaciones
FOR EACH ROW
EXECUTE FUNCTION actualizar_rating_servicio();

-- 8. TRIGGER: Validación de contenido prohibido en servicios (títulos y descripciones)
CREATE OR REPLACE FUNCTION validar_contenido_servicio()
RETURNS TRIGGER AS $$
DECLARE
    combined_text TEXT;
    prohibited_sexual TEXT[] := ARRAY[
        'sexual', 'sexo', 'prostitución', 'prostitucion', 'escort',
        'acompañante sexual', 'acompanante sexual', 'masaje erótico', 'masaje erotico',
        'servicios sexuales', 'servicio sexual', 'adulto', 'erótico', 'erotico',
        'íntimo', 'intimo', 'intimidad', 'relaciones sexuales', 'contacto sexual',
        'servicios íntimos', 'servicios intimos', 'masaje sensual', 'masaje tantra',
        'tantra', 'striptease', 'bailarin', 'bailarina', 'show erotico', 'show erótico'
    ];
    prohibited_child TEXT[] := ARRAY[
        'niños', 'niñas', 'menores', 'bebés', 'bebes', 'infantes', 'guardería',
        'guarderia', 'cuidado infantil', 'niñera', 'ninera', 'nana', 'colegio',
        'escuela', 'kinder', 'jardin infantil', 'jardín infantil', 'preescolar',
        'pre-escolar', 'cuna', 'sala cuna', 'educacion parvularia', 'educación parvularia',
        'cuidado de menores', 'cuido niños', 'cuido niñas', 'cuido bebes', 'canguro'
    ];
    prohibited_sales TEXT[] := ARRAY[
        'vendo', 'venta', 'compro', 'compra', 'se vende', 'se compra', 'producto',
        'productos', 'artículo', 'articulos', 'articulo', 'mercancía', 'mercancia',
        'stock', 'catálogo', 'catalogo', 'tienda', 'envío', 'envio', 'despacho',
        'marketplace', 'ecommerce', 'e-commerce', 'comercio', 'vender', 'comprar',
        'oferta', 'ofertas', 'precio', 'precios', 'costo', 'costos', 'mercado libre',
        'mercadolibre', 'facebook marketplace', 'instagram shop', 'tienda online',
        'venta online', 'vende', 'venden', 'compramos', 'interesado', 'interesados',
        'contactar para comprar', 'whatsapp para comprar', 'enviamos',
        'enviamos a todo chile', 'despachos', 'retiro en tienda', 'pago contra entrega',
        'transferencia', 'webpay', 'mercadopago'
    ];
    prohibited_illegal TEXT[] := ARRAY[
        'ilegal', 'ilegalidad', 'drogas', 'droga', 'estupefacientes', 'estupefaciente',
        'marihuana', 'cocaína', 'cocaina', 'pasta base', 'armas', 'arma', 'municiones',
        'municion', 'lavado', 'lavado de dinero', 'estafa', 'estafas', 'fraude', 'fraudes',
        'estafador', 'hackeo', 'hackear', 'phishing', 'robo', 'hurto', 'falsificación',
        'falsificacion', 'documentos falsos', 'clonación', 'clonacion', 'skimming', 'carding'
    ];
    keyword TEXT;
    found_category TEXT;
BEGIN
    combined_text := LOWER(NEW.titulo || ' ' || NEW.descripcion);
    
    -- Verificar palabras prohibidas (coincidencia de palabras completas)
    FOREACH keyword IN ARRAY prohibited_sexual
    LOOP
        IF combined_text ~ ('\y' || keyword || '\y') THEN
            found_category := 'sexual';
            EXIT;
        END IF;
    END LOOP;
    
    IF found_category IS NULL THEN
        FOREACH keyword IN ARRAY prohibited_child
        LOOP
            IF combined_text ~ ('\y' || keyword || '\y') THEN
                found_category := 'childRelated';
                EXIT;
            END IF;
        END LOOP;
    END IF;
    
    IF found_category IS NULL THEN
        FOREACH keyword IN ARRAY prohibited_sales
        LOOP
            IF combined_text ~ ('\y' || keyword || '\y') THEN
                found_category := 'goodsSales';
                EXIT;
            END IF;
        END LOOP;
    END IF;
    
    IF found_category IS NULL THEN
        FOREACH keyword IN ARRAY prohibited_illegal
        LOOP
            IF combined_text ~ ('\y' || keyword || '\y') THEN
                found_category := 'illegal';
                EXIT;
            END IF;
        END LOOP;
    END IF;
    
    IF found_category IS NOT NULL THEN
        CASE found_category
            WHEN 'sexual' THEN
                RAISE EXCEPTION 'No se permiten servicios de contenido sexual o para adultos.';
            WHEN 'childRelated' THEN
                RAISE EXCEPTION 'No se permiten servicios relacionados con cuidado de menores de edad.';
            WHEN 'goodsSales' THEN
                RAISE EXCEPTION 'No se permite la venta de productos. Solo servicios.';
            WHEN 'illegal' THEN
                RAISE EXCEPTION 'No se permiten actividades ilegales.';
        END CASE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_contenido_servicio ON public.servicios;
CREATE TRIGGER trg_validar_contenido_servicio
BEFORE INSERT OR UPDATE ON public.servicios
FOR EACH ROW
EXECUTE FUNCTION validar_contenido_servicio();

-- 9. PERMISOS DE ROLES (Necesarios para que Supabase permita el acceso a la API)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
-- anon SOLO puede leer servicios públicos (catálogo) — NO usuarios, calificaciones, alertas, contactos
GRANT SELECT ON public.servicios TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
-- Revocar acceso anon a tablas sensibles (defensa en profundidad)
REVOKE ALL ON public.usuarios FROM anon;
REVOKE ALL ON public.calificaciones FROM anon;
REVOKE ALL ON public.alertas FROM anon;
REVOKE ALL ON public.contactos FROM anon;
REVOKE ALL ON public.terms_acceptance FROM anon;

-- 10. POLÍTICAS DE SEGURIDAD (Row Level Security - RLS)
-- Habilitar RLS en todas las tablas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contactos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms_acceptance ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLÍTICAS USUARIOS
-- ==========================================
-- Lectura: usuario autenticado ve solo su propio perfil
DROP POLICY IF EXISTS "Usuario ve su perfil" ON public.usuarios;
CREATE POLICY "Usuario ve su perfil" ON public.usuarios
  FOR SELECT USING (auth.uid() = id);

-- Inserción: durante registro (auth.uid() = id) o por el trigger interno (service_role)
DROP POLICY IF EXISTS "Usuario se registra" ON public.usuarios;
CREATE POLICY "Usuario se registra" ON public.usuarios
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- Actualización: usuario actualiza solo su propio perfil
DROP POLICY IF EXISTS "Usuario actualiza su perfil" ON public.usuarios;
CREATE POLICY "Usuario actualiza su perfil" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Eliminación: usuario elimina solo su propia cuenta (GDPR/Ley 19.628)
DROP POLICY IF EXISTS "Usuario elimina su cuenta" ON public.usuarios;
CREATE POLICY "Usuario elimina su cuenta" ON public.usuarios
  FOR DELETE USING (auth.uid() = id);

-- Lectura anónima: NO permitida (datos sensibles: RUT, teléfono, fecha_nac, password_hash)

-- ==========================================
-- POLÍTICAS SERVICIOS
-- ==========================================
-- Lectura pública: solo servicios activos (catálogo público)
DROP POLICY IF EXISTS "Servicios activos visibles públicamente" ON public.servicios;
CREATE POLICY "Servicios activos visibles públicamente" ON public.servicios
  FOR SELECT USING (activo = TRUE);

-- Inserción: prestador autenticado crea sus servicios
DROP POLICY IF EXISTS "Prestador publica servicio" ON public.servicios;
CREATE POLICY "Prestador publica servicio" ON public.servicios
  FOR INSERT WITH CHECK (auth.uid() = prestador_id);

-- Actualización: prestador actualiza solo sus servicios
DROP POLICY IF EXISTS "Prestador actualiza su servicio" ON public.servicios;
CREATE POLICY "Prestador actualiza su servicio" ON public.servicios
  FOR UPDATE USING (auth.uid() = prestador_id) WITH CHECK (auth.uid() = prestador_id);

-- Eliminación: prestador elimina solo sus servicios
DROP POLICY IF EXISTS "Prestador elimina su servicio" ON public.servicios;
CREATE POLICY "Prestador elimina su servicio" ON public.servicios
  FOR DELETE USING (auth.uid() = prestador_id);

-- ==========================================
-- POLÍTICAS CALIFICACIONES
-- ==========================================
-- Lectura pública: reseñas visibles para todos (transparencia)
DROP POLICY IF EXISTS "Reseñas visibles públicamente" ON public.calificaciones;
CREATE POLICY "Reseñas visibles públicamente" ON public.calificaciones
  FOR SELECT USING (TRUE);

-- Inserción: solo cliente autenticado puede calificar (anti-auto-rating en trigger)
DROP POLICY IF EXISTS "Cliente califica servicio" ON public.calificaciones;
CREATE POLICY "Cliente califica servicio" ON public.calificaciones
  FOR INSERT WITH CHECK (auth.uid() = cliente_id);

-- No UPDATE ni DELETE de reseñas (inmutabilidad)

-- ==========================================
-- POLÍTICAS ALERTAS
-- ==========================================
-- Usuario ve solo sus propias alertas
DROP POLICY IF EXISTS "Usuario ve sus alertas" ON public.alertas;
CREATE POLICY "Usuario ve sus alertas" ON public.alertas
  FOR SELECT USING (auth.uid() = usuario_id);

-- Usuario crea sus alertas (al revelar teléfono)
DROP POLICY IF EXISTS "Usuario crea alerta" ON public.alertas;
CREATE POLICY "Usuario crea alerta" ON public.alertas
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Usuario marca sus alertas como atendidas
DROP POLICY IF EXISTS "Usuario actualiza su alerta" ON public.alertas;
CREATE POLICY "Usuario actualiza su alerta" ON public.alertas
  FOR UPDATE USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- Usuario elimina sus alertas
DROP POLICY IF EXISTS "Usuario elimina su alerta" ON public.alertas;
CREATE POLICY "Usuario elimina su alerta" ON public.alertas
  FOR DELETE USING (auth.uid() = usuario_id);

-- ==========================================
-- POLÍTICAS CONTACTOS
-- ==========================================
-- Inserción pública: cualquiera puede enviar un contacto/reclamo (anon key)
DROP POLICY IF EXISTS "Público puede crear contacto" ON public.contactos;
CREATE POLICY "Público puede crear contacto" ON public.contactos
  FOR INSERT WITH CHECK (TRUE);

-- Lectura: solo administradores (service_role) pueden ver contactos
-- El usuario autenticado puede ver sus propios contactos si los vincula a su cuenta
DROP POLICY IF EXISTS "Usuario ve sus contactos" ON public.contactos;
CREATE POLICY "Usuario ve sus contactos" ON public.contactos
  FOR SELECT USING (auth.uid()::text = email OR auth.role() = 'service_role');

-- Actualización: solo service_role (admin) puede actualizar estado/respuesta
DROP POLICY IF EXISTS "Admin actualiza contacto" ON public.contactos;
CREATE POLICY "Admin actualiza contacto" ON public.contactos
  FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ==========================================
-- POLÍTICAS TERMS ACCEPTANCE
-- ==========================================
-- Inserción pública: cualquiera puede aceptar términos durante registro (anon key)
DROP POLICY IF EXISTS "Público puede aceptar términos" ON public.terms_acceptance;
CREATE POLICY "Público puede aceptar términos" ON public.terms_acceptance
  FOR INSERT WITH CHECK (TRUE);

-- Lectura: solo administradores (service_role) y el propio usuario pueden ver sus aceptaciones
DROP POLICY IF EXISTS "Usuario ve su aceptación términos" ON public.terms_acceptance;
CREATE POLICY "Usuario ve su aceptación términos" ON public.terms_acceptance
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ==========================================
-- TRIGGER: Auto-crear perfil en public.usuarios al registrarse (auth.users)
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, email, password_hash, tipo, nombre, rut, telefono, 
                                  fecha_nacimiento, region, comuna, ciudad_sector, 
                                  servicios, valor_hora, foto)
    VALUES (
        NEW.id,
        NEW.email,
        '',
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'tipo', ''), 'usuario'),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'nombre', ''), ''),
        NULLIF(NEW.raw_user_meta_data->>'rut', ''),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'telefono', ''), ''),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'fechaNacimiento', '')::date, (CURRENT_DATE - INTERVAL '18 years')),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'region', ''), ''),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'comuna', ''), ''),
        NULLIF(NEW.raw_user_meta_data->>'ciudadSector', ''),
        NULLIF(NEW.raw_user_meta_data->>'servicios', ''),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'valorHora', '')::numeric, 0),
        NULLIF(NEW.raw_user_meta_data->>'foto', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

