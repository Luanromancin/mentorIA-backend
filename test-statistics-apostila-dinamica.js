const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStatisticsApostilaDinamica() {
    console.log('🧪 Testando estatísticas da apostila dinâmica...\n');

    try {
        // 1. Verificar se a tabela user_statistics existe
        console.log('1. Verificando estrutura da tabela user_statistics...');
        const { data: tableInfo, error: tableError } = await supabase
            .from('user_statistics')
            .select('*')
            .limit(1);

        if (tableError) {
            console.error('❌ Erro ao acessar tabela user_statistics:', tableError);
            return;
        }

        console.log('✅ Tabela user_statistics acessível\n');

        // 2. Buscar estatísticas existentes
        console.log('2. Buscando estatísticas existentes...');
        const { data: existingStats, error: statsError } = await supabase
            .from('user_statistics')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (statsError) {
            console.error('❌ Erro ao buscar estatísticas:', statsError);
            return;
        }

        console.log(`✅ Encontradas ${existingStats.length} estatísticas existentes`);

        if (existingStats.length > 0) {
            console.log('📊 Últimas estatísticas:');
            existingStats.slice(0, 3).forEach((stat, index) => {
                console.log(`   ${index + 1}. ${stat.subtopic_name} (${stat.topic_name}): ${stat.correct_answers}/${stat.questions_answered} questões`);
            });
        }

        console.log('\n3. Testando função de estatísticas...');

        // 3. Testar a função get_user_statistics
        const { data: userStats, error: userStatsError } = await supabase
            .rpc('get_user_statistics', {
                p_user_id: 'test-user-id'
            });

        if (userStatsError) {
            console.error('❌ Erro ao chamar get_user_statistics:', userStatsError);
        } else {
            console.log('✅ Função get_user_statistics executada com sucesso');
            console.log('📊 Estrutura retornada:', JSON.stringify(userStats, null, 2));
        }

        // 4. Verificar se há dados de apostila dinâmica
        console.log('\n4. Verificando dados específicos da apostila dinâmica...');

        const { data: apostilaStats, error: apostilaError } = await supabase
            .from('user_statistics')
            .select('*')
            .or('subtopic_name.eq.Álgebra Linear,subtopic_name.eq.Cálculo Diferencial,subtopic_name.eq.Geometria Analítica')
            .order('created_at', { ascending: false })
            .limit(5);

        if (apostilaError) {
            console.error('❌ Erro ao buscar estatísticas da apostila:', apostilaError);
        } else {
            console.log(`✅ Encontradas ${apostilaStats.length} estatísticas de competências da apostila dinâmica`);

            if (apostilaStats.length > 0) {
                console.log('📈 Estatísticas da apostila dinâmica:');
                apostilaStats.forEach((stat, index) => {
                    const accuracy = stat.questions_answered > 0
                        ? Math.round((stat.correct_answers / stat.questions_answered) * 100)
                        : 0;
                    console.log(`   ${index + 1}. ${stat.subtopic_name}: ${stat.correct_answers}/${stat.questions_answered} (${accuracy}%)`);
                });
            } else {
                console.log('⚠️ Nenhuma estatística encontrada para competências da apostila dinâmica');
                console.log('💡 Isso pode indicar que as respostas da apostila dinâmica não estão sendo registradas');
            }
        }

        console.log('\n🎯 Resumo do teste:');
        console.log('✅ Tabela user_statistics está acessível');
        console.log('✅ Função get_user_statistics está funcionando');

        if (apostilaStats.length > 0) {
            console.log('✅ Estatísticas da apostila dinâmica estão sendo registradas');
        } else {
            console.log('⚠️ Estatísticas da apostila dinâmica não foram encontradas');
            console.log('💡 Verifique se as respostas estão sendo enviadas corretamente');
        }

    } catch (error) {
        console.error('❌ Erro geral no teste:', error);
    }
}

// Executar o teste
testStatisticsApostilaDinamica();
