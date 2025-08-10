-- Criar tabela para sessões do teste de nivelamento
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

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_leveling_test_sessions_profile_id ON public.leveling_test_sessions (profile_id);
CREATE INDEX IF NOT EXISTS idx_leveling_test_sessions_is_completed ON public.leveling_test_sessions (is_completed);
CREATE INDEX IF NOT EXISTS idx_leveling_test_sessions_created_at ON public.leveling_test_sessions (created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.leveling_test_sessions ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias sessões
CREATE POLICY "Users can view their own leveling test sessions" ON public.leveling_test_sessions
  FOR SELECT USING (auth.uid() = profile_id);

-- Política para usuários criarem suas próprias sessões
CREATE POLICY "Users can create their own leveling test sessions" ON public.leveling_test_sessions
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Política para usuários atualizarem suas próprias sessões
CREATE POLICY "Users can update their own leveling test sessions" ON public.leveling_test_sessions
  FOR UPDATE USING (auth.uid() = profile_id);

-- Política para usuários deletarem suas próprias sessões
CREATE POLICY "Users can delete their own leveling test sessions" ON public.leveling_test_sessions
  FOR DELETE USING (auth.uid() = profile_id);
