import { TalentSearch } from '../../../application/use-cases/TalentSearch';
import { ITalentSearchRepository } from '../../../application/ports/ITalentSearchRepository';

describe('TalentSearch Use Case', () => {
  let mockSearchRepo: jest.Mocked<ITalentSearchRepository>;

  beforeEach(() => {
    mockSearchRepo = {
      search: jest.fn(),
      findById: jest.fn(),
    };
  });

  it('should return matching talent lists and total count', async () => {
    const mockTalents = [
      { id: 'alumni1', fullName: 'Alice', cgpa: 3.8, graduationYear: 2024, skills: ['Node.js'] },
    ];
    mockSearchRepo.search.mockResolvedValue({
      data: mockTalents as any,
      total: 1,
      page: 1,
      limit: 10,
    });

    const useCase = new TalentSearch(mockSearchRepo);
    const result = await useCase.execute({
      skills: ['Node.js'],
      minCgpa: 3.5,
    });

    expect(result.total).toBe(1);
    expect(result.data[0].fullName).toBe('Alice');
    expect(mockSearchRepo.search).toHaveBeenCalledWith(expect.objectContaining({
      skills: ['Node.js'],
      minCgpa: 3.5,
    }));
  });
});
