import { Competency } from '../entities/competency.entity';
import BaseRepository from './base.repository';

export class CompetencyRepository extends BaseRepository<Competency> {
  constructor() {
    super('competency');
  }
}
