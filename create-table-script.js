const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUserAnswersTable() {
    try {
        console.log('🔧 Criando tabela user_answers...');

        // SQL para criar a tabela
        const createTableSQL = `
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
        `;

        // SQL para criar índices
        const createIndexesSQL = `
            CREATE INDEX IF NOT EXISTS idx_user_answers_profile_id ON user_answers(profile_id);
            CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON user_answers(question_id);
            CREATE INDEX IF NOT EXISTS idx_user_answers_answered_at ON user_answers(answered_at);
        `;

        // SQL para habilitar RLS
        const enableRLSSQL = `
            ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
        `;

        // SQL para criar políticas
        const createPoliciesSQL = `
            DROP POLICY IF EXISTS "Users can view their own answers" ON user_answers;
            CREATE POLICY "Users can view their own answers" ON user_answers
                FOR SELECT USING (auth.uid() = profile_id);

            DROP POLICY IF EXISTS "Users can insert their own answers" ON user_answers;
            CREATE POLICY "Users can insert their own answers" ON user_answers
                FOR INSERT WITH CHECK (auth.uid() = profile_id);

            DROP POLICY IF EXISTS "Service role can access all answers" ON user_answers;
            CREATE POLICY "Service role can access all answers" ON user_answers
                FOR ALL USING (auth.role() = 'service_role');
        `;

        // Executar criação da tabela
        console.log('📋 Executando criação da tabela...');
        const { error: tableError } = await supabase.rpc('exec_sql', {
            sql: createTableSQL
        });

        if (tableError) {
            console.error('❌ Erro ao criar tabela:', tableError);
            return;
        }

        console.log('✅ Tabela criada com sucesso');

        // Executar criação de índices
        console.log('📊 Criando índices...');
        const { error: indexError } = await supabase.rpc('exec_sql', {
            sql: createIndexesSQL
        });

        if (indexError) {
            console.error('❌ Erro ao criar índices:', indexError);
        } else {
            console.log('✅ Índices criados com sucesso');
        }

        // Executar habilitação de RLS
        console.log('🔒 Habilitando RLS...');
        const { error: rlsError } = await supabase.rpc('exec_sql', {
            sql: enableRLSSQL
        });

        if (rlsError) {
            console.error('❌ Erro ao habilitar RLS:', rlsError);
        } else {
            console.log('✅ RLS habilitado com sucesso');
        }

        // Executar criação de políticas
        console.log('🛡️ Criando políticas de segurança...');
        const { error: policyError } = await supabase.rpc('exec_sql', {
            sql: createPoliciesSQL
        });

        if (policyError) {
            console.error('❌ Erro ao criar políticas:', policyError);
        } else {
            console.log('✅ Políticas criadas com sucesso');
        }

        // Testar inserção
        console.log('🧪 Testando inserção...');
        const { data: testData, error: testError } = await supabase
            .from('user_answers')
            .insert({
                profile_id: '00000000-0000-0000-0000-000000000000',
                question_id: '00000000-0000-0000-0000-000000000001',
                selected_alternative_id: '00000000-0000-0000-0000-000000000002',
                is_correct: true,
                time_spent_seconds: 30
            })
            .select();

        if (testError) {
            console.error('❌ Erro ao testar inserção:', testError);
        } else {
            console.log('✅ Inserção de teste realizada com sucesso');

            // Limpar teste
            await supabase
                .from('user_answers')
                .delete()
                .eq('profile_id', '00000000-0000-0000-0000-000000000000');

            console.log('🧹 Registro de teste removido');
        }

        console.log('🎉 Tabela user_answers criada e configurada com sucesso!');

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

createUserAnswersTable(); 