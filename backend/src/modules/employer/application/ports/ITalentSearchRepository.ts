export interface SearchCriteria {
  departmentId?: string;
  graduationYear?: number;
  minCgpa?: number;
  skills?: string[];
  employmentStatus?: string;
  location?: string;
  sortBy?: 'newest' | 'cgpa' | 'experience';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  data: any[];
  total: number;
  page: number;
  limit: number;
}

export interface ITalentSearchRepository {
  search(criteria: SearchCriteria): Promise<SearchResult>;
  findById(alumniId: string): Promise<any | null>;
}
// 
