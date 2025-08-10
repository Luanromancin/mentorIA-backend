import { createClient, SupabaseClient } from '@supabase/supabase-js';
import env from '../env';

export interface UserCompetency {
  profile_id: string;
  competency_id: string;
  level: number;
  last_evaluated_at: string;
  created_at?: string;
}

export interface CompetencyInfo {
  id: string;
  name: string;
  code: string;
}

export class CompetencyCacheService {
  private client: SupabaseClient;
  private cache = new Map<string, UserCompetency[]>();
  private competenciesCache: CompetencyInfo[] | null = null;
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  constructor() {
    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }

  /**
   * Obtém todas as competências do usuário (com cache e criação automática)
   */
  async getUserCompetencies(profileId: string): Promise<UserCompetency[]> {
    const cacheKey = `user_${profileId}`;

    // 1. Verificar cache
    if (this.isCacheValid(cacheKey)) {
      console.log('📦 Cache hit para competências do usuário:', profileId);
      return this.cache.get(cacheKey)!;
    }

    console.log(
      '🔄 Cache miss, carregando competências do usuário:',
      profileId
    );

    // 2. Buscar do banco
    const competencies = await this.loadFromDatabase(profileId);

    // 3. Se não tem competências, criar automaticamente
    if (competencies.length === 0) {
      console.log('🆕 Usuário sem competências, criando automaticamente...');
      await this.initializeUserCompetencies(profileId);

      // Buscar novamente após criar
      const newCompetencies = await this.loadFromDatabase(profileId);
      console.log(
        `✅ ${newCompetencies.length} competências criadas automaticamente`
      );

      // 4. Popular cache
      this.cache.set(cacheKey, newCompetencies);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);

      return newCompetencies;
    }

