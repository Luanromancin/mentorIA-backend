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

async function testAvailableTopics() {
  console.log('🧪 Testando API de tópicos disponíveis...\n');

  try {
    // 1. Verificar se a tabela questions tem dados
    console.log('1. Verificando dados na tabela questions...');
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('topic_name, subtopic_name')
      .not('topic_name', 'is', null)
      .not('subtopic_name', 'is', null)
      .limit(10);

    if (questionsError) {
      console.error('❌ Erro ao acessar tabela questions:', questionsError);
      return;
    }

    console.log(`✅ Encontradas ${questionsData.length} questões com topic_name e subtopic_name`);
    
    if (questionsData.length > 0) {
      console.log('📋 Exemplos de dados:');
      questionsData.slice(0, 5).forEach((q, index) => {
        console.log(`   ${index + 1}. Topic: "${q.topic_name}" | Subtopic: "${q.subtopic_name}"`);
      });
    }

    // 2. Testar a função que agrupa tópicos e subtópicos
    console.log('\n2. Testando agrupamento de tópicos e subtópicos...');
    
    // Buscar todos os tópicos e subtópicos únicos
    const { data: allQuestions, error: allError } = await supabase
      .from('questions')
      .select('topic_name, subtopic_name')
      .not('topic_name', 'is', null)
      .not('subtopic_name', 'is', null);

    if (allError) {
      console.error('❌ Erro ao buscar todas as questões:', allError);
      return;
    }

    // Agrupar subtópicos por tópico
    const topicsMap = {};
    allQuestions.forEach((row) => {
      const topicName = row.topic_name;
      const subtopicName = row.subtopic_name;
      
      if (!topicsMap[topicName]) {
        topicsMap[topicName] = new Set();
      }
      topicsMap[topicName].add(subtopicName);
    });

    // Converter Sets para arrays
    const result = {};
    Object.keys(topicsMap).forEach((topicName) => {
      result[topicName] = Array.from(topicsMap[topicName]).sort();
    });

    console.log(`✅ Encontrados ${Object.keys(result).length} tópicos únicos:`);
    Object.entries(result).forEach(([topic, subtopics]) => {
      console.log(`   📚 ${topic}: ${subtopics.length} subtópicos`);
      subtopics.slice(0, 3).forEach(subtopic => {
        console.log(`      - ${subtopic}`);
      });
      if (subtopics.length > 3) {
        console.log(`      ... e mais ${subtopics.length - 3} subtópicos`);
      }
    });

    // 3. Verificar se há dados na tabela user_statistics
    console.log('\n3. Verificando dados na tabela user_statistics...');
    const { data: statsData, error: statsError } = await supabase
      .from('user_statistics')
      .select('*')
      .limit(5);

    if (statsError) {
      console.error('❌ Erro ao acessar tabela user_statistics:', statsError);
    } else {
      console.log(`✅ Encontrados ${statsData.length} registros na tabela user_statistics`);
      if (statsData.length > 0) {
        console.log('📊 Exemplos de estatísticas:');
        statsData.forEach((stat, index) => {
          console.log(`   ${index + 1}. User: ${stat.user_id.substring(0, 8)}... | Subtopic: ${stat.subtopic_name} | Topic: ${stat.topic_name} | Q: ${stat.questions_answered} | C: ${stat.correct_answers}`);
        });
      }
    }

    console.log('\n✅ Teste concluído com sucesso!');
    console.log('📝 Próximos passos:');
    console.log('   1. Testar a API /api/statistics/available-topics no backend');
    console.log('   2. Verificar se o frontend consegue carregar os tópicos dinamicamente');
    console.log('   3. Confirmar que as estatísticas são exibidas corretamente');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testAvailableTopics();
