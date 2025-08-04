const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'dev.sqlite');

console.log('🔍 Verificando dados do SQLite...');
console.log('📁 Caminho do banco:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao SQLite:', err.message);
    return;
  }
  console.log('✅ Conectado ao banco SQLite');
});

// Listar todas as tabelas
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
  if (err) {
    console.error('❌ Erro ao listar tabelas:', err.message);
    return;
  }
  
  console.log('\n📋 Tabelas encontradas:');
  tables.forEach(table => {
    console.log(`  - ${table.name}`);
  });

  // Verificar se existe a tabela profiles
  const profilesTable = tables.find(t => t.name === 'profiles');
  if (profilesTable) {
    console.log('\n👥 Verificando dados da tabela profiles...');
    
    db.all("SELECT * FROM profiles", [], (err, profiles) => {
      if (err) {
        console.error('❌ Erro ao buscar perfis:', err.message);
        return;
      }
      
      console.log(`📊 Total de perfis: ${profiles.length}`);
      if (profiles.length > 0) {
        console.log('\n📝 Primeiros 5 perfis:');
        profiles.slice(0, 5).forEach((profile, index) => {
          console.log(`  ${index + 1}. ID: ${profile.id}`);
          console.log(`     Email: ${profile.email}`);
          console.log(`     Nome: ${profile.name}`);
          console.log(`     Instituição: ${profile.institution || 'N/A'}`);
          console.log(`     Criado em: ${profile.created_at}`);
          console.log('');
        });
      }
      
      db.close((err) => {
        if (err) {
          console.error('❌ Erro ao fechar banco:', err.message);
        } else {
          console.log('✅ Banco fechado com sucesso');
        }
      });
    });
  } else {
    console.log('\n⚠️ Tabela profiles não encontrada');
    db.close();
  }
}); 