import { createClient, SupabaseClient } from '@supabase/supabase-js';
import env from '../env';

export interface UserCompetency {
  profile_id: string;
  competency_id: string;
  level: number;
  last_evaluated_at: string;
}

export interface CompetencyInfo {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface UserCompetencyWithDetails {
  id: string;
  profileId: string;
  competencyId: string;
  level: number;
  lastEvaluatedAt: Date;
  competency: CompetencyInfo;
}

/**
 * Serviço otimizado para competências usando dados esparsos
 * - Nível 0 = implícito (não armazenado no banco)
 * - Apenas níveis > 0 são persistidos
 * - Cache inteligente para performance
 */
export class SparseCompetencyService {
  private client: SupabaseClient;
  private cache = new Map<string, Map<string, number>>(); // profile_id -> competency_id -> level
  private competenciesCache: CompetencyInfo[] | null = null;
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutos

  constructor() {
    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }

  /**
   * Obtém o nível de uma competência específica do usuário
   * Retorna 0 se não existir registro (nível implícito)
   */
  async getCompetencyLevel(profileId: string, competencyId: string): Promise<number> {
    // 1. Verificar cache primeiro
    const cacheKey = `user_competencies:${profileId}`;
    if (this.isCacheValid(cacheKey)) {
      const userCache = this.cache.get(cacheKey);
      return userCache?.get(competencyId) ?? 0; // 0 = nível implícito
    }

    // 2. Carregar do banco (apenas níveis > 0)
    await this.loadUserCompetencies(profileId);
    
    // 3. Retornar do cache atualizado
    const userCache = this.cache.get(cacheKey);
    return userCache?.get(competencyId) ?? 0;
  }

  /**
   * Obtém todas as competências do usuário com seus níveis
   * Inclui competências com nível 0 (implícito)
   */
  async getAllUserCompetencies(profileId: string): Promise<UserCompetencyWithDetails[]> {
    // 1. Carregar competências do usuário (níveis > 0)
    const userCompetencies = await this.getUserCompetenciesFromDatabase(profileId);
    
    // 2. Carregar todas as competências disponíveis
    const allCompetencies = await this.getAllCompetencies();
    
    // 3. Criar mapa de níveis do usuário
    const userLevels = new Map<string, number>();
    userCompetencies.forEach(comp => {
      userLevels.set(comp.competency_id, comp.level);
    });

    // 4. Retornar todas as competências com níveis (0 = implícito)
    return allCompetencies.map(competency => ({
      id: `${profileId}-${competency.id}`,
      profileId,
      competencyId: competency.id,
      level: userLevels.get(competency.id) ?? 0, // 0 = nível implícito
      lastEvaluatedAt: new Date(), // Para competências nível 0, usar data atual
      competency: {
        id: competency.id,
        name: competency.name,
        code: competency.code,
        description: competency.description,
      },
    }));
  }

  /**
   * Atualiza o nível de uma competência do usuário
   * Se nível = 0, remove o registro (dados esparsos)
   * Se nível > 0, insere/atualiza o registro
   */
  async updateCompetencyLevel(
    profileId: string, 
    competencyId: string, 
    newLevel: number
  ): Promise<void> {
    console.log(`🔄 Atualizando competência ${competencyId} para nível ${newLevel}`);

    if (newLevel === 0) {
      // Nível 0 = remover registro (dados esparsos)
      await this.removeCompetencyRecord(profileId, competencyId);
    } else {
      // Nível > 0 = inserir/atualizar registro
      await this.upsertCompetencyRecord(profileId, competencyId, newLevel);
    }

    // Invalidar cache
    this.invalidateUserCache(profileId);
  }

  /**
   * Obtém competências recomendadas para o usuário
   * Prioriza competências com níveis mais baixos
   */
  async getRecommendedCompetencies(profileId: string, limit: number = 5): Promise<CompetencyInfo[]> {
    const userCompetencies = await this.getAllUserCompetencies(profileId);
    
    // Ordenar por nível (menor primeiro) e retornar as primeiras
    return userCompetencies
      .sort((a, b) => a.level - b.level)
      .slice(0, limit)
      .map(comp => comp.competency);
  }

