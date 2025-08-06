const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndCreateTable() {
    try {
        console.log('🔍 Verificando se a tabela user_answers existe...');

        // Tentar inserir um registro para verificar se a tabela existe
        const { data, error } = await supabase
            .from('user_answers')
            .select('*')
            .limit(1);

        if (error) {
            if (error.code === '42P01') {
                console.log('❌ Tabela user_answers NÃO existe');
                console.log('📋 Você precisa criar a tabela manualmente no Supabase SQL Editor');
                console.log('📝 Execute o seguinte SQL no Supabase:');
                console.log(`
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

-- Políticas de segurança
DROP POLICY IF EXISTS "Users can view their own answers" ON user_answers;
CREATE POLICY "Users can view their own answers" ON user_answers
    FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can insert their own answers" ON user_answers;
CREATE POLICY "Users can insert their own answers" ON user_answers
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Service role can access all answers" ON user_answers;
CREATE POLICY "Service role can access all answers" ON user_answers
    FOR ALL USING (auth.role() = 'service_role');
                `);
            } else {
                console.error('❌ Erro ao verificar tabela:', error);
            }
            return;
        }

        console.log('✅ Tabela user_answers existe');

        // Verificar quantos registros existem
        const { count, error: countError } = await supabase
            .from('user_answers')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('❌ Erro ao contar registros:', countError);
        } else {
            console.log(`📈 Total de registros na tabela: ${count}`);
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

    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

checkAndCreateTable(); 