import { BaseRepository } from './base.repository';
import { UserCompetency, CreateUserCompetencyDto, UserCompetencyWithDetails } from '../entities/user-competency.entity';

export class UserCompetencyRepository extends BaseRepository<UserCompetency> {
  constructor() {
    super('user_competencies');
  }

  /**
   * Busca todas as competências de um usuário com detalhes
   */
  async findByProfileId(profileId: string): Promise<UserCompetencyWithDetails[]> {
    // TODO: Implementar busca real quando tivermos acesso ao banco PostgreSQL
    // Por enquanto, retornamos dados mockados para testes
    console.log(`🔍 Buscando competências do usuário ${profileId}`);
    
    // Mock de competências para teste
    const mockCompetencies: UserCompetencyWithDetails[] = [
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
          description: 'Operações com matrizes, sistemas lineares'
        }
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
          description: 'Derivadas, limites, continuidade'
        }
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
          description: 'Coordenadas, distâncias, equações'
        }
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
          description: 'Eventos, distribuições, estatística'
        }
      }
    ];

    return mockCompetencies;
  }

  /**
   * Busca competências de um usuário agrupadas por nível
   */
  async findByProfileIdGroupedByLevel(profileId: string): Promise<Record<number, UserCompetencyWithDetails[]>> {
    const competencies = await this.findByProfileId(profileId);
    
    const grouped: Record<number, UserCompetencyWithDetails[]> = {
      0: [],
      1: [],
      2: [],
      3: []
    };

    competencies.forEach(comp => {
      grouped[comp.level].push(comp);
    });

    return grouped;
  }

  /**
   * Busca uma competência específica de um usuário
   */
  async findByProfileAndCompetency(profileId: string, competencyId: string): Promise<UserCompetency | null> {
    // TODO: Implementar busca real quando tivermos acesso ao banco
    console.log(`🔍 Buscando competência ${competencyId} do usuário ${profileId}`);
    
    // Mock de busca
    const mockCompetency: UserCompetency = {
      id: 'uc-mock',
      profileId,
      competencyId,
      level: 1,
      lastEvaluatedAt: new Date()
    };

    return mockCompetency;
  }

  /**
   * Cria ou atualiza o nível de uma competência para um usuário
   */
  async upsertUserCompetency(data: CreateUserCompetencyDto & { level?: number }): Promise<UserCompetency> {
    // TODO: Implementar upsert real quando tivermos acesso ao banco
    console.log(`💾 Upsert competência: usuário ${data.profileId}, competência ${data.competencyId}, nível ${data.level || 0}`);
    
    const userCompetency: UserCompetency = {
      id: 'uc-upsert',
      profileId: data.profileId,
      competencyId: data.competencyId,
      level: data.level || 0,
      lastEvaluatedAt: new Date()
    };

    return userCompetency;
  }

  /**
   * Atualiza o nível de uma competência
   */
  async updateLevel(profileId: string, competencyId: string, level: number): Promise<UserCompetency | null> {
    // TODO: Implementar atualização real quando tivermos acesso ao banco
    console.log(`📈 Atualizando nível: usuário ${profileId}, competência ${competencyId}, novo nível ${level}`);
    
    const userCompetency: UserCompetency = {
      id: 'uc-update',
      profileId,
      competencyId,
      level,
      lastEvaluatedAt: new Date()
    };

    return userCompetency;
  }
} 