import OtherRepository from '../repositories/other.repository';
import TestRepository from '../repositories/test.repository';
import { QuestionService } from '../services/question.service';
import { QuestionRepository } from '../repositories/question.repository';
import { CompetencyRepository } from '../repositories/competency.repository';
import { SubjectRepository } from '../repositories/subject.repository';
import TestService from '../services/test.service';
import Injector from './injector';

export const di = new Injector();

// Test
di.registerRepository(TestRepository, new TestRepository());
di.registerRepository(OtherRepository, new OtherRepository());

// App
di.registerRepository(SubjectRepository, new SubjectRepository());
di.registerRepository(CompetencyRepository, new CompetencyRepository());
di.registerRepository(QuestionRepository, new QuestionRepository());

di.registerService(
  TestService,
  new TestService(
    di.getRepository(TestRepository),
    di.getRepository(OtherRepository)
  )
);

di.registerService(
  QuestionService,
  new QuestionService(
    di.getRepository(CompetencyRepository),
    di.getRepository(QuestionRepository),
  ),
);
