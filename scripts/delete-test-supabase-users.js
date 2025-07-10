const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.test' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos no .env.test');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function deleteTestUsers() {
  let { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw error;

  for (const user of data.users) {
    if (user.email && user.email.endsWith('@example.com')) {
      const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
      if (delError) console.error('Erro ao deletar usuário:', delError);
      else console.log('Usuário de teste deletado:', user.email);
    }
  }
}

deleteTestUsers(); 