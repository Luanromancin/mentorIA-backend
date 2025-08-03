import { Question } from '../entities/question.entity';
import BaseRepository from './base.repository';

export class QuestionRepository extends BaseRepository<Question> {
  constructor() {
    super('question');
  }
}
