const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = null;
let testUserId = null;

// Configuração do axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
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

// Testes de Registro
async function testRegistration() {
  const testUser = {
    name: 'Usuário Teste PR',
    email: `test-pr-${Date.now()}@example.com`,
    password: 'senha123456'
  };

  // Teste 1: Registro com dados válidos
  await testEndpoint('Registro com dados válidos', async () => {
    const response = await api.post('/auth/register', testUser);
    if (response.status !== 201) throw new Error('Status incorreto');
    if (!response.data.user || !response.data.token) throw new Error('Resposta incompleta');
    if (response.data.user.password) throw new Error('Senha não deve ser retornada');
    
    testUserId = response.data.user.id;
    authToken = response.data.token;
    
    console.log(`   Usuário criado: ${response.data.user.email} (ID: ${response.data.user.id})`);
  });

  // Teste 2: Tentativa de registro com email duplicado
  await testEndpoint('Registro com email duplicado', async () => {
    const response = await api.post('/auth/register', testUser);
    if (response.status !== 400) throw new Error('Status incorreto');
    if (!response.data.message) throw new Error('Mensagem de erro ausente');
  });

  // Teste 3: Registro com dados inválidos
  await testEndpoint('Registro com dados inválidos', async () => {
    const invalidUser = {
      name: '',
      email: 'email-invalido',
      password: '123'
    };
    
    const response = await api.post('/auth/register', invalidUser);
    if (response.status !== 400) throw new Error('Status incorreto');
    if (!response.data.message) throw new Error('Mensagem de erro ausente');
  });

  // Teste 4: Registro com campos obrigatórios faltando
  await testEndpoint('Registro com campos faltando', async () => {
    const incompleteUser = {
      email: 'teste@example.com'
      // name e password faltando
    };
    
    const response = await api.post('/auth/register', incompleteUser);
    if (response.status !== 400) throw new Error('Status incorreto');
    if (!response.data.message) throw new Error('Mensagem de erro ausente');
  });
}

// Testes de Login
async function testLogin() {
  const validCredentials = {
    email: `test-pr-${Date.now()}@example.com`,
    password: 'senha123456'
  };

  // Primeiro, criar um usuário para testar login
  try {
    const registerResponse = await api.post('/auth/register', {
      name: 'Usuário Login Teste',
      email: validCredentials.email,
      password: validCredentials.password
    });
    authToken = registerResponse.data.token;
    testUserId = registerResponse.data.user.id;
  } catch (error) {
    log.warning('Usuário já existe, continuando com login...');
  }

  // Teste 1: Login com credenciais válidas
  await testEndpoint('Login com credenciais válidas', async () => {
    const response = await api.post('/auth/login', validCredentials);
    if (response.status !== 200) throw new Error('Status incorreto');
    if (!response.data.user || !response.data.token) throw new Error('Resposta incompleta');
    if (response.data.user.password) throw new Error('Senha não deve ser retornada');
    
    authToken = response.data.token;
    console.log(`   Login realizado: ${response.data.user.email}`);
  });

  // Teste 2: Login com senha incorreta
  await testEndpoint('Login com senha incorreta', async () => {
    const wrongPassword = {
      email: validCredentials.email,
      password: 'senhaerrada'
    };
    
    const response = await api.post('/auth/login', wrongPassword);
    if (response.status !== 401) throw new Error('Status incorreto');
    if (!response.data.message) throw new Error('Mensagem de erro ausente');
  });

  // Teste 3: Login com email inexistente
  await testEndpoint('Login com email inexistente', async () => {
    const nonExistentEmail = {
      email: 'naoexiste@example.com',
      password: 'senha123456'
    };
    
    const response = await api.post('/auth/login', nonExistentEmail);
    if (response.status !== 401) throw new Error('Status incorreto');
    if (!response.data.message) throw new Error('Mensagem de erro ausente');
  });

  // Teste 4: Login com dados inválidos
  await testEndpoint('Login com dados inválidos', async () => {
    const invalidData = {
      email: 'email-invalido',
      password: ''
    };
    
    const response = await api.post('/auth/login', invalidData);
    if (response.status !== 400) throw new Error('Status incorreto');
    if (!response.data.message) throw new Error('Mensagem de erro ausente');
  });
}

