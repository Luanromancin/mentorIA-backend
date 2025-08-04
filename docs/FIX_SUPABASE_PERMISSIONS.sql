-- Script para corrigir permissões no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Desabilitar RLS nas tabelas principais (temporariamente para desenvolvimento)
ALTER TABLE public.competencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_competencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.alternatives DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Garantir que o service role tem acesso total
GRANT ALL ON public.competencies TO service_role;
GRANT ALL ON public.user_competencies TO service_role;
GRANT ALL ON public.questions TO service_role;
GRANT ALL ON public.alternatives TO service_role;
GRANT ALL ON public.profiles TO service_role;

-- 3. Garantir que o anon role também tem acesso (para desenvolvimento)
GRANT ALL ON public.competencies TO anon;
GRANT ALL ON public.user_competencies TO anon;
GRANT ALL ON public.questions TO anon;
GRANT ALL ON public.alternatives TO anon;
GRANT ALL ON public.profiles TO anon;

-- 4. Verificar se as tabelas existem e têm dados
SELECT COUNT(*) as total_competencies FROM public.competencies;
SELECT COUNT(*) as total_questions FROM public.questions;
SELECT COUNT(*) as total_alternatives FROM public.alternatives;

-- 5. Verificar estrutura das tabelas
\d public.competencies;
\d public.questions;
\d public.user_competencies; 