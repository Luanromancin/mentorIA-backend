export interface StartLevelingTestDto {
  profileId: string;
}

export interface AnswerLevelingTestDto {
  sessionId: string;
  questionId: string;
  selectedAnswer: string;
}

export interface CompleteLevelingTestDto {
  sessionId: string;
}

export interface LevelingTestQuestionDto {
  id: string;
  orderIndex: number;
  question: {
    id: string;
    statement: string;
    options: string[];
  };
}

export interface LevelingTestSessionDto {
  id: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  isCompleted: boolean;
  startedAt: Date;
  completedAt?: Date;
}

export interface LevelingTestResultDto {
  sessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  completedAt: Date;
  competencyResults: CompetencyResultDto[];
}

export interface CompetencyResultDto {
  competencyId: string;
  competencyName: string;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
}
