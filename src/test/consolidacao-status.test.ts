import { describe, it, expect } from "vitest"
import { validateReabrirRota, validateFecharRota, aggregateProdutosAlocados } from "@/lib/consolidacao-utils"

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

describe("aggregateProdutosAlocados", () => {
  const makeItem = (nome: string, quantidade: number, quantidadeFalta = 0) => ({
    id: nome, produtoId: nome, produto: { id: nome, nome, peso: 1, valorUnitario: 1, custo: null, tipo: "CONSUMIDOR_FINAL" as const, ativo: true, createdAt: "" },
    quantidade, pesoUnit: 1, valorUnit: 1, pedidoId: "", quantidadeFalta,
  })

  it("retorna produto único com quantidade e peso corretos", () => {
    const pedidos = [{ itens: [makeItem("Ração 5kg", 3)] }]
    const result = aggregateProdutosAlocados(pedidos)
    expect(result[0]).toMatchObject({ nome: "Ração 5kg", quantidade: 3, pesoTotal: 3 })
  })

  it("soma quantidades e pesos do mesmo produto em pedidos diferentes", () => {
    const pedidos = [
      { itens: [makeItem("Ração 5kg", 2)] },
      { itens: [makeItem("Ração 5kg", 4)] },
    ]
    const result = aggregateProdutosAlocados(pedidos)
    expect(result[0]).toMatchObject({ nome: "Ração 5kg", quantidade: 6, pesoTotal: 6 })
  })

  it("lista produtos distintos separadamente com peso", () => {
    const pedidos = [{ itens: [makeItem("Ração 5kg", 2), makeItem("Ração 10kg", 1)] }]
    const result = aggregateProdutosAlocados(pedidos)
    expect(result.find(p => p.nome === "Ração 5kg")?.quantidade).toBe(2)
    expect(result.find(p => p.nome === "Ração 10kg")?.quantidade).toBe(1)
    expect(result.find(p => p.nome === "Ração 5kg")?.pesoTotal).toBe(2)
  })

  it("retorna vazio para lista sem pedidos", () => {
    expect(aggregateProdutosAlocados([])).toEqual([])
  })

  it("pedido parcial mostra apenas quantidadeFalta (itens ainda a entregar)", () => {
    // ordenou 5, 2 em falta → mostra 2 (os que ainda faltam entregar)
    const pedidos = [{ itens: [makeItem("Ração 5kg", 5, 2)] }]
    const result = aggregateProdutosAlocados(pedidos)
    expect(result[0]).toMatchObject({ nome: "Ração 5kg", quantidade: 2, pesoTotal: 2 })
  })
})
