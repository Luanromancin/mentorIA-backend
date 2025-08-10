-- Script para verificar se as questões do teste de nivelamento têm competency_id
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar questões do teste de nivelamento e suas competências
SELECT 
  ltq.id as leveling_question_id,
  ltq.question_id,
  ltq.order_index,
  q.title,
  q.competency_id,
  c.name as competency_name,
  q.topic_name,
  q.subtopic_name
FROM public.leveling_test_questions ltq
JOIN public.questions q ON ltq.question_id = q.id
LEFT JOIN public.competencies c ON q.competency_id = c.id
ORDER BY ltq.order_index;

-- 2. Contar questões com e sem competency_id
SELECT 
  COUNT(*) as total_questions,
  COUNT(CASE WHEN q.competency_id IS NOT NULL AND q.competency_id != '' THEN 1 END) as with_competency_id,
  COUNT(CASE WHEN q.competency_id IS NULL OR q.competency_id = '' THEN 1 END) as without_competency_id
FROM public.leveling_test_questions ltq
JOIN public.questions q ON ltq.question_id = q.id;

-- 3. Mostrar questões sem competency_id
SELECT 
  ltq.question_id,
  q.title,
  q.competency_id,
  q.topic_name,
  q.subtopic_name
FROM public.leveling_test_questions ltq
JOIN public.questions q ON ltq.question_id = q.id
WHERE q.competency_id IS NULL OR q.competency_id = ''
ORDER BY ltq.order_index;

-- 4. Verificar se há competências cadastradas
SELECT 
  id,
  name,
  description
FROM public.competencies
LIMIT 10;
