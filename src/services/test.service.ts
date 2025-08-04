import { TestEntity } from '../entities/test.entity';
import TestModel from '../models/test.model';
import OtherRepository from '../repositories/other.repository';
import TestRepository from '../repositories/test.repository';
import { HttpNotFoundError } from '../utils/errors/http.error';
import { DynamicQuestionsService } from './dynamic-questions.service';
import { UserCompetencyRepository } from '../repositories/user-competency.repository';

class TestServiceMessageCode {
  public static readonly test_not_found = 'test_not_found';
}

class TestService {
  private testRepository: TestRepository;
  private otherRepository: OtherRepository;
  private dynamicQuestionsService: DynamicQuestionsService;
  private userCompetencyRepository: UserCompetencyRepository;

  constructor(
    testRepository: TestRepository,
    otherRepository: OtherRepository,
    dynamicQuestionsService: DynamicQuestionsService,
    userCompetencyRepository: UserCompetencyRepository
  ) {
    this.testRepository = testRepository;
    this.otherRepository = otherRepository;
    this.dynamicQuestionsService = dynamicQuestionsService;
    this.userCompetencyRepository = userCompetencyRepository;
  }

  public async getTests(): Promise<TestModel[]> {
    const testsEntity = await this.testRepository.getTests();

    const testsModel = testsEntity.map((test) => new TestModel(test));

    return testsModel;
  }

  public async getOtherTests(): Promise<TestModel[]> {
    const testsEntity = await this.otherRepository.getTests();

    const testsModel = testsEntity.map((test) => new TestModel(test));

    return testsModel;
  }

  public async getTest(id: string): Promise<TestModel> {
    const testEntity = await this.testRepository.getTest(id);

    if (!testEntity) {
      throw new HttpNotFoundError({
        msg: 'Test not found',
        msgCode: TestServiceMessageCode.test_not_found,
      });
    }

    const testModel = new TestModel(testEntity);

    return testModel;
  }

  public async createTest(data: TestEntity): Promise<TestModel> {
    const testEntity = await this.testRepository.createTest(data);
    const testModel = new TestModel(testEntity);

    return testModel;
  }

  public async updateTest(id: string, data: TestEntity): Promise<TestModel> {
    const testEntity = await this.testRepository.updateTest(id, data);

    if (!testEntity) {
      throw new HttpNotFoundError({
        msg: 'Test not found',
        msgCode: TestServiceMessageCode.test_not_found,
      });
    }

    const testModel = new TestModel(testEntity);

    return testModel;
  }

  public async deleteTest(id: string): Promise<void> {
    await this.testRepository.deleteTest(id);
  }

  // Novo método: Carregar sessão completa (competências + questões)
  public async getSessionQuestions(profileId: string, maxQuestions: number) {
    console.log(`🔧 Carregando sessão para usuário ${profileId}, máximo: ${maxQuestions}`);
    
    // 1. Carregar competências do usuário (uma vez só)
    const userCompetencies = await this.userCompetencyRepository.findByProfileIdGroupedByLevel(profileId);
    console.log('📊 Competências carregadas:', {
      nivel0: userCompetencies[0].length,
      nivel1: userCompetencies[1].length,
      nivel2: userCompetencies[2].length,
      nivel3: userCompetencies[3].length,
    });

    // 2. Carregar questões baseadas nas competências
    const questions = await this.dynamicQuestionsService.getDynamicQuestions({
      profileId,
      maxQuestions
    });

    console.log(`✅ Sessão carregada: ${questions.length} questões`);

    return {
      userCompetencies,
      questions,
      sessionId: `session_${Date.now()}_${profileId}`
    };
  }

  // Novo método: Finalizar sessão e atualizar competências
  public async completeSession(profileId: string, answers: Array<{
    questionId: string;
    answer: string;
    isCorrect: boolean;
    competencyName: string;
  }>) {
    console.log(`🏁 Finalizando sessão para usuário ${profileId} com ${answers.length} respostas`);

    // Processar todas as respostas e atualizar competências
    for (const answer of answers) {
      await this.dynamicQuestionsService.updateCompetencyLevel(
        profileId,
        answer.competencyName,
        answer.isCorrect
      );
    }

    console.log('✅ Sessão finalizada e competências atualizadas');
  }

  // Pré-carregar competências do usuário
  public async preloadUserCompetencies(profileId: string) {
    console.log(`🚀 Pré-carregando competências para usuário ${profileId}`);
    
    try {
      const competencies = await this.userCompetencyRepository.findByProfileId(profileId);
      console.log(`✅ Pré-carregamento concluído: ${competencies.length} competências`);
      return competencies;
    } catch (error) {
      console.error('❌ Erro no pré-carregamento:', error);
      return [];
    }
  }
}

export default TestService;
