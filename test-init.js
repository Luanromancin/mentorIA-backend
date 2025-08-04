import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testando inicialização do Supabase...');

// Verificar variáveis de ambiente
console.log('📋 Verificando variáveis de ambiente:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Definida' : '❌ Não definida');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Definida' : '❌ Não definida');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente obrigatórias não encontradas');
  process.exit(1);
}

try {
  console.log('🚀 Criando cliente Supabase...');
  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  console.log('✅ Cliente Supabase criado com sucesso');
  
  console.log('🔍 Testando conexão com uma query simples...');
  
  // Testar uma query simples
  const { data, error } = await client
    .from('competencies')
    .select('id')
    .limit(1);
    
  if (error) {
    console.error('❌ Erro na query de teste:', error);
  } else {
    console.log('✅ Query de teste executada com sucesso');
    console.log('📊 Dados retornados:', data);
  }
  
} catch (error) {
  console.error('❌ Erro ao inicializar Supabase:', error);
  process.exit(1);
}

console.log('✅ Teste de inicialização concluído com sucesso'); 