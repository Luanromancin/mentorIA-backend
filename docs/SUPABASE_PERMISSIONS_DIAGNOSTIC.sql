-- Script de diagnóstico para verificar permissões no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se o service_role existe
SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin
FROM pg_roles 
WHERE rolname = 'service_role';

-- 2. Verificar permissões do service_role no schema public
SELECT 
    n.nspname as schema_name,
    r.rolname as role_name,
    has_schema_privilege(r.oid, n.oid, 'USAGE') as has_usage,
    has_schema_privilege(r.oid, n.oid, 'CREATE') as has_create
FROM pg_namespace n
CROSS JOIN pg_roles r
WHERE n.nspname = 'public' 
AND r.rolname = 'service_role';

-- 3. Verificar permissões do service_role nas tabelas específicas
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasselect,
    hasinsert,
    hasupdate,
    hasdelete,
    hasreferences,
    hastrigger
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('competencies', 'user_competencies', 'questions', 'alternatives', 'profiles');

-- 4. Verificar se RLS está habilitado nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('competencies', 'user_competencies', 'questions', 'alternatives', 'profiles');

-- 5. Verificar políticas RLS (se existirem)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('competencies', 'user_competencies', 'questions', 'alternatives', 'profiles');

-- 6. Tentar uma consulta simples como service_role
-- (Isso pode falhar, mas nos dará mais informações)
SELECT 'Teste de acesso como service_role' as test; 