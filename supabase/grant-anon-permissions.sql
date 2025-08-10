-- Script para conceder permissões explícitas ao role 'anon'
-- Execute este script no SQL Editor do Supabase

-- 1. Conceder USAGE no schema public para o role 'anon'
GRANT USAGE ON SCHEMA public TO anon;

-- 2. Conceder SELECT, INSERT, UPDATE nas tabelas para o role 'anon'
GRANT SELECT, INSERT, UPDATE ON public.leveling_test_sessions TO anon;
GRANT SELECT, INSERT, UPDATE ON public.leveling_test_questions TO anon;

-- 3. Conceder permissões futuras para novas tabelas/sequências no schema public
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT USAGE ON SEQUENCES TO anon;

-- 4. Verificar permissões atuais
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('leveling_test_questions', 'leveling_test_sessions');

-- 5. Verificar permissões do role anon
SELECT 
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.table_privileges 
WHERE grantee = 'anon' 
  AND table_name IN ('leveling_test_questions', 'leveling_test_sessions');

SELECT 'Permissões explícitas concedidas ao role anon.' as status;
