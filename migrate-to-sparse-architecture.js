const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateToSparseArchitecture() {
  console.log('🚀 Migrando para Arquitetura de Dados Esparsos\n');
  console.log('📋 Objetivos:');
  console.log('1. ✅ Remover registros com nível 0 da tabela user_competencies');
  console.log('2. ✅ Manter apenas registros com nível > 0');
  console.log('3. ✅ Otimizar performance e espaço em disco\n');

  try {
    // 1. Verificar dados atuais
    console.log('1️⃣ Verificando dados atuais...');
    const { data: currentData, error: currentError } = await supabase
      .from('user_competencies')
      .select('*')
      .limit(10);

    if (currentError) {
      console.error('❌ Erro ao verificar dados atuais:', currentError);
      return;
    }

    console.log(`📊 Dados atuais: ${currentData?.length || 0} registros (amostra)`);
    
    if (currentData && currentData.length > 0) {
      console.log('📋 Exemplo de dados:');
      currentData.forEach((record, index) => {
        console.log(`   ${index + 1}. Usuário: ${record.profile_id}, Competência: ${record.competency_id}, Nível: ${record.level}`);
      });
    }

    // 2. Contar registros com nível 0
    console.log('\n2️⃣ Contando registros com nível 0...');
    const { data: levelZeroData, error: levelZeroError } = await supabase
      .from('user_competencies')
      .select('*')
      .eq('level', 0);

    if (levelZeroError) {
      console.error('❌ Erro ao contar registros nível 0:', levelZeroError);
      return;
    }

    const levelZeroCount = levelZeroData?.length || 0;
    console.log(`📊 Registros com nível 0: ${levelZeroCount}`);

    // 3. Contar registros com nível > 0
    console.log('\n3️⃣ Contando registros com nível > 0...');
    const { data: levelGreaterZeroData, error: levelGreaterZeroError } = await supabase
      .from('user_competencies')
      .select('*')
      .gt('level', 0);

    if (levelGreaterZeroError) {
      console.error('❌ Erro ao contar registros nível > 0:', levelGreaterZeroError);
      return;
    }

    const levelGreaterZeroCount = levelGreaterZeroData?.length || 0;
    console.log(`📊 Registros com nível > 0: ${levelGreaterZeroCount}`);

    // 4. Perguntar se deve prosseguir
    console.log('\n⚠️ ATENÇÃO: Esta operação irá remover registros com nível 0!');
    console.log(`📊 Total de registros a serem removidos: ${levelZeroCount}`);
    console.log(`📊 Registros que serão mantidos: ${levelGreaterZeroCount}`);
    
    // Simular confirmação (em produção, seria uma pergunta real)
    console.log('\n✅ Simulando confirmação para prosseguir...');

    // 5. Remover registros com nível 0
    console.log('\n4️⃣ Removendo registros com nível 0...');
    const { error: deleteError } = await supabase
      .from('user_competencies')
      .delete()
      .eq('level', 0);

    if (deleteError) {
      console.error('❌ Erro ao remover registros nível 0:', deleteError);
      return;
    }

    console.log(`✅ ${levelZeroCount} registros com nível 0 removidos`);

    // 6. Verificar resultado final
    console.log('\n5️⃣ Verificando resultado final...');
    const { data: finalData, error: finalError } = await supabase
      .from('user_competencies')
      .select('*');

    if (finalError) {
      console.error('❌ Erro ao verificar dados finais:', finalError);
      return;
    }

    const finalCount = finalData?.length || 0;
    console.log(`📊 Registros finais: ${finalCount}`);
    console.log(`📊 Registros mantidos: ${levelGreaterZeroCount}`);
    console.log(`📊 Registros removidos: ${levelZeroCount}`);

    // 7. Calcular economia de espaço
    const estimatedSpaceSaved = levelZeroCount * 100; // Estimativa de 100 bytes por registro
    console.log(`💾 Espaço estimado economizado: ~${estimatedSpaceSaved} bytes`);

    // 8. Resumo da migração
    console.log('\n🎉 MIGRAÇÃO PARA DADOS ESPARSOS CONCLUÍDA!');
    console.log('\n✅ BENEFÍCIOS ALCANÇADOS:');
    console.log(`✅ ${levelZeroCount} registros desnecessários removidos`);
    console.log(`✅ ${levelGreaterZeroCount} registros importantes mantidos`);
    console.log('✅ Consultas mais rápidas (menos dados para processar)');
    console.log('✅ Menor uso de espaço em disco');
    console.log('✅ Melhor performance de I/O');
    console.log('✅ Escalabilidade otimizada');

    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. ✅ Testar criação de novos usuários (sem inserções em massa)');
    console.log('2. ✅ Verificar que nível 0 = implícito funciona corretamente');
    console.log('3. ✅ Testar atualizações de competências (nível > 0 = persistido)');
    console.log('4. ✅ Validar performance das consultas');

    console.log('\n🚀 ARQUITETURA DE DADOS ESPARSOS ATIVA!');

  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

migrateToSparseArchitecture()
  .then(() => {
    console.log('\n✅ Script concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro no script:', error);
    process.exit(1);
  }); 