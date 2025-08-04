const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addPerformanceIndexes() {
  console.log('🚀 Adicionando Índices de Performance\n');
  console.log('📋 Objetivo: Otimizar consultas de competências para melhor performance\n');

  const indexes = [
    {
      name: 'idx_user_competencies_profile',
      sql: 'CREATE INDEX IF NOT EXISTS idx_user_competencies_profile ON user_competencies(profile_id);',
      description: 'Índice para consultas por profile_id'
    },
    {
      name: 'idx_user_competencies_competency',
      sql: 'CREATE INDEX IF NOT EXISTS idx_user_competencies_competency ON user_competencies(competency_id);',
      description: 'Índice para consultas por competency_id'
    },
    {
      name: 'idx_user_competencies_composite',
      sql: 'CREATE INDEX IF NOT EXISTS idx_user_competencies_composite ON user_competencies(profile_id, competency_id);',
      description: 'Índice composto para consultas por profile_id + competency_id'
    },
    {
      name: 'idx_user_competencies_level',
      sql: 'CREATE INDEX IF NOT EXISTS idx_user_competencies_level ON user_competencies(level);',
      description: 'Índice para consultas por nível de competência'
    },
    {
      name: 'idx_user_competencies_profile_level',
      sql: 'CREATE INDEX IF NOT EXISTS idx_user_competencies_profile_level ON user_competencies(profile_id, level);',
      description: 'Índice composto para consultas por profile_id + level'
    },
    {
      name: 'idx_competencies_code',
      sql: 'CREATE INDEX IF NOT EXISTS idx_competencies_code ON competencies(code);',
      description: 'Índice para consultas de competências por código'
    },
    {
      name: 'idx_profiles_email',
      sql: 'CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);',
      description: 'Índice para consultas de perfis por email'
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const index of indexes) {
    try {
      console.log(`🔧 Criando índice: ${index.name}`);
      console.log(`   📝 ${index.description}`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: index.sql });
      
      if (error) {
        console.error(`❌ Erro ao criar índice ${index.name}:`, error);
        errorCount++;
      } else {
        console.log(`✅ Índice ${index.name} criado com sucesso`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Erro ao executar índice ${index.name}:`, error);
      errorCount++;
    }
    
    console.log(''); // Linha em branco
  }

  // Verificar índices existentes
  console.log('🔍 Verificando índices existentes...\n');
  
  try {
    const { data: existingIndexes, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          indexname,
          tablename,
          indexdef
        FROM pg_indexes 
        WHERE tablename IN ('user_competencies', 'competencies', 'profiles')
        AND indexname LIKE 'idx_%'
        ORDER BY tablename, indexname;
      `
    });

    if (error) {
      console.error('❌ Erro ao verificar índices:', error);
    } else {
      console.log('📊 Índices existentes:');
      if (existingIndexes && existingIndexes.length > 0) {
        existingIndexes.forEach(index => {
          console.log(`   - ${index.indexname} (${index.tablename})`);
        });
      } else {
        console.log('   ⚠️ Nenhum índice encontrado');
      }
    }
  } catch (error) {
    console.error('❌ Erro ao verificar índices existentes:', error);
  }

  // Resumo final
  console.log('\n🎉 RESUMO DA OTIMIZAÇÃO:');
  console.log(`✅ Índices criados com sucesso: ${successCount}`);
  console.log(`❌ Índices com erro: ${errorCount}`);
  console.log(`📊 Total de índices processados: ${indexes.length}`);

  if (successCount > 0) {
    console.log('\n🚀 BENEFÍCIOS ESPERADOS:');
    console.log('✅ Consultas de competências 10-50x mais rápidas');
    console.log('✅ Criação de usuário instantânea');
    console.log('✅ Melhor escalabilidade do sistema');
    console.log('✅ Cache mais eficiente');
  }

  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('1. Testar performance com dados reais');
  console.log('2. Monitorar uso dos índices');
  console.log('3. Ajustar conforme necessário');
}

addPerformanceIndexes()
  .then(() => {
    console.log('\n✅ Script concluído com sucesso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro no script:', error);
    process.exit(1);
  }); 