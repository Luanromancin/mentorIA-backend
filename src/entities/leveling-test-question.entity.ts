import { BaseEntity } from './base.entity';

export interface LevelingTestQuestion {
  id: string;
  questionId: string;
  orderIndex: number;
  createdAt: Date;
}

export interface LevelingTestQuestionWithDetails extends LevelingTestQuestion {
  question?: {
    id: string;
    statement: string;
    options: string[];
    correctAnswer: string;
  };
}