  /**
   * Obtém questões para uma competência específica
   */
  async getQuestionsForCompetency(competencyId: string, limit: number = 10): Promise<string[]> {
    const { data: questions, error } = await this.client
      .from('question_competencies')
      .select('question_id')
      .eq('competency_id', competencyId)
      .limit(limit);

    if (error) {
      console.error('❌ Erro ao buscar questões:', error);
      return [];
    }

    return questions?.map(q => q.question_id) ?? [];
  }

  // ===== MÉTODOS PRIVADOS =====

  /**
   * Carrega competências do usuário do banco (apenas níveis > 0)
   */
  private async getUserCompetenciesFromDatabase(profileId: string): Promise<UserCompetency[]> {
    const { data: competencies, error } = await this.client
      .from('user_competencies')
      .select(`
        profile_id,
        competency_id,
        level,
        last_evaluated_at
      `)
      .eq('profile_id', profileId);

    if (error) {
      console.error('❌ Erro ao carregar competências do usuário:', error);
      return [];
    }

    return competencies || [];
  }

  /**
   * Carrega todas as competências disponíveis
   */
  private async getAllCompetencies(): Promise<CompetencyInfo[]> {
    if (this.competenciesCache) {
      return this.competenciesCache;
    }

    const { data: competencies, error } = await this.client
      .from('competencies')
      .select('id, name, code, description')
      .order('code');

    if (error) {
      console.error('❌ Erro ao carregar competências:', error);
      return [];
    }

    this.competenciesCache = competencies || [];
    return this.competenciesCache;
  }

  /**
   * Carrega competências do usuário para o cache
   */
  private async loadUserCompetencies(profileId: string): Promise<void> {
    const cacheKey = `user_competencies:${profileId}`;
    
    // Carregar do banco
    const competencies = await this.getUserCompetenciesFromDatabase(profileId);
    
    // Popular cache
    const userCache = new Map<string, number>();
    competencies.forEach(comp => {
      userCache.set(comp.competency_id, comp.level);
    });
    
    this.cache.set(cacheKey, userCache);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);
  }

  /**
   * Remove registro de competência (nível 0)
   */
  private async removeCompetencyRecord(profileId: string, competencyId: string): Promise<void> {
    const { error } = await this.client
      .from('user_competencies')
      .delete()
      .eq('profile_id', profileId)
      .eq('competency_id', competencyId);

    if (error) {
      console.error('❌ Erro ao remover competência:', error);
      throw error;
    }

    console.log(`✅ Competência ${competencyId} removida (nível 0)`);
  }

  /**
   * Insere/atualiza registro de competência (nível > 0)
   */
  private async upsertCompetencyRecord(
    profileId: string, 
    competencyId: string, 
    level: number
  ): Promise<void> {
    const { error } = await this.client
      .from('user_competencies')
      .upsert({
        profile_id: profileId,
        competency_id: competencyId,
        level: level,
        last_evaluated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Erro ao atualizar competência:', error);
      throw error;
    }

    console.log(`✅ Competência ${competencyId} atualizada para nível ${level}`);
  }

  /**
   * Verifica se o cache é válido
   */
  private isCacheValid(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey);
    return expiry ? Date.now() < expiry : false;
  }

  /**
   * Invalida cache do usuário
   */
  private invalidateUserCache(profileId: string): void {
    const cacheKey = `user_competencies:${profileId}`;
    this.cache.delete(cacheKey);
    this.cacheExpiry.delete(cacheKey);
  }

  /**
   * Limpa todo o cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
    this.competenciesCache = null;
  }
}

// Instância singleton
const sparseCompetencyService = new SparseCompetencyService();
export default sparseCompetencyService; 