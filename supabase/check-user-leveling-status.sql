-- Script para verificar e corrigir status do teste de nivelamento
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar status atual do usuário nivelamento2@teste.com
SELECT 
  id,
  email,
  name,
  has_completed_leveling_test,
  created_at
FROM public.profiles 
WHERE email = 'nivelamento2@teste.com';

-- 2. Verificar se há sessões de teste de nivelamento para este usuário
SELECT 
  id,
  profile_id,
  current_question_index,
  is_completed,
  started_at,
  completed_at,
  created_at
FROM public.leveling_test_sessions 
WHERE profile_id = (
  SELECT id FROM public.profiles WHERE email = 'nivelamento2@teste.com'
);

-- 3. Verificar competências do usuário
SELECT 
  uc.profile_id,
  uc.competency_id,
  uc.level,
  uc.last_evaluated_at,
  c.name as competency_name
FROM public.user_competencies uc
JOIN public.competencies c ON uc.competency_id = c.id
WHERE uc.profile_id = (
  SELECT id FROM public.profiles WHERE email = 'nivelamento2@teste.com'
);

-- 4. Corrigir status se necessário (descomente se precisar resetar)
-- UPDATE public.profiles 
-- SET has_completed_leveling_test = false
-- WHERE email = 'nivelamento2@teste.com';

-- 5. Remover sessões antigas se necessário (descomente se precisar limpar)
-- DELETE FROM public.leveling_test_sessions 
-- WHERE profile_id = (
--   SELECT id FROM public.profiles WHERE email = 'nivelamento2@teste.com'
-- );

-- 6. Remover competências antigas se necessário (descomente se precisar limpar)
-- DELETE FROM public.user_competencies 
-- WHERE profile_id = (
--   SELECT id FROM public.profiles WHERE email = 'nivelamento2@teste.com'
-- );

-- 7. Status final
SELECT 'Verificação concluída. Descomente as linhas 4-6 se precisar resetar o usuário.' as status;
