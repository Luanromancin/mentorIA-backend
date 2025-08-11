-- Corrigir a função get_available_topics para ser mais robusta
-- Execute este script no SQL Editor do Supabase

-- 1. Remover a função antiga
DROP FUNCTION IF EXISTS get_available_topics();

-- 2. Criar nova função mais robusta
CREATE OR REPLACE FUNCTION get_available_topics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Usar jsonb_build_object para garantir que sempre retorne um objeto válido
  SELECT jsonb_build_object(
    'topics', 
    COALESCE(
      jsonb_object_agg(topic_name, subtopics), 
      '{}'::jsonb
    )
  ) INTO result
  FROM (
    SELECT 
      topic_name,
      jsonb_agg(subtopic_name ORDER BY subtopic_name) as subtopics
    FROM topic_structure
    GROUP BY topic_name
    ORDER BY topic_name
  ) as grouped_topics;
  
  -- Se não há dados, retornar objeto vazio
  IF result IS NULL THEN
    RETURN '{"topics": {}}'::json;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Testar a função
SELECT get_available_topics();

-- 4. Versão alternativa mais simples (se a anterior não funcionar)
CREATE OR REPLACE FUNCTION get_available_topics_simple()
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT jsonb_object_agg(topic_name, subtopics)
    FROM (
      SELECT 
        topic_name,
        jsonb_agg(subtopic_name ORDER BY subtopic_name) as subtopics
      FROM topic_structure
      GROUP BY topic_name
      ORDER BY topic_name
    ) as grouped_topics
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Testar a versão simples
SELECT get_available_topics_simple();
