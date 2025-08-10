-- Script AGGRESSIVO para corrigir permissões do teste de nivelamento
-- Execute este script no SQL Editor do Supabase

-- 1. Remover TODAS as políticas RLS existentes (se existirem)
DROP POLICY IF EXISTS "Users can view their own leveling test sessions" ON public.leveling_test_sessions;
DROP POLICY IF EXISTS "Users can create their own leveling test sessions" ON public.leveling_test_sessions;
DROP POLICY IF EXISTS "Users can update their own leveling test sessions" ON public.leveling_test_sessions;
DROP POLICY IF EXISTS "Users can delete their own leveling test sessions" ON public.leveling_test_sessions;

-- 2. Desabilitar RLS COMPLETAMENTE para ambas as tabelas
ALTER TABLE public.leveling_test_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leveling_test_questions DISABLE ROW LEVEL SECURITY;

-- 3. Garantir que as tabelas existem com a estrutura correta
-- Se a tabela leveling_test_sessions não existir, criar
CREATE TABLE IF NOT EXISTS public.leveling_test_sessions (
  id TEXT NOT NULL PRIMARY KEY,
  profile_id UUID NOT NULL,
  current_question_index INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '[]',
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT leveling_test_sessions_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE
);

-- 4. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_leveling_test_sessions_profile_id ON public.leveling_test_sessions (profile_id);
CREATE INDEX IF NOT EXISTS idx_leveling_test_sessions_is_completed ON public.leveling_test_sessions (is_completed);
CREATE INDEX IF NOT EXISTS idx_leveling_test_sessions_created_at ON public.leveling_test_sessions (created_at);

-- 5. Garantir que a tabela leveling_test_questions existe
CREATE TABLE IF NOT EXISTS public.leveling_test_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  question_id TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT leveling_test_questions_pkey PRIMARY KEY (id),
  CONSTRAINT leveling_test_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
);

-- 6. Inserir questões se não existirem
INSERT INTO public.leveling_test_questions (question_id, order_index)
SELECT * FROM (VALUES
  ('2019-168', 1),  -- Funções do 1º grau
  ('2019-163', 2),  -- Funções e seus gráficos
  ('2016-172', 3),  -- Geometria Plana
  ('2017-138', 4),  -- Estatística
  ('2018-145', 5),  -- Álgebra
  ('2019-155', 6),  -- Geometria Analítica
  ('2020-167', 7),  -- Trigonometria
  ('2018-178', 8),  -- Probabilidade
  ('2019-172', 9),  -- Análise Combinatória
  ('2020-158', 10)  -- Logaritmos
) AS v(question_id, order_index)
WHERE NOT EXISTS (
  SELECT 1 FROM public.leveling_test_questions WHERE question_id = v.question_id
);

-- 7. Verificar status final
SELECT 'leveling_test_questions' as tabela, COUNT(*) as total FROM public.leveling_test_questions
UNION ALL
SELECT 'leveling_test_sessions' as tabela, COUNT(*) as total FROM public.leveling_test_sessions;

-- 8. Verificar RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('leveling_test_questions', 'leveling_test_sessions');

-- 9. Status final
SELECT 'PERMISSÕES CORRIGIDAS AGGRESSIVAMENTE! RLS DESABILITADO PARA AMBAS AS TABELAS.' as status;
