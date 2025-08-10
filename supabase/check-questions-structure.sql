-- Script para verificar a estrutura real da tabela questions
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura da tabela questions
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'questions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar questões do teste de nivelamento
SELECT 
  ltq.id as leveling_question_id,
  ltq.question_id,
  ltq.order_index,
  q.title,
  q.topic_name,
  q.subtopic_name,
  q.field,
  q.year
FROM public.leveling_test_questions ltq
JOIN public.questions q ON ltq.question_id = q.id
ORDER BY ltq.order_index;

-- 3. Verificar se há competências cadastradas
SELECT 
  id,
  name,
  description
FROM public.competencies
LIMIT 10;

-- 4. Verificar se há alguma relação entre questions e competencies
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'questions';
