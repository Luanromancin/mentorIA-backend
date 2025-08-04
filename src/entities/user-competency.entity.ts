import { BaseEntity } from './base.entity';

export interface UserCompetency extends BaseEntity {
  profileId: string;
  competencyId: string;
  level: number; // 0, 1, 2, 3
  lastEvaluatedAt?: Date;
}

export interface CreateUserCompetencyDto {
  profileId: string;
  competencyId: string;
  level?: number; // Default 0
}

export interface UpdateUserCompetencyDto {
  level?: number;
  lastEvaluatedAt?: Date;
}

export interface UserCompetencyWithDetails extends UserCompetency {
  competency?: {
    id: string;
    code: string;
    name: string;
    description?: string;
  };
}
