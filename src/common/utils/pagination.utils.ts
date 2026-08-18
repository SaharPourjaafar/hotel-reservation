export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function getPagination(page?: number, limit?: number) {
  const currentPage = page ?? 1;
  const currentLimit = limit ?? 10;

  const skip = (currentPage - 1) * currentLimit;

  return {
    page: currentPage,
    limit: currentLimit,
    skip,
  };
}

export function getPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
  };
}
