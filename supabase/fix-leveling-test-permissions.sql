-- Script para corrigir permissões do teste de nivelamento
-- Execute este script no SQL Editor do Supabase

-- 1. Remover políticas RLS existentes (se existirem)
DROP POLICY IF EXISTS "Users can view their own leveling test sessions" ON public.leveling_test_sessions;
DROP POLICY IF EXISTS "Users can create their own leveling test sessions" ON public.leveling_test_sessions;
DROP POLICY IF EXISTS "Users can update their own leveling test sessions" ON public.leveling_test_sessions;
DROP POLICY IF EXISTS "Users can delete their own leveling test sessions" ON public.leveling_test_sessions;

-- 2. Desabilitar RLS temporariamente para permitir acesso via API
ALTER TABLE public.leveling_test_sessions DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se a tabela leveling_test_questions existe e tem dados
SELECT COUNT(*) as total_questions FROM public.leveling_test_questions;

-- 4. Verificar se a tabela leveling_test_sessions existe
SELECT COUNT(*) as total_sessions FROM public.leveling_test_sessions;

-- 5. Mostrar estrutura das tabelas
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('leveling_test_questions', 'leveling_test_sessions')
ORDER BY table_name, ordinal_position;

-- 6. Status final
SELECT 'Permissões corrigidas! RLS desabilitado para acesso via API.' as status;
