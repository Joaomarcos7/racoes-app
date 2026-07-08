import { describe, it, expect } from "vitest"
import { calcularStatusEntregaAlocacao, calcularPesoFaltante, calcularPesoRestante, calcularPesoAlocar, calcularStatusFechamento, statusAposAlocar, validateFalta } from "@/lib/consolidacao-utils"

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

describe("calcularPesoRestante", () => {
  it("retorna peso total quando não há falta", () => {
    // 5 un * 10kg = 50kg
    expect(calcularPesoRestante([item(5, 10, 0)])).toBe(50)
  })

  it("retorna apenas peso dos itens não faltantes", () => {
    // (5-2) * 10 = 30kg
    expect(calcularPesoRestante([item(5, 10, 2)])).toBe(30)
  })

  it("retorna 0 quando tudo está em falta", () => {
    expect(calcularPesoRestante([item(5, 10, 5)])).toBe(0)
  })

  it("soma restante de múltiplos itens", () => {
    // (5-2)*10 + (3-1)*5 = 30 + 10 = 40
    expect(calcularPesoRestante([item(5, 10, 2), item(3, 5, 1)])).toBe(40)
  })
})

describe("statusAposAlocar", () => {
  it("pedido ENTREGA_PARCIAL alocado → EM_ROTA", () => {
    expect(statusAposAlocar("ENTREGA_PARCIAL")).toBe("EM_ROTA")
  })

  it("pedido AGUARDANDO alocado → null (sem mudança)", () => {
    expect(statusAposAlocar("AGUARDANDO")).toBeNull()
  })

  it("null alocado → null", () => {
    expect(statusAposAlocar(null)).toBeNull()
  })
})

describe("calcularStatusFechamento", () => {
  it("pedido normal sem falta → EM_ROTA", () => {
    const r = calcularStatusFechamento("AGUARDANDO", false, [item(5, 10, 0)])
    expect(r).toEqual({ status: "EM_ROTA", resetFalta: false })
  })

  it("pedido normal com falta registrada → ENTREGA_PARCIAL", () => {
    const r = calcularStatusFechamento("AGUARDANDO", true, [item(5, 10, 2)])
    expect(r).toEqual({ status: "ENTREGA_PARCIAL", resetFalta: false })
  })

  it("pedido ENTREGA_PARCIAL sem nova falta na rota → ENTREGUE e reset", () => {
    // driver não registrou falta na nova rota = tudo entregue
    const r = calcularStatusFechamento("ENTREGA_PARCIAL", false, [item(5, 10, 2)])
    expect(r).toEqual({ status: "ENTREGUE", resetFalta: true })
  })

  it("pedido ENTREGA_PARCIAL com nova falta ainda pendente → ENTREGA_PARCIAL", () => {
    const r = calcularStatusFechamento("ENTREGA_PARCIAL", true, [item(5, 10, 1)])
    expect(r).toEqual({ status: "ENTREGA_PARCIAL", resetFalta: false })
  })

  it("pedido ENTREGA_PARCIAL com falta registrada zerada → ENTREGUE e reset", () => {
    // driver registrou falta=0 para todos os itens = tudo entregue desta vez
    const r = calcularStatusFechamento("ENTREGA_PARCIAL", true, [item(5, 10, 0)])
    expect(r).toEqual({ status: "ENTREGUE", resetFalta: true })
  })
})

describe("calcularPesoAlocar", () => {
  it("pedido sem falta usa peso total (primeira alocação)", () => {
    // AGUARDANDO: quantidadeFalta=0 → carrega tudo
    expect(calcularPesoAlocar([item(5, 10, 0)])).toBe(50)
  })

  it("pedido parcial usa apenas peso dos itens em falta", () => {
    // 2 faltaram * 10kg = 20kg (os 3 já entregues não entram)
    expect(calcularPesoAlocar([item(5, 10, 2)])).toBe(20)
  })

  it("pedido com item totalmente em falta usa peso total do item", () => {
    // 5 faltaram * 10kg = 50kg
    expect(calcularPesoAlocar([item(5, 10, 5)])).toBe(50)
  })

  it("pedido parcial com múltiplos itens soma apenas os em falta", () => {
    // item A: 2 falta * 10kg = 20kg, item B: 0 falta = 0kg → total 20kg
    expect(calcularPesoAlocar([item(5, 10, 2), item(3, 5, 0)])).toBe(20)
  })

  it("múltiplos itens com falta soma todos", () => {
    // (2*10) + (1*5) = 25kg
    expect(calcularPesoAlocar([item(5, 10, 2), item(3, 5, 1)])).toBe(25)
  })

  it("retorna 0 para lista vazia", () => {
    expect(calcularPesoAlocar([])).toBe(0)
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
