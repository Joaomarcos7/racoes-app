import { describe, it, expect } from "vitest"
import { validateItensPedido, calcTotalComDesconto, calcularValorPesoVariavel, shouldRegistrarHistoricoCusto, calcularValorEmAberto, validarAdiantadoFiado, resolverValorUnitItem, validarValorUnitOverride, calcularNovoValorEmAberto, resolverStatusPosBaixa, validarBaixaFiado, validarEdicaoPedido } from "@/lib/pedido-utils"

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

describe("calcularValorPesoVariavel", () => {
  it("calculates price for exact 1kg", () => {
    // produto: 25kg bag at R$100 → R$4/kg → 1kg = R$4
    expect(calcularValorPesoVariavel(1, 100, 25)).toBeCloseTo(4)
  })

  it("calculates price for 500g (0.5kg)", () => {
    // R$4/kg → 0.5kg = R$2
    expect(calcularValorPesoVariavel(0.5, 100, 25)).toBeCloseTo(2)
  })

  it("calculates price for 1.25kg", () => {
    // R$4/kg → 1.25kg = R$5
    expect(calcularValorPesoVariavel(1.25, 100, 25)).toBeCloseTo(5)
  })

  it("calculates price for 750g with different product", () => {
    // produto: 50kg bag at R$200 → R$4/kg → 0.75kg = R$3
    expect(calcularValorPesoVariavel(0.75, 200, 50)).toBeCloseTo(3)
  })
})

describe("shouldRegistrarHistoricoCusto", () => {
  it("returns true when custo changed from a value to a different value", () => {
    expect(shouldRegistrarHistoricoCusto(10, 15)).toBe(true)
  })

  it("returns false when custo is the same", () => {
    expect(shouldRegistrarHistoricoCusto(10, 10)).toBe(false)
  })

  it("returns true when custo changes from null to a value", () => {
    expect(shouldRegistrarHistoricoCusto(null, 10)).toBe(true)
  })

  it("returns true when custo changes from a value to null", () => {
    expect(shouldRegistrarHistoricoCusto(10, null)).toBe(true)
  })

  it("returns false when both are null", () => {
    expect(shouldRegistrarHistoricoCusto(null, null)).toBe(false)
  })

  it("returns false when novo is undefined (not being updated)", () => {
    expect(shouldRegistrarHistoricoCusto(10, undefined)).toBe(false)
  })
})

describe("calcularValorEmAberto", () => {
  it("INTEGRAL returns full total as em aberto", () => {
    expect(calcularValorEmAberto(500, "INTEGRAL", undefined)).toBe(500)
  })

  it("INTEGRAL ignores any adiantado passed", () => {
    expect(calcularValorEmAberto(500, "INTEGRAL", 100)).toBe(500)
  })

  it("PARCIAL returns total minus adiantado", () => {
    expect(calcularValorEmAberto(500, "PARCIAL", 200)).toBe(300)
  })

  it("PARCIAL with zero adiantado returns full total", () => {
    expect(calcularValorEmAberto(500, "PARCIAL", 0)).toBe(500)
  })

  it("PARCIAL clamps to zero if adiantado exceeds total", () => {
    expect(calcularValorEmAberto(100, "PARCIAL", 150)).toBe(0)
  })
})

describe("resolverValorUnitItem", () => {
  it("uses produto valorUnitario when no override", () => {
    expect(resolverValorUnitItem(100, undefined)).toBe(100)
  })

  it("uses override when provided and valid", () => {
    expect(resolverValorUnitItem(100, 80)).toBe(80)
  })

  it("uses produto valorUnitario when override is zero", () => {
    expect(resolverValorUnitItem(100, 0)).toBe(100)
  })

  it("uses produto valorUnitario when override is negative", () => {
    expect(resolverValorUnitItem(100, -5)).toBe(100)
  })
})

