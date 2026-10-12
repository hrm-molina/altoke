-- Migración: Crear bucket de Supabase Storage para fotos de perfil
-- Ejecutar en Supabase SQL Editor

-- 1. Crear bucket público para fotos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fotos-perfil',
  'fotos-perfil',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy: usuarios autenticados pueden subir/borrar su propia foto
DROP POLICY IF EXISTS "Subir foto propia" ON storage.objects;
CREATE POLICY "Subir foto propia"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'fotos-perfil'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Actualizar foto propia" ON storage.objects;
CREATE POLICY "Actualizar foto propia"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'fotos-perfil'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Borrar foto propia" ON storage.objects;
CREATE POLICY "Borrar foto propia"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'fotos-perfil'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Policy: cualquiera puede ver fotos (bucket público)
DROP POLICY IF EXISTS "Ver fotos publicas" ON storage.objects;
CREATE POLICY "Ver fotos publicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'fotos-perfil');

-- 4. Asegurar que usuarios.foto acepte URLs largas
ALTER TABLE public.usuarios ALTER COLUMN foto TYPE TEXT;
ALTER TABLE public.servicios ALTER COLUMN foto TYPE TEXT;
ALTER TABLE public.servicios ALTER COLUMN foto_prestador TYPE TEXT;
