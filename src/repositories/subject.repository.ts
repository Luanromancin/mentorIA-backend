import { Subject } from '../entities/subject.entity';
import BaseRepository from './base.repository';

export class SubjectRepository extends BaseRepository<Subject> {
  constructor() {
    super('subject');
  }
} 