describe("validarValorUnitOverride", () => {
  it("returns null when override is undefined", () => {
    expect(validarValorUnitOverride(undefined, 100)).toBeNull()
  })

  it("returns null when override is positive and below original", () => {
    expect(validarValorUnitOverride(80, 100)).toBeNull()
  })

  it("returns error when override exceeds original price", () => {
    expect(validarValorUnitOverride(120, 100)).not.toBeNull()
  })

  it("returns error when override equals zero", () => {
    expect(validarValorUnitOverride(0, 100)).not.toBeNull()
  })

  it("returns null when override equals original (no discount = ok)", () => {
    expect(validarValorUnitOverride(100, 100)).toBeNull()
  })
})

describe("validarAdiantadoFiado", () => {
  it("returns null when adiantado is less than total", () => {
    expect(validarAdiantadoFiado(200, 500)).toBeNull()
  })

  it("returns error when adiantado equals total", () => {
    expect(validarAdiantadoFiado(500, 500)).not.toBeNull()
  })

  it("returns error when adiantado exceeds total", () => {
    expect(validarAdiantadoFiado(600, 500)).not.toBeNull()
  })

  it("returns null when adiantado is zero", () => {
    expect(validarAdiantadoFiado(0, 500)).toBeNull()
  })
})

describe("calcularNovoValorEmAberto", () => {
  it("subtrai baixa do valor em aberto", () => {
    expect(calcularNovoValorEmAberto(500, 200)).toBe(300)
  })

  it("zera quando baixa é igual ao valor em aberto", () => {
    expect(calcularNovoValorEmAberto(500, 500)).toBe(0)
  })

  it("nunca retorna negativo quando baixa excede valor em aberto", () => {
    expect(calcularNovoValorEmAberto(500, 600)).toBe(0)
  })

  it("retorna valor original quando baixa é zero", () => {
    expect(calcularNovoValorEmAberto(500, 0)).toBe(500)
  })
})

describe("resolverStatusPosBaixa", () => {
  it("retorna PAGO quando valor em aberto é zero", () => {
    expect(resolverStatusPosBaixa(0)).toBe("PAGO")
  })

  it("retorna FIADO quando ainda há valor em aberto", () => {
    expect(resolverStatusPosBaixa(100)).toBe("FIADO")
  })

  it("retorna PAGO quando valor em aberto é menor que 0.01 (float precision)", () => {
    expect(resolverStatusPosBaixa(0.001)).toBe("PAGO")
  })
})

describe("validarBaixaFiado", () => {
  it("retorna null quando baixa é válida", () => {
    expect(validarBaixaFiado(300, 500)).toBeNull()
  })

  it("retorna null quando baixa é igual ao valor em aberto (quitação total)", () => {
    expect(validarBaixaFiado(500, 500)).toBeNull()
  })

  it("retorna erro quando baixa é zero", () => {
    expect(validarBaixaFiado(0, 500)).not.toBeNull()
  })

  it("retorna erro quando baixa é negativa", () => {
    expect(validarBaixaFiado(-100, 500)).not.toBeNull()
  })

  it("retorna erro quando baixa excede valor em aberto", () => {
    expect(validarBaixaFiado(600, 500)).not.toBeNull()
  })
})

describe("validarEdicaoPedido", () => {
  it("retorna null quando payload válido", () => {
    expect(validarEdicaoPedido({ clienteId: "c1", itens: [{ produtoId: "p1", quantidade: 2, valorUnit: 100 }] })).toBeNull()
  })

  it("retorna erro quando clienteId ausente em pedido de entrega", () => {
    expect(validarEdicaoPedido({ clienteId: "", itens: [{ produtoId: "p1", quantidade: 1, valorUnit: 50 }], requireCliente: true })).not.toBeNull()
  })

  it("retorna erro quando lista de itens vazia", () => {
    expect(validarEdicaoPedido({ clienteId: "c1", itens: [] })).not.toBeNull()
  })

  it("retorna erro quando item tem quantidade menor que 1", () => {
    expect(validarEdicaoPedido({ clienteId: "c1", itens: [{ produtoId: "p1", quantidade: 0, valorUnit: 50 }] })).not.toBeNull()
  })

  it("retorna erro quando item tem valorUnit menor ou igual a zero", () => {
    expect(validarEdicaoPedido({ clienteId: "c1", itens: [{ produtoId: "p1", quantidade: 1, valorUnit: 0 }] })).not.toBeNull()
  })
})
