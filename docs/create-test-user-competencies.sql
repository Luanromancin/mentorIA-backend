-- Inserir dados de teste na tabela user_competencies
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos verificar se o usuário de teste existe
DO $$
DECLARE
    test_user_id UUID;
    competency_ids UUID[];
BEGIN
    -- Buscar o ID do usuário de teste
    SELECT id INTO test_user_id 
    FROM profiles 
    WHERE email = 'estatisticas@teste.com' 
    LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário de teste não encontrado. Execute primeiro o script de criação de dados de teste.';
    END IF;
    
    -- Buscar IDs das competências que queremos testar
    SELECT array_agg(id) INTO competency_ids
    FROM competencies 
    WHERE name IN (
        'Funções do 1º grau',
        'Sistemas de Equações',
        'Média Aritmética',
        'Mediana',
        'Moda',
        'Áreas',
        'Triângulos',
        'Cálculo de porcentagem',
        'Variação Percentual'
    );
    
    -- Inserir níveis de domínio para o usuário de teste
    INSERT INTO user_competencies (profile_id, competency_id, level, last_evaluated_at)
    VALUES
        -- Álgebra
        (test_user_id, competency_ids[1], 3, NOW()), -- Funções do 1º grau: Nível 3
        (test_user_id, competency_ids[2], 2, NOW()), -- Sistemas de Equações: Nível 2
        
        -- Estatística
        (test_user_id, competency_ids[3], 3, NOW()), -- Média Aritmética: Nível 3
        (test_user_id, competency_ids[4], 2, NOW()), -- Mediana: Nível 2
        (test_user_id, competency_ids[5], 2, NOW()), -- Moda: Nível 2
        
        -- Geometria
        (test_user_id, competency_ids[6], 3, NOW()), -- Áreas: Nível 3
        (test_user_id, competency_ids[7], 2, NOW()), -- Triângulos: Nível 2
        
        -- Porcentagem
        (test_user_id, competency_ids[8], 3, NOW()), -- Cálculo de porcentagem: Nível 3
        (test_user_id, competency_ids[9], 2, NOW())  -- Variação Percentual: Nível 2
    ON CONFLICT (profile_id, competency_id) 
    DO UPDATE SET 
        level = EXCLUDED.level,
        last_evaluated_at = EXCLUDED.last_evaluated_at;
    
    RAISE NOTICE 'Dados de teste inseridos para o usuário: %', test_user_id;
END $$;
