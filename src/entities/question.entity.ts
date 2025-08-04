import BaseEntity from './base.entity';

export class Question extends BaseEntity {
  statement: string;
  options: string[];
  correctAnswer: string;
  competencyId: string;
}
