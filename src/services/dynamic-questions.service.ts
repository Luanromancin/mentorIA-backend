import { UserCompetencyRepository } from '../repositories/user-competency.repository';
import { UserCompetencyWithDetails } from '../entities/user-competency.entity';

export interface DynamicQuestionRequest {
  profileId: string;
  maxQuestions?: number; // Default 20
}

export interface QuestionWithCompetency {
  id: string;
  title: string;
  year: number;
  questionIndex: number;
  language: string;
  field: string;
  problemStatement: string;
  files: any[];
  topicName?: string;
  subtopicName?: string;
  explanation?: string;
  alternatives: Array<{
    id: string;
    letter: string;
    text: string;
    file?: string;
    isCorrect: boolean;
  }>;
  competencyLevel: number; // Nível da competência para esta questão
}

export class DynamicQuestionsService {
  constructor(
    private userCompetencyRepository: UserCompetencyRepository
  ) {}

  /**
   * Busca questões dinâmicas baseadas no nível de competência do usuário
   */
  async getDynamicQuestions(request: DynamicQuestionRequest): Promise<QuestionWithCompetency[]> {
    const { profileId, maxQuestions = 20 } = request;

    console.log(`🔧 Buscando questões dinâmicas para usuário ${profileId}, máximo: ${maxQuestions}`);

    // 1. Buscar competências do usuário agrupadas por nível
    const userCompetencies = await this.userCompetencyRepository.findByProfileIdGroupedByLevel(profileId);
    
    console.log('📊 Competências do usuário por nível:', {
      nivel0: userCompetencies[0].length,
      nivel1: userCompetencies[1].length,
      nivel2: userCompetencies[2].length,
      nivel3: userCompetencies[3].length
    });

    // 2. Aplicar regra de seleção: maior nível primeiro
    const questionsToSelect = this.calculateQuestionsPerLevel(userCompetencies, maxQuestions);
    
    console.log('🎯 Questões a selecionar por nível:', questionsToSelect);

    // 3. Buscar questões para cada competência
    const selectedQuestions: QuestionWithCompetency[] = [];
    
    // Ordem de prioridade: nível 2, nível 1, nível 0
    const priorityLevels = [2, 1, 0];
    
    for (const level of priorityLevels) {
      const competencies = userCompetencies[level];
      const questionsForLevel = questionsToSelect[level];
      
      if (questionsForLevel === 0 || competencies.length === 0) continue;
      
      // Distribuir questões entre as competências do nível
      const questionsPerCompetency = Math.floor(questionsForLevel / competencies.length);
      const remainingQuestions = questionsForLevel % competencies.length;
      
      for (let i = 0; i < competencies.length; i++) {
        if (selectedQuestions.length >= maxQuestions) break;
        
        const competency = competencies[i];
        const questionsForThisCompetency = questionsPerCompetency + (i < remainingQuestions ? 1 : 0);
        
        if (questionsForThisCompetency === 0) continue;
        
        const questionsNeeded = Math.min(
          questionsForThisCompetency,
          maxQuestions - selectedQuestions.length
        );
        
        const questions = await this.getQuestionsForCompetency(
          competency.competency!.name, // subtopic_name
          questionsNeeded,
          profileId // Para evitar questões já respondidas
        );
        
        // Adicionar nível da competência a cada questão
        const questionsWithLevel = questions.map(q => ({
          ...q,
          competencyLevel: level
        }));
        
        selectedQuestions.push(...questionsWithLevel);
      }
    }

    console.log(`✅ ${selectedQuestions.length} questões selecionadas dinamicamente`);
    return selectedQuestions;
  }

  /**
   * Calcula quantas questões selecionar por nível baseado na regra
   */
  private calculateQuestionsPerLevel(
    userCompetencies: Record<number, UserCompetencyWithDetails[]>,
    maxQuestions: number
  ): Record<number, number> {
    const questionsPerLevel: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    
    // Regra: nível 0 = 3 questões, nível 1 = 2 questões, nível 2 = 1 questão, nível 3 = 0 questões
    const questionsPerCompetency: Record<number, number> = { 0: 3, 1: 2, 2: 1, 3: 0 };
    
    let totalQuestions = 0;
    
    // Calcular para cada nível (prioridade: 2, 1, 0)
    for (const level of [2, 1, 0]) {
      const competencies = userCompetencies[level];
      const questionsPerComp = questionsPerCompetency[level];
      
      if (competencies.length === 0) continue;
      
      const questionsForLevel = competencies.length * questionsPerComp;
      const remainingCapacity = maxQuestions - totalQuestions;
      
      if (questionsForLevel <= remainingCapacity) {
        // Cabe todas as questões do nível
        questionsPerLevel[level] = questionsForLevel;
        totalQuestions += questionsForLevel;
      } else {
        // Não cabe todas, distribuir proporcionalmente
        if (remainingCapacity > 0) {
          questionsPerLevel[level] = remainingCapacity;
          totalQuestions += remainingCapacity;
        }
      }
      
      if (totalQuestions >= maxQuestions) break;
    }
    
    return questionsPerLevel;
  }

  /**
   * Busca questões para uma competência específica
   */
  private async getQuestionsForCompetency(
    subtopicName: string,
    count: number,
    _profileId: string
  ): Promise<any[]> {
    // TODO: Implementar busca real quando tivermos acesso ao banco
    // Por enquanto, retornamos dados mockados
    console.log(`🔍 Buscando ${count} questões para competência: ${subtopicName}`);
    
    // Mock de questões para teste
    const mockQuestions = Array.from({ length: count }, (_, i) => ({
      id: `question-${subtopicName}-${i}`,
      title: `Questão ${i + 1} - ${subtopicName}`,
      year: 2023,
      questionIndex: i + 1,
      language: 'pt-BR',
      field: 'matemática',
      problemStatement: `Enunciado da questão ${i + 1} sobre ${subtopicName}`,
      files: [],
      topicName: 'Matemática',
      subtopicName: subtopicName,
      explanation: `Explicação da questão ${i + 1}`,
      alternatives: [
        { id: 'a', letter: 'A', text: 'Alternativa A', isCorrect: i === 0 },
        { id: 'b', letter: 'B', text: 'Alternativa B', isCorrect: i === 1 },
        { id: 'c', letter: 'C', text: 'Alternativa C', isCorrect: i === 2 },
        { id: 'd', letter: 'D', text: 'Alternativa D', isCorrect: i === 3 },
        { id: 'e', letter: 'E', text: 'Alternativa E', isCorrect: i === 4 }
      ]
    }));

    return mockQuestions;
  }



  /**
   * Atualiza o nível de competência baseado na resposta do usuário
   */
  async updateCompetencyLevel(
    profileId: string,
    competencyName: string,
    isCorrect: boolean
  ): Promise<void> {
    // TODO: Implementar atualização real quando tivermos acesso ao banco
    console.log(`📈 Atualizando competência ${competencyName} para usuário ${profileId}`);
    console.log(`📊 Resposta: ${isCorrect ? 'correta' : 'incorreta'}`);
    
    // Mock da lógica de atualização
    const mockCurrentLevel = 1; // Nível mockado
    let newLevel = mockCurrentLevel;
    
    if (isCorrect) {
      // Acertou: aumenta o nível (máximo 3)
      newLevel = Math.min(mockCurrentLevel + 1, 3);
    } else {
      // Errou: diminui o nível (mínimo 0)
      newLevel = Math.max(mockCurrentLevel - 1, 0);
    }
    
    console.log(`📈 Competência ${competencyName}: ${mockCurrentLevel} → ${newLevel} (${isCorrect ? 'acerto' : 'erro'})`);
  }
} 