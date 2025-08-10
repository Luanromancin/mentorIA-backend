#!/usr/bin/env node

/**
 * Script para testar o teste de nivelamento automaticamente
 * 
 * Uso:
 * node test-leveling.js
 */

const { execSync } = require('child_process');

console.log('🧪 Iniciando teste automatizado do teste de nivelamento...\n');

try {
  // Executar o teste de integração
  console.log('📋 Executando teste de integração...');
  execSync('npm run test:leveling', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
  console.log('\n✅ Teste concluído com sucesso!');
  console.log('🎯 A lógica do teste de nivelamento está funcionando corretamente.');
  
} catch (error) {
  console.error('\n❌ Erro no teste:', error.message);
  console.log('\n🔧 Verifique:');
  console.log('   - Se o backend está rodando');
  console.log('   - Se o usuário nivelamento2@teste.com existe');
  console.log('   - Se as tabelas do Supabase estão configuradas corretamente');
  process.exit(1);
}