// Testes de Perfil do Usuário
async function testUserProfile() {
  if (!authToken) {
    log.warning('Token não disponível, criando usuário para teste...');
    const testUser = {
      name: 'Usuário Perfil Teste',
      email: `profile-test-${Date.now()}@example.com`,
      password: 'senha123456'
    };
    
    const response = await api.post('/auth/register', testUser);
    authToken = response.data.token;
    testUserId = response.data.user.id;
  }

  // Teste 1: Obter perfil com token válido
  await testEndpoint('Obter perfil com token válido', async () => {
    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status !== 200) throw new Error('Status incorreto');
    if (!response.data.email) throw new Error('Dados do usuário ausentes');
    if (response.data.password) throw new Error('Senha não deve ser retornada');
    
    console.log(`   Perfil obtido: ${response.data.email}`);
  });

  // Teste 2: Obter perfil com token inválido
  await testEndpoint('Obter perfil com token inválido', async () => {
    const response = await api.get('/auth/me', {
      headers: { Authorization: 'Bearer token-invalido' }
    });
    
    if (response.status !== 401) throw new Error('Status incorreto');
    if (!response.data.message) throw new Error('Mensagem de erro ausente');
  });

  // Teste 3: Obter perfil sem token
  await testEndpoint('Obter perfil sem token', async () => {
    const response = await api.get('/auth/me');
    
    if (response.status !== 401) throw new Error('Status incorreto');
    if (!response.data.message) throw new Error('Mensagem de erro ausente');
  });

  // Teste 4: Obter perfil com token malformado
  await testEndpoint('Obter perfil com token malformado', async () => {
    const response = await api.get('/auth/me', {
      headers: { Authorization: 'Bearer' } // Token vazio
    });
    
    if (response.status !== 401) throw new Error('Status incorreto');
    if (!response.data.message) throw new Error('Mensagem de erro ausente');
  });
}

