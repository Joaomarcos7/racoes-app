import { describe, it, expect } from "vitest"
import { buildPaginationMeta, parsePaginationParams } from "@/lib/pagination-utils"

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
