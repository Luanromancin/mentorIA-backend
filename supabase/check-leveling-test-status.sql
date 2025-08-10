-- Script para verificar status das tabelas do teste de nivelamento
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se as tabelas existem
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name IN ('leveling_test_questions', 'leveling_test_sessions')
ORDER BY table_name;

-- 2. Verificar se RLS está habilitado/desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('leveling_test_questions', 'leveling_test_sessions');

-- 3. Verificar políticas RLS existentes
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
WHERE tablename IN ('leveling_test_questions', 'leveling_test_sessions');

-- 4. Contar registros nas tabelas
SELECT 'leveling_test_questions' as tabela, COUNT(*) as total FROM public.leveling_test_questions
UNION ALL
SELECT 'leveling_test_sessions' as tabela, COUNT(*) as total FROM public.leveling_test_sessions;

-- 5. Mostrar algumas questões de exemplo
SELECT 
  ltq.id,
  ltq.question_id,
  ltq.order_index,
  q.title,
  q.topic_name,
  q.subtopic_name
FROM public.leveling_test_questions ltq
JOIN public.questions q ON ltq.question_id = q.id
ORDER BY ltq.order_index
LIMIT 5;
