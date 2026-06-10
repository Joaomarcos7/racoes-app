export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  skip: number
}

export function buildPaginationMeta({ total, page, limit }: { total: number; page: number; limit: number }): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    skip: (page - 1) * limit,
  }
}

export function parsePaginationParams(params: URLSearchParams): { page: number; limit: number } {
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(params.get("limit") ?? "15", 10) || 15))
  return { page, limit }
}
