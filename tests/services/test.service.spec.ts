import TestService from '../../src/services/test.service';
import TestRepository from '../../src/repositories/test.repository';
import { TestEntity } from '../../src/entities/test.entity';
import OtherRepository from '../../src/repositories/other.repository';
import { HttpNotFoundError } from '../../src/utils/errors/http.error';

describe('TestService', () => {
  let mockTestRepository: TestRepository;
  let mockOtherRepository: OtherRepository;
  let service: TestService;

  const mockTestEntity = { id: '123', name: 'test' } as TestEntity;

  const mockTestModel = { id: '123', name: 'test' };

  beforeEach(() => {
    mockTestRepository = {
      getTests: jest.fn(),
      getTest: jest.fn(),
      createTest: jest.fn(),
      updateTest: jest.fn(),
      deleteTest: jest.fn(),
    } as any;

    mockOtherRepository = {
      getTests: jest.fn(),
    } as any;

    const mockDynamicQuestionsService = {
      getDynamicQuestions: jest.fn(),
    } as any;

    const mockUserCompetencyRepository = {
      findByProfileIdGroupedByLevel: jest.fn(),
    } as any;

    service = new TestService(
      mockTestRepository, 
      mockOtherRepository, 
      mockDynamicQuestionsService,
      mockUserCompetencyRepository
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return all tests', async () => {
    jest
      .spyOn(mockTestRepository, 'getTests')
      .mockResolvedValue([mockTestEntity]);

    const tests = await service.getTests();

    expect(tests[0]).toMatchObject(mockTestModel);
    expect(mockTestRepository.getTests).toBeCalledTimes(1);
  });

  it('should return a test by id', async () => {
    const id = '123';

    jest.spyOn(mockTestRepository, 'getTest').mockResolvedValue(mockTestEntity);

    const test = await service.getTest(id);

    expect(test).toMatchObject(mockTestModel);
    expect(mockTestRepository.getTest).toBeCalledWith(id);
  });

  it('should throw an error when test is not found', async () => {
    const id = '123';

    jest.spyOn(mockTestRepository, 'getTest').mockResolvedValue(null);

    await expect(service.getTest(id)).rejects.toThrow(HttpNotFoundError);
    expect(mockTestRepository.getTest).toBeCalledWith(id);
  });

  it('should create a test', async () => {
    jest
      .spyOn(mockTestRepository, 'createTest')
      .mockResolvedValue(mockTestEntity);
    await service.createTest(mockTestEntity);

    expect(mockTestRepository.createTest).toBeCalledWith(mockTestEntity);
  });

  it('should update a test', async () => {
    const id = '123';

    jest
      .spyOn(mockTestRepository, 'updateTest')
      .mockResolvedValue(mockTestEntity);

    const updateTest = await service.updateTest(id, mockTestEntity);

    expect(mockTestRepository.updateTest).toBeCalledWith(id, mockTestEntity);
    expect(updateTest).toMatchObject(mockTestModel);
  });

  it('should delete a test', async () => {
    const id = '123';
    await service.deleteTest(id);

    expect(mockTestRepository.deleteTest).toBeCalledWith(id);
  });
});
