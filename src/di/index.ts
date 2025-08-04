import OtherRepository from '../repositories/other.repository';
import TestRepository from '../repositories/test.repository';
import { QuestionService } from '../services/question.service';
import { QuestionRepository } from '../repositories/question.repository';
import { CompetencyRepository } from '../repositories/competency.repository';
import { SubjectRepository } from '../repositories/subject.repository';
import { UserCompetencyRepository } from '../repositories/user-competency.repository';
import { DynamicQuestionsService } from '../services/dynamic-questions.service';
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
di.registerRepository(UserCompetencyRepository, new UserCompetencyRepository());

// Registrar DynamicQuestionsService primeiro
di.registerService(
  DynamicQuestionsService,
  new DynamicQuestionsService(
    di.getRepository(UserCompetencyRepository)
  )
);

di.registerService(
  TestService,
  new TestService(
    di.getRepository(TestRepository),
    di.getRepository(OtherRepository),
    di.getService(DynamicQuestionsService),
    di.getRepository(UserCompetencyRepository)
  )
);

di.registerService(
  QuestionService,
  new QuestionService(
    di.getRepository(CompetencyRepository),
    di.getRepository(QuestionRepository)
  )
);