// Testes de Validação de Token
async function testTokenValidation() {
  if (!authToken) {
    log.warning('Token não disponível, pulando testes de validação...');
    return;
  }

  // Teste 1: Token válido
  await testEndpoint('Validação de token válido', async () => {
    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status !== 200) throw new Error('Status incorreto');
  });

  // Teste 2: Token expirado (simulado)
  await testEndpoint('Validação de token expirado', async () => {
    // Criar um token que sabemos que é inválido
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${expiredToken}` }
    });
    
    if (response.status !== 401) throw new Error('Status incorreto');
  });
}

// Testes de Performance e Stress
async function testPerformance() {
  log.info('Iniciando testes de performance...');

  // Teste 1: Múltiplos registros simultâneos
  await testEndpoint('Múltiplos registros simultâneos', async () => {
    const promises = [];
    const baseEmail = `perf-test-${Date.now()}`;
    
    for (let i = 0; i < 5; i++) {
      const user = {
        name: `Usuário Performance ${i}`,
        email: `${baseEmail}-${i}@example.com`,
        password: 'senha123456'
      };
      
      promises.push(api.post('/auth/register', user));
    }
    
    const start = Date.now();
    const results = await Promise.allSettled(promises);
    const duration = Date.now() - start;
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`   ${successful}/5 registros bem-sucedidos em ${duration}ms`);
    
    if (successful < 3) throw new Error('Muitos registros falharam');
  });

  // Teste 2: Múltiplos logins simultâneos
  await testEndpoint('Múltiplos logins simultâneos', async () => {
    const credentials = {
      email: `perf-test-${Date.now()}-0@example.com`,
      password: 'senha123456'
    };
    
    // Primeiro, criar um usuário
    await api.post('/auth/register', {
      name: 'Usuário Performance Login',
      ...credentials
    });
    
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(api.post('/auth/login', credentials));
    }
    
    const start = Date.now();
    const results = await Promise.allSettled(promises);
    const duration = Date.now() - start;
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`   ${successful}/10 logins bem-sucedidos em ${duration}ms`);
    
    if (successful < 8) throw new Error('Muitos logins falharam');
  });
}

// Testes de Segurança
async function testSecurity() {
  log.info('Iniciando testes de segurança...');

  // Teste 1: Tentativa de SQL Injection
  await testEndpoint('Proteção contra SQL Injection', async () => {
    const maliciousUser = {
      name: "'; DROP TABLE users; --",
      email: "'; DROP TABLE users; --",
      password: "'; DROP TABLE users; --"
    };
    
    const response = await api.post('/auth/register', maliciousUser);
    // Deve falhar, mas não deve causar erro 500
    if (response.status === 500) throw new Error('Vulnerabilidade detectada');
  });

  // Teste 2: Tentativa de XSS
  await testEndpoint('Proteção contra XSS', async () => {
    const xssUser = {
      name: '<script>alert("xss")</script>',
      email: 'xss@example.com',
      password: 'senha123456'
    };
    
    const response = await api.post('/auth/register', xssUser);
    if (response.status === 201) {
      // Verificar se o script foi escapado na resposta
      if (response.data.user.name.includes('<script>')) {
        throw new Error('XSS não foi escapado');
      }
    }
  });

  // Teste 3: Senha muito fraca
  await testEndpoint('Validação de senha fraca', async () => {
    const weakPasswordUser = {
      name: 'Usuário Senha Fraca',
      email: 'weak@example.com',
      password: '123'
    };
    
    const response = await api.post('/auth/register', weakPasswordUser);
    if (response.status !== 400) throw new Error('Senha fraca não foi rejeitada');
  });
}

// Função principal
async function runAllTests() {
  console.log('\n🚀 INICIANDO VALIDAÇÃO COMPLETA DE AUTENTICAÇÃO\n');
  console.log('=' .repeat(60));
  
  const results = {
    registration: 0,
    login: 0,
    profile: 0,
    tokenValidation: 0,
    performance: 0,
    security: 0
  };

  try {
    // Testes de Registro
    console.log('\n📝 TESTES DE REGISTRO');
    console.log('-'.repeat(30));
    const registrationTests = await testRegistration();
    results.registration = registrationTests ? 1 : 0;

    // Testes de Login
    console.log('\n🔐 TESTES DE LOGIN');
    console.log('-'.repeat(30));
    const loginTests = await testLogin();
    results.login = loginTests ? 1 : 0;

    // Testes de Perfil
    console.log('\n👤 TESTES DE PERFIL');
    console.log('-'.repeat(30));
    const profileTests = await testUserProfile();
    results.profile = profileTests ? 1 : 0;

    // Testes de Validação de Token
    console.log('\n🎫 TESTES DE VALIDAÇÃO DE TOKEN');
    console.log('-'.repeat(30));
    const tokenTests = await testTokenValidation();
    results.tokenValidation = tokenTests ? 1 : 0;

    // Testes de Performance
    console.log('\n⚡ TESTES DE PERFORMANCE');
    console.log('-'.repeat(30));
    const performanceTests = await testPerformance();
    results.performance = performanceTests ? 1 : 0;

    // Testes de Segurança
    console.log('\n🔒 TESTES DE SEGURANÇA');
    console.log('-'.repeat(30));
    const securityTests = await testSecurity();
    results.security = securityTests ? 1 : 0;

  } catch (error) {
    log.error(`Erro durante os testes: ${error.message}`);
  }

  // Resumo final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(60));
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).reduce((sum, val) => sum + val, 0);
  
  console.log(`✅ Testes passaram: ${passedTests}/${totalTests}`);
  console.log(`❌ Testes falharam: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    log.success('🎉 TODOS OS TESTES PASSARAM! Sistema pronto para PR!');
  } else {
    log.error('⚠️ ALGUNS TESTES FALHARAM! Revise antes do PR.');
  }
  
  console.log('\n📋 Detalhes por categoria:');
  Object.entries(results).forEach(([category, passed]) => {
    const status = passed ? '✅' : '❌';
    console.log(`   ${status} ${category}: ${passed ? 'PASSOU' : 'FALHOU'}`);
  });
  
  console.log('\n' + '='.repeat(60));
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests }; 