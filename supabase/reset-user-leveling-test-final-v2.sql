-- Script para resetar o teste de nivelamento do usuário (versão 2)
-- Execute este script no SQL Editor do Supabase

-- 1. Resetar flag has_completed_leveling_test
UPDATE public.profiles 
SET has_completed_leveling_test = false
WHERE email = 'nivelamento2@teste.com';

-- 2. Deletar todas as sessões do usuário
DELETE FROM public.leveling_test_sessions 
WHERE profile_id = (
  SELECT id FROM public.profiles WHERE email = 'nivelamento2@teste.com'
);

-- 3. Deletar todas as competências do usuário (só as que têm nível > 0)
DELETE FROM public.user_competencies 
WHERE profile_id = (
  SELECT id FROM public.profiles WHERE email = 'nivelamento2@teste.com'
);

-- 4. Verificar se foi resetado corretamente
SELECT 
  p.email,
  p.has_completed_leveling_test,
  COUNT(lt.id) as active_sessions,
  COUNT(uc.profile_id) as user_competencies
FROM public.profiles p
LEFT JOIN public.leveling_test_sessions lt ON p.id = lt.profile_id
LEFT JOIN public.user_competencies uc ON p.id = uc.profile_id
WHERE p.email = 'nivelamento2@teste.com'
GROUP BY p.id, p.email, p.has_completed_leveling_test;
