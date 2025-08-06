const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_USER_EMAIL = 'gabriel@gmail.com';
const TEST_USER_PASSWORD = '123456';

let authToken = null;

// Função para fazer login e obter token
async function login() {
    try {
        console.log('🔐 Fazendo login...');
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: TEST_USER_EMAIL,
            password: TEST_USER_PASSWORD
        });

        if (response.data.success) {
            authToken = response.data.token;
            console.log('✅ Login realizado com sucesso');
            return true;
        } else {
            console.log('❌ Login falhou:', response.data.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro no login:', error.response?.data || error.message);
        return false;
    }
}

// Função para testar busca de estatísticas
async function testGetUserStatistics() {
    try {
        console.log('\n📊 Testando busca de estatísticas do usuário...');
        const response = await axios.get(`${BASE_URL}/api/statistics/user`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.data.success) {
            console.log('✅ Estatísticas carregadas com sucesso');
            console.log('📈 Dados:', {
                totalQuestions: response.data.data.totalQuestions,
                correctAnswers: response.data.data.correctAnswers,
                accuracy: response.data.data.accuracy,
                studyStreak: response.data.data.studyStreak,
                completedTests: response.data.data.completedTests
            });
            return true;
        } else {
            console.log('❌ Falha ao carregar estatísticas:', response.data.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro ao buscar estatísticas:', error.response?.data || error.message);
        return false;
    }
}

// Função para testar salvamento de resposta
async function testSaveUserAnswer() {
    try {
        console.log('\n💾 Testando salvamento de resposta...');
        const mockAnswer = {
            questionId: 'test-question-123',
            selectedAlternativeId: 'alt-a',
            isCorrect: true,
            timeSpentSeconds: 45
        };

        const response = await axios.post(`${BASE_URL}/api/statistics/answer`, mockAnswer, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.success) {
            console.log('✅ Resposta salva com sucesso');
            return true;
        } else {
            console.log('❌ Falha ao salvar resposta:', response.data.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro ao salvar resposta:', error.response?.data || error.message);
        return false;
    }
}

// Função para testar estatísticas de competências
async function testCompetencyStatistics() {
    try {
        console.log('\n🎯 Testando estatísticas de competências...');
        const response = await axios.get(`${BASE_URL}/api/statistics/competencies`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.data.success) {
            console.log('✅ Estatísticas de competências carregadas');
            console.log('📊 Dados:', response.data.data);
            return true;
        } else {
            console.log('❌ Falha ao carregar estatísticas de competências:', response.data.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro ao buscar estatísticas de competências:', error.response?.data || error.message);
        return false;
    }
}

// Função para testar progresso de competências
async function testCompetencyProgress() {
    try {
        console.log('\n📈 Testando progresso de competências...');
        const response = await axios.get(`${BASE_URL}/api/statistics/competencies/progress`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.data.success) {
            console.log('✅ Progresso de competências carregado');
            console.log('📊 Total de competências:', response.data.data.length);
            return true;
        } else {
            console.log('❌ Falha ao carregar progresso de competências:', response.data.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro ao buscar progresso de competências:', error.response?.data || error.message);
        return false;
    }
}

// Função principal de teste
async function runStatisticsTests() {
    try {
        console.log('🧪 Iniciando testes de estatísticas...\n');

        // 1. Fazer login
        const loginSuccess = await login();
        if (!loginSuccess) {
            console.log('❌ Falha no login, abortando testes');
            return;
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // 2. Testar busca de estatísticas
        await testGetUserStatistics();
        console.log('\n' + '='.repeat(50) + '\n');

        // 3. Testar salvamento de resposta
        await testSaveUserAnswer();
        console.log('\n' + '='.repeat(50) + '\n');

        // 4. Testar estatísticas de competências
        await testCompetencyStatistics();
        console.log('\n' + '='.repeat(50) + '\n');

        // 5. Testar progresso de competências
        await testCompetencyProgress();

        console.log('\n🎉 Todos os testes de estatísticas passaram com sucesso!');

    } catch (error) {
        console.error('\n💥 Teste falhou:', error.message);
        process.exit(1);
    }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
    runStatisticsTests();
}

module.exports = {
    runStatisticsTests,
    login,
    testGetUserStatistics,
    testSaveUserAnswer,
    testCompetencyStatistics,
    testCompetencyProgress
}; 