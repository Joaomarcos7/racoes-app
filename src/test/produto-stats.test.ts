import { describe, it, expect } from "vitest"
import { calcProdutoStats } from "@/lib/produto-stats"

interface ItemComPedido {
  pedidoId: string
  quantidade: number
  pesoUnit: number
  pedido: { tipoPedido: "ENTREGA" | "BALCAO" }
}

const makeItem = (overrides: Partial<ItemComPedido> & { pedidoId: string }): ItemComPedido => ({
  quantidade: 1,
  pesoUnit: 25,
  pedido: { tipoPedido: "ENTREGA" },
  ...overrides,
})

describe("calcProdutoStats", () => {
  it("retorna zeros para lista vazia", () => {
    const result = calcProdutoStats([])
    expect(result).toEqual({ totalPedidos: 0, kgBalcao: 0, kgEntrega: 0, kgTotal: 0 })
  })

  it("conta pedidos distintos (não itens)", () => {
    const itens = [
      makeItem({ pedidoId: "p1", quantidade: 2 }),
      makeItem({ pedidoId: "p1", quantidade: 3 }), // mesmo pedido
      makeItem({ pedidoId: "p2", quantidade: 1 }),
    ]
    expect(calcProdutoStats(itens).totalPedidos).toBe(2)
  })

  it("calcula kg de entrega corretamente", () => {
    const itens = [
      makeItem({ pedidoId: "p1", quantidade: 2, pesoUnit: 25, pedido: { tipoPedido: "ENTREGA" } }),
      makeItem({ pedidoId: "p2", quantidade: 1, pesoUnit: 10, pedido: { tipoPedido: "ENTREGA" } }),
    ]
    expect(calcProdutoStats(itens).kgEntrega).toBe(60)
  })

  it("calcula kg de balcao corretamente", () => {
    const itens = [
      makeItem({ pedidoId: "p1", quantidade: 3, pesoUnit: 20, pedido: { tipoPedido: "BALCAO" } }),
    ]
    expect(calcProdutoStats(itens).kgBalcao).toBe(60)
  })

  it("kgTotal = kgEntrega + kgBalcao", () => {
    const itens = [
      makeItem({ pedidoId: "p1", quantidade: 2, pesoUnit: 25, pedido: { tipoPedido: "ENTREGA" } }),
      makeItem({ pedidoId: "p2", quantidade: 1, pesoUnit: 10, pedido: { tipoPedido: "BALCAO" } }),
    ]
    const result = calcProdutoStats(itens)
    expect(result.kgTotal).toBe(result.kgEntrega + result.kgBalcao)
    expect(result.kgTotal).toBe(60)
  })

  it("separa corretamente entrega e balcao no mesmo produto", () => {
    const itens = [
      makeItem({ pedidoId: "p1", quantidade: 4, pesoUnit: 25, pedido: { tipoPedido: "ENTREGA" } }),
      makeItem({ pedidoId: "p2", quantidade: 2, pesoUnit: 25, pedido: { tipoPedido: "BALCAO" } }),
    ]
    const result = calcProdutoStats(itens)
    expect(result.kgEntrega).toBe(100)
    expect(result.kgBalcao).toBe(50)
    expect(result.totalPedidos).toBe(2)
  })
})
