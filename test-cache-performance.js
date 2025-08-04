const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simular o sistema de cache real
class MockCompetencyCacheService {
  constructor() {
    this.client = supabase;
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  }

  async getUserCompetencies(profileId) {
    const cacheKey = `user_${profileId}`;
    
    // 1. Verificar cache
    if (this.isCacheValid(cacheKey)) {
      console.log('   📦 Cache hit!');
      return this.cache.get(cacheKey);
    }

    console.log('   🔄 Cache miss, carregando do banco...');
    
    // 2. Buscar do banco
    const competencies = await this.loadFromDatabase(profileId);
    
    // 3. Se não tem competências, criar automaticamente
    if (competencies.length === 0) {
      console.log('   🆕 Criando competências automaticamente...');
      await this.initializeUserCompetencies(profileId);
      
      // Buscar novamente após criar
      const newCompetencies = await this.loadFromDatabase(profileId);
      console.log(`   ✅ ${newCompetencies.length} competências criadas`);
      
      // 4. Popular cache
      this.cache.set(cacheKey, newCompetencies);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);
      
      return newCompetencies;
    }
    
    // 4. Popular cache
    this.cache.set(cacheKey, competencies);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);
    
    return competencies;
  }

  async initializeUserCompetencies(profileId) {
    try {
      // 1. Buscar todas as competências disponíveis
      const { data: allCompetencies, error: competenciesError } = await this.client
        .from('competencies')
        .select('id, name')
        .order('code');

      if (competenciesError) {
        console.error('❌ Erro ao buscar competências:', competenciesError);
        return;
      }

      if (!allCompetencies || allCompetencies.length === 0) {
        console.log('⚠️ Nenhuma competência encontrada para inicializar');
        return;
      }

      // 2. Criar competências em lotes para melhor performance
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < allCompetencies.length; i += batchSize) {
        const batch = allCompetencies.slice(i, i + batchSize);
        batches.push(batch);
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchData = batch.map(competency => ({
          profile_id: profileId,
          competency_id: competency.id,
          level: 0,
          last_evaluated_at: new Date().toISOString(),
        }));

        const { error: batchError } = await this.client
          .from('user_competencies')
          .insert(batchData);

        if (batchError) {
          console.error(`❌ Erro ao inserir lote ${batchIndex + 1}:`, batchError);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar competências:', error);
    }
  }

  async loadFromDatabase(profileId) {
    const { data: existing, error } = await this.client
      .from('user_competencies')
      .select('*')
      .eq('profile_id', profileId);

    if (error) {
      console.error('❌ Erro ao carregar competências do banco:', error);
      return [];
    }

    return existing || [];
  }

  isCacheValid(cacheKey) {
    const expiry = this.cacheExpiry.get(cacheKey);
    return expiry ? Date.now() < expiry : false;
  }

  clearCache() {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

async function testCachePerformance() {
  console.log('🚀 Teste de Performance do Sistema de Cache\n');
  console.log('📋 Objetivos:');
  console.log('1. ⏱️ Performance sem cache (primeira consulta)');
  console.log('2. ⏱️ Performance com cache (consultas subsequentes)');
  console.log('3. ⏱️ Performance de atualização de competências\n');

  try {
    // 1. Criar usuário de teste
    console.log('1️⃣ Criando usuário de teste...');
    
    const testEmail = `cache-perf-test-${Date.now()}@example.com`;
    const testPassword = 'test123456';
    const testName = 'Usuário Cache Performance Test';
    const testInstitution = 'Instituição Teste';

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
      return;
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
      return;
    }

    console.log('✅ Usuário criado com sucesso');

    // 2. Inicializar sistema de cache
    const cacheService = new MockCompetencyCacheService();

    // 3. TESTE 1: Primeira consulta (sem cache)
    console.log('\n2️⃣ TESTE 1: Primeira Consulta (Sem Cache)');
    const firstQueryStart = Date.now();
    
    const firstCompetencies = await cacheService.getUserCompetencies(authData.user.id);
    
    const firstQueryTime = Date.now() - firstQueryStart;
    console.log(`✅ Primeira consulta: ${firstCompetencies.length} competências em ${firstQueryTime}ms`);

    // 4. TESTE 2: Segunda consulta (com cache)
    console.log('\n3️⃣ TESTE 2: Segunda Consulta (Com Cache)');
    const secondQueryStart = Date.now();
    
    const secondCompetencies = await cacheService.getUserCompetencies(authData.user.id);
    
    const secondQueryTime = Date.now() - secondQueryStart;
    console.log(`✅ Segunda consulta: ${secondCompetencies.length} competências em ${secondQueryTime}ms`);

    // 5. TESTE 3: Terceira consulta (com cache)
    console.log('\n4️⃣ TESTE 3: Terceira Consulta (Com Cache)');
    const thirdQueryStart = Date.now();
    
    const thirdCompetencies = await cacheService.getUserCompetencies(authData.user.id);
    
    const thirdQueryTime = Date.now() - thirdQueryStart;
    console.log(`✅ Terceira consulta: ${thirdCompetencies.length} competências em ${thirdQueryTime}ms`);

    // 6. TESTE 4: Atualização de competências
    console.log('\n5️⃣ TESTE 4: Atualização de Competências');
    const updateStart = Date.now();

    if (firstCompetencies.length > 0) {
      // Atualizar 5 competências
      const competenciesToUpdate = firstCompetencies.slice(0, 5);
      
      for (const competency of competenciesToUpdate) {
        const newLevel = Math.min((competency.level || 0) + 1, 3);
        
        const { error: updateError } = await supabase
          .from('user_competencies')
          .update({
            level: newLevel,
            last_evaluated_at: new Date().toISOString(),
          })
          .eq('profile_id', authData.user.id)
          .eq('competency_id', competency.competency_id);

        if (updateError) {
          console.error(`   ❌ Erro ao atualizar competência:`, updateError);
        } else {
          console.log(`   ✅ Competência atualizada: nível ${competency.level || 0} → ${newLevel}`);
        }
      }

      const updateTime = Date.now() - updateStart;
      console.log(`✅ Atualização de 5 competências em ${updateTime}ms`);
    }

    // 7. TESTE 5: Consulta após atualização (cache deve ser invalidado)
    console.log('\n6️⃣ TESTE 5: Consulta Após Atualização');
    const afterUpdateQueryStart = Date.now();
    
    const afterUpdateCompetencies = await cacheService.getUserCompetencies(authData.user.id);
    
    const afterUpdateQueryTime = Date.now() - afterUpdateQueryStart;
    console.log(`✅ Consulta após atualização: ${afterUpdateCompetencies.length} competências em ${afterUpdateQueryTime}ms`);

    // 8. Limpeza
    console.log('\n7️⃣ Limpando dados de teste...');
    const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
    if (deleteError) {
      console.error('❌ Erro ao deletar usuário:', deleteError);
    } else {
      console.log('✅ Usuário removido com sucesso');
    }

    // 9. ANÁLISE DOS RESULTADOS
    console.log('\n' + '='.repeat(60));
    console.log('📊 ANÁLISE DE PERFORMANCE DO CACHE');
    console.log('='.repeat(60));

    console.log('\n📈 COMPARAÇÃO DE TEMPOS:');
    console.log(`   🔄 Primeira consulta (sem cache): ${firstQueryTime}ms`);
    console.log(`   📦 Segunda consulta (com cache): ${secondQueryTime}ms`);
    console.log(`   📦 Terceira consulta (com cache): ${thirdQueryTime}ms`);
    console.log(`   🔄 Consulta após atualização: ${afterUpdateQueryTime}ms`);

    const cacheImprovement = firstQueryTime > 0 ? Math.round(firstQueryTime / secondQueryTime) : 0;
    console.log(`\n🚀 MELHORIA COM CACHE: ${cacheImprovement}x mais rápido`);

    if (cacheImprovement >= 5) {
      console.log('   ✅ CACHE FUNCIONANDO EXCELENTEMENTE!');
    } else if (cacheImprovement >= 2) {
      console.log('   ⚠️ CACHE FUNCIONANDO BEM');
    } else {
      console.log('   ❌ CACHE NÃO ESTÁ FUNCIONANDO ADEQUADAMENTE');
    }

    // Verificar se o cache está funcionando
    const cacheIsWorking = secondQueryTime < firstQueryTime * 0.5; // 50% mais rápido
    console.log(`\n🔍 CACHE ESTÁ FUNCIONANDO: ${cacheIsWorking ? '✅ SIM' : '❌ NÃO'}`);

    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES:');
    
    if (firstQueryTime > 2000) {
      console.log('   🔧 Primeira consulta muito lenta - verificar criação de competências');
    }
    
    if (secondQueryTime > 100) {
      console.log('   🔧 Cache não está otimizado - verificar implementação');
    }
    
    if (afterUpdateQueryTime > firstQueryTime) {
      console.log('   🔧 Cache não está sendo invalidado corretamente após atualizações');
    }

    // Resumo final
    console.log('\n🎯 RESUMO FINAL:');
    console.log(`📊 Tempo médio sem cache: ${firstQueryTime}ms`);
    console.log(`📊 Tempo médio com cache: ${secondQueryTime}ms`);
    console.log(`📊 Melhoria de performance: ${cacheImprovement}x`);
    
    if (cacheImprovement >= 5 && firstQueryTime < 3000) {
      console.log('\n🎉 SISTEMA DE CACHE OTIMIZADO!');
    } else {
      console.log('\n⚠️ SISTEMA DE CACHE PRECISA DE OTIMIZAÇÃO');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testCachePerformance()
  .then(() => {
    console.log('\n✅ Teste de cache concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro no teste:', error);
    process.exit(1);
  }); 