const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserCompetencies(userId) {
  try {
    console.log(`🔍 Verificando competências do usuário: ${userId}\n`);
    
    // 1. Verificar se o usuário existe na tabela profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      return;
    }
    
    console.log('✅ Perfil encontrado:', {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      created_at: profile.created_at
    });
    
    // 2. Verificar competências do usuário
    const { data: userCompetencies, error: competenciesError } = await supabase
      .from('user_competencies')
      .select(`
        *,
        competency:competencies(*)
      `)
      .eq('profile_id', userId);
    
    if (competenciesError) {
      console.error('❌ Erro ao buscar competências:', competenciesError);
      return;
    }
    
    console.log(`\n📊 Competências encontradas: ${userCompetencies.length}`);
    
    if (userCompetencies.length === 0) {
      console.log('⚠️  Nenhuma competência registrada para este usuário');
      console.log('💡 Isso é normal para usuários novos (nível 0 = implícito)');
    } else {
      console.log('\n🎯 Competências registradas:');
      userCompetencies.forEach((uc, index) => {
        console.log(`${index + 1}. ${uc.competency?.name || 'Competência desconhecida'}`);
        console.log(`   - Nível: ${uc.level}`);
        console.log(`   - Última avaliação: ${uc.last_evaluated_at}`);
        console.log('');
      });
    }
    
    // 3. Verificar todas as competências disponíveis
    const { data: allCompetencies, error: allCompetenciesError } = await supabase
      .from('competencies')
      .select('*')
      .order('name');
    
    if (allCompetenciesError) {
      console.error('❌ Erro ao buscar todas as competências:', allCompetenciesError);
      return;
    }
    
    console.log(`📚 Total de competências disponíveis no sistema: ${allCompetencies.length}`);
    
    // 4. Mostrar estatísticas
    const userCompetencyIds = userCompetencies.map(uc => uc.competency_id);
    const missingCompetencies = allCompetencies.filter(c => !userCompetencyIds.includes(c.id));
    
    console.log(`\n📈 Estatísticas:`);
    console.log(`   - Competências com nível > 0: ${userCompetencies.length}`);
    console.log(`   - Competências com nível 0 (implícito): ${missingCompetencies.length}`);
    console.log(`   - Total de competências: ${allCompetencies.length}`);
    
    if (missingCompetencies.length > 0) {
      console.log('\n🔍 Competências com nível 0 (não registradas):');
      missingCompetencies.slice(0, 5).forEach((comp, index) => {
        console.log(`   ${index + 1}. ${comp.name}`);
      });
      if (missingCompetencies.length > 5) {
        console.log(`   ... e mais ${missingCompetencies.length - 5} competências`);
      }
    }
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// Função principal
async function main() {
  const userId = process.argv[2];
  
  if (!userId) {
    console.log('❌ Uso: node check-user-competencies-after-test.js <user_id>');
    console.log('💡 Exemplo: node check-user-competencies-after-test.js 94910867-32ed-4bcd-a8cc-ced600c14eb0');
    process.exit(1);
  }
  
  await checkUserCompetencies(userId);
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { checkUserCompetencies }; 