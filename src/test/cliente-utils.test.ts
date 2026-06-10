import { describe, it, expect } from "vitest"
import { normalizeNome, clienteMatchesDuplicate } from "@/lib/cliente-utils"

describe("normalizeNome", () => {
  it("converts to lowercase", () => {
    expect(normalizeNome("JOÃO SILVA")).toBe("joão silva")
  })

  it("trims whitespace", () => {
    expect(normalizeNome("  João  ")).toBe("joão")
  })

  it("lowercases and trims together", () => {
    expect(normalizeNome("  JOÃO SILVA  ")).toBe("joão silva")
  })
})

describe("clienteMatchesDuplicate", () => {
  it("matches same nome and cidade (case insensitive)", () => {
    expect(clienteMatchesDuplicate({ nome: "João Silva", cidade: "São Paulo" }, { nome: "João Silva", cidade: "São Paulo" })).toBe(true)
  })

  it("matches when nome differs only in case", () => {
    expect(clienteMatchesDuplicate({ nome: "JOÃO SILVA", cidade: "São Paulo" }, { nome: "joão silva", cidade: "São Paulo" })).toBe(true)
  })

  it("matches when nome differs only in whitespace", () => {
    expect(clienteMatchesDuplicate({ nome: "  João Silva  ", cidade: "São Paulo" }, { nome: "João Silva", cidade: "São Paulo" })).toBe(true)
  })

  it("does not match different nome", () => {
    expect(clienteMatchesDuplicate({ nome: "João Silva", cidade: "São Paulo" }, { nome: "Maria Silva", cidade: "São Paulo" })).toBe(false)
  })

  it("does not match same nome but different cidade", () => {
    expect(clienteMatchesDuplicate({ nome: "João Silva", cidade: "São Paulo" }, { nome: "João Silva", cidade: "Campinas" })).toBe(false)
  })
})
