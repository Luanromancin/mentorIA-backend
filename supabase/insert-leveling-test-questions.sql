-- Script para inserir questões de teste na tabela leveling_test_questions
-- Execute este script no SQL Editor do Supabase após criar a tabela leveling_test_sessions

-- Inserir questões de teste (usando questões existentes da tabela questions)
INSERT INTO public.leveling_test_questions (question_id, order_index) VALUES
('2019-168', 1),  -- Funções do 1º grau
('2019-163', 2),  -- Funções e seus gráficos
('2016-172', 3),  -- Geometria Plana
('2017-138', 4),  -- Estatística
('2018-145', 5),  -- Álgebra
('2019-155', 6),  -- Geometria Analítica
('2020-167', 7),  -- Trigonometria
('2018-178', 8),  -- Probabilidade
('2019-172', 9),  -- Análise Combinatória
('2020-158', 10); -- Logaritmos

-- Verificar se as inserções foram bem-sucedidas
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
