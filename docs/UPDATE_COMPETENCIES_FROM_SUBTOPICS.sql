-- Script para atualizar a tabela competencies com os subtopic_name reais
-- Execute este script DEPOIS de ver os resultados do GET_SUBTOPIC_NAMES.sql

-- 1. Limpar a tabela competencies atual
TRUNCATE TABLE public.competencies RESTART IDENTITY CASCADE;

-- 2. Inserir as competências baseadas nos subtopic_name únicos da tabela questions
INSERT INTO public.competencies (code, name, description)
SELECT 
    'C' || ROW_NUMBER() OVER (ORDER BY subtopic_name) as code,
    subtopic_name as name,
    'Competência em ' || subtopic_name as description
FROM (
    SELECT DISTINCT subtopic_name 
    FROM questions 
    WHERE subtopic_name IS NOT NULL 
    ORDER BY subtopic_name
) as unique_subtopics;

-- 3. Verificar o resultado
SELECT 
    code,
    name,
    description,
    created_at
FROM public.competencies 
ORDER BY code;

-- 4. Contar total de competências criadas
SELECT COUNT(*) as total_competencies FROM public.competencies; 