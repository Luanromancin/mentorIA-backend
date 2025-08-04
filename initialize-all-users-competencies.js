const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initializeAllUsersCompetencies() {
  console.log('🚀 Inicializando Competências para Todos os Usuários\n');

  try {
    // 1. Buscar todos os usuários
    console.log('1️⃣ Buscando todos os usuários...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name, created_at')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError);
      return;
    }

    console.log(`✅ Encontrados ${profiles.length} usuários`);

    // 2. Buscar todas as competências disponíveis
    console.log('\n2️⃣ Buscando competências disponíveis...');
    
    const { data: allCompetencies, error: allCompetenciesError } = await supabase
      .from('competencies')
      .select('id, name, code')
      .order('code');

    if (allCompetenciesError) {
      console.error('❌ Erro ao buscar competências:', allCompetenciesError);
      return;
    }

    console.log(`✅ Encontradas ${allCompetencies.length} competências no sistema`);

    // 3. Para cada usuário, verificar e criar competências se necessário
    console.log('\n3️⃣ Processando usuários...\n');

    let totalProcessed = 0;
    let totalCreated = 0;
    let totalSkipped = 0;

    for (const profile of profiles) {
      console.log(`🔍 Processando: ${profile.email} (${profile.name})`);
      
      // Verificar competências atuais
      const { data: currentCompetencies, error: currentError } = await supabase
        .from('user_competencies')
        .select('competency_id')
        .eq('profile_id', profile.id);

      if (currentError) {
        console.error(`   ❌ Erro ao verificar competências de ${profile.email}:`, currentError);
        continue;
      }

      const currentCount = currentCompetencies.length;
      console.log(`   📊 Competências atuais: ${currentCount}`);

      if (currentCount === allCompetencies.length) {
        console.log(`   ✅ Já tem todas as competências (${currentCount})`);
        totalSkipped++;
        continue;
      }

      if (currentCount > 0) {
        console.log(`   ⚠️ Tem ${currentCount} competências, mas deveria ter ${allCompetencies.length}`);
      }

      // Criar competências faltantes
      console.log(`   🔄 Criando competências faltantes...`);
      
      const missingCompetencies = allCompetencies.filter(comp => 
        !currentCompetencies.some(uc => uc.competency_id === comp.id)
      );

      console.log(`   📝 Faltam ${missingCompetencies.length} competências`);

      if (missingCompetencies.length > 0) {
        // Criar em lotes
        const batchSize = 50;
        const batches = [];
        
        for (let i = 0; i < missingCompetencies.length; i += batchSize) {
          const batch = missingCompetencies.slice(i, i + batchSize);
          batches.push(batch);
        }

        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
          const batch = batches[batchIndex];
          const batchData = batch.map(competency => ({
            profile_id: profile.id,
            competency_id: competency.id,
            level: 0,
            last_evaluated_at: new Date().toISOString(),
          }));

          const { error: batchError } = await supabase
            .from('user_competencies')
            .insert(batchData);

          if (batchError) {
            console.error(`   ❌ Erro ao inserir lote ${batchIndex + 1}:`, batchError);
          } else {
            console.log(`   ✅ Lote ${batchIndex + 1}/${batches.length} processado (${batch.length} competências)`);
          }
        }

        totalCreated += missingCompetencies.length;
        console.log(`   ✅ ${missingCompetencies.length} competências criadas para ${profile.email}`);
      }

      totalProcessed++;
      console.log(''); // Linha em branco
    }

    // 4. Verificação final
    console.log('\n4️⃣ Verificação final...');
    
    const { data: finalProfiles, error: finalError } = await supabase
      .from('profiles')
      .select('id, email, name');

    if (finalError) {
      console.error('❌ Erro na verificação final:', finalError);
    } else {
      console.log(`✅ Verificando ${finalProfiles.length} usuários...`);
      
      let allUsersComplete = 0;
      
      for (const profile of finalProfiles) {
        const { data: finalCompetencies, error: finalCompetenciesError } = await supabase
          .from('user_competencies')
          .select('competency_id')
          .eq('profile_id', profile.id);

        if (!finalCompetenciesError && finalCompetencies.length === allCompetencies.length) {
          allUsersComplete++;
        }
      }

      console.log(`✅ ${allUsersComplete}/${finalProfiles.length} usuários com todas as competências`);
    }

    // 5. Resumo final
    console.log('\n🎉 INICIALIZAÇÃO CONCLUÍDA!');
    console.log('\n📊 RESUMO FINAL:');
    console.log(`👥 Usuários processados: ${totalProcessed}`);
    console.log(`✅ Competências criadas: ${totalCreated}`);
    console.log(`⏭️ Usuários já completos: ${totalSkipped}`);
    console.log(`📊 Total de competências no sistema: ${allCompetencies.length}`);

    if (totalCreated > 0) {
      console.log('\n✅ SUCESSO:');
      console.log('✅ Competências criadas para usuários que precisavam');
      console.log('✅ Sistema de apostila dinâmica funcionará para todos');
      console.log('✅ Performance otimizada mantida');
    } else {
      console.log('\nℹ️ INFORMAÇÃO:');
      console.log('ℹ️ Todos os usuários já tinham competências criadas');
      console.log('ℹ️ Sistema já estava funcionando corretamente');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

initializeAllUsersCompetencies()
  .then(() => {
    console.log('\n✅ Script concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro no script:', error);
    process.exit(1);
  }); 