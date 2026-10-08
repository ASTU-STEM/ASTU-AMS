export interface PaginationOptions {
  page?: number | string;
  limit?: number | string;
  maxLimit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Standardized Pagination Helper enforcing maximum limit bounds (default: max 100 per page)
 */
export async function paginateQuery<T>(
  queryModel: {
    findMany: (args: any) => Promise<T[]>;
    count: (args: any) => Promise<number>;
  },
  args: any = {},
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, Number(options.page) || 1);
  const maxLimit = options.maxLimit || 100;
  const limit = Math.min(maxLimit, Math.max(1, Number(options.limit) || 20));

  const skip = (page - 1) * limit;

  const countArgs = { where: args.where };

  const [data, total] = await Promise.all([
    queryModel.findMany({ ...args, skip, take: limit }),
    queryModel.count(countArgs),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
