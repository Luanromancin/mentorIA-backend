const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testUserCompetencies() {
  console.log('🔍 Testando endpoint de competências do usuário...');
  
  try {
    const response = await fetch('http://localhost:3000/api/questions/competencies/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Status:', response.status);
    console.log('Headers:', JSON.stringify(response.headers.raw(), null, 2));
    
    const data = await response.json();
    console.log('Response:');
    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testUserCompetencies(); 