-- Criar dados de teste para estatísticas
-- Execute este script no SQL Editor do Supabase

-- 1. Inserir estatísticas de teste para o usuário
INSERT INTO user_statistics (user_id, topic_name, subtopic_name, questions_answered, correct_answers, created_at, updated_at)
VALUES 
  -- Álgebra
  ('8691e88d-c6d8-4011-822d-fb5db400035d', 'Álgebra', 'Funções do 1º grau', 10, 8, NOW(), NOW()),
  ('8691e88d-c6d8-4011-822d-fb5db400035d', 'Álgebra', 'Sistemas de Equações', 8, 6, NOW(), NOW()),
  
  -- Estatística
  ('8691e88d-c6d8-4011-822d-fb5db400035d', 'Estatística', 'Média Aritmética', 12, 10, NOW(), NOW()),
  ('8691e88d-c6d8-4011-822d-fb5db400035d', 'Estatística', 'Mediana', 6, 4, NOW(), NOW()),
  ('8691e88d-c6d8-4011-822d-fb5db400035d', 'Estatística', 'Moda', 4, 3, NOW(), NOW()),
  
  -- Geometria
  ('8691e88d-c6d8-4011-822d-fb5db400035d', 'Geometria', 'Áreas', 15, 12, NOW(), NOW()),
  ('8691e88d-c6d8-4011-822d-fb5db400035d', 'Geometria', 'Triângulos', 9, 7, NOW(), NOW()),
  
  -- Porcentagem
  ('8691e88d-c6d8-4011-822d-fb5db400035d', 'Porcentagem', 'Cálculo de porcentagem', 20, 18, NOW(), NOW()),
  ('8691e88d-c6d8-4011-822d-fb5db400035d', 'Porcentagem', 'Variação Percentual', 7, 5, NOW(), NOW())
ON CONFLICT (user_id, topic_name, subtopic_name) 
DO UPDATE SET 
  questions_answered = EXCLUDED.questions_answered,
  correct_answers = EXCLUDED.correct_answers,
  updated_at = NOW();

-- 2. Verificar os dados inseridos
SELECT 
  topic_name,
  subtopic_name,
  questions_answered,
  correct_answers,
  ROUND((correct_answers::DECIMAL / questions_answered * 100), 2) as accuracy_percentage
FROM user_statistics 
WHERE user_id = '8691e88d-c6d8-4011-822d-fb5db400035d'
ORDER BY topic_name, subtopic_name;

-- 3. Testar a função getUserStatistics com dados
SELECT get_user_statistics('8691e88d-c6d8-4011-822d-fb5db400035d');
