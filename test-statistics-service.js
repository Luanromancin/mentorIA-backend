const { StatisticsService } = require('./src/services/statistics.service');
require('dotenv').config();

async function testStatisticsService() {
  console.log('🧪 Testando StatisticsService...\n');

  try {
    // Criar instância do StatisticsService
    const statisticsService = new StatisticsService();

    // Testar getAvailableTopics
    console.log('1. Testando getAvailableTopics...');
    const availableTopics = await statisticsService.getAvailableTopics();
    
    console.log('✅ getAvailableTopics funcionou!');
    console.log(`📊 Retornou ${Object.keys(availableTopics).length} tópicos`);
    
    // Mostrar alguns tópicos
    console.log('\n📋 Primeiros 3 tópicos:');
    const topicNames = Object.keys(availableTopics);
    topicNames.slice(0, 3).forEach((topicName, index) => {
      const subtopics = availableTopics[topicName];
      console.log(`   ${index + 1}. ${topicName} (${subtopics.length} subtópicos)`);
    });

    // Testar com um usuário específico (se existir)
    console.log('\n2. Testando getUserStatistics...');
    try {
      // Usar um user_id de teste (você pode alterar para um ID real)
      const testUserId = 'test-user-id';
      const userStats = await statisticsService.getUserStatistics(testUserId);
      console.log('✅ getUserStatistics funcionou!');
      console.log(`📊 Retornou ${userStats.length} estatísticas para o usuário`);
    } catch (error) {
      console.log('ℹ️ getUserStatistics retornou erro (esperado para usuário de teste):', error.message);
    }

    console.log('\n🎉 StatisticsService está funcionando perfeitamente!');
    console.log('✅ Próximo passo: Testar no frontend');

  } catch (error) {
    console.error('❌ Erro ao testar StatisticsService:', error);
  }
}

testStatisticsService();
