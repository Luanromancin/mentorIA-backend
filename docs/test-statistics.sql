-- Script de teste para verificar as funções de estatísticas
-- Execute este script no SQL Editor do Supabase para testar

-- 1. Testar inserção de estatísticas
SELECT upsert_user_statistics(
  '85b8a3d0-5d26-4be2-9d38-0382ed5e3f58'::UUID,
  'Função Quadrática',
  'Funções',
  true
);

-- 2. Testar inserção de mais estatísticas
SELECT upsert_user_statistics(
  '85b8a3d0-5d26-4be2-9d38-0382ed5e3f58'::UUID,
  'Função Quadrática',
  'Funções',
  false
);

SELECT upsert_user_statistics(
  '85b8a3d0-5d26-4be2-9d38-0382ed5e3f58'::UUID,
  'Equações do 1º grau',
  'Álgebra',
  true
);

-- 3. Testar obtenção de estatísticas
SELECT get_user_statistics('85b8a3d0-5d26-4be2-9d38-0382ed5e3f58'::UUID);

-- 4. Verificar dados na tabela
SELECT * FROM user_statistics WHERE user_id = '85b8a3d0-5d26-4be2-9d38-0382ed5e3f58'::UUID; 