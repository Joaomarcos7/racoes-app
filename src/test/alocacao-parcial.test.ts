import { describe, it, expect } from "vitest"
import {
  calcularStatusAlocacao,
  calcularStatusFechamentoV2,
  calcularPesoAlocado,
  validateFaltaAlocada,
  calcularDisponivelParaAlocacao,
  filtrarItensAlocadosNaRota,
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

describe("calcularDisponivelParaAlocacao", () => {
  it("pedido AGUARDANDO: usa quantidade total independente de quantidadeRestante", () => {
    expect(calcularDisponivelParaAlocacao("AGUARDANDO", 10, 0)).toBe(10)
    expect(calcularDisponivelParaAlocacao("AGUARDANDO", 10, 5)).toBe(10)
  })

  it("pedido ENTREGA_PARCIAL com restante > 0: usa quantidadeRestante", () => {
    expect(calcularDisponivelParaAlocacao("ENTREGA_PARCIAL", 10, 2)).toBe(2)
  })

  it("pedido ENTREGA_PARCIAL com restante = 0: item ja entregue, disponivel = 0", () => {
    // Item B foi alocado 5/5 na rota 1 → restante=0 → nao deve aparecer na rota 2
    expect(calcularDisponivelParaAlocacao("ENTREGA_PARCIAL", 5, 0)).toBe(0)
  })

  it("status null (balcao): usa quantidade total", () => {
    expect(calcularDisponivelParaAlocacao(null, 10, 0)).toBe(10)
  })

  it("status EM_ROTA com restante > 0: usa quantidadeRestante", () => {
    expect(calcularDisponivelParaAlocacao("EM_ROTA", 10, 3)).toBe(3)
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

describe("filtrarItensAlocadosNaRota", () => {
  it("sem detalhes: retorna todos os itens (comportamento legado)", () => {
    const itens = [{ id: "i1" }, { id: "i2" }]
    expect(filtrarItensAlocadosNaRota(itens, [])).toEqual(itens)
  })

  it("com detalhes: retorna apenas itens que tem detalhe na rota atual", () => {
    const itens = [{ id: "i1" }, { id: "i2" }, { id: "i3" }]
    const detalhes = [{ itemPedidoId: "i1" }, { itemPedidoId: "i3" }]
    const result = filtrarItensAlocadosNaRota(itens, detalhes)
    expect(result).toHaveLength(2)
    expect(result.map((i) => i.id)).toEqual(["i1", "i3"])
  })

  it("item sem detalhe (ja entregue em rota anterior) nao aparece", () => {
    const itens = [{ id: "itemA" }, { id: "itemB" }]
    // itemB foi totalmente alocado na rota 1, nao tem detalhe na rota 2
    const detalhes = [{ itemPedidoId: "itemA" }]
    const result = filtrarItensAlocadosNaRota(itens, detalhes)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("itemA")
  })
})
