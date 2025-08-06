const { UserAnswerRepository } = require('./src/repositories/user-answer.repository');
require('dotenv').config();

async function testRepository() {
    try {
        console.log('🧪 Testando UserAnswerRepository diretamente...');

        const repository = new UserAnswerRepository();

        // Testar inserção
        console.log('💾 Testando inserção...');
        const testData = {
            profileId: '00000000-0000-0000-0000-000000000000',
            questionId: '00000000-0000-0000-0000-000000000001',
            selectedAlternativeId: '00000000-0000-0000-0000-000000000002',
            isCorrect: true,
            timeSpentSeconds: 30
        };

        console.log('📤 Dados para inserção:', testData);

        const result = await repository.create(testData);
        console.log('✅ Inserção realizada com sucesso:', result);

        // Testar busca
        console.log('🔍 Testando busca...');
        const answers = await repository.findByProfileId('00000000-0000-0000-0000-000000000000');
        console.log('✅ Busca realizada, encontrados:', answers.length, 'registros');

        // Limpar teste
        console.log('🧹 Limpando dados de teste...');
        // Nota: Não temos método de delete, mas isso é apenas um teste

        console.log('🎉 Teste do repository concluído com sucesso!');

    } catch (error) {
        console.error('❌ Erro no teste do repository:', error);
        console.error('❌ Stack trace:', error.stack);
    }
}

testRepository(); 