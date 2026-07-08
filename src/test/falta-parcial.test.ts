import { describe, it, expect } from "vitest"
import { calcularStatusEntregaAlocacao, calcularPesoFaltante, validateFalta } from "@/lib/consolidacao-utils"

const item = (quantidade: number, pesoUnit: number, quantidadeFalta: number) => ({
  quantidade,
  pesoUnit,
  quantidadeFalta,
})

describe("calcularStatusEntregaAlocacao", () => {
  it("retorna EM_ROTA quando nenhum item tem falta", () => {
    const itens = [item(5, 10, 0), item(3, 5, 0)]
    expect(calcularStatusEntregaAlocacao(itens)).toBe("EM_ROTA")
  })

  it("retorna ENTREGA_PARCIAL quando algum item tem falta parcial", () => {
    const itens = [item(5, 10, 2), item(3, 5, 0)]
    expect(calcularStatusEntregaAlocacao(itens)).toBe("ENTREGA_PARCIAL")
  })

  it("retorna ENTREGA_PARCIAL quando item tem falta total (tudo em falta)", () => {
    const itens = [item(5, 10, 5), item(3, 5, 0)]
    expect(calcularStatusEntregaAlocacao(itens)).toBe("ENTREGA_PARCIAL")
  })

  it("retorna ENTREGA_PARCIAL quando todos itens têm falta", () => {
    const itens = [item(5, 10, 5), item(3, 5, 3)]
    expect(calcularStatusEntregaAlocacao(itens)).toBe("ENTREGA_PARCIAL")
  })

  it("retorna EM_ROTA para lista vazia", () => {
    expect(calcularStatusEntregaAlocacao([])).toBe("EM_ROTA")
  })
})

describe("calcularPesoFaltante", () => {
  it("retorna 0 quando nenhum item tem falta", () => {
    expect(calcularPesoFaltante([item(5, 10, 0), item(3, 5, 0)])).toBe(0)
  })

  it("calcula peso faltante de item com falta parcial", () => {
    // 2 unidades faltando * 10kg = 20kg
    expect(calcularPesoFaltante([item(5, 10, 2)])).toBe(20)
  })

  it("soma peso faltante de múltiplos itens", () => {
    // (2 * 10) + (1 * 5) = 25kg
    expect(calcularPesoFaltante([item(5, 10, 2), item(3, 5, 1)])).toBe(25)
  })

  it("retorna 0 para lista vazia", () => {
    expect(calcularPesoFaltante([])).toBe(0)
  })
})

describe("validateFalta", () => {
  it("retorna null para falta zero (sem falta)", () => {
    expect(validateFalta(5, 0)).toBeNull()
  })

  it("retorna null para falta válida parcial", () => {
    expect(validateFalta(5, 3)).toBeNull()
  })

  it("retorna null para falta igual à quantidade (item todo em falta)", () => {
    expect(validateFalta(5, 5)).toBeNull()
  })

  it("retorna erro para falta negativa", () => {
    expect(validateFalta(5, -1)).toBe("Quantidade em falta não pode ser negativa")
  })

  it("retorna erro quando falta excede quantidade pedida", () => {
    expect(validateFalta(5, 6)).toBe("Quantidade em falta não pode exceder a quantidade do item")
  })
})
