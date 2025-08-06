const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserAnswersTable() {
    try {
        console.log('🔍 Verificando tabela user_answers...');

        // Tentar inserir um registro de teste para verificar se a tabela existe
        const { data: testInsert, error: testError } = await supabase
            .from('user_answers')
            .insert({
                profile_id: '00000000-0000-0000-0000-000000000000',
                question_id: '00000000-0000-0000-0000-000000000001',
                selected_alternative_id: '00000000-0000-0000-0000-000000000002',
                is_correct: true,
                time_spent_seconds: 30,
                answered_at: new Date().toISOString()
            })
            .select();

        if (testError) {
            if (testError.code === '42P01') {
                console.log('❌ Tabela user_answers NÃO existe');
                console.log('📋 Criando tabela user_answers...');

                // Criar a tabela usando SQL direto
                const { error: createError } = await supabase.rpc('exec_sql', {
                    sql: `
                        CREATE TABLE IF NOT EXISTS user_answers (
                            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                            profile_id UUID NOT NULL,
                            question_id UUID NOT NULL,
                            selected_alternative_id UUID,
                            is_correct BOOLEAN NOT NULL,
                            time_spent_seconds INTEGER,
                            answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                        );
                        
                        -- Criar índices para performance
                        CREATE INDEX IF NOT EXISTS idx_user_answers_profile_id ON user_answers(profile_id);
                        CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON user_answers(question_id);
                        CREATE INDEX IF NOT EXISTS idx_user_answers_answered_at ON user_answers(answered_at);
                        
                        -- Habilitar RLS
                        ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
                        
                        -- Política para usuários verem apenas suas próprias respostas
                        DROP POLICY IF EXISTS "Users can view their own answers" ON user_answers;
                        CREATE POLICY "Users can view their own answers" ON user_answers
                            FOR SELECT USING (auth.uid() = profile_id);
                        
                        -- Política para usuários inserirem suas próprias respostas
                        DROP POLICY IF EXISTS "Users can insert their own answers" ON user_answers;
                        CREATE POLICY "Users can insert their own answers" ON user_answers
                            FOR INSERT WITH CHECK (auth.uid() = profile_id);
                    `
                });

                if (createError) {
                    console.error('❌ Erro ao criar tabela:', createError);
                    console.log('💡 Tentando criar tabela sem RLS...');

                    // Tentar criar sem RLS primeiro
                    const { error: createSimpleError } = await supabase.rpc('exec_sql', {
                        sql: `
                            CREATE TABLE IF NOT EXISTS user_answers (
                                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                                profile_id UUID NOT NULL,
                                question_id UUID NOT NULL,
                                selected_alternative_id UUID,
                                is_correct BOOLEAN NOT NULL,
                                time_spent_seconds INTEGER,
                                answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                            );
                        `
                    });

                    if (createSimpleError) {
                        console.error('❌ Erro ao criar tabela simples:', createSimpleError);
                        return;
                    } else {
                        console.log('✅ Tabela user_answers criada (sem RLS)');
                    }
                } else {
                    console.log('✅ Tabela user_answers criada com sucesso');
                }
            } else {
                console.error('❌ Erro ao testar tabela:', testError);
                return;
            }
        } else {
            console.log('✅ Tabela user_answers existe');

            // Limpar registro de teste
            await supabase
                .from('user_answers')
                .delete()
                .eq('profile_id', '00000000-0000-0000-0000-000000000000');
        }

        // Verificar se há dados na tabela
        const { data: records, error: countError } = await supabase
            .from('user_answers')
            .select('*', { count: 'exact' });

        if (countError) {
            console.error('❌ Erro ao contar registros:', countError);
            return;
        }

        console.log(`\n📈 Total de registros na tabela: ${records.length}`);

        // Testar inserção de um registro real
        console.log('\n🧪 Testando inserção de registro...');
        const { data: insertData, error: insertError } = await supabase
            .from('user_answers')
            .insert({
                profile_id: '00000000-0000-0000-0000-000000000000',
                question_id: '00000000-0000-0000-0000-000000000001',
                selected_alternative_id: '00000000-0000-0000-0000-000000000002',
                is_correct: true,
                time_spent_seconds: 30,
                answered_at: new Date().toISOString()
            })
            .select();

        if (insertError) {
            console.error('❌ Erro ao inserir registro de teste:', insertError);
        } else {
            console.log('✅ Inserção de teste realizada com sucesso');
            console.log('📝 Registro inserido:', insertData[0]);

            // Limpar registro de teste
            const { error: deleteError } = await supabase
                .from('user_answers')
                .delete()
                .eq('profile_id', '00000000-0000-0000-0000-000000000000');

            if (deleteError) {
                console.error('⚠️ Erro ao limpar registro de teste:', deleteError);
            } else {
                console.log('🧹 Registro de teste removido');
            }
        }

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

checkUserAnswersTable(); 