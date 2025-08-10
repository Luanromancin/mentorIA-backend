-- Script específico para corrigir permissões da tabela leveling_test_sessions
-- Execute este script no SQL Editor do Supabase

-- 1. Garantir que o role 'anon' tem todas as permissões necessárias
GRANT ALL PRIVILEGES ON public.leveling_test_sessions TO anon;
GRANT ALL PRIVILEGES ON public.leveling_test_questions TO anon;

-- 2. Garantir que o role 'authenticated' tem todas as permissões necessárias
GRANT ALL PRIVILEGES ON public.leveling_test_sessions TO authenticated;
GRANT ALL PRIVILEGES ON public.leveling_test_questions TO authenticated;

-- 3. Garantir que o role 'service_role' tem todas as permissões necessárias
GRANT ALL PRIVILEGES ON public.leveling_test_sessions TO service_role;
GRANT ALL PRIVILEGES ON public.leveling_test_questions TO service_role;

-- 4. Verificar se a tabela existe e tem a estrutura correta
SELECT 
  table_name,
  table_type,
  table_schema
FROM information_schema.tables 
WHERE table_name = 'leveling_test_sessions';

-- 5. Verificar permissões atuais
SELECT 
  grantee,
  table_schema,
  table_name,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'leveling_test_sessions'
ORDER BY grantee, privilege_type;

-- 6. Verificar se RLS está desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'leveling_test_sessions';

-- 7. Contar registros na tabela
SELECT COUNT(*) as total_sessions FROM public.leveling_test_sessions;

-- 8. Buscar o profile_id específico do nivelamento2@teste.com
SELECT id as nivelamento2_profile_id, email, name FROM public.profiles WHERE email = 'nivelamento2@teste.com';

-- 9. Testar inserção de um registro de teste (será removido depois)
-- Usando especificamente o profile_id do nivelamento2@teste.com
DO $$
DECLARE
    nivelamento2_profile_id UUID;
BEGIN
    -- Buscar o profile_id do nivelamento2@teste.com
    SELECT id INTO nivelamento2_profile_id FROM public.profiles WHERE email = 'nivelamento2@teste.com';
    
    IF nivelamento2_profile_id IS NOT NULL THEN
        -- Inserir registro de teste
        INSERT INTO public.leveling_test_sessions (
          id, 
          profile_id, 
          current_question_index, 
          answers, 
          is_completed, 
          started_at, 
          created_at, 
          updated_at
        ) VALUES (
          'test_session_' || EXTRACT(EPOCH FROM NOW()),
          nivelamento2_profile_id,
          0,
          '[]',
          false,
          NOW(),
          NOW(),
          NOW()
        );
        
        RAISE NOTICE 'Registro de teste inserido com sucesso usando profile_id do nivelamento2@teste.com: %', nivelamento2_profile_id;
    ELSE
        RAISE NOTICE 'Usuário nivelamento2@teste.com não encontrado na tabela profiles';
    END IF;
END $$;

-- 10. Verificar se a inserção funcionou
SELECT COUNT(*) as total_after_insert FROM public.leveling_test_sessions;

-- 11. Remover o registro de teste
DELETE FROM public.leveling_test_sessions 
WHERE id LIKE 'test_session_%';

-- 12. Status final
SELECT 'Permissões da tabela leveling_test_sessions corrigidas e testadas!' as status;
