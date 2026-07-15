import { describe, it, expect } from "vitest"
import { buildPaginationMeta, parsePaginationParams, paginateArray, parseSortOrder } from "@/lib/pagination-utils"

describe("buildPaginationMeta", () => {
  it("calculates totalPages correctly", () => {
    expect(buildPaginationMeta({ total: 100, page: 1, limit: 10 }).totalPages).toBe(10)
  })

  it("rounds up totalPages for partial page", () => {
    expect(buildPaginationMeta({ total: 21, page: 1, limit: 10 }).totalPages).toBe(3)
  })

  it("totalPages is 1 when no items", () => {
    expect(buildPaginationMeta({ total: 0, page: 1, limit: 10 }).totalPages).toBe(1)
  })

  it("hasNext is true when not on last page", () => {
    expect(buildPaginationMeta({ total: 30, page: 1, limit: 10 }).hasNext).toBe(true)
  })

  it("hasNext is false on last page", () => {
    expect(buildPaginationMeta({ total: 30, page: 3, limit: 10 }).hasNext).toBe(false)
  })

  it("hasPrev is false on first page", () => {
    expect(buildPaginationMeta({ total: 30, page: 1, limit: 10 }).hasPrev).toBe(false)
  })

  it("hasPrev is true on page > 1", () => {
    expect(buildPaginationMeta({ total: 30, page: 2, limit: 10 }).hasPrev).toBe(true)
  })

  it("calculates skip correctly", () => {
    expect(buildPaginationMeta({ total: 100, page: 3, limit: 10 }).skip).toBe(20)
  })
})

describe("parsePaginationParams", () => {
  it("returns default page 1 and limit 15 when params absent", () => {
    const result = parsePaginationParams(new URLSearchParams())
    expect(result.page).toBe(1)
    expect(result.limit).toBe(15)
  })

  it("parses page and limit from params", () => {
    const result = parsePaginationParams(new URLSearchParams("page=3&limit=20"))
    expect(result.page).toBe(3)
    expect(result.limit).toBe(20)
  })

  it("clamps page to minimum 1", () => {
    expect(parsePaginationParams(new URLSearchParams("page=0")).page).toBe(1)
  })

  it("clamps limit to maximum 100", () => {
    expect(parsePaginationParams(new URLSearchParams("limit=999")).limit).toBe(100)
  })
})

describe("paginateArray", () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1)

  it("returns first page slice", () => {
    const { data } = paginateArray(items, 1, 10)
    expect(data).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it("returns second page slice", () => {
    const { data } = paginateArray(items, 2, 10)
    expect(data).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
  })

  it("returns partial last page", () => {
    const { data } = paginateArray(items, 3, 10)
    expect(data).toEqual([21, 22, 23, 24, 25])
  })

  it("meta reflects correct total and totalPages", () => {
    const { meta } = paginateArray(items, 1, 10)
    expect(meta.total).toBe(25)
    expect(meta.totalPages).toBe(3)
  })

  it("meta hasNext is false on last page", () => {
    const { meta } = paginateArray(items, 3, 10)
    expect(meta.hasNext).toBe(false)
  })

  it("returns empty data for empty array", () => {
    const { data, meta } = paginateArray([], 1, 10)
    expect(data).toEqual([])
    expect(meta.total).toBe(0)
    expect(meta.totalPages).toBe(1)
  })
})

describe("parseSortOrder", () => {
  it("retorna desc quando param é null", () => {
    expect(parseSortOrder(null)).toBe("desc")
  })

  it("retorna asc quando param é 'asc'", () => {
    expect(parseSortOrder("asc")).toBe("asc")
  })

  it("retorna desc quando param é 'desc'", () => {
    expect(parseSortOrder("desc")).toBe("desc")
  })

  it("retorna desc quando param é valor inválido", () => {
    expect(parseSortOrder("INVALIDO")).toBe("desc")
  })

  it("retorna desc para string vazia", () => {
    expect(parseSortOrder("")).toBe("desc")
  })
})
