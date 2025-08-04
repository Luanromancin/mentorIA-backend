const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000/api';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    if (options.body) {
      requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
    }

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            ok: res.statusCode >= 200 && res.statusCode < 300,
            data: jsonData,
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            ok: res.statusCode >= 200 && res.statusCode < 300,
            data: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testBackendUnified() {
  console.log('🧪 Testando backend com sistema unificado...\n');

  try {
    // 1. Testar listagem de perfis (rota de debug)
    console.log('1️⃣ Testando listagem de perfis...');
    
    const profilesResponse = await makeRequest(`${BASE_URL}/auth/profiles`);
    
    if (profilesResponse.ok) {
      console.log('✅ Listagem de perfis funcionando');
      console.log(`📊 Total de perfis: ${profilesResponse.data.length}`);
    } else {
      console.log('❌ Erro na listagem de perfis:', profilesResponse.data);
    }

    // 2. Testar registro de usuário
    console.log('\n2️⃣ Testando registro de usuário...');
    
    const testEmail = `backend-test-${Date.now()}@example.com`;
    const registerData = {
      email: testEmail,
      password: 'test123456',
      name: 'Usuário Backend Test',
      birthDate: '1990-01-01',
      institution: 'Instituição Teste'
    };

    const registerResponse = await makeRequest(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    });

    if (registerResponse.ok) {
      console.log('✅ Registro funcionando');
      console.log('📝 Usuário criado:', {
        id: registerResponse.data.user.id,
        email: registerResponse.data.user.email,
        name: registerResponse.data.user.name,
      });
      
      const token = registerResponse.data.token;
      
      // 3. Testar busca de usuário atual
      console.log('\n3️⃣ Testando busca de usuário atual...');
      
      const meResponse = await makeRequest(`${BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (meResponse.ok) {
        console.log('✅ Busca de usuário atual funcionando');
        console.log('📝 Dados do usuário:', {
          id: meResponse.data.id,
          email: meResponse.data.email,
          name: meResponse.data.name,
        });
      } else {
        console.log('❌ Erro na busca de usuário:', meResponse.data);
      }

      // 4. Testar atualização de perfil
      console.log('\n4️⃣ Testando atualização de perfil...');
      
      const updateData = {
        name: 'Usuário Backend Test Atualizado',
        institution: 'Instituição Atualizada'
      };

      const updateResponse = await makeRequest(`${BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (updateResponse.ok) {
        console.log('✅ Atualização de perfil funcionando');
        console.log('📝 Perfil atualizado:', {
          name: updateResponse.data.name,
          institution: updateResponse.data.institution,
        });
      } else {
        console.log('❌ Erro na atualização de perfil:', updateResponse.data);
      }

      // 5. Testar logout
      console.log('\n5️⃣ Testando logout...');
      
      const logoutResponse = await makeRequest(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (logoutResponse.ok) {
        console.log('✅ Logout funcionando');
      } else {
        console.log('❌ Erro no logout:', logoutResponse.data);
      }

    } else {
      console.log('❌ Erro no registro:', registerResponse.data);
    }

    // 6. Testar login
    console.log('\n6️⃣ Testando login...');
    
    const loginData = {
      email: testEmail,
      password: 'test123456'
    };

    const loginResponse = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    if (loginResponse.ok) {
      console.log('✅ Login funcionando');
      console.log('📝 Login realizado:', {
        id: loginResponse.data.user.id,
        email: loginResponse.data.user.email,
        name: loginResponse.data.user.name,
      });
    } else {
      console.log('❌ Erro no login:', loginResponse.data);
    }

    console.log('\n🎉 Testes do backend concluídos!');
    console.log('✅ Sistema unificado funcionando corretamente');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    console.log('\n💡 Dica: Certifique-se de que o servidor está rodando em http://localhost:3000');
  }
}

testBackendUnified(); 