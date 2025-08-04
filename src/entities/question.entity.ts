import { BaseEntity } from './base.entity';

export interface Question extends BaseEntity {
  statement: string;
  options: string[];
  correctAnswer: string;
  competencyId: string;
}
