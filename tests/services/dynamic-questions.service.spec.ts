import { DynamicQuestionsService } from '../../src/services/dynamic-questions.service';
import { UserCompetencyRepository } from '../../src/repositories/user-competency.repository';

describe('DynamicQuestionsService', () => {
  let service: DynamicQuestionsService;
  let userCompetencyRepository: UserCompetencyRepository;

  beforeEach(() => {
    userCompetencyRepository = new UserCompetencyRepository();
    service = new DynamicQuestionsService(userCompetencyRepository);
  });

  describe('getDynamicQuestions', () => {
    it('deve selecionar questões baseado na regra de níveis', async () => {
      // Arrange: Mock das competências do usuário
      const mockUserCompetencies = {
        0: [
          {
            id: 'uc-3',
            profileId: 'user-1',
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
            profileId: 'user-1',
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
        ],
        1: [
          {
            id: 'uc-2',
            profileId: 'user-1',
            competencyId: 'comp-2',
            level: 1,
            lastEvaluatedAt: new Date(),
            competency: {
              id: 'comp-2',
              code: 'C2',
              name: 'Cálculo Diferencial',
              description: 'Derivadas, limites, continuidade'
            }
          }
        ],
        2: [
          {
            id: 'uc-1',
            profileId: 'user-1',
            competencyId: 'comp-1',
            level: 2,
            lastEvaluatedAt: new Date(),
            competency: {
              id: 'comp-1',
              code: 'C1',
              name: 'Álgebra Linear',
              description: 'Operações com matrizes, sistemas lineares'
            }
          }
        ],
        3: []
      };

      // Mock do método findByProfileIdGroupedByLevel
      jest.spyOn(userCompetencyRepository, 'findByProfileIdGroupedByLevel')
        .mockResolvedValue(mockUserCompetencies);

      // Act: Buscar questões dinâmicas
      const result = await service.getDynamicQuestions({
        profileId: 'user-1',
        maxQuestions: 5
      });

      // Assert: Verificar se a lógica está correta
      expect(result).toHaveLength(5);
      
      // Verificar se as questões estão ordenadas por nível (maior primeiro)
      const competencyLevels = result.map(q => q.competencyLevel);
      // Com limite de 5 questões: 1 do nível 2, 2 do nível 1, 2 do nível 0 (distribuído entre 2 competências)
      expect(competencyLevels).toEqual([2, 1, 1, 0, 0]); 
      
      // Verificar se as questões têm as propriedades corretas
      result.forEach(question => {
        expect(question).toHaveProperty('id');
        expect(question).toHaveProperty('title');
        expect(question).toHaveProperty('alternatives');
        expect(question).toHaveProperty('competencyLevel');
        expect(question.alternatives).toHaveLength(5);
      });

      // Verificar se o repositório foi chamado
      expect(userCompetencyRepository.findByProfileIdGroupedByLevel)
        .toHaveBeenCalledWith('user-1');
    });

    it('deve respeitar o limite máximo de questões', async () => {
      // Arrange: Mock com muitas competências
      const mockUserCompetencies = {
        0: Array.from({ length: 10 }, (_, i) => ({
          id: `uc-${i}`,
          profileId: 'user-1',
          competencyId: `comp-${i}`,
          level: 0,
          lastEvaluatedAt: new Date(),
          competency: {
            id: `comp-${i}`,
            code: `C${i + 1}`,
            name: `Competência ${i + 1}`,
            description: `Descrição ${i + 1}`
          }
        })),
        1: [],
        2: [],
        3: []
      };

      jest.spyOn(userCompetencyRepository, 'findByProfileIdGroupedByLevel')
        .mockResolvedValue(mockUserCompetencies);

      // Act: Buscar com limite de 3 questões
      const result = await service.getDynamicQuestions({
        profileId: 'user-1',
        maxQuestions: 3
      });

      // Assert: Verificar se respeitou o limite
      expect(result).toHaveLength(3);
    });

    it('deve retornar array vazio se não há competências', async () => {
      // Arrange: Mock sem competências
      const mockUserCompetencies = {
        0: [],
        1: [],
        2: [],
        3: []
      };

      jest.spyOn(userCompetencyRepository, 'findByProfileIdGroupedByLevel')
        .mockResolvedValue(mockUserCompetencies);

      // Act: Buscar questões
      const result = await service.getDynamicQuestions({
        profileId: 'user-1',
        maxQuestions: 20
      });

      // Assert: Verificar se retorna array vazio
      expect(result).toHaveLength(0);
    });

    it('deve priorizar competências de nível mais alto', async () => {
      // Arrange: Mock com competências em diferentes níveis
      const mockUserCompetencies = {
        0: [
          {
            id: 'uc-1',
            profileId: 'user-1',
            competencyId: 'comp-1',
            level: 0,
            lastEvaluatedAt: new Date(),
            competency: {
              id: 'comp-1',
              code: 'C1',
              name: 'Competência Nível 0',
              description: 'Descrição'
            }
          }
        ],
        1: [
          {
            id: 'uc-2',
            profileId: 'user-1',
            competencyId: 'comp-2',
            level: 1,
            lastEvaluatedAt: new Date(),
            competency: {
              id: 'comp-2',
              code: 'C2',
              name: 'Competência Nível 1',
              description: 'Descrição'
            }
          }
        ],
        2: [
          {
            id: 'uc-3',
            profileId: 'user-1',
            competencyId: 'comp-3',
            level: 2,
            lastEvaluatedAt: new Date(),
            competency: {
              id: 'comp-3',
              code: 'C3',
              name: 'Competência Nível 2',
              description: 'Descrição'
            }
          }
        ],
        3: []
      };

      jest.spyOn(userCompetencyRepository, 'findByProfileIdGroupedByLevel')
        .mockResolvedValue(mockUserCompetencies);

      // Act: Buscar questões
      const result = await service.getDynamicQuestions({
        profileId: 'user-1',
        maxQuestions: 6
      });

      // Assert: Verificar se priorizou nível mais alto
      expect(result).toHaveLength(6);
      const competencyLevels = result.map(q => q.competencyLevel);
      // Deve retornar: 1 do nível 2, 2 do nível 1, 3 do nível 0
      expect(competencyLevels).toEqual([2, 1, 1, 0, 0, 0]);
    });

    it('deve distribuir questões proporcionalmente entre competências do mesmo nível', async () => {
      // Arrange: Mock com 3 competências no nível 0
      const mockUserCompetencies = {
        0: [
          {
            id: 'uc-1',
            profileId: 'user-1',
            competencyId: 'comp-1',
            level: 0,
            lastEvaluatedAt: new Date(),
            competency: {
              id: 'comp-1',
              code: 'C1',
              name: 'Competência A',
              description: 'Descrição'
            }
          },
          {
            id: 'uc-2',
            profileId: 'user-1',
            competencyId: 'comp-2',
            level: 0,
            lastEvaluatedAt: new Date(),
            competency: {
              id: 'comp-2',
              code: 'C2',
              name: 'Competência B',
              description: 'Descrição'
            }
          },
          {
            id: 'uc-3',
            profileId: 'user-1',
            competencyId: 'comp-3',
            level: 0,
            lastEvaluatedAt: new Date(),
            competency: {
              id: 'comp-3',
              code: 'C3',
              name: 'Competência C',
              description: 'Descrição'
            }
          }
        ],
        1: [],
        2: [],
        3: []
      };

      jest.spyOn(userCompetencyRepository, 'findByProfileIdGroupedByLevel')
        .mockResolvedValue(mockUserCompetencies);

      // Act: Buscar com limite que não cabe todas as questões
      const result = await service.getDynamicQuestions({
        profileId: 'user-1',
        maxQuestions: 5
      });

      // Assert: Verificar distribuição proporcional
      expect(result).toHaveLength(5);
      const competencyLevels = result.map(q => q.competencyLevel);
      expect(competencyLevels).toEqual([0, 0, 0, 0, 0]); // Todas do nível 0
      
      // Verificar se as questões vêm de competências diferentes
      const questionTitles = result.map(q => q.title);
      expect(questionTitles.some(title => title.includes('Competência A'))).toBe(true);
      expect(questionTitles.some(title => title.includes('Competência B'))).toBe(true);
      expect(questionTitles.some(title => title.includes('Competência C'))).toBe(true);
    });

    it('deve ignorar competências de nível 3 (domínio)', async () => {
      // Arrange: Mock com competências incluindo nível 3
      const mockUserCompetencies = {
        0: [
          {
            id: 'uc-1',
            profileId: 'user-1',
            competencyId: 'comp-1',
            level: 0,
            lastEvaluatedAt: new Date(),
            competency: {
              id: 'comp-1',
              code: 'C1',
              name: 'Competência Nível 0',
              description: 'Descrição'
            }
          }
        ],
        1: [],
        2: [],
        3: [
          {
            id: 'uc-2',
            profileId: 'user-1',
            competencyId: 'comp-2',
            level: 3,
            lastEvaluatedAt: new Date(),
            competency: {
              id: 'comp-2',
              code: 'C2',
              name: 'Competência Nível 3',
              description: 'Descrição'
            }
          }
        ]
      };

      jest.spyOn(userCompetencyRepository, 'findByProfileIdGroupedByLevel')
        .mockResolvedValue(mockUserCompetencies);

      // Act: Buscar questões
      const result = await service.getDynamicQuestions({
        profileId: 'user-1',
        maxQuestions: 10
      });

      // Assert: Verificar se ignorou nível 3
      expect(result).toHaveLength(3); // Apenas 3 questões do nível 0
      const competencyLevels = result.map(q => q.competencyLevel);
      expect(competencyLevels).toEqual([0, 0, 0]); // Todas do nível 0
    });

    it('deve usar maxQuestions padrão quando não especificado', async () => {
      // Arrange: Mock simples
      const mockUserCompetencies = {
        0: [
          {
            id: 'uc-1',
            profileId: 'user-1',
            competencyId: 'comp-1',
            level: 0,
            lastEvaluatedAt: new Date(),
            competency: {
              id: 'comp-1',
              code: 'C1',
              name: 'Competência Teste',
              description: 'Descrição'
            }
          }
        ],
        1: [],
        2: [],
        3: []
      };

      jest.spyOn(userCompetencyRepository, 'findByProfileIdGroupedByLevel')
        .mockResolvedValue(mockUserCompetencies);

      // Act: Buscar sem especificar maxQuestions
      const result = await service.getDynamicQuestions({
        profileId: 'user-1'
      });

      // Assert: Verificar se usou padrão (20)
      expect(result).toHaveLength(3); // 1 competência × 3 questões = 3 questões
    });

    it('deve lidar com cenário de muitas competências e limite baixo', async () => {
      // Arrange: Mock com muitas competências em diferentes níveis
      const mockUserCompetencies = {
        0: Array.from({ length: 5 }, (_, i) => ({
          id: `uc-${i}`,
          profileId: 'user-1',
          competencyId: `comp-${i}`,
          level: 0,
          lastEvaluatedAt: new Date(),
          competency: {
            id: `comp-${i}`,
            code: `C${i + 1}`,
            name: `Competência ${i + 1}`,
            description: 'Descrição'
          }
        })),
        1: Array.from({ length: 3 }, (_, i) => ({
          id: `uc-${i + 5}`,
          profileId: 'user-1',
          competencyId: `comp-${i + 5}`,
          level: 1,
          lastEvaluatedAt: new Date(),
          competency: {
            id: `comp-${i + 5}`,
            code: `C${i + 6}`,
            name: `Competência ${i + 6}`,
            description: 'Descrição'
          }
        })),
        2: Array.from({ length: 2 }, (_, i) => ({
          id: `uc-${i + 8}`,
          profileId: 'user-1',
          competencyId: `comp-${i + 8}`,
          level: 2,
          lastEvaluatedAt: new Date(),
          competency: {
            id: `comp-${i + 8}`,
            code: `C${i + 9}`,
            name: `Competência ${i + 9}`,
            description: 'Descrição'
          }
        })),
        3: []
      };

      jest.spyOn(userCompetencyRepository, 'findByProfileIdGroupedByLevel')
        .mockResolvedValue(mockUserCompetencies);

      // Act: Buscar com limite baixo
      const result = await service.getDynamicQuestions({
        profileId: 'user-1',
        maxQuestions: 4
      });

      // Assert: Verificar se respeitou limite e priorizou corretamente
      expect(result).toHaveLength(4);
      const competencyLevels = result.map(q => q.competencyLevel);
      // Deve priorizar: 2 do nível 2, 2 do nível 1
      expect(competencyLevels).toEqual([2, 2, 1, 1]);
    });
  });

  describe('updateCompetencyLevel', () => {
    it('deve logar a atualização de nível', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      await service.updateCompetencyLevel('user-1', 'Álgebra Linear', true);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📈 Atualizando competência Álgebra Linear para usuário user-1')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📊 Resposta: correta')
      );

      consoleSpy.mockRestore();
    });

    it('deve logar resposta incorreta', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      await service.updateCompetencyLevel('user-1', 'Cálculo Diferencial', false);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📈 Atualizando competência Cálculo Diferencial para usuário user-1')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📊 Resposta: incorreta')
      );

      consoleSpy.mockRestore();
    });
  });
}); 