import { ITalentSearchRepository, SearchCriteria } from '../ports/ITalentSearchRepository';

export class TalentSearch {
  constructor(private readonly searchRepo: ITalentSearchRepository) {}

  async execute(criteria: SearchCriteria) {
    return await this.searchRepo.search(criteria);
  }
}
