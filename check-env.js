require('dotenv').config();

console.log('🔍 Verificando variáveis de ambiente...\n');

const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY'
];

const optionalVars = [
  'PORT',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'FRONTEND_URL',
  'LOG_LEVEL'
];

console.log('📋 Variáveis obrigatórias:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: NÃO CONFIGURADA`);
  }
});

console.log('\n📋 Variáveis opcionais:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`⚠️ ${varName}: não configurada (usando padrão)`);
  }
});

console.log('\n💡 Para configurar as variáveis obrigatórias:');
console.log('1. Copie o arquivo env.supabase.example para .env');
console.log('2. Preencha com suas credenciais do Supabase');
console.log('3. Reinicie o servidor'); 