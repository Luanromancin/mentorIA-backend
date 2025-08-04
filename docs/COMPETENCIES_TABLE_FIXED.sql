-- Script para criar a tabela competencies (com verificação de existência)
-- Execute este script no SQL Editor do Supabase

-- Verificar se a tabela já existe
DO $$
BEGIN
    -- Criar tabela apenas se não existir
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'competencies') THEN
        CREATE TABLE public.competencies (
            id uuid NOT NULL DEFAULT gen_random_uuid(),
            code text NOT NULL UNIQUE, -- Código único (C1, C2, etc.)
            name text NOT NULL, -- Nome da competência (subtopic_name)
            description text NULL, -- Descrição detalhada
            subject_id uuid NULL, -- Para futuras expansões por matéria
            created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT competencies_pkey PRIMARY KEY (id)
        ) TABLESPACE pg_default;
        
        RAISE NOTICE 'Tabela competencies criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela competencies já existe. Pulando criação...';
    END IF;
END $$;

-- Criar índices (IF NOT EXISTS já está incluído)
CREATE INDEX IF NOT EXISTS idx_competencies_code ON public.competencies USING btree (code);
CREATE INDEX IF NOT EXISTS idx_competencies_name ON public.competencies USING btree (name);

-- Inserir competências apenas se a tabela estiver vazia
INSERT INTO public.competencies (code, name, description)
SELECT * FROM (VALUES
    ('C1', 'Álgebra Linear', 'Operações com matrizes, sistemas lineares, espaços vetoriais'),
    ('C2', 'Cálculo Diferencial', 'Derivadas, limites, continuidade'),
    ('C3', 'Cálculo Integral', 'Integrais definidas e indefinidas, aplicações'),
    ('C4', 'Geometria Analítica', 'Coordenadas, distâncias, equações de retas e planos'),
    ('C5', 'Probabilidade', 'Eventos, distribuições, estatística básica'),
    ('C6', 'Lógica Matemática', 'Proposições, conectivos, demonstrações'),
    ('C7', 'Trigonometria', 'Funções trigonométricas, identidades, equações'),
    ('C8', 'Análise Combinatória', 'Permutações, combinações, princípio fundamental'),
    ('C9', 'Funções', 'Domínio, imagem, composição, inversão'),
    ('C10', 'Sequências e Séries', 'Progressões aritméticas e geométricas, convergência')
) AS v(code, name, description)
WHERE NOT EXISTS (SELECT 1 FROM public.competencies WHERE competencies.code = v.code);

-- Comentários para documentação
COMMENT ON TABLE public.competencies IS 'Tabela de competências matemáticas disponíveis no sistema';
COMMENT ON COLUMN public.competencies.code IS 'Código único da competência (ex: C1, C2)';
COMMENT ON COLUMN public.competencies.name IS 'Nome da competência (corresponde ao subtopic_name)';
COMMENT ON COLUMN public.competencies.description IS 'Descrição detalhada da competência';

-- Verificar resultado
SELECT COUNT(*) as total_competencies FROM public.competencies; 