-- Criação da tabela competencies
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_competencies_code ON public.competencies USING btree (code);
CREATE INDEX IF NOT EXISTS idx_competencies_name ON public.competencies USING btree (name);

-- Inserir competências baseadas nos subtopic_name existentes
-- Este script deve ser executado após analisar os subtopic_name únicos na tabela questions
INSERT INTO public.competencies (code, name, description) VALUES
('C1', 'Álgebra Linear', 'Operações com matrizes, sistemas lineares, espaços vetoriais'),
('C2', 'Cálculo Diferencial', 'Derivadas, limites, continuidade'),
('C3', 'Cálculo Integral', 'Integrais definidas e indefinidas, aplicações'),
('C4', 'Geometria Analítica', 'Coordenadas, distâncias, equações de retas e planos'),
('C5', 'Probabilidade', 'Eventos, distribuições, estatística básica'),
('C6', 'Lógica Matemática', 'Proposições, conectivos, demonstrações'),
('C7', 'Trigonometria', 'Funções trigonométricas, identidades, equações'),
('C8', 'Análise Combinatória', 'Permutações, combinações, princípio fundamental'),
('C9', 'Funções', 'Domínio, imagem, composição, inversão'),
('C10', 'Sequências e Séries', 'Progressões aritméticas e geométricas, convergência');

-- Atualizar a tabela questions para referenciar competencies
-- ALTER TABLE public.questions ADD COLUMN competency_id uuid REFERENCES public.competencies(id);

-- Comentários para documentação
COMMENT ON TABLE public.competencies IS 'Tabela de competências matemáticas disponíveis no sistema';
COMMENT ON COLUMN public.competencies.code IS 'Código único da competência (ex: C1, C2)';
COMMENT ON COLUMN public.competencies.name IS 'Nome da competência (corresponde ao subtopic_name)';
COMMENT ON COLUMN public.competencies.level IS 'Nível de domínio: 0=iniciante, 1=intermediário, 2=avançado, 3=domínio'; 