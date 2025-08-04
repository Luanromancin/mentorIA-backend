import { BaseRepository } from './base.repository';
import {
  UserCompetency,
  CreateUserCompetencyDto,
  UserCompetencyWithDetails,
} from '../entities/user-competency.entity';
import databaseService from '../services/database.service';
import competencyCacheService from '../services/competency-cache.service';
import { PerformanceMonitor } from '../utils/performance';

export class UserCompetencyRepository extends BaseRepository<UserCompetency> {
  constructor() {
    super('user_competencies');
  }

  /**
   * Busca todas as competências de um usuário com detalhes
   */
  async findByProfileId(
    profileId: string
  ): Promise<UserCompetencyWithDetails[]> {
    const startTime = Date.now();
    console.log(`🏁 [${new Date().toISOString()}] === INICIANDO findByProfileId ===`);
    PerformanceMonitor.startTimer('findByProfileId');
    
    try {
      console.log(`🔍 [${new Date().toISOString()}] Verificando cache...`);
      
      // 1. Usar o sistema de cache corrigido (com criação automática)
      console.log(`🔄 [${new Date().toISOString()}] Usando sistema de cache corrigido...`);
      
      const cachedCompetencies = await competencyCacheService.getUserCompetencies(profileId);
      
      const searchTime = Date.now() - startTime;
      console.log(`📊 [${new Date().toISOString()}] Busca concluída em ${searchTime}ms`);
      
      console.log(`🔄 [${new Date().toISOString()}] Convertendo dados para formato esperado...`);
      
      // Converte para o formato esperado
      const competencies: UserCompetencyWithDetails[] = (cachedCompetencies || []).map((comp: any) => ({
        id: `${comp.profile_id}-${comp.competency_id}`,
        profileId: comp.profile_id,
        competencyId: comp.competency_id,
        level: comp.level || 0,
        lastEvaluatedAt: comp.last_evaluated_at ? new Date(comp.last_evaluated_at) : new Date(),
        competency: {
          id: comp.competencies?.id || comp.competency_id,
          code: comp.competencies?.code || '',
          name: comp.competencies?.name || 'Competência',
          description: comp.competencies?.description || '',
        },
      }));

      const totalTime = Date.now() - startTime;
      console.log(`✅ [${new Date().toISOString()}] Encontradas ${competencies.length} competências para o usuário ${profileId} em ${totalTime}ms`);
      console.log(`🏁 [${new Date().toISOString()}] === FINALIZANDO findByProfileId ===`);
      
      PerformanceMonitor.endTimer('findByProfileId');
      return competencies;
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error(`❌ [${new Date().toISOString()}] Erro ao buscar competências do usuário (${totalTime}ms):`, error);
      
      // Fallback para dados mockados em caso de erro
      console.log(`⚠️ [${new Date().toISOString()}] Usando dados mockados como fallback`);
      PerformanceMonitor.endTimer('findByProfileId');
      return this.getMockCompetencies(profileId);
    }
  }

  /**
   * Busca competências de um usuário agrupadas por nível
   */
  async findByProfileIdGroupedByLevel(
    profileId: string
  ): Promise<Record<number, UserCompetencyWithDetails[]>> {
    const competencies = await this.findByProfileId(profileId);

    const grouped: Record<number, UserCompetencyWithDetails[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
    };

    competencies.forEach((comp) => {
      grouped[comp.level].push(comp);
    });

    return grouped;
  }

  /**
   * Busca uma competência específica de um usuário
   */
  async findByProfileAndCompetency(
    profileId: string,
    competencyId: string
  ): Promise<UserCompetency | null> {
    try {
      console.log(
        `🔍 Buscando competência ${competencyId} do usuário ${profileId} no banco real`
      );

      const dbCompetency = await databaseService.getUserCompetency(profileId, competencyId);
      
      if (!dbCompetency) {
        return null;
      }

      const competency: UserCompetency = {
        id: `${profileId}-${competencyId}`,
        profileId: dbCompetency.profile_id,
        competencyId: dbCompetency.competency_id,
        level: dbCompetency.level || 0,
        lastEvaluatedAt: dbCompetency.last_evaluated_at ? new Date(dbCompetency.last_evaluated_at) : new Date(),
      };

      return competency;
    } catch (error) {
      console.error('❌ Erro ao buscar competência específica:', error);
      
      // Fallback para mock
      console.log('⚠️ Usando dados mockados como fallback');
      return this.getMockCompetency(profileId, competencyId);
    }
  }

