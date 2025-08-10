-- Script seguro para configurar o teste de nivelamento
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela para sessões do teste de nivelamento
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

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_leveling_test_sessions_profile_id ON public.leveling_test_sessions (profile_id);
CREATE INDEX IF NOT EXISTS idx_leveling_test_sessions_is_completed ON public.leveling_test_sessions (is_completed);
CREATE INDEX IF NOT EXISTS idx_leveling_test_sessions_created_at ON public.leveling_test_sessions (created_at);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE public.leveling_test_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de segurança (apenas se não existirem)
DO $$
BEGIN
  -- Política para SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'leveling_test_sessions' 
    AND policyname = 'Users can view their own leveling test sessions'
  ) THEN
    CREATE POLICY "Users can view their own leveling test sessions" ON public.leveling_test_sessions
      FOR SELECT USING (auth.uid() = profile_id);
  END IF;

  -- Política para INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'leveling_test_sessions' 
    AND policyname = 'Users can create their own leveling test sessions'
  ) THEN
    CREATE POLICY "Users can create their own leveling test sessions" ON public.leveling_test_sessions
      FOR INSERT WITH CHECK (auth.uid() = profile_id);
  END IF;

  -- Política para UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'leveling_test_sessions' 
    AND policyname = 'Users can update their own leveling test sessions'
  ) THEN
    CREATE POLICY "Users can update their own leveling test sessions" ON public.leveling_test_sessions
      FOR UPDATE USING (auth.uid() = profile_id);
  END IF;

  -- Política para DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'leveling_test_sessions' 
    AND policyname = 'Users can delete their own leveling test sessions'
  ) THEN
    CREATE POLICY "Users can delete their own leveling test sessions" ON public.leveling_test_sessions
      FOR DELETE USING (auth.uid() = profile_id);
  END IF;
END $$;

-- 5. Inserir questões de teste (apenas se a tabela estiver vazia)
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

-- 6. Verificar configuração
SELECT 'Configuração do teste de nivelamento concluída!' as status;

-- 7. Mostrar questões configuradas
SELECT 
  ltq.id,
  ltq.question_id,
  ltq.order_index,
  q.title,
  q.topic_name,
  q.subtopic_name
FROM public.leveling_test_questions ltq
JOIN public.questions q ON ltq.question_id = q.id
ORDER BY ltq.order_index;
