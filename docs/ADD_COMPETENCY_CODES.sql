-- Script para adicionar códigos únicos às competências
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar a coluna 'code' à tabela competencies
ALTER TABLE public.competencies
ADD COLUMN code text;

-- 2. Criar índice único para a coluna code (para performance e garantir unicidade)
CREATE UNIQUE INDEX IF NOT EXISTS idx_competencies_code ON public.competencies USING btree (code);

-- 3. Preencher a coluna 'code' com valores sequenciais (C1, C2, C3, ...)
WITH ordered_competencies AS (
    SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY name) as rn
    FROM public.competencies
)
UPDATE public.competencies c
SET code = 'C' || oc.rn::text
FROM ordered_competencies oc
WHERE c.id = oc.id;

-- 4. Tornar a coluna 'code' NOT NULL (após preenchimento)
ALTER TABLE public.competencies
ALTER COLUMN code SET NOT NULL;

-- 5. Adicionar comentário para documentação
COMMENT ON COLUMN public.competencies.code IS 'Código único da competência (ex: C1, C2, C3...)';

-- 6. Verificar o resultado
SELECT 
    id,
    code,
    name,
    description
FROM public.competencies
ORDER BY code
LIMIT 10;

-- 7. Contar total de competências com códigos
SELECT COUNT(*) as total_competencies_with_codes FROM public.competencies WHERE code IS NOT NULL; 