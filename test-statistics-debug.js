const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugStatistics() {
  console.log('🔍 Debugando sistema de estatísticas...\n');

  try {
    // 1. Verificar se a tabela existe
    console.log('1. Verificando tabela user_statistics...');
    const { data: tableData, error: tableError } = await supabase
      .from('user_statistics')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao acessar tabela:', tableError);
      return;
    }
    console.log('✅ Tabela user_statistics acessível\n');

    // 2. Verificar dados existentes
    console.log('2. Verificando dados existentes...');
    const { data: existingData, error: dataError } = await supabase
      .from('user_statistics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (dataError) {
      console.error('❌ Erro ao buscar dados:', dataError);
      return;
    }

    console.log(`📊 Total de registros encontrados: ${existingData.length}`);
    
    if (existingData.length > 0) {
      console.log('📋 Últimos registros:');
      existingData.forEach((record, index) => {
        console.log(`   ${index + 1}. User: ${record.user_id.substring(0, 8)}... | Subtopic: ${record.subtopic_name} | Topic: ${record.topic_name} | Q: ${record.questions_answered} | C: ${record.correct_answers}`);
      });
    } else {
      console.log('⚠️ Nenhum registro encontrado na tabela user_statistics');
    }

    // 3. Testar função get_user_statistics
    console.log('\n3. Testando função get_user_statistics...');
    if (existingData.length > 0) {
      const testUserId = existingData[0].user_id;
      console.log(`   Testando com user_id: ${testUserId.substring(0, 8)}...`);
      
      const { data: statsData, error: statsError } = await supabase.rpc('get_user_statistics', {
        p_user_id: testUserId
      });

      if (statsError) {
        console.error('❌ Erro na função get_user_statistics:', statsError);
      } else {
        console.log('✅ Função get_user_statistics executada com sucesso');
        console.log('📊 Resultado:', JSON.stringify(statsData, null, 2));
      }
    } else {
      console.log('⚠️ Não há dados para testar a função get_user_statistics');
    }

    // 4. Verificar estrutura da tabela questions
    console.log('\n4. Verificando estrutura da tabela questions...');
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('topic_name, subtopic_name')
      .limit(5);

    if (questionsError) {
      console.error('❌ Erro ao acessar tabela questions:', questionsError);
    } else {
      console.log('✅ Tabela questions acessível');
      console.log('📋 Exemplos de topic_name e subtopic_name:');
      questionsData.forEach((q, index) => {
        console.log(`   ${index + 1}. Topic: "${q.topic_name}" | Subtopic: "${q.subtopic_name}"`);
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

debugStatistics();
