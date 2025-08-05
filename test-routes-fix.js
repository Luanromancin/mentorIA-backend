const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Função para testar autenticação
async function testAuth() {
  try {
    console.log('🔐 Testando autenticação...');
    
    // 1. Registrar usuário
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'teste-rotas-2@teste.com',
      password: '123456',
      name: 'Usuário Teste Rotas 2',
      institution: 'Teste'
    });
    
    console.log('✅ Registro bem-sucedido:', registerResponse.data);
    
    // 2. Fazer login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'teste-rotas-2@teste.com',
      password: '123456'
    });
    
    console.log('✅ Login bem-sucedido:', loginResponse.data);
    
    return loginResponse.data.token;
  } catch (error) {
    console.error('❌ Erro na autenticação:', error.response?.data || error.message);
    throw error;
  }
}

// Função para testar pré-carregamento
async function testPreload(token) {
  try {
    console.log('🚀 Testando pré-carregamento...');
    
    const response = await axios.post(`${BASE_URL}/questions/preload`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Pré-carregamento bem-sucedido:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erro no pré-carregamento:', error.response?.data || error.message);
    throw error;
  }
}

// Função para testar sessão de questões
async function testSession(token) {
  try {
    console.log('📚 Testando sessão de questões...');
    
    const response = await axios.get(`${BASE_URL}/questions/session?maxQuestions=5`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Sessão bem-sucedida:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erro na sessão:', error.response?.data || error.message);
    throw error;
  }
}

// Função para testar competências do usuário
async function testUserCompetencies(token) {
  try {
    console.log('🎯 Testando competências do usuário...');
    
    const response = await axios.get(`${BASE_URL}/questions/competencies/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Competências bem-sucedidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erro nas competências:', error.response?.data || error.message);
    throw error;
  }
}

// Função principal de teste
async function runTests() {
  try {
    console.log('🧪 Iniciando testes de rotas...\n');
    
    // 1. Testar autenticação
    const token = await testAuth();
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Testar pré-carregamento
    await testPreload(token);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Testar competências do usuário
    await testUserCompetencies(token);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 4. Testar sessão de questões
    const sessionData = await testSession(token);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 5. Testar finalização de sessão (se houver questões)
    if (sessionData.data && sessionData.data.questions && sessionData.data.questions.length > 0) {
      console.log('🏁 Testando finalização de sessão...');
      
      const mockAnswers = sessionData.data.questions.slice(0, 2).map((question, index) => ({
        questionId: question.id,
        answer: question.alternatives[0]?.id || '1',
        isCorrect: index === 0, // Primeira correta, segunda incorreta
        competencyName: question.topicName || 'Matemática'
      }));
      
      const completeResponse = await axios.post(`${BASE_URL}/questions/session/complete`, {
        answers: mockAnswers
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Finalização de sessão bem-sucedida:', completeResponse.data);
    }
    
    console.log('\n🎉 Todos os testes passaram com sucesso!');
    
  } catch (error) {
    console.error('\n💥 Teste falhou:', error.message);
    process.exit(1);
  }
}

// Executar testes se o arquivo for chamado diretamente
if (require.main === module) {
  runTests();
}

module.exports = {
  testAuth,
  testPreload,
  testSession,
  testUserCompetencies,
  runTests
}; 