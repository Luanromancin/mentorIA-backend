import { UserAnswerRepository } from './src/repositories/user-answer.repository';
import dotenv from 'dotenv';

dotenv.config();

async function testAfterFix() {
    try {
        console.log('🧪 Testando após correção das políticas RLS...');

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

        // Testar estatísticas
        console.log('📊 Testando estatísticas...');
        const stats = await repository.getUserStatistics('00000000-0000-0000-0000-000000000000');
        console.log('✅ Estatísticas carregadas:', stats);

        console.log('🎉 Teste concluído com sucesso!');

    } catch (error) {
        console.error('❌ Erro no teste:', error);
        console.error('❌ Stack trace:', error.stack);
    }
}

testAfterFix(); 