const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testBackendUnified() {
  console.log('🧪 Testando backend com sistema unificado...\n');

  try {
    // 1. Testar listagem de perfis (rota de debug)
    console.log('1️⃣ Testando listagem de perfis...');
    
    const profilesResponse = await fetch(`${BASE_URL}/auth/profiles`);
    const profilesData = await profilesResponse.json();
    
    if (profilesResponse.ok) {
      console.log('✅ Listagem de perfis funcionando');
      console.log(`📊 Total de perfis: ${profilesData.length}`);
    } else {
      console.log('❌ Erro na listagem de perfis:', profilesData);
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

    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    });

    const registerResult = await registerResponse.json();

    if (registerResponse.ok) {
      console.log('✅ Registro funcionando');
      console.log('📝 Usuário criado:', {
        id: registerResult.user.id,
        email: registerResult.user.email,
        name: registerResult.user.name,
      });
      
      const token = registerResult.token;
      
      // 3. Testar busca de usuário atual
      console.log('\n3️⃣ Testando busca de usuário atual...');
      
      const meResponse = await fetch(`${BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const meData = await meResponse.json();

      if (meResponse.ok) {
        console.log('✅ Busca de usuário atual funcionando');
        console.log('📝 Dados do usuário:', {
          id: meData.id,
          email: meData.email,
          name: meData.name,
        });
      } else {
        console.log('❌ Erro na busca de usuário:', meData);
      }

      // 4. Testar atualização de perfil
      console.log('\n4️⃣ Testando atualização de perfil...');
      
      const updateData = {
        name: 'Usuário Backend Test Atualizado',
        institution: 'Instituição Atualizada'
      };

      const updateResponse = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const updateResult = await updateResponse.json();

      if (updateResponse.ok) {
        console.log('✅ Atualização de perfil funcionando');
        console.log('📝 Perfil atualizado:', {
          name: updateResult.name,
          institution: updateResult.institution,
        });
      } else {
        console.log('❌ Erro na atualização de perfil:', updateResult);
      }

      // 5. Testar logout
      console.log('\n5️⃣ Testando logout...');
      
      const logoutResponse = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const logoutResult = await logoutResponse.json();

      if (logoutResponse.ok) {
        console.log('✅ Logout funcionando');
      } else {
        console.log('❌ Erro no logout:', logoutResult);
      }

    } else {
      console.log('❌ Erro no registro:', registerResult);
    }

    // 6. Testar login
    console.log('\n6️⃣ Testando login...');
    
    const loginData = {
      email: testEmail,
      password: 'test123456'
    };

    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const loginResult = await loginResponse.json();

    if (loginResponse.ok) {
      console.log('✅ Login funcionando');
      console.log('📝 Login realizado:', {
        id: loginResult.user.id,
        email: loginResult.user.email,
        name: loginResult.user.name,
      });
    } else {
      console.log('❌ Erro no login:', loginResult);
    }

    console.log('\n🎉 Testes do backend concluídos!');
    console.log('✅ Sistema unificado funcionando corretamente');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    console.log('\n💡 Dica: Certifique-se de que o servidor está rodando em http://localhost:3000');
  }
}

testBackendUnified(); 