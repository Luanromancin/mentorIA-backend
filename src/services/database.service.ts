import { createClient } from '@supabase/supabase-js';
import env from '../env';

export class DatabaseService {
  private client;

  constructor() {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error(
        'SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios para consultas ao banco'
      );
    }

    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }

  /**
   * Busca competências de um usuário com detalhes
   */
  async getUserCompetencies(profileId: string): Promise<any[]> {
    const startTime = Date.now();
    console.log(
      `🔍 [${new Date().toISOString()}] Iniciando busca de competências para usuário ${profileId}...`
    );

    try {
      console.log(
        `⏱️ [${new Date().toISOString()}] Criando timeout de 45 segundos...`
      );

      // Timeout progressivo: 45 segundos para a primeira consulta
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          const elapsed = Date.now() - startTime;
          reject(
            new Error(
              `Timeout: Consulta demorou mais de 45 segundos (${elapsed}ms)`
            )
          );
        }, 45000);
      });

      console.log(
        `🌐 [${new Date().toISOString()}] Executando query no Supabase...`
      );
      const queryPromise = this.client
        .from('user_competencies')
        .select(
          `
          profile_id,
          competency_id,
          level,
          last_evaluated_at,
          competencies!inner (
            id,
            code,
            name,
            description
          )
        `
        )
        .eq('profile_id', profileId);

      console.log(
        `⏳ [${new Date().toISOString()}] Aguardando resposta do banco...`
      );
      const { data, error } = (await Promise.race([
        queryPromise,
        timeoutPromise,
      ])) as any;

      const elapsed = Date.now() - startTime;
      console.log(
        `📊 [${new Date().toISOString()}] Query executada em ${elapsed}ms`
      );

      if (error) {
        console.error(
          `❌ [${new Date().toISOString()}] Erro ao buscar competências do usuário:`,
          error
        );
        throw error;
      }

      console.log(
        `✅ [${new Date().toISOString()}] Busca concluída: ${
          data?.length || 0
        } competências encontradas em ${elapsed}ms`
      );
      return data || [];
    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.error(
        `❌ [${new Date().toISOString()}] Erro ao buscar competências do usuário (${elapsed}ms):`,
        error
      );
      throw error;
    }
  }

  /**
   * Busca questões por competência
   */
  async getQuestionsByCompetency(
    competencyName: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      // Primeiro, buscar questões que correspondem ao subtopic_name
      const { data: questions, error: questionsError } = await this.client
        .from('questions')
        .select('*')
        .eq('subtopic_name', competencyName)
        .limit(limit);

      if (questionsError) {
        console.error('❌ Erro ao buscar questões:', questionsError);
        throw questionsError;
      }

      if (!questions || questions.length === 0) {
        console.log(
          `⚠️ Nenhuma questão encontrada para competência: ${competencyName}`
        );
        return [];
      }

      // Para cada questão, buscar as alternativas
      const questionsWithAlternatives = await Promise.all(
        questions.map(async (question) => {
          const { data: alternatives, error: alternativesError } =
            await this.client
              .from('alternatives')
              .select('*')
              .eq('question_id', question.id);

          if (alternativesError) {
            console.error(
              `❌ Erro ao buscar alternativas para questão ${question.id}:`,
              alternativesError
            );
            return {
              ...question,
              alternatives: [],
            };
          }

          return {
            ...question,
            alternatives: alternatives || [],
          };
        })
      );

      return questionsWithAlternatives;
    } catch (error) {
      console.error(
        `❌ Erro ao buscar questões para competência ${competencyName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Atualiza o nível de uma competência para um usuário
   */
  async updateUserCompetencyLevel(
    profileId: string,
    competencyId: string,
    level: number
  ): Promise<void> {
    try {
      const { error } = await this.client.from('user_competencies').upsert({
        profile_id: profileId,
        competency_id: competencyId,
        level: level,
        last_evaluated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('❌ Erro ao atualizar nível da competência:', error);
        throw error;
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar nível da competência:', error);
      throw error;
    }
  }

  /**
   * Busca uma competência específica de um usuário
   */
  async getUserCompetency(
    profileId: string,
    competencyId: string
  ): Promise<any | null> {
    try {
      const { data, error } = await this.client
        .from('user_competencies')
        .select('*')
        .eq('profile_id', profileId)
        .eq('competency_id', competencyId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhum resultado encontrado
          return null;
        }
        console.error('❌ Erro ao buscar competência específica:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar competência específica:', error);
      throw error;
    }
  }

  /**
   * Remove questões sem alternativas
   */
  async removeQuestionsWithoutAlternatives(): Promise<{
    removedCount: number;
  }> {
    try {
      console.log('🗑️ Iniciando remoção de questões sem alternativas...');

      // Primeiro, buscar questões sem alternativas
      const questionsWithoutAlternatives =
        await this.checkQuestionsWithoutAlternatives();

      if (questionsWithoutAlternatives.length === 0) {
        console.log(
          '✅ Nenhuma questão sem alternativas encontrada para remover'
        );
        return { removedCount: 0 };
      }

      console.log(
        `⚠️ Removendo ${questionsWithoutAlternatives.length} questões sem alternativas...`
      );

      // Extrair IDs das questões para remover
      const questionIds = questionsWithoutAlternatives.map((q) => q.id);

      // Remover as questões
      const { error: deleteError } = await this.client
        .from('questions')
        .delete()
        .in('id', questionIds);

      if (deleteError) {
        console.error('❌ Erro ao remover questões:', deleteError);
        throw deleteError;
      }

      console.log(
        `✅ ${questionsWithoutAlternatives.length} questões removidas com sucesso`
      );

      return { removedCount: questionsWithoutAlternatives.length };
    } catch (error) {
      console.error('❌ Erro ao remover questões sem alternativas:', error);
      throw error;
    }
  }

  /**
   * Verifica questões sem alternativas
   */
  async checkQuestionsWithoutAlternatives(): Promise<any[]> {
    try {
      console.log('🔍 Verificando questões sem alternativas...');

      // Primeiro, buscar todas as questões
      const { data: allQuestions, error: questionsError } =
        await this.client.from('questions').select(`
          id,
          title,
          subtopic_name,
          topic_name
        `);

      if (questionsError) {
        console.error('❌ Erro ao buscar questões:', questionsError);
        throw questionsError;
      }

      // Depois, buscar todas as questões que têm alternativas
      const { data: questionsWithAlternatives, error: alternativesError } =
        await this.client.from('alternatives').select('question_id');

      if (alternativesError) {
        console.error('❌ Erro ao buscar alternativas:', alternativesError);
        throw alternativesError;
      }

      // Criar um Set com IDs de questões que têm alternativas
      const questionsWithAlternativesSet = new Set(
        questionsWithAlternatives?.map((a) => a.question_id) || []
      );

      // Filtrar questões que não têm alternativas
      const questionsWithoutAlternatives =
        allQuestions?.filter((q) => !questionsWithAlternativesSet.has(q.id)) ||
        [];

      const { data, error } = {
        data: questionsWithoutAlternatives,
        error: null,
      };

      if (error) {
        console.error('❌ Erro ao verificar questões sem alternativas:', error);
        throw error;
      }

      console.log(
        `⚠️ Encontradas ${data?.length || 0} questões sem alternativas`
      );
      if (data && data.length > 0) {
        console.log(
          '📋 Questões sem alternativas:',
          data.map((q) => ({
            id: q.id,
            title: q.title,
            subtopic: q.subtopic_name,
            topic: q.topic_name,
          }))
        );
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao verificar questões sem alternativas:', error);
      throw error;
    }
  }

  /**
   * Inicializa competências para um usuário (se não existirem)
   */
  async initializeUserCompetencies(profileId: string): Promise<void> {
    const startTime = Date.now();
    console.log(
      `🚀 [${new Date().toISOString()}] Inicializando competências para usuário ${profileId}...`
    );

    try {
      console.log(
        `⏱️ [${new Date().toISOString()}] Criando timeout de 30 segundos para inicialização...`
      );

      // Timeout progressivo: 30 segundos para inicialização
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          const elapsed = Date.now() - startTime;
          reject(
            new Error(
              `Timeout: Inicialização demorou mais de 30 segundos (${elapsed}ms)`
            )
          );
        }, 30000);
      });

      console.log(
        `🔄 [${new Date().toISOString()}] Iniciando processo de inicialização...`
      );
      const initPromise = this._initializeUserCompetencies(profileId);

      await Promise.race([initPromise, timeoutPromise]);

      const elapsed = Date.now() - startTime;
      console.log(
        `✅ [${new Date().toISOString()}] Inicialização concluída com sucesso em ${elapsed}ms`
      );
    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.error(
        `❌ [${new Date().toISOString()}] Erro ao inicializar competências do usuário (${elapsed}ms):`,
        error
      );
      // Não falhar completamente, apenas logar o erro
      console.log(
        `⚠️ [${new Date().toISOString()}] Continuando sem inicialização de competências`
      );
    }
  }

  /**
   * Método privado para inicialização real
   */
  private async _initializeUserCompetencies(profileId: string): Promise<void> {
    const startTime = Date.now();
    console.log(
      `📋 [${new Date().toISOString()}] Iniciando busca de competências disponíveis...`
    );

    // Buscar todas as competências disponíveis
    const { data: competencies, error: competenciesError } = await this.client
      .from('competencies')
      .select('id')
      .limit(1000); // Limitar para evitar problemas

    const step1Time = Date.now() - startTime;
    console.log(
      `📊 [${new Date().toISOString()}] Busca de competências concluída em ${step1Time}ms`
    );

    if (competenciesError) {
      console.error(
        `❌ [${new Date().toISOString()}] Erro ao buscar competências:`,
        competenciesError
      );
      throw competenciesError;
    }

    if (!competencies || competencies.length === 0) {
      console.log(
        `⚠️ [${new Date().toISOString()}] Nenhuma competência encontrada no banco`
      );
      return;
    }

    console.log(
      `📈 [${new Date().toISOString()}] Encontradas ${
        competencies.length
      } competências disponíveis`
    );

    console.log(
      `🔍 [${new Date().toISOString()}] Buscando competências existentes do usuário...`
    );

    // Buscar competências existentes do usuário em uma única query
    const { data: existingCompetencies, error: existingError } =
      await this.client
        .from('user_competencies')
        .select('competency_id')
        .eq('profile_id', profileId);

    const step2Time = Date.now() - startTime;
    console.log(
      `📊 [${new Date().toISOString()}] Busca de competências existentes concluída em ${step2Time}ms`
    );

    if (existingError) {
      console.error(
        `❌ [${new Date().toISOString()}] Erro ao buscar competências existentes:`,
        existingError
      );
      throw existingError;
    }

    const existingCompetencyIds = new Set(
      (existingCompetencies || []).map((comp: any) => comp.competency_id)
    );

    console.log(
      `📊 [${new Date().toISOString()}] Usuário já possui ${
        existingCompetencyIds.size
      } competências`
    );

    // Filtrar competências que não existem
    const missingCompetencies = competencies.filter(
      (comp: any) => !existingCompetencyIds.has(comp.id)
    );

    console.log(
      `📋 [${new Date().toISOString()}] Faltam ${
        missingCompetencies.length
      } competências para inicializar`
    );

    if (missingCompetencies.length === 0) {
      console.log(
        `✅ [${new Date().toISOString()}] Usuário ${profileId} já tem todas as competências inicializadas`
      );
      return;
    }

    console.log(
      `💾 [${new Date().toISOString()}] Preparando dados para inserção...`
    );

    // Inserir todas as competências faltantes em uma única operação
    const now = new Date().toISOString();
    const insertData = missingCompetencies.map((comp: any) => ({
      profile_id: profileId,
      competency_id: comp.id,
      level: 0,
      last_evaluated_at: now,
    }));

    console.log(
      `🚀 [${new Date().toISOString()}] Inserindo ${
        insertData.length
      } competências no banco...`
    );

    const { error: insertError } = await this.client
      .from('user_competencies')
      .insert(insertData);

    const totalTime = Date.now() - startTime;
    console.log(
      `📊 [${new Date().toISOString()}] Operação de inserção concluída em ${totalTime}ms`
    );

    if (insertError) {
      console.error(
        `❌ [${new Date().toISOString()}] Erro ao inserir competências:`,
        insertError
      );
      throw insertError;
    }

    console.log(
      `✅ [${new Date().toISOString()}] ${
        missingCompetencies.length
      } competências inicializadas para usuário ${profileId} em ${totalTime}ms`
    );
  }
}

export default new DatabaseService();
