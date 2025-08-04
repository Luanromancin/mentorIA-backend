const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPerformanceComplete() {
  console.log('🚀 Teste Completo de Performance do Sistema\n');
  console.log('📋 Objetivos:');
  console.log('1. ⏱️ Tempo para criar usuário');
  console.log('2. ⏱️ Tempo para decidir competências e buscar questões');
  console.log('3. ⏱️ Tempo para atualizar competências do usuário\n');

  const results = {
    userCreation: [],
    competencyDecision: [],
    competencyUpdate: []
  };

  try {
    // Executar 5 testes para ter uma média confiável
    for (let testRun = 1; testRun <= 5; testRun++) {
      console.log(`\n🔄 EXECUTANDO TESTE ${testRun}/5`);
      console.log('=' .repeat(50));

      // 1. TESTE: Tempo para criar usuário
      console.log('\n1️⃣ TESTE: Criação de Usuário');
      const userCreationStart = Date.now();
      
      const testEmail = `perf-test-${Date.now()}-${testRun}@example.com`;
      const testPassword = 'test123456';
      const testName = `Usuário Performance Test ${testRun}`;
      const testInstitution = 'Instituição Teste';

      // Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          name: testName,
          institution: testInstitution,
        },
      });

      if (authError) {
        console.error('❌ Erro ao criar usuário no Auth:', authError);
        continue;
      }

      // Criar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: testEmail,
          name: testName,
          institution: testInstitution,
        });

      if (profileError) {
        console.error('❌ Erro ao criar perfil:', profileError);
        continue;
      }

      const userCreationTime = Date.now() - userCreationStart;
      results.userCreation.push(userCreationTime);
      console.log(`✅ Usuário criado em ${userCreationTime}ms`);

      // 2. TESTE: Tempo para decidir competências e buscar questões
      console.log('\n2️⃣ TESTE: Decisão de Competências e Busca de Questões');
      const competencyDecisionStart = Date.now();

      // Simular o processo de decisão de competências (como o sistema faria)
      // 1. Buscar competências do usuário
      const { data: userCompetencies, error: competenciesError } = await supabase
        .from('user_competencies')
        .select(`
          level,
          competencies (
            id,
            name,
            code
          )
        `)
        .eq('profile_id', authData.user.id);

      if (competenciesError) {
        console.error('❌ Erro ao buscar competências:', competenciesError);
        continue;
      }

      // 2. Se não tem competências, criar automaticamente (simulando lazy loading)
      if (userCompetencies.length === 0) {
        console.log('   🔄 Criando competências automaticamente...');
        
        const { data: allCompetencies, error: allCompetenciesError } = await supabase
          .from('competencies')
          .select('id, name, code')
          .order('code');

        if (allCompetenciesError) {
          console.error('❌ Erro ao buscar competências do sistema:', allCompetenciesError);
          continue;
        }

        // Criar competências em lotes
        const batchSize = 50;
        const batches = [];
        
        for (let i = 0; i < allCompetencies.length; i += batchSize) {
          const batch = allCompetencies.slice(i, i + batchSize);
          batches.push(batch);
        }

        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
          const batch = batches[batchIndex];
          const batchData = batch.map(competency => ({
            profile_id: authData.user.id,
            competency_id: competency.id,
            level: 0,
            last_evaluated_at: new Date().toISOString(),
          }));

          const { error: batchError } = await supabase
            .from('user_competencies')
            .insert(batchData);

          if (batchError) {
            console.error(`   ❌ Erro ao inserir lote ${batchIndex + 1}:`, batchError);
          }
        }

        // Buscar competências novamente
        const { data: newUserCompetencies, error: newCompetenciesError } = await supabase
          .from('user_competencies')
          .select(`
            level,
            competencies (
              id,
              name,
              code
            )
          `)
          .eq('profile_id', authData.user.id);

        if (!newCompetenciesError) {
          userCompetencies.push(...newUserCompetencies);
        }
      }

      // 3. Simular decisão de competências (como o sistema de apostila dinâmica faria)
      console.log(`   📊 Analisando ${userCompetencies.length} competências...`);
      
      // Agrupar por nível
      const competenciesByLevel = userCompetencies.reduce((acc, comp) => {
        const level = comp.level || 0;
        if (!acc[level]) acc[level] = [];
        acc[level].push(comp);
        return acc;
      }, {});

      // Decidir quantas questões buscar por nível (simulando lógica do sistema)
      const questionsPerLevel = {
        0: 3, // Nível 0: 3 questões por competência
        1: 2, // Nível 1: 2 questões por competência
        2: 1, // Nível 2: 1 questão por competência
        3: 1  // Nível 3: 1 questão por competência
      };

      let totalQuestionsToFetch = 0;
      for (const [level, count] of Object.entries(competenciesByLevel)) {
        const questionsPerCompetency = questionsPerLevel[level] || 1;
        totalQuestionsToFetch += count.length * questionsPerCompetency;
      }

      console.log(`   🎯 Decidido buscar ${totalQuestionsToFetch} questões total`);

      // 4. Simular busca de questões (apenas contar, não buscar todas)
      const maxQuestionsToSimulate = Math.min(totalQuestionsToFetch, 10); // Limitar para teste
      
      // Simular busca de algumas questões para medir tempo
      const { data: sampleQuestions, error: questionsError } = await supabase
        .from('questions')
        .select('id, title, field, topic_name, subtopic_name')
        .limit(maxQuestionsToSimulate);

      if (questionsError) {
        console.error('❌ Erro ao buscar questões:', questionsError);
      } else {
        console.log(`   📝 ${sampleQuestions.length} questões encontradas`);
      }

      const competencyDecisionTime = Date.now() - competencyDecisionStart;
      results.competencyDecision.push(competencyDecisionTime);
      console.log(`✅ Decisão de competências e busca de questões em ${competencyDecisionTime}ms`);

      // 3. TESTE: Tempo para atualizar competências do usuário
      console.log('\n3️⃣ TESTE: Atualização de Competências');
      const competencyUpdateStart = Date.now();

      if (userCompetencies.length > 0) {
        // Simular atualização de algumas competências (como quando o usuário responde questões)
        const competenciesToUpdate = userCompetencies.slice(0, 3); // Atualizar 3 competências
        
        for (const competency of competenciesToUpdate) {
          const newLevel = Math.min((competency.level || 0) + 1, 3); // Incrementar nível
          
          const { error: updateError } = await supabase
            .from('user_competencies')
            .update({
              level: newLevel,
              last_evaluated_at: new Date().toISOString(),
            })
            .eq('profile_id', authData.user.id)
            .eq('competency_id', competency.competencies.id);

          if (updateError) {
            console.error(`   ❌ Erro ao atualizar competência ${competency.competencies.name}:`, updateError);
          } else {
            console.log(`   ✅ Competência ${competency.competencies.name} atualizada: nível ${competency.level} → ${newLevel}`);
          }
        }

        const competencyUpdateTime = Date.now() - competencyUpdateStart;
        results.competencyUpdate.push(competencyUpdateTime);
        console.log(`✅ Atualização de competências em ${competencyUpdateTime}ms`);
      } else {
        console.log('⚠️ Nenhuma competência para atualizar');
        results.competencyUpdate.push(0);
      }

      // Limpeza
      console.log('\n🧹 Limpando dados de teste...');
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
      if (deleteError) {
        console.error('❌ Erro ao deletar usuário:', deleteError);
      } else {
        console.log('✅ Usuário removido com sucesso');
      }

      // Aguardar um pouco entre testes
      if (testRun < 5) {
        console.log('⏳ Aguardando 2 segundos antes do próximo teste...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // ANÁLISE DOS RESULTADOS
    console.log('\n' + '='.repeat(60));
    console.log('📊 ANÁLISE COMPLETA DE PERFORMANCE');
    console.log('='.repeat(60));

    // Função para calcular estatísticas
    const calculateStats = (times) => {
      const validTimes = times.filter(t => t > 0);
      if (validTimes.length === 0) return { avg: 0, min: 0, max: 0, count: 0 };
      
      const avg = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
      const min = Math.min(...validTimes);
      const max = Math.max(...validTimes);
      
      return { avg: Math.round(avg), min, max, count: validTimes.length };
    };

    // 1. Análise da criação de usuário
    const userCreationStats = calculateStats(results.userCreation);
    console.log('\n1️⃣ CRIAÇÃO DE USUÁRIO:');
    console.log(`   📊 Média: ${userCreationStats.avg}ms`);
    console.log(`   📊 Mínimo: ${userCreationStats.min}ms`);
    console.log(`   📊 Máximo: ${userCreationStats.max}ms`);
    console.log(`   📊 Testes válidos: ${userCreationStats.count}/5`);
    
    if (userCreationStats.avg < 1000) {
      console.log('   ✅ PERFORMANCE EXCELENTE (< 1s)');
    } else if (userCreationStats.avg < 2000) {
      console.log('   ⚠️ PERFORMANCE BOA (1-2s)');
    } else {
      console.log('   ❌ PERFORMANCE RUIM (> 2s)');
    }

    // 2. Análise da decisão de competências
    const competencyDecisionStats = calculateStats(results.competencyDecision);
    console.log('\n2️⃣ DECISÃO DE COMPETÊNCIAS E BUSCA DE QUESTÕES:');
    console.log(`   📊 Média: ${competencyDecisionStats.avg}ms`);
    console.log(`   📊 Mínimo: ${competencyDecisionStats.min}ms`);
    console.log(`   📊 Máximo: ${competencyDecisionStats.max}ms`);
    console.log(`   📊 Testes válidos: ${competencyDecisionStats.count}/5`);
    
    if (competencyDecisionStats.avg < 500) {
      console.log('   ✅ PERFORMANCE EXCELENTE (< 500ms)');
    } else if (competencyDecisionStats.avg < 1000) {
      console.log('   ⚠️ PERFORMANCE BOA (500ms-1s)');
    } else {
      console.log('   ❌ PERFORMANCE RUIM (> 1s)');
    }

    // 3. Análise da atualização de competências
    const competencyUpdateStats = calculateStats(results.competencyUpdate);
    console.log('\n3️⃣ ATUALIZAÇÃO DE COMPETÊNCIAS:');
    console.log(`   📊 Média: ${competencyUpdateStats.avg}ms`);
    console.log(`   📊 Mínimo: ${competencyUpdateStats.min}ms`);
    console.log(`   📊 Máximo: ${competencyUpdateStats.max}ms`);
    console.log(`   📊 Testes válidos: ${competencyUpdateStats.count}/5`);
    
    if (competencyUpdateStats.avg < 200) {
      console.log('   ✅ PERFORMANCE EXCELENTE (< 200ms)');
    } else if (competencyUpdateStats.avg < 500) {
      console.log('   ⚠️ PERFORMANCE BOA (200-500ms)');
    } else {
      console.log('   ❌ PERFORMANCE RUIM (> 500ms)');
    }

    // RESUMO FINAL
    console.log('\n' + '='.repeat(60));
    console.log('🎯 RESUMO FINAL DE PERFORMANCE');
    console.log('='.repeat(60));
    
    const totalAvg = userCreationStats.avg + competencyDecisionStats.avg + competencyUpdateStats.avg;
    
    console.log(`📊 Tempo total médio: ${totalAvg}ms`);
    console.log(`📊 Criação de usuário: ${userCreationStats.avg}ms (${Math.round(userCreationStats.avg/totalAvg*100)}%)`);
    console.log(`📊 Decisão de competências: ${competencyDecisionStats.avg}ms (${Math.round(competencyDecisionStats.avg/totalAvg*100)}%)`);
    console.log(`📊 Atualização de competências: ${competencyUpdateStats.avg}ms (${Math.round(competencyUpdateStats.avg/totalAvg*100)}%)`);

    // RECOMENDAÇÕES
    console.log('\n💡 RECOMENDAÇÕES:');
    
    if (userCreationStats.avg > 1000) {
      console.log('   🔧 Otimizar criação de usuário (verificar Supabase Auth)');
    }
    
    if (competencyDecisionStats.avg > 500) {
      console.log('   🔧 Otimizar decisão de competências (verificar cache e consultas)');
    }
    
    if (competencyUpdateStats.avg > 200) {
      console.log('   🔧 Otimizar atualização de competências (verificar índices)');
    }

    if (totalAvg < 2000) {
      console.log('\n🎉 SISTEMA COM PERFORMANCE EXCELENTE!');
    } else if (totalAvg < 5000) {
      console.log('\n✅ SISTEMA COM PERFORMANCE BOA');
    } else {
      console.log('\n⚠️ SISTEMA PRECISA DE OTIMIZAÇÃO');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testPerformanceComplete()
  .then(() => {
    console.log('\n✅ Teste de performance concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro no teste:', error);
    process.exit(1);
  }); 