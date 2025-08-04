-- Script para garantir permissões de leitura no schema public para o service_role
-- Execute este script no SQL Editor do Supabase

-- 1. Garante que o service_role pode "usar" o schema public.
-- Esta é a permissão mais básica necessária.
GRANT USAGE ON SCHEMA public TO service_role;

-- 2. Garante que o service_role pode fazer SELECT em TODAS as tabelas do schema public.
GRANT SELECT ON ALL TABLES IN SCHEMA public TO service_role;

-- 3. Garante que o service_role também pode fazer SELECT em futuras tabelas que forem criadas.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO service_role;

-- 4. Garante permissões específicas para as tabelas que estamos usando
GRANT SELECT, INSERT, UPDATE ON public.competencies TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.user_competencies TO service_role;
GRANT SELECT ON public.questions TO service_role;
GRANT SELECT ON public.alternatives TO service_role;
GRANT SELECT ON public.profiles TO service_role;

-- 5. Verifica se as tabelas existem
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('competencies', 'user_competencies', 'questions', 'alternatives', 'profiles');

-- 6. Verifica se RLS está desabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('competencies', 'user_competencies', 'questions', 'alternatives', 'profiles');

-- Mensagem de sucesso para você saber que executou.
SELECT 'Permissões de leitura para service_role foram aplicadas com sucesso!' as result; 