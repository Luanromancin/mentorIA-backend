-- Script para verificar a estrutura atual da tabela competencies
-- Execute este script primeiro para ver quais colunas existem

-- Verificar a estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'competencies'
ORDER BY ordinal_position;

-- Ver alguns dados atuais da tabela
SELECT * FROM public.competencies LIMIT 5;

-- Verificar se existe alguma constraint de chave única
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public' 
AND tc.table_name = 'competencies'; 