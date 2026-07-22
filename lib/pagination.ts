export function normalizePagination(page: number, pageSize: number, maxPageSize = 50): { page: number; pageSize: number; offset: number } {
  const normalizedPageSize = Math.min(Math.max(Math.floor(pageSize), 1), maxPageSize);
  const normalizedPage = Math.min(Math.max(Math.floor(page), 1), 10_000);
  return { page: normalizedPage, pageSize: normalizedPageSize, offset: (normalizedPage - 1) * normalizedPageSize };
}
