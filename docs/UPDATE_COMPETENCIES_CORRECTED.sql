-- Script corrigido para atualizar a tabela competencies com os subtopic_name reais
-- Baseado na estrutura atual da tabela (id, name, description)

-- 1. Limpar a tabela competencies atual
TRUNCATE TABLE public.competencies RESTART IDENTITY CASCADE;

-- 2. Inserir as competências baseadas nos subtopic_name únicos da tabela questions
INSERT INTO public.competencies (name, description)
SELECT 
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
    id,
    name,
    description,
    created_at
FROM public.competencies 
ORDER BY name;

-- 4. Contar total de competências criadas
SELECT COUNT(*) as total_competencies FROM public.competencies; 