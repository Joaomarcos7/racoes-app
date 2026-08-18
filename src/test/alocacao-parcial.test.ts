import { describe, it, expect } from "vitest"
import {
  calcularStatusAlocacao,
  calcularStatusFechamentoV2,
  calcularPesoAlocado,
  validateFaltaAlocada,
} from "@/lib/consolidacao-utils"

describe("calcularStatusAlocacao", () => {
  it("alocação parcial (algum item abaixo do disponível) → ENTREGA_PARCIAL", () => {
    expect(calcularStatusAlocacao("AGUARDANDO", true)).toBe("ENTREGA_PARCIAL")
  })

  it("alocação total de AGUARDANDO → null (fechar vai setar EM_ROTA)", () => {
    expect(calcularStatusAlocacao("AGUARDANDO", false)).toBeNull()
  })

  it("alocação total de ENTREGA_PARCIAL → EM_ROTA (restante todo alocado)", () => {
    expect(calcularStatusAlocacao("ENTREGA_PARCIAL", false)).toBe("EM_ROTA")
  })

  it("alocação parcial de ENTREGA_PARCIAL → ENTREGA_PARCIAL (ainda sobra)", () => {
    expect(calcularStatusAlocacao("ENTREGA_PARCIAL", true)).toBe("ENTREGA_PARCIAL")
  })

  it("statusAtual null com alocação total → null", () => {
    expect(calcularStatusAlocacao(null, false)).toBeNull()
  })
})

describe("calcularStatusFechamentoV2", () => {
  it("restante zero em pedido AGUARDANDO → EM_ROTA (primeira rota entregue)", () => {
    expect(calcularStatusFechamentoV2("AGUARDANDO", 0)).toBe("EM_ROTA")
  })

  it("restante zero em pedido EM_ROTA → ENTREGUE", () => {
    expect(calcularStatusFechamentoV2("EM_ROTA", 0)).toBe("ENTREGUE")
  })

  it("restante zero em pedido ENTREGA_PARCIAL → ENTREGUE", () => {
    expect(calcularStatusFechamentoV2("ENTREGA_PARCIAL", 0)).toBe("ENTREGUE")
  })

  it("restante > 0 → ENTREGA_PARCIAL independente do status anterior", () => {
    expect(calcularStatusFechamentoV2("AGUARDANDO", 5)).toBe("ENTREGA_PARCIAL")
    expect(calcularStatusFechamentoV2("EM_ROTA", 5)).toBe("ENTREGA_PARCIAL")
    expect(calcularStatusFechamentoV2("ENTREGA_PARCIAL", 3)).toBe("ENTREGA_PARCIAL")
  })

  it("statusAtual null e restante zero → EM_ROTA", () => {
    expect(calcularStatusFechamentoV2(null, 0)).toBe("EM_ROTA")
  })
})

describe("calcularPesoAlocado", () => {
  it("soma peso de todos detalhes de alocação", () => {
    const detalhes = [
      { quantidadeAlocada: 5, pesoUnit: 10 },
      { quantidadeAlocada: 3, pesoUnit: 5 },
    ]
    expect(calcularPesoAlocado(detalhes)).toBe(65)
  })

  it("retorna 0 para lista vazia", () => {
    expect(calcularPesoAlocado([])).toBe(0)
  })

  it("único detalhe", () => {
    expect(calcularPesoAlocado([{ quantidadeAlocada: 20, pesoUnit: 50 }])).toBe(1000)
  })
})

describe("validateFaltaAlocada", () => {
  it("retorna null para falta zero", () => {
    expect(validateFaltaAlocada(20, 0)).toBeNull()
  })

  it("retorna null para falta válida menor que alocado", () => {
    expect(validateFaltaAlocada(20, 5)).toBeNull()
  })

  it("retorna null para falta igual ao alocado", () => {
    expect(validateFaltaAlocada(20, 20)).toBeNull()
  })

  it("retorna erro para falta negativa", () => {
    expect(validateFaltaAlocada(20, -1)).toBe("Quantidade em falta não pode ser negativa")
  })

  it("retorna erro quando falta excede o alocado nesta rota", () => {
    expect(validateFaltaAlocada(20, 21)).toBe("Quantidade em falta não pode exceder a quantidade alocada nesta rota")
  })
})
