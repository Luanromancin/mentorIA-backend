import { BaseEntity } from './base.entity';

export interface UserAnswer extends BaseEntity {
  profileId: string;
  questionId: string;
  selectedAlternativeId?: string;
  isCorrect: boolean;
  answeredAt?: Date;
  timeSpentSeconds?: number;
}

export interface CreateUserAnswerDto {
  profileId: string;
  questionId: string;
  selectedAlternativeId?: string;
  isCorrect: boolean;
  timeSpentSeconds?: number;
}

export interface UserAnswerWithDetails extends UserAnswer {
  question?: {
    id: string;
    title: string;
    topicName?: string;
    subtopicName?: string;
  };
  selectedAlternative?: {
    id: string;
    letter: string;
    text: string;
  };
}
