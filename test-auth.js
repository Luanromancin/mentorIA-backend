const http = require('http');

// Teste de cadastro
function testRegister() {
  const postData = JSON.stringify({
    email: 'teste@exemplo.com',
    password: 'senha123',
    name: 'Usuário Teste',
    birthDate: '1990-01-01',
    institution: 'Instituição Teste'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\n=== TESTE DE CADASTRO ===`);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Body: ${data}`);
      
      // Se o cadastro foi bem-sucedido, testar login
      if (res.statusCode === 201) {
        testLogin();
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Erro no cadastro: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

// Teste de login
function testLogin() {
  const postData = JSON.stringify({
    email: 'teste@exemplo.com',
    password: 'senha123'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\n=== TESTE DE LOGIN ===`);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Body: ${data}`);
      
      // Se o login foi bem-sucedido, extrair token e testar endpoint protegido
      if (res.statusCode === 200) {
        try {
          const response = JSON.parse(data);
          if (response.token) {
            testProtectedEndpoint(response.token);
          }
        } catch (e) {
          console.error('Erro ao parsear resposta:', e.message);
        }
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Erro no login: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

// Teste de endpoint protegido
function testProtectedEndpoint(token) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/me',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\n=== TESTE DE ENDPOINT PROTEGIDO ===`);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Body: ${data}`);
      console.log(`\n=== TESTES CONCLUÍDOS ===`);
    });
  });

  req.on('error', (e) => {
    console.error(`Erro no endpoint protegido: ${e.message}`);
  });

  req.end();
}

// Iniciar testes
console.log('Iniciando testes da API de autenticação...');
testRegister(); 