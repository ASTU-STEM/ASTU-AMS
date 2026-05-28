export interface Pagination {
  limit: number;
  page: number;
}

export interface ApiListResponse<T> {
  items: T[];
  total: number;
}

export default {};
