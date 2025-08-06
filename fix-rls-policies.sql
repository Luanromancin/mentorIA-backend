-- Script para corrigir as políticas RLS da tabela user_answers
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos desabilitar RLS temporariamente para permitir inserções
ALTER TABLE user_answers DISABLE ROW LEVEL SECURITY;

-- Agora vamos recriar as políticas corretamente
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- Política para service role (backend) acessar todas as respostas
DROP POLICY IF EXISTS "Service role can access all answers" ON user_answers;
CREATE POLICY "Service role can access all answers" ON user_answers
    FOR ALL USING (auth.role() = 'service_role');

-- Política para usuários verem apenas suas próprias respostas
DROP POLICY IF EXISTS "Users can view their own answers" ON user_answers;
CREATE POLICY "Users can view their own answers" ON user_answers
    FOR SELECT USING (auth.uid() = profile_id);

-- Política para usuários inserirem suas próprias respostas
DROP POLICY IF EXISTS "Users can insert their own answers" ON user_answers;
CREATE POLICY "Users can insert their own answers" ON user_answers
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Política para usuários atualizarem suas próprias respostas
DROP POLICY IF EXISTS "Users can update their own answers" ON user_answers;
CREATE POLICY "Users can update their own answers" ON user_answers
    FOR UPDATE USING (auth.uid() = profile_id);

-- Política para usuários deletarem suas próprias respostas
DROP POLICY IF EXISTS "Users can delete their own answers" ON user_answers;
CREATE POLICY "Users can delete their own answers" ON user_answers
    FOR DELETE USING (auth.uid() = profile_id);

-- Verificar as políticas criadas
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
WHERE tablename = 'user_answers'; 