const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = null;

// Configuração do axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Função para log colorido
const log = {
  success: (msg) => console.log('\x1b[32m✅\x1b[0m', msg),
  error: (msg) => console.log('\x1b[31m❌\x1b[0m', msg),
  info: (msg) => console.log('\x1b[34mℹ️\x1b[0m', msg)
};

// Função para testar endpoint
async function testEndpoint(name, testFn) {
  try {
    log.info(`Testando: ${name}`);
    await testFn();
    log.success(`${name} - PASSOU`);
    return true;
  } catch (error) {
    log.error(`${name} - FALHOU`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Resposta:`, error.response.data);
    } else {
      console.log(`   Erro:`, error.message);
    }
    return false;
  }
}

// Teste básico de registro
async function testBasicRegistration() {
  const testUser = {
    name: 'Usuário Teste Básico',
    email: `basic-test-${Date.now()}@example.com`,
    password: 'senha123456'
  };

  return await testEndpoint('Registro básico', async () => {
    const response = await api.post('/auth/register', testUser);
    if (response.status !== 201) throw new Error('Status incorreto');
    if (!response.data.user || !response.data.token) throw new Error('Resposta incompleta');
    if (response.data.user.password) throw new Error('Senha não deve ser retornada');
    
    authToken = response.data.token;
    console.log(`   Usuário criado: ${response.data.user.email}`);
  });
}

// Teste básico de login
async function testBasicLogin() {
  const credentials = {
    email: `basic-test-${Date.now()}@example.com`,
    password: 'senha123456'
  };

  // Primeiro, criar um usuário
  try {
    await api.post('/auth/register', {
      name: 'Usuário Login Básico',
      ...credentials
    });
  } catch (error) {
    // Usuário já pode existir
  }

  return await testEndpoint('Login básico', async () => {
    const response = await api.post('/auth/login', credentials);
    if (response.status !== 200) throw new Error('Status incorreto');
    if (!response.data.user || !response.data.token) throw new Error('Resposta incompleta');
    
    authToken = response.data.token;
    console.log(`   Login realizado: ${response.data.user.email}`);
  });
}

// Teste básico de perfil
async function testBasicProfile() {
  if (!authToken) {
    log.info('Criando usuário para teste de perfil...');
    const testUser = {
      name: 'Usuário Perfil Básico',
      email: `profile-basic-${Date.now()}@example.com`,
      password: 'senha123456'
    };
    
    const response = await api.post('/auth/register', testUser);
    authToken = response.data.token;
  }

  return await testEndpoint('Perfil básico', async () => {
    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status !== 200) throw new Error('Status incorreto');
    if (!response.data.email) throw new Error('Dados do usuário ausentes');
    if (response.data.password) throw new Error('Senha não deve ser retornada');
    
    console.log(`   Perfil obtido: ${response.data.email}`);
  });
}

// Teste de erro básico
async function testBasicErrors() {
  return await testEndpoint('Tratamento de erros básico', async () => {
    // Teste de login com credenciais inválidas
    const response = await api.post('/auth/login', {
      email: 'naoexiste@example.com',
      password: 'senhaerrada'
    });
    
    if (response.status !== 401) throw new Error('Status incorreto para credenciais inválidas');
    if (!response.data.message) throw new Error('Mensagem de erro ausente');
    
    console.log(`   Erro tratado corretamente: ${response.data.message}`);
  });
}

// Função principal
async function runBasicTests() {
  console.log('\n🚀 TESTE BÁSICO DE AUTENTICAÇÃO\n');
  console.log('=' .repeat(50));
  
  const results = [];
  
  try {
    results.push(await testBasicRegistration());
    results.push(await testBasicLogin());
    results.push(await testBasicProfile());
    results.push(await testBasicErrors());
  } catch (error) {
    log.error(`Erro durante os testes: ${error.message}`);
  }

  // Resumo final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMO DO TESTE BÁSICO');
  console.log('='.repeat(50));
  
  const passedTests = results.filter(r => r).length;
  const totalTests = results.length;
  
  console.log(`✅ Testes passaram: ${passedTests}/${totalTests}`);
  console.log(`❌ Testes falharam: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    log.success('🎉 TESTE BÁSICO PASSOU! Funcionalidades principais OK!');
    console.log('\n💡 Para teste completo, execute: npm run test:auth-complete');
  } else {
    log.error('⚠️ TESTE BÁSICO FALHOU! Revise as funcionalidades principais.');
  }
  
  console.log('\n' + '='.repeat(50));
}

// Executar se chamado diretamente
if (require.main === module) {
  runBasicTests().catch(console.error);
}

module.exports = { runBasicTests }; 