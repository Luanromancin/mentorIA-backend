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

// Função para testar salvamento de resposta com dados mais simples
async function testSaveAnswer() {
    try {
        console.log('\n💾 Testando salvamento de resposta...');

        // Dados mais simples para teste
        const mockAnswer = {
            questionId: 'test-question-123',
            isCorrect: true,
            timeSpentSeconds: 45
        };

        console.log('📤 Enviando dados:', mockAnswer);

        const response = await axios.post(`${BASE_URL}/api/statistics/answer`, mockAnswer, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📥 Resposta recebida:', response.data);

        if (response.data.success) {
            console.log('✅ Resposta salva com sucesso');
            return true;
        } else {
            console.log('❌ Falha ao salvar resposta:', response.data.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro ao salvar resposta:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
        return false;
    }
}

async function runTest() {
    console.log('🧪 Iniciando teste simples...');

    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log('❌ Falha no login, abortando teste');
        return;
    }

    await testSaveAnswer();
}

runTest(); 