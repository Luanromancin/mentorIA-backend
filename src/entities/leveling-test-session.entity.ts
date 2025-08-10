import { BaseEntity } from './base.entity';

export interface LevelingTestSession extends BaseEntity {
  profileId: string;
  currentQuestionIndex: number;
  answers: LevelingTestAnswer[];
  isCompleted: boolean;
  startedAt: Date;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LevelingTestAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  answeredAt: Date;
}
