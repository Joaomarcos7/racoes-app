import { describe, it, expect } from "vitest"
import { validateReabrirRota, validateFecharRota } from "@/lib/consolidacao-utils"

describe("validateReabrirRota", () => {
  it("permite reabrir rota FECHADA", () => {
    expect(validateReabrirRota({ status: "FECHADA" })).toBeNull()
  })

  it("rejeita reabrir rota já ABERTA", () => {
    expect(validateReabrirRota({ status: "ABERTA" })).toBe("Rota já está aberta")
  })
})

describe("validateFecharRota", () => {
  it("permite fechar rota ABERTA com itens", () => {
    expect(validateFecharRota({ status: "ABERTA", numItens: 1 })).toBeNull()
  })

  it("rejeita fechar rota ABERTA sem itens", () => {
    expect(validateFecharRota({ status: "ABERTA", numItens: 0 })).toBe("Rota sem pedidos alocados")
  })

  it("rejeita fechar rota já FECHADA", () => {
    expect(validateFecharRota({ status: "FECHADA", numItens: 3 })).toBe("Rota já está fechada")
  })
})
