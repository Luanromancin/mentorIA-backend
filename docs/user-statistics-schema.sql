-- Habilitar a extensão uuid-ossp se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Função para atualizar a coluna 'updated_at' automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Script para criar a tabela user_statistics e funcionalidades relacionadas
-- Execute este script no SQL Editor do Supabase

-- Criar tabela user_statistics
CREATE TABLE IF NOT EXISTS user_statistics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subtopic_name TEXT NOT NULL,
  topic_name TEXT NOT NULL,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que cada usuário só tem um registro por subtópico
  UNIQUE(user_id, subtopic_name)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_subtopic ON user_statistics(subtopic_name);
CREATE INDEX IF NOT EXISTS idx_user_statistics_topic ON user_statistics(topic_name);
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_subtopic ON user_statistics(user_id, subtopic_name);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_user_statistics_updated_at 
  BEFORE UPDATE ON user_statistics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para inserir ou atualizar estatísticas do usuário
CREATE OR REPLACE FUNCTION upsert_user_statistics(
  p_user_id UUID,
  p_subtopic_name TEXT,
  p_topic_name TEXT,
  p_is_correct BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_statistics (user_id, subtopic_name, topic_name, questions_answered, correct_answers)
  VALUES (
    p_user_id,
    p_subtopic_name,
    p_topic_name,
    1,
    CASE WHEN p_is_correct THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, subtopic_name)
  DO UPDATE SET
    questions_answered = user_statistics.questions_answered + 1,
    correct_answers = user_statistics.correct_answers + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas completas do usuário
CREATE OR REPLACE FUNCTION get_user_statistics(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH stats AS (
    SELECT 
      us.subtopic_name,
      us.topic_name,
      us.questions_answered,
      us.correct_answers,
      -- Previne divisão por zero
      CASE WHEN us.questions_answered > 0 
           THEN ROUND((us.correct_answers::DECIMAL / us.questions_answered * 100), 2)
           ELSE 0
      END as accuracy_percentage
    FROM user_statistics us
    WHERE us.user_id = p_user_id
  ),
  general_stats AS (
    SELECT 
      SUM(questions_answered) as total_questions,
      SUM(correct_answers) as total_correct,
      -- Previne divisão por zero
      CASE WHEN SUM(questions_answered) > 0
           THEN ROUND((SUM(correct_answers)::DECIMAL / SUM(questions_answered) * 100), 2)
           ELSE 0
      END as overall_accuracy
    FROM stats
  ),
  topic_stats AS (
    SELECT 
      topic_name,
      SUM(questions_answered) as questions_answered,
      SUM(correct_answers) as correct_answers,
      -- Previne divisão por zero
      CASE WHEN SUM(questions_answered) > 0
           THEN ROUND((SUM(correct_answers)::DECIMAL / SUM(questions_answered) * 100), 2)
           ELSE 0
      END as accuracy_percentage
    FROM stats
    GROUP BY topic_name
  ),
  competency_stats AS (
    SELECT 
      subtopic_name,
      questions_answered,
      correct_answers,
      accuracy_percentage
    FROM stats
  )
  SELECT json_build_object(
    'general', (
      SELECT json_build_object(
        'total_questions', total_questions,
        'total_correct', total_correct,
        'overall_accuracy', overall_accuracy
      ) FROM general_stats
    ),
    'by_topic', (
      SELECT json_agg(
        json_build_object(
          'topic_name', topic_name,
          'questions_answered', questions_answered,
          'correct_answers', correct_answers,
          'accuracy_percentage', accuracy_percentage
        )
      ) FROM topic_stats
    ),
    'by_competency', (
      SELECT json_agg(
        json_build_object(
          'subtopic_name', subtopic_name,
          'questions_answered', questions_answered,
          'correct_answers', correct_answers,
          'accuracy_percentage', accuracy_percentage
        )
      ) FROM competency_stats
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar RLS na tabela user_statistics
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança RLS - Permitir acesso total para funções SECURITY DEFINER
CREATE POLICY "Permitir acesso para funções SECURITY DEFINER" ON user_statistics
  FOR ALL USING (true);

-- Comentários para documentação
COMMENT ON TABLE user_statistics IS 'Estatísticas de desempenho dos usuários por competência';
COMMENT ON FUNCTION update_updated_at_column IS 'Função para atualizar a coluna "updated_at" automaticamente';
COMMENT ON FUNCTION upsert_user_statistics IS 'Função para inserir ou atualizar estatísticas do usuário';
COMMENT ON FUNCTION get_user_statistics IS 'Função para obter estatísticas completas do usuário';
