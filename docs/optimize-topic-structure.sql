-- Script para otimizar estrutura de tópicos e subtópicos
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela otimizada para tópicos e subtópicos
CREATE TABLE IF NOT EXISTS topic_structure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_name TEXT NOT NULL,
  subtopic_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(topic_name, subtopic_name)
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_topic_structure_topic ON topic_structure(topic_name);
CREATE INDEX IF NOT EXISTS idx_topic_structure_subtopic ON topic_structure(subtopic_name);
CREATE INDEX IF NOT EXISTS idx_topic_structure_topic_subtopic ON topic_structure(topic_name, subtopic_name);

-- 3. Popular com dados existentes da tabela questions
INSERT INTO topic_structure (topic_name, subtopic_name)
SELECT DISTINCT topic_name, subtopic_name
FROM questions
WHERE topic_name IS NOT NULL 
  AND subtopic_name IS NOT NULL
  AND topic_name != ''
  AND subtopic_name != ''
ON CONFLICT (topic_name, subtopic_name) DO NOTHING;

-- 4. Função otimizada para buscar tópicos e subtópicos
CREATE OR REPLACE FUNCTION get_available_topics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_object_agg(topic_name, subtopics) INTO result
  FROM (
    SELECT 
      topic_name,
      json_agg(subtopic_name ORDER BY subtopic_name) as subtopics
    FROM topic_structure
    GROUP BY topic_name
    ORDER BY topic_name
  ) as grouped_topics;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Função para buscar questões por tópico (otimizada)
CREATE OR REPLACE FUNCTION get_questions_by_topic(p_topic_name TEXT)
RETURNS TABLE (
  question_id TEXT,
  title TEXT,
  topic_name TEXT,
  subtopic_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id as question_id,
    q.title,
    q.topic_name,
    q.subtopic_name
  FROM questions q
  WHERE q.topic_name = p_topic_name
  ORDER BY q.subtopic_name, q.title;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Verificar resultado
SELECT 
  topic_name,
  COUNT(*) as subtopics_count,
  array_agg(subtopic_name ORDER BY subtopic_name) as subtopics
FROM topic_structure
GROUP BY topic_name
ORDER BY topic_name;

-- 7. Comparar performance
-- Antes: SELECT DISTINCT topic_name, subtopic_name FROM questions;
-- Depois: SELECT * FROM topic_structure;
