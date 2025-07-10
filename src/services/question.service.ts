import { Question } from '../entities/question.entity';
import { CompetencyRepository } from '../repositories/competency.repository';
import { QuestionRepository } from '../repositories/question.repository';

export class QuestionService {
  constructor(
    private competencyRepository: CompetencyRepository,
    private questionRepository: QuestionRepository,
  ) {}

  public async getQuestions(
    subjectId: string,
    n: number,
  ): Promise<Question[]> {
    const competencies = await this.competencyRepository.findAll(
      c => c.subjectId === subjectId,
    );
    const m = competencies.length;

    if (m === 0) {
      return [];
    }

    const questions: Question[] = [];

    if (n <= m) {
      // Case 1: n <= m
      const selectedCompetencies = this.shuffleArray(competencies).slice(0, n);

      for (const competency of selectedCompetencies) {
        const question = await this.getRandomQuestionForCompetency(
          competency.id,
        );
        if (question) {
          questions.push(question);
        }
      }
    } else {
      // Case 2: n > m
      // Get one question for each competency first
      for (const competency of competencies) {
        const question = await this.getRandomQuestionForCompetency(
          competency.id,
        );
        if (question) {
          questions.push(question);
        }
      }

      // Get remaining questions
      const remainingQuestionsCount = n - questions.length;
      let competencyPool = this.shuffleArray([...competencies]);

      for (let i = 0; i < remainingQuestionsCount; i++) {
        if (competencyPool.length === 0) {
          competencyPool = this.shuffleArray([...competencies]);
        }
        const competency = competencyPool.pop()!;
        const question = await this.getRandomQuestionForCompetency(
          competency.id,
        );
        if (question) {
          questions.push(question);
        }
      }
    }

    return questions;
  }

  private async getRandomQuestionForCompetency(
    competencyId: string,
  ): Promise<Question | null> {
    const questions = await this.questionRepository.findAll(
      q => q.competencyId === competencyId,
    );
    if (questions.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
} 