    // 4. Popular cache
    this.cache.set(cacheKey, competencies);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);

    return competencies;
  }

  /**
   * Inicializa todas as competências para um usuário (método otimizado)
   */
  private async initializeUserCompetencies(profileId: string): Promise<void> {
    try {
      console.log('🎯 Inicializando competências para usuário:', profileId);

      // 1. Buscar todas as competências disponíveis
      const { data: allCompetencies, error: competenciesError } =
        await this.client.from('competencies').select('id, name').order('code');

      if (competenciesError) {
        console.error('❌ Erro ao buscar competências:', competenciesError);
        return;
      }

      if (!allCompetencies || allCompetencies.length === 0) {
        console.log('⚠️ Nenhuma competência encontrada para inicializar');
        return;
      }

      console.log(
        `📊 Encontradas ${allCompetencies.length} competências para inicializar`
      );

      // 2. Criar competências em lotes para melhor performance
      const batchSize = 50; // Processar 50 por vez
      const batches = [];

      for (let i = 0; i < allCompetencies.length; i += batchSize) {
        const batch = allCompetencies.slice(i, i + batchSize);
        batches.push(batch);
      }

      console.log(`🔄 Processando ${batches.length} lotes de competências...`);

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchData = batch.map((competency) => ({
          profile_id: profileId,
          competency_id: competency.id,
          level: 0,
          last_evaluated_at: new Date().toISOString(),
        }));

        const { error: batchError } = await this.client
          .from('user_competencies')
          .insert(batchData);

        if (batchError) {
          console.error(
            `❌ Erro ao inserir lote ${batchIndex + 1}:`,
            batchError
          );
        } else {
          console.log(
            `✅ Lote ${batchIndex + 1}/${batches.length} processado (${
              batch.length
            } competências)`
          );
        }
      }

      console.log(
        '🎉 Inicialização de competências concluída para usuário:',
        profileId
      );
    } catch (error) {
      console.error('❌ Erro ao inicializar competências:', error);
    }
  }

  /**
   * Obtém o nível de uma competência específica (cria se não existir)
   */
  async getCompetencyLevel(
    profileId: string,
    competencyId: string
  ): Promise<number> {
    // 1. Verificar se existe
    const { data: existing } = await this.client
      .from('user_competencies')
      .select('level')
      .eq('profile_id', profileId)
      .eq('competency_id', competencyId)
      .single();

    if (existing) {
      return existing.level;
    }

    // 2. Criar com nível 0 se não existir
    console.log('🆕 Criando competência sob demanda:', {
      profileId,
      competencyId,
    });

    const { error: insertError } = await this.client
      .from('user_competencies')
      .insert({
        profile_id: profileId,
        competency_id: competencyId,
        level: 0,
        last_evaluated_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('❌ Erro ao criar competência:', insertError);
      return 0; // Fallback
    }

    // 3. Invalidar cache do usuário
    this.invalidateUserCache(profileId);

    return 0;
  }

  /**
   * Atualiza o nível de uma competência
   */
  async updateCompetencyLevel(
    profileId: string,
    competencyId: string,
    newLevel: number
  ): Promise<void> {
    console.log('📝 Atualizando competência:', {
      profileId,
      competencyId,
      newLevel,
    });

    const { error } = await this.client.from('user_competencies').upsert(
      {
        profile_id: profileId,
        competency_id: competencyId,
        level: newLevel,
        last_evaluated_at: new Date().toISOString(),
      },
      {
        onConflict: 'profile_id,competency_id',
      }
    );

    if (error) {
      console.error('❌ Erro ao atualizar competência:', error);
      throw error;
    }

    // Invalidar cache do usuário
    this.invalidateUserCache(profileId);
  }

  /**
   * Obtém todas as competências disponíveis no sistema
   */
  async getAllCompetencies(): Promise<CompetencyInfo[]> {
    // 1. Verificar cache
    if (this.competenciesCache) {
      console.log('📦 Cache hit para competências do sistema');
      return this.competenciesCache;
    }

    console.log('🔄 Cache miss, carregando competências do sistema');

    // 2. Buscar do banco
    const { data: competencies, error } = await this.client
      .from('competencies')
      .select('id, name, code')
      .order('code');

    if (error) {
      console.error('❌ Erro ao buscar competências:', error);
      return [];
    }

    // 3. Popular cache
    this.competenciesCache = competencies || [];

    return this.competenciesCache;
  }

  /**
   * Obtém competências por nível (para seleção de questões)
   */
  async getCompetenciesByLevel(
    profileId: string,
    targetLevel: number,
    limit: number = 10
  ): Promise<CompetencyInfo[]> {
    // 1. Obter competências do usuário
    const userCompetencies = await this.getUserCompetencies(profileId);

    // 2. Filtrar por nível
    const matchingCompetencies = userCompetencies
      .filter((uc) => uc.level === targetLevel)
      .slice(0, limit);

    // 3. Obter informações das competências
    const allCompetencies = await this.getAllCompetencies();
    const competencyMap = new Map(allCompetencies.map((c) => [c.id, c]));

    return matchingCompetencies
      .map((uc) => competencyMap.get(uc.competency_id))
      .filter(Boolean) as CompetencyInfo[];
  }

  /**
   * Obtém estatísticas de competências do usuário
   */
  async getUserCompetencyStats(profileId: string): Promise<{
    total: number;
    completed: number;
    averageLevel: number;
    byLevel: Record<number, number>;
  }> {
    const userCompetencies = await this.getUserCompetencies(profileId);
    const allCompetencies = await this.getAllCompetencies();

    const total = allCompetencies.length;
    const completed = userCompetencies.length;
    const averageLevel =
      completed > 0
        ? userCompetencies.reduce((sum, uc) => sum + uc.level, 0) / completed
        : 0;

    const byLevel = userCompetencies.reduce((acc, uc) => {
      acc[uc.level] = (acc[uc.level] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      total,
      completed,
      averageLevel: Math.round(averageLevel * 100) / 100,
      byLevel,
    };
  }

  /**
   * Carrega competências do banco de dados
   */
  private async loadFromDatabase(profileId: string): Promise<UserCompetency[]> {
    const { data: existing, error } = await this.client
      .from('user_competencies')
      .select('*')
      .eq('profile_id', profileId);

    if (error) {
      console.error('❌ Erro ao carregar competências do banco:', error);
      return [];
    }

    return existing || [];
  }

  /**
   * Verifica se o cache é válido
   */
  private isCacheValid(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey);
    return expiry ? Date.now() < expiry : false;
  }

  /**
   * Invalida o cache de um usuário
   */
  private invalidateUserCache(profileId: string): void {
    const cacheKey = `user_${profileId}`;
    this.cache.delete(cacheKey);
    this.cacheExpiry.delete(cacheKey);
    console.log('🗑️ Cache invalidado para usuário:', profileId);
  }

  /**
   * Limpa todo o cache (útil para testes)
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
    this.competenciesCache = null;
    console.log('🧹 Cache limpo');
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats(): {
    userCacheSize: number;
    competenciesCacheSize: number;
    totalExpiryEntries: number;
  } {
    return {
      userCacheSize: this.cache.size,
      competenciesCacheSize: this.competenciesCache ? 1 : 0,
      totalExpiryEntries: this.cacheExpiry.size,
    };
  }
}

export default new CompetencyCacheService();
