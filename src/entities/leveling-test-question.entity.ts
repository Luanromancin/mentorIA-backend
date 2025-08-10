export interface LevelingTestQuestion {
  id: string;
  questionId: string;
  orderIndex: number;
  createdAt: Date;
}

export interface LevelingTestQuestionDetails {
  id: string;
  statement: string;
  options: string[];
  correctAnswer: string;
}

export interface LevelingTestQuestionWithDetails extends LevelingTestQuestion {
  question?: LevelingTestQuestionDetails;
}
