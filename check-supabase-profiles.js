const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseProfiles() {
  console.log('🔍 Verificando perfis no Supabase...');
  
  try {
    // Verificar perfis na tabela profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError);
      return;
    }

    console.log(`📊 Total de perfis no Supabase: ${profiles.length}`);
    
    if (profiles.length > 0) {
      console.log('\n📝 Primeiros 5 perfis no Supabase:');
      profiles.slice(0, 5).forEach((profile, index) => {
        console.log(`  ${index + 1}. ID: ${profile.id}`);
        console.log(`     Email: ${profile.email}`);
        console.log(`     Nome: ${profile.name}`);
        console.log(`     Instituição: ${profile.institution || 'N/A'}`);
        console.log(`     Criado em: ${profile.created_at}`);
        console.log('');
      });
    }

    // Verificar usuários no auth
    console.log('🔐 Verificando usuários no Supabase Auth...');
    
    // Nota: Para listar usuários, precisamos do service role key
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey) {
      const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
      
      const { data: users, error: usersError } = await adminSupabase.auth.admin.listUsers();
      
      if (usersError) {
        console.error('❌ Erro ao buscar usuários:', usersError);
      } else {
        console.log(`👤 Total de usuários no Auth: ${users.users.length}`);
        
        if (users.users.length > 0) {
          console.log('\n👤 Primeiros 5 usuários no Auth:');
          users.users.slice(0, 5).forEach((user, index) => {
            console.log(`  ${index + 1}. ID: ${user.id}`);
            console.log(`     Email: ${user.email}`);
            console.log(`     Criado em: ${user.created_at}`);
            console.log(`     Confirmado: ${user.email_confirmed_at ? 'Sim' : 'Não'}`);
            console.log('');
          });
        }
      }
    } else {
      console.log('⚠️ SUPABASE_SERVICE_ROLE_KEY não configurada - não é possível listar usuários do Auth');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkSupabaseProfiles(); 