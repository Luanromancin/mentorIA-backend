-- Script para descobrir todos os subtopic_name únicos da tabela questions
-- Execute este script primeiro para ver quais competências existem

-- Listar todos os subtopic_name únicos ordenados alfabeticamente
SELECT DISTINCT subtopic_name 
FROM questions 
WHERE subtopic_name IS NOT NULL 
ORDER BY subtopic_name;

-- Contar quantos subtopic_name únicos existem
SELECT COUNT(DISTINCT subtopic_name) as total_subtopics
FROM questions 
WHERE subtopic_name IS NOT NULL;

-- Ver alguns exemplos de questões para cada subtopic_name
SELECT subtopic_name, COUNT(*) as total_questions
FROM questions 
WHERE subtopic_name IS NOT NULL 
GROUP BY subtopic_name 
ORDER BY total_questions DESC; 