import { describe, it, expect } from "vitest"
import { validateItensPedido, calcTotalComDesconto } from "@/lib/pedido-utils"

describe("validateItensPedido", () => {
  const produtoMap = new Map([
    ["p1", { id: "p1", nome: "Ração", peso: 25, valorUnitario: 100 }],
  ])

  it("returns null when all produtos found", () => {
    const result = validateItensPedido([{ produtoId: "p1", quantidade: 2 }], produtoMap)
    expect(result).toBeNull()
  })

  it("returns error message when produto not found", () => {
    const result = validateItensPedido([{ produtoId: "inexistente", quantidade: 1 }], produtoMap)
    expect(result).toBe("Produto inexistente não encontrado")
  })

  it("returns error on first missing produto in list", () => {
    const result = validateItensPedido(
      [{ produtoId: "p1", quantidade: 1 }, { produtoId: "nope", quantidade: 1 }],
      produtoMap
    )
    expect(result).toBe("Produto nope não encontrado")
  })
})

describe("calcTotalComDesconto", () => {
  it("returns subtotal when no discount", () => {
    expect(calcTotalComDesconto(200, 0)).toBe(200)
  })

  it("subtracts discount from subtotal", () => {
    expect(calcTotalComDesconto(200, 30)).toBe(170)
  })

  it("clamps total to 0 when discount exceeds subtotal", () => {
    expect(calcTotalComDesconto(50, 100)).toBe(0)
  })

  it("handles decimal discount correctly", () => {
    expect(calcTotalComDesconto(100, 10.5)).toBeCloseTo(89.5)
  })
})