  /**
   * Cria ou atualiza o nível de uma competência para um usuário
   */
  async upsertUserCompetency(
    data: CreateUserCompetencyDto & { level?: number }
  ): Promise<UserCompetency> {
    try {
      console.log(
        `💾 Upsert competência no banco real: usuário ${data.profileId}, competência ${
          data.competencyId
        }, nível ${data.level || 0}`
      );

      await databaseService.updateUserCompetencyLevel(
        data.profileId,
        data.competencyId,
        data.level || 0
      );

      const userCompetency: UserCompetency = {
        id: `${data.profileId}-${data.competencyId}`,
        profileId: data.profileId,
        competencyId: data.competencyId,
        level: data.level || 0,
        lastEvaluatedAt: new Date(),
      };

      return userCompetency;
    } catch (error) {
      console.error('❌ Erro ao fazer upsert da competência:', error);
      
      // Fallback para mock
      console.log('⚠️ Usando dados mockados como fallback');
      return this.getMockUpsertCompetency(data);
    }
  }

  /**
   * Atualiza o nível de uma competência
   */
  async updateLevel(
    profileId: string,
    competencyId: string,
    level: number
  ): Promise<UserCompetency | null> {
    try {
      console.log(
        `📈 Atualizando nível no banco real: usuário ${profileId}, competência ${competencyId}, novo nível ${level}`
      );

      await databaseService.updateUserCompetencyLevel(profileId, competencyId, level);

      const userCompetency: UserCompetency = {
        id: `${profileId}-${competencyId}`,
        profileId,
        competencyId,
        level,
        lastEvaluatedAt: new Date(),
      };

      return userCompetency;
    } catch (error) {
      console.error('❌ Erro ao atualizar nível da competência:', error);
      
      // Fallback para mock
      console.log('⚠️ Usando dados mockados como fallback');
      return this.getMockUpdateCompetency(profileId, competencyId, level);
    }
  }

  // Métodos de fallback com dados mockados
  private getMockCompetencies(profileId: string): UserCompetencyWithDetails[] {
    return [
      {
        id: 'uc-1',
        profileId,
        competencyId: 'comp-1',
        level: 2,
        lastEvaluatedAt: new Date(),
        competency: {
          id: 'comp-1',
          code: 'C1',
          name: 'Álgebra Linear',
          description: 'Operações com matrizes, sistemas lineares',
        },
      },
      {
        id: 'uc-2',
        profileId,
        competencyId: 'comp-2',
        level: 1,
        lastEvaluatedAt: new Date(),
        competency: {
          id: 'comp-2',
          code: 'C2',
          name: 'Cálculo Diferencial',
          description: 'Derivadas, limites, continuidade',
        },
      },
      {
        id: 'uc-3',
        profileId,
        competencyId: 'comp-3',
        level: 0,
        lastEvaluatedAt: new Date(),
        competency: {
          id: 'comp-3',
          code: 'C3',
          name: 'Geometria Analítica',
          description: 'Coordenadas, distâncias, equações',
        },
      },
      {
        id: 'uc-4',
        profileId,
        competencyId: 'comp-4',
        level: 0,
        lastEvaluatedAt: new Date(),
        competency: {
          id: 'comp-4',
          code: 'C4',
          name: 'Probabilidade',
          description: 'Eventos, distribuições, estatística',
        },
      },
    ];
  }

  private getMockCompetency(profileId: string, competencyId: string): UserCompetency {
    return {
      id: 'uc-mock',
      profileId,
      competencyId,
      level: 1,
      lastEvaluatedAt: new Date(),
    };
  }

  private getMockUpsertCompetency(data: CreateUserCompetencyDto & { level?: number }): UserCompetency {
    return {
      id: 'uc-upsert',
      profileId: data.profileId,
      competencyId: data.competencyId,
      level: data.level || 0,
      lastEvaluatedAt: new Date(),
    };
  }

  private getMockUpdateCompetency(profileId: string, competencyId: string, level: number): UserCompetency {
    return {
      id: 'uc-update',
      profileId,
      competencyId,
      level,
      lastEvaluatedAt: new Date(),
    };
  }
}
