const { createClient } = require('@supabase/supabase-js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  console.error('Certifique-se de que SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const dbPath = path.join(__dirname, 'dev.sqlite');

console.log('🚀 Iniciando migração corrigida do SQLite para o Supabase...');

async function migrateProfiles() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Erro ao conectar ao SQLite:', err.message);
        reject(err);
        return;
      }
      console.log('✅ Conectado ao SQLite');
    });

    db.all("SELECT * FROM profiles", [], async (err, profiles) => {
      if (err) {
        console.error('❌ Erro ao buscar perfis do SQLite:', err.message);
        db.close();
        reject(err);
        return;
      }

      console.log(`📊 Encontrados ${profiles.length} perfis no SQLite`);

      if (profiles.length === 0) {
        console.log('✅ Nenhum perfil para migrar');
        db.close();
        resolve();
        return;
      }

      try {
        // Migrar cada perfil para o Supabase
        for (const profile of profiles) {
          console.log(`🔄 Migrando perfil: ${profile.email}`);
          
          // Preparar dados para migração, tratando campos nulos
          const profileData = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            institution: profile.institution || null,
            created_at: profile.created_at,
            updated_at: profile.updated_at || profile.created_at
          };

          // Tentar inserir sem birth_date primeiro
          const { error } = await supabase
            .from('profiles')
            .upsert(profileData, {
              onConflict: 'id'
            });

          if (error) {
            console.error(`❌ Erro ao migrar perfil ${profile.email}:`, error.message);
            
            // Se o erro for sobre birth_date, tentar sem esse campo
            if (error.message.includes('birth_date')) {
              console.log(`🔄 Tentando migrar ${profile.email} sem birth_date...`);
              
              const { error: retryError } = await supabase
                .from('profiles')
                .upsert({
                  id: profile.id,
                  email: profile.email,
                  name: profile.name,
                  institution: profile.institution || null,
                  created_at: profile.created_at,
                  updated_at: profile.updated_at || profile.created_at
                }, {
                  onConflict: 'id'
                });

              if (retryError) {
                console.error(`❌ Erro na segunda tentativa para ${profile.email}:`, retryError.message);
              } else {
                console.log(`✅ Perfil ${profile.email} migrado com sucesso (sem birth_date)`);
              }
            }
          } else {
            console.log(`✅ Perfil ${profile.email} migrado com sucesso`);
          }
        }

        console.log('🎉 Migração concluída!');
        db.close();
        resolve();
      } catch (error) {
        console.error('❌ Erro durante a migração:', error);
        db.close();
        reject(error);
      }
    });
  });
}

async function verifyMigration() {
  console.log('\n🔍 Verificando migração...');
  
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao verificar perfis:', error);
      return;
    }

    console.log(`✅ Total de perfis no Supabase após migração: ${profiles.length}`);
    
    if (profiles.length > 0) {
      console.log('\n📝 Perfis migrados:');
      profiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.email} - ${profile.name}`);
      });
    }
  } catch (error) {
    console.error('❌ Erro ao verificar migração:', error);
  }
}

async function main() {
  try {
    await migrateProfiles();
    await verifyMigration();
    console.log('\n🎉 Processo de migração finalizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro no processo de migração:', error);
    process.exit(1);
  }
}

main(); 