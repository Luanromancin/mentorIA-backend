-- Script para resetar o usuário nivelamento2@teste.com novamente
-- Execute este script no SQL Editor do Supabase

-- 1. Resetar status do usuário
UPDATE public.profiles 
SET has_completed_leveling_test = false
WHERE email = 'nivelamento2@teste.com';

-- 2. Remover todas as sessões de teste de nivelamento
DELETE FROM public.leveling_test_sessions 
WHERE profile_id = (
  SELECT id FROM public.profiles WHERE email = 'nivelamento2@teste.com'
);

-- 3. Remover todas as competências do usuário
DELETE FROM public.user_competencies 
WHERE profile_id = (
  SELECT id FROM public.profiles WHERE email = 'nivelamento2@teste.com'
);

-- 4. Verificar se o reset foi bem-sucedido
SELECT 
  'Usuário resetado novamente!' as status,
  p.has_completed_leveling_test,
  COUNT(lts.id) as total_sessions,
  COUNT(uc.profile_id) as total_competencies
FROM public.profiles p
LEFT JOIN public.leveling_test_sessions lts ON p.id = lts.profile_id
LEFT JOIN public.user_competencies uc ON p.id = uc.profile_id
WHERE p.email = 'nivelamento2@teste.com'
GROUP BY p.has_completed_leveling_test;
