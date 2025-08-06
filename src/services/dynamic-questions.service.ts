import { UserCompetencyRepository } from '../repositories/user-competency.repository';
import { UserCompetencyWithDetails } from '../entities/user-competency.entity';
import databaseService from './database.service';

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
  constructor(private userCompetencyRepository: UserCompetencyRepository) {}

  /**
   * Busca questões dinâmicas baseadas no nível de competência do usuário
   */
  async getDynamicQuestions(
    request: DynamicQuestionRequest
  ): Promise<QuestionWithCompetency[]> {
    const { profileId, maxQuestions = 20 } = request;

    console.log(
      `🔧 Buscando questões dinâmicas para usuário ${profileId}, máximo: ${maxQuestions}`
    );

    // 1. Buscar competências do usuário agrupadas por nível
    const userCompetencies =
      await this.userCompetencyRepository.findByProfileIdGroupedByLevel(
        profileId
      );

    console.log('📊 Competências do usuário por nível:', {
      nivel0: userCompetencies[0].length,
      nivel1: userCompetencies[1].length,
      nivel2: userCompetencies[2].length,
      nivel3: userCompetencies[3].length,
    });

    // 2. Aplicar regra de seleção: maior nível primeiro
    const questionsToSelect = this.calculateQuestionsPerLevel(
      userCompetencies,
      maxQuestions
    );

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
      const questionsPerCompetency = Math.floor(
        questionsForLevel / competencies.length
      );
      const remainingQuestions = questionsForLevel % competencies.length;

      for (let i = 0; i < competencies.length; i++) {
        if (selectedQuestions.length >= maxQuestions) break;

        const competency = competencies[i];
        const questionsForThisCompetency =
          questionsPerCompetency + (i < remainingQuestions ? 1 : 0);

        if (questionsForThisCompetency === 0) continue;

        const questionsNeeded = Math.min(
          questionsForThisCompetency,
          maxQuestions - selectedQuestions.length
        );

        const questions = await this.getQuestionsForCompetency(
          competency.competency!.name, // subtopic_name
          questionsNeeded,
          profileId
        );

        // Adicionar nível da competência a cada questão
        const questionsWithLevel = questions.map((question: any) => ({
          ...question,
          competencyLevel: level,
        }));

        selectedQuestions.push(...questionsWithLevel);
      }
    }

    console.log(
      `✅ ${selectedQuestions.length} questões selecionadas dinamicamente`
    );
    return selectedQuestions;
  }

  /**
   * Calcula quantas questões buscar por nível baseado na regra de negócio
   */
  private calculateQuestionsPerLevel(
    userCompetencies: Record<number, UserCompetencyWithDetails[]>,
    maxQuestions: number
  ): Record<number, number> {
    const questionsPerLevel: Record<number, number> = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
    };

    // Regra: nível 3 = 0 questões, nível 2 = 1 questão, nível 1 = 2 questões, nível 0 = 3 questões
    const questionsPerCompetency: Record<number, number> = {
      0: 3,
      1: 2,
      2: 1,
      3: 0,
    };

    let totalQuestions = 0;

    // Calcular questões por nível, priorizando níveis mais altos
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

    // Se não conseguimos 20 questões, tentar preencher com questões de nível 0
    if (totalQuestions < maxQuestions) {
      const level0Competencies = userCompetencies[0];
      if (level0Competencies.length > 0) {
        const additionalQuestions = maxQuestions - totalQuestions;
        const currentLevel0Questions = questionsPerLevel[0];
        const maxAdditionalPerCompetency = Math.ceil(
          additionalQuestions / level0Competencies.length
        );

        // Adicionar questões extras para nível 0
        questionsPerLevel[0] = Math.min(
          currentLevel0Questions +
            level0Competencies.length * maxAdditionalPerCompetency,
          maxQuestions
        );
      }
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
    try {
      console.log(
        `🔍 Buscando ${count} questões para competência: ${subtopicName} no banco real`
      );

      // Buscar questões reais do banco
      const dbQuestions = await databaseService.getQuestionsByCompetency(
        subtopicName,
        count
      );

      // Debug: verificar estrutura das questões do banco
      console.log(`🔍 Estrutura da primeira questão do banco:`, dbQuestions[0]);
      console.log(
        `📝 Alternativas da primeira questão:`,
        dbQuestions[0]?.alternatives
      );

      // Converter para o formato esperado
      const questions = dbQuestions.map((dbQuestion: any) => ({
        id: dbQuestion.id,
        title: dbQuestion.title,
        year: dbQuestion.year,
        questionIndex: dbQuestion.question_index,
        language: dbQuestion.language,
        field: dbQuestion.field,
        problemStatement: dbQuestion.problem_statement,
        files: dbQuestion.files || [],
        topicName: dbQuestion.topic_name,
        subtopicName: dbQuestion.subtopic_name,
        explanation: dbQuestion.explanation,
        alternatives: (dbQuestion.alternatives || [])
          .map((alt: any) => ({
            id: alt.id,
            letter: alt.letter,
            text: alt.text,
            file: alt.file,
            isCorrect: alt.is_correct,
          }))
          .sort((a: any, b: any) => a.letter.localeCompare(b.letter)), // Ordenar por letra (A, B, C, D, E)
        competencyLevel: 0, // Por enquanto, todas as questões são nível 0
      }));

      console.log(
        `✅ Encontradas ${questions.length} questões para ${subtopicName}`
      );
      return questions;
    } catch (error) {
      console.error(`❌ Erro ao buscar questões para ${subtopicName}:`, error);

      // Fallback para dados mockados
      console.log('⚠️ Usando dados mockados como fallback');
      return this.getMockQuestions(subtopicName, count);
    }
  }

  /**
   * Atualiza o nível de competência baseado na resposta do usuário
   */
  async updateCompetencyLevel(
    profileId: string,
    competencyName: string,
    isCorrect: boolean
  ): Promise<void> {
    try {
      console.log(
        `📈 Atualizando competência ${competencyName} para usuário ${profileId} no banco real`
      );
      console.log(`📊 Resposta: ${isCorrect ? 'correta' : 'incorreta'}`);

      // Buscar competência atual do usuário
      const userCompetencies =
        await this.userCompetencyRepository.findByProfileId(profileId);
      const competency = userCompetencies.find(
        (comp) => comp.competency?.name === competencyName
      );

      if (!competency) {
        console.error(
          `❌ Competência ${competencyName} não encontrada para o usuário ${profileId}`
        );
        return;
      }

      const currentLevel = competency.level;
      let newLevel = currentLevel;

      if (isCorrect) {
        // Acertou: aumenta o nível (máximo 3)
        newLevel = Math.min(currentLevel + 1, 3);
      } else {
        // Errou: diminui o nível (mínimo 0)
        newLevel = Math.max(currentLevel - 1, 0);
      }

      // Atualizar no banco
      await this.userCompetencyRepository.updateLevel(
        profileId,
        competency.competencyId,
        newLevel
      );

      console.log(
        `📈 Competência ${competencyName}: ${currentLevel} → ${newLevel} (${
          isCorrect ? 'acerto' : 'erro'
        })`
      );
    } catch (error) {
      console.error('❌ Erro ao atualizar nível da competência:', error);

      // Fallback para mock
      console.log('⚠️ Usando lógica mockada como fallback');
      this.updateMockCompetencyLevel(competencyName, isCorrect);
    }
  }

  // Métodos de fallback com dados mockados
  private getMockQuestions(subtopicName: string, count: number): any[] {
    return Array.from({ length: count }, (_, i) => ({
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
        { id: 'e', letter: 'E', text: 'Alternativa E', isCorrect: i === 4 },
      ],
    }));
  }

  private updateMockCompetencyLevel(
    competencyName: string,
    isCorrect: boolean
  ): void {
    const mockCurrentLevel = 1; // Nível mockado
    let newLevel = mockCurrentLevel;

    if (isCorrect) {
      newLevel = Math.min(mockCurrentLevel + 1, 3);
    } else {
      newLevel = Math.max(mockCurrentLevel - 1, 0);
    }

    console.log(
      `📈 Competência ${competencyName}: ${mockCurrentLevel} → ${newLevel} (${
        isCorrect ? 'acerto' : 'erro'
      })`
    );
  }
}
