-- 🚀 Índices de Performance para Sistema de Competências
-- Execute este script no Supabase SQL Editor para otimizar a performance

-- Índices para tabela user_competencies
CREATE INDEX IF NOT EXISTS idx_user_competencies_profile ON user_competencies(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_competencies_competency ON user_competencies(competency_id);
CREATE INDEX IF NOT EXISTS idx_user_competencies_composite ON user_competencies(profile_id, competency_id);
CREATE INDEX IF NOT EXISTS idx_user_competencies_level ON user_competencies(level);
CREATE INDEX IF NOT EXISTS idx_user_competencies_profile_level ON user_competencies(profile_id, level);

-- Índices para tabela competencies
CREATE INDEX IF NOT EXISTS idx_competencies_code ON competencies(code);

-- Índices para tabela profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Verificar índices criados
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('user_competencies', 'competencies', 'profiles')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname; 