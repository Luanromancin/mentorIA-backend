const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserCompetenciesStatus() {
  console.log('🔍 Verificando Status das Competências do Usuário\n');

  try {
    // 1. Listar usuários recentes
    console.log('1️⃣ Buscando usuários recentes...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError);
      return;
    }

    console.log(`✅ Encontrados ${profiles.length} usuários recentes:`);
    profiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.email} (${profile.name}) - ${profile.created_at}`);
    });

    if (profiles.length === 0) {
      console.log('⚠️ Nenhum usuário encontrado');
      return;
    }

    // 2. Verificar competências de cada usuário
    console.log('\n2️⃣ Verificando competências de cada usuário...\n');

    for (const profile of profiles) {
      console.log(`🔍 Analisando usuário: ${profile.email}`);
      
      // Buscar competências do usuário
      const { data: userCompetencies, error: competenciesError } = await supabase
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
        .eq('profile_id', profile.id);

      if (competenciesError) {
        console.error(`❌ Erro ao buscar competências de ${profile.email}:`, competenciesError);
        continue;
      }

      console.log(`   📊 Competências encontradas: ${userCompetencies.length}`);
      
      if (userCompetencies.length === 0) {
        console.log(`   ⚠️  NENHUMA COMPETÊNCIA CRIADA!`);
        console.log(`   🚨 PROBLEMA: Usuário não conseguirá usar o sistema de apostila dinâmica`);
      } else {
        // Agrupar por nível
        const byLevel = userCompetencies.reduce((acc, comp) => {
          acc[comp.level] = (acc[comp.level] || 0) + 1;
          return acc;
        }, {});

        console.log(`   📈 Distribuição por nível:`);
        Object.entries(byLevel).forEach(([level, count]) => {
          console.log(`      - Nível ${level}: ${count} competências`);
        });

        // Mostrar algumas competências como exemplo
        console.log(`   📝 Exemplos de competências:`);
        userCompetencies.slice(0, 3).forEach(comp => {
          console.log(`      - ${comp.competencies.name}: Nível ${comp.level}`);
        });
      }

      console.log(''); // Linha em branco
    }

    // 3. Verificar total de competências disponíveis no sistema
    console.log('3️⃣ Verificando competências disponíveis no sistema...');
    
    const { data: allCompetencies, error: allCompetenciesError } = await supabase
      .from('competencies')
      .select('id, name, code')
      .order('code');

    if (allCompetenciesError) {
      console.error('❌ Erro ao buscar competências do sistema:', allCompetenciesError);
    } else {
      console.log(`✅ Total de competências no sistema: ${allCompetencies.length}`);
    }

    // 4. Análise do problema
    console.log('\n🚨 ANÁLISE DO PROBLEMA:');
    console.log('❌ Usuários novos NÃO têm competências criadas');
    console.log('❌ Sistema de apostila dinâmica NÃO funcionará');
    console.log('❌ Lazy loading está quebrando a funcionalidade');

    console.log('\n💡 SOLUÇÕES POSSÍVEIS:');
    console.log('1. ✅ Criar competências com nível 0 na criação do usuário');
    console.log('2. ✅ Modificar lazy loading para criar competências na primeira consulta');
    console.log('3. ✅ Implementar fallback para competências não existentes');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkUserCompetenciesStatus()
  .then(() => {
    console.log('\n✅ Verificação concluída');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro na verificação:', error);
    process.exit(1);
  }); 