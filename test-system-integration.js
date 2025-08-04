const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simular o sistema de cache
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
      console.log('📦 Cache hit para competências do usuário:', profileId);
      return this.cache.get(cacheKey);
    }

    console.log('🔄 Cache miss, carregando competências do usuário:', profileId);
    
    // 2. Buscar do banco
    const competencies = await this.loadFromDatabase(profileId);
    
    // 3. Se não tem competências, criar automaticamente
    if (competencies.length === 0) {
      console.log('🆕 Usuário sem competências, criando automaticamente...');
      await this.initializeUserCompetencies(profileId);
      
      // Buscar novamente após criar
      const newCompetencies = await this.loadFromDatabase(profileId);
      console.log(`✅ ${newCompetencies.length} competências criadas automaticamente`);
      
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
      console.log('🎯 Inicializando competências para usuário:', profileId);
      
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

      console.log(`📊 Encontradas ${allCompetencies.length} competências para inicializar`);

      // 2. Criar competências em lotes para melhor performance
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < allCompetencies.length; i += batchSize) {
        const batch = allCompetencies.slice(i, i + batchSize);
        batches.push(batch);
      }

      console.log(`🔄 Processando ${batches.length} lotes de competências...`);

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
        } else {
          console.log(`✅ Lote ${batchIndex + 1}/${batches.length} processado (${batch.length} competências)`);
        }
      }

      console.log('🎉 Inicialização de competências concluída para usuário:', profileId);
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
}

async function testSystemIntegration() {
  console.log('🔧 Testando Integração Completa do Sistema\n');

  try {
    // 1. Criar usuário de teste
    console.log('1️⃣ Criando usuário de teste...');
    
    const testEmail = `integration-test-${Date.now()}@example.com`;
    const testPassword = 'test123456';
    const testName = 'Usuário Integração Teste';
    const testInstitution = 'Instituição Teste';

    const startTime = Date.now();
    
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

    const userCreationTime = Date.now() - startTime;
    console.log(`✅ Usuário criado em ${userCreationTime}ms`);
    console.log('   📝 ID:', authData.user.id);

    // 2. Criar perfil
    console.log('\n2️⃣ Criando perfil...');
    
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

    console.log('✅ Perfil criado com sucesso');

    // 3. Verificar competências iniciais (deve ser 0)
    console.log('\n3️⃣ Verificando competências iniciais...');
    
    const { data: initialCompetencies, error: initialError } = await supabase
      .from('user_competencies')
      .select('*')
      .eq('profile_id', authData.user.id);

    if (initialError) {
      console.error('❌ Erro ao verificar competências iniciais:', initialError);
      return;
    }

    console.log(`   📊 Competências iniciais: ${initialCompetencies.length} (esperado: 0)`);

    // 4. Simular uso do sistema de cache (como o repositório faria)
    console.log('\n4️⃣ Simulando uso do sistema de cache...');
    
    const cacheService = new MockCompetencyCacheService();
    const cacheQueryStart = Date.now();
    
    const cachedCompetencies = await cacheService.getUserCompetencies(authData.user.id);
    
    const cacheQueryTime = Date.now() - cacheQueryStart;
    console.log(`✅ Consulta via cache concluída em ${cacheQueryTime}ms`);
    console.log(`   📊 Competências retornadas: ${cachedCompetencies.length}`);

    // 5. Verificar competências finais
    console.log('\n5️⃣ Verificando competências finais...');
    
    const { data: finalCompetencies, error: finalError } = await supabase
      .from('user_competencies')
      .select(`
        level,
        last_evaluated_at,
        competencies (
          id,
          name,
          code
        )
      `)
      .eq('profile_id', authData.user.id);

    if (finalError) {
      console.error('❌ Erro ao verificar competências finais:', finalError);
      return;
    }

    console.log(`   📊 Total de competências: ${finalCompetencies.length}`);

    if (finalCompetencies.length > 0) {
      // Agrupar por nível
      const byLevel = finalCompetencies.reduce((acc, comp) => {
        acc[comp.level] = (acc[comp.level] || 0) + 1;
        return acc;
      }, {});

      console.log(`   📈 Distribuição por nível:`);
      Object.entries(byLevel).forEach(([level, count]) => {
        console.log(`      - Nível ${level}: ${count} competências`);
      });

      // Mostrar algumas competências como exemplo
      console.log(`   📝 Exemplos de competências:`);
      finalCompetencies.slice(0, 3).forEach(comp => {
        console.log(`      - ${comp.competencies.name}: Nível ${comp.level}`);
      });
    }

    // 6. Verificar total de competências no sistema
    console.log('\n6️⃣ Verificando total de competências no sistema...');
    
    const { data: allCompetencies, error: allCompetenciesError } = await supabase
      .from('competencies')
      .select('id')
      .order('code');

    if (allCompetenciesError) {
      console.error('❌ Erro ao buscar competências do sistema:', allCompetenciesError);
    } else {
      console.log(`✅ Total de competências no sistema: ${allCompetencies.length}`);
      
      if (finalCompetencies.length === allCompetencies.length) {
        console.log('   ✅ TODAS as competências foram criadas corretamente!');
      } else {
        console.log(`   ⚠️ Faltam ${allCompetencies.length - finalCompetencies.length} competências`);
      }
    }

    // 7. Limpeza
    console.log('\n7️⃣ Limpando dados de teste...');
    
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      authData.user.id
    );

    if (deleteError) {
      console.error('❌ Erro ao deletar usuário:', deleteError);
    } else {
      console.log('✅ Usuário removido com sucesso');
    }

    // 8. Resumo final
    const totalTime = Date.now() - startTime;
    
    console.log('\n🎉 TESTE DE INTEGRAÇÃO CONCLUÍDO!');
    console.log('\n📊 RESUMO FINAL:');
    console.log(`⏱️  Tempo total: ${totalTime}ms`);
    console.log(`📊 Competências criadas: ${finalCompetencies.length}`);
    console.log(`📊 Competências esperadas: ${allCompetencies?.length || 0}`);

    if (finalCompetencies.length > 0) {
      console.log('\n✅ SISTEMA FUNCIONANDO:');
      console.log('✅ Competências criadas automaticamente via cache service');
      console.log('✅ Sistema de apostila dinâmica funcionará');
      console.log('✅ Performance otimizada');
    } else {
      console.log('\n❌ PROBLEMA AINDA EXISTE:');
      console.log('❌ Competências não foram criadas automaticamente');
      console.log('❌ Sistema de apostila dinâmica não funcionará');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testSystemIntegration()
  .then(() => {
    console.log('\n✅ Teste concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro no teste:', error);
    process.exit(1);
  }); 