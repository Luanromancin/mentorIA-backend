-- Criar tabela para rastrear sequência de estudos dos usuários
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela user_study_streaks
CREATE TABLE IF NOT EXISTS public.user_study_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL,
  study_date DATE NOT NULL,
  questions_completed INTEGER NOT NULL DEFAULT 0,
  completed_daily_goal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT user_study_streaks_profile_date_unique UNIQUE (profile_id, study_date),
  CONSTRAINT user_study_streaks_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
  CONSTRAINT user_study_streaks_questions_check CHECK (questions_completed >= 0)
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_study_streaks_profile_id ON public.user_study_streaks (profile_id);
CREATE INDEX IF NOT EXISTS idx_user_study_streaks_date ON public.user_study_streaks (study_date);
CREATE INDEX IF NOT EXISTS idx_user_study_streaks_profile_date ON public.user_study_streaks (profile_id, study_date);

-- 3. Criar função para calcular sequência atual
CREATE OR REPLACE FUNCTION get_user_study_streak(user_profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
BEGIN
  -- Calcular sequência atual (dias consecutivos até hoje)
  WHILE EXISTS (
    SELECT 1 FROM user_study_streaks 
    WHERE profile_id = user_profile_id 
    AND study_date = check_date 
    AND completed_daily_goal = true
  ) LOOP
    current_streak := current_streak + 1;
    check_date := check_date - INTERVAL '1 day';
  END LOOP;
  
  RETURN current_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar função para registrar estudo diário
CREATE OR REPLACE FUNCTION register_daily_study(
  user_profile_id UUID,
  questions_count INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  completed_goal BOOLEAN := questions_count >= 20;
  result JSON;
BEGIN
  -- Inserir ou atualizar registro do dia
  INSERT INTO user_study_streaks (profile_id, study_date, questions_completed, completed_daily_goal)
  VALUES (user_profile_id, today_date, questions_count, completed_goal)
  ON CONFLICT (profile_id, study_date) 
  DO UPDATE SET 
    questions_completed = EXCLUDED.questions_completed,
    completed_daily_goal = EXCLUDED.completed_daily_goal,
    updated_at = CURRENT_TIMESTAMP;
  
  -- Calcular nova sequência
  SELECT json_build_object(
    'current_streak', get_user_study_streak(user_profile_id),
    'questions_completed', questions_count,
    'completed_daily_goal', completed_goal,
    'date', today_date
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Conceder permissões
GRANT SELECT, INSERT, UPDATE ON public.user_study_streaks TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_study_streak(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION register_daily_study(UUID, INTEGER) TO authenticated;

-- 6. Inserir dados de teste para o usuário de teste
INSERT INTO user_study_streaks (profile_id, study_date, questions_completed, completed_daily_goal)
VALUES 
  ('8691e88d-c6d8-4011-822d-fb5db400035d', CURRENT_DATE - INTERVAL '3 days', 20, true),
  ('8691e88d-c6d8-4011-822d-fb5db400035d', CURRENT_DATE - INTERVAL '2 days', 20, true),
  ('8691e88d-c6d8-4011-822d-fb5db400035d', CURRENT_DATE - INTERVAL '1 day', 20, true),
  ('8691e88d-c6d8-4011-822d-fb5db400035d', CURRENT_DATE, 15, false)
ON CONFLICT (profile_id, study_date) DO NOTHING;

-- 7. Testar a função
SELECT 
  'Teste da função get_user_study_streak:' as info,
  get_user_study_streak('8691e88d-c6d8-4011-822d-fb5db400035d') as current_streak;
