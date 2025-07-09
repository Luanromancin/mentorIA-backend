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
  info: (msg) => console.log('\x1b[34mℹ️\x1b[0m', msg),
  warning: (msg) => console.log('\x1b[33m⚠️\x1b[0m', msg)
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

// Teste de conectividade
async function testConnectivity() {
  return await testEndpoint('Conectividade do servidor', async () => {
    try {
      const response = await api.get('/test');
      console.log(`   Servidor respondendo: ${response.status}`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Servidor não está rodando na porta 3000');
      }
      // Se der erro 404, significa que o servidor está rodando mas a rota não existe
      if (error.response && error.response.status === 404) {
        console.log(`   Servidor rodando (rota /test não existe)`);
        return;
      }
      throw error;
    }
  });
}

// Teste básico de registro
async function testBasicRegistration() {
  const testUser = {
    name: 'Usuário Teste Local',
    email: `local-test-${Date.now()}@example.com`,
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
    email: `local-test-${Date.now()}@example.com`,
    password: 'senha123456'
  };

  // Primeiro, criar um usuário
  try {
    await api.post('/auth/register', {
      name: 'Usuário Login Local',
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
      name: 'Usuário Perfil Local',
      email: `profile-local-${Date.now()}@example.com`,
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
async function runLocalTests() {
  console.log('\n🚀 TESTE LOCAL DE AUTENTICAÇÃO\n');
  console.log('=' .repeat(50));
  
  const results = [];
  
  try {
    results.push(await testConnectivity());
    results.push(await testBasicRegistration());
    results.push(await testBasicLogin());
    results.push(await testBasicProfile());
    results.push(await testBasicErrors());
  } catch (error) {
    log.error(`Erro durante os testes: ${error.message}`);
  }

  // Resumo final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMO DO TESTE LOCAL');
  console.log('='.repeat(50));
  
  const passedTests = results.filter(r => r).length;
  const totalTests = results.length;
  
  console.log(`✅ Testes passaram: ${passedTests}/${totalTests}`);
  console.log(`❌ Testes falharam: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    log.success('🎉 TESTE LOCAL PASSOU! Funcionalidades principais OK!');
    console.log('\n💡 Para teste completo com Supabase, execute: npm run test:auth-complete');
  } else {
    log.error('⚠️ TESTE LOCAL FALHOU! Revise as funcionalidades principais.');
    
    if (passedTests === 0) {
      console.log('\n🔧 Possíveis soluções:');
      console.log('   1. Verifique se o servidor está rodando: npm start');
      console.log('   2. Verifique se a porta 3000 está livre');
      console.log('   3. Verifique os logs do servidor');
    }
  }
  
  console.log('\n' + '='.repeat(50));
}

// Executar se chamado diretamente
if (require.main === module) {
  runLocalTests().catch(console.error);
}

module.exports = { runLocalTests }; 