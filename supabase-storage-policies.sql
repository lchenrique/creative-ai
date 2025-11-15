-- Políticas de Storage para o bucket 'cliparts'
-- Execute este SQL no Supabase SQL Editor

-- ========================================
-- POLÍTICAS PARA UPLOAD DE IMAGENS
-- ========================================

-- 1. Permitir que usuários autenticados façam UPLOAD em suas próprias pastas
CREATE POLICY "Users can upload to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cliparts'
  AND (storage.foldername(name))[1] = 'images'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 2. Permitir que usuários autenticados LEIAM (SELECT) suas próprias imagens
CREATE POLICY "Users can view their own uploads"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'cliparts'
  AND (storage.foldername(name))[1] = 'images'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 3. Permitir que usuários autenticados DELETEM suas próprias imagens
CREATE POLICY "Users can delete their own uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'cliparts'
  AND (storage.foldername(name))[1] = 'images'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 4. Permitir que usuários autenticados ATUALIZEM suas próprias imagens
CREATE POLICY "Users can update their own uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cliparts'
  AND (storage.foldername(name))[1] = 'images'
  AND (storage.foldername(name))[2] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'cliparts'
  AND (storage.foldername(name))[1] = 'images'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- ========================================
-- POLÍTICA PARA LEITURA PÚBLICA (OPCIONAL)
-- ========================================
-- Se você quiser que as imagens sejam acessíveis publicamente via URL,
-- descomente a política abaixo:

-- CREATE POLICY "Public images are publicly accessible"
-- ON storage.objects
-- FOR SELECT
-- TO public
-- USING (
--   bucket_id = 'cliparts'
--   AND (storage.foldername(name))[1] = 'images'
-- );

-- ========================================
-- VERIFICAR POLÍTICAS EXISTENTES
-- ========================================
-- Para ver as políticas atuais do bucket, execute:
-- SELECT * FROM storage.policies WHERE bucket_id = 'cliparts';

-- ========================================
-- REMOVER POLÍTICAS (SE NECESSÁRIO)
-- ========================================
-- Se precisar remover alguma política antes de criar novas, use:
-- DROP POLICY IF EXISTS "nome_da_politica" ON storage.objects;
