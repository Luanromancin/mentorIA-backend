-- Script para mapear questões do teste de nivelamento para competências
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar questões do teste de nivelamento com suas competências correspondentes
SELECT 
  ltq.order_index,
  ltq.question_id,
  q.title,
  q.topic_name,
  q.subtopic_name,
  c.id as competency_id,
  c.name as competency_name
FROM public.leveling_test_questions ltq
JOIN public.questions q ON ltq.question_id = q.id
LEFT JOIN public.competencies c ON c.name = q.subtopic_name
ORDER BY ltq.order_index;

-- 2. Verificar se todas as questões têm competências correspondentes
SELECT 
  COUNT(*) as total_questions,
  COUNT(c.id) as questions_with_competency,
  COUNT(*) - COUNT(c.id) as questions_without_competency
FROM public.leveling_test_questions ltq
JOIN public.questions q ON ltq.question_id = q.id
LEFT JOIN public.competencies c ON c.name = q.subtopic_name;

-- 3. Listar questões que NÃO têm competência correspondente
SELECT 
  ltq.order_index,
  ltq.question_id,
  q.title,
  q.subtopic_name
FROM public.leveling_test_questions ltq
JOIN public.questions q ON ltq.question_id = q.id
LEFT JOIN public.competencies c ON c.name = q.subtopic_name
WHERE c.id IS NULL
ORDER BY ltq.order_index;

-- 4. Verificar se há subtopics duplicados no teste
SELECT 
  q.subtopic_name,
  COUNT(*) as question_count,
  STRING_AGG(ltq.order_index::text, ', ' ORDER BY ltq.order_index) as question_positions
FROM public.leveling_test_questions ltq
JOIN public.questions q ON ltq.question_id = q.id
GROUP BY q.subtopic_name
HAVING COUNT(*) > 1
ORDER BY question_count DESC;
