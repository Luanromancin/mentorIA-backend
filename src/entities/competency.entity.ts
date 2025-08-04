import { BaseEntity } from './base.entity';

export interface Competency extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  subjectId?: string;
}

export interface CreateCompetencyDto {
  code: string;
  name: string;
  description?: string;
  subjectId?: string;
}

export interface UpdateCompetencyDto {
  code?: string;
  name?: string;
  description?: string;
  subjectId?: string;
}
