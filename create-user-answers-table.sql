-- Script para criar a tabela user_answers no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar a tabela user_answers
CREATE TABLE IF NOT EXISTS user_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL,
    question_id UUID NOT NULL,
    selected_alternative_id UUID,
    is_correct BOOLEAN NOT NULL,
    time_spent_seconds INTEGER,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_answers_profile_id ON user_answers(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_answered_at ON user_answers(answered_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

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

-- Política para service role (backend) acessar todas as respostas
DROP POLICY IF EXISTS "Service role can access all answers" ON user_answers;
CREATE POLICY "Service role can access all answers" ON user_answers
    FOR ALL USING (auth.role() = 'service_role');

-- Verificar se a tabela foi criada
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_answers' 
ORDER BY ordinal_position; 