import { describe, it, expect } from "vitest"
import { groupByMetodoPagamento, getTopClientes } from "@/lib/dashboard-utils"

const makePedido = (overrides: Record<string, unknown>) => ({
  id: "p1",
  tipoPedido: "ENTREGA",
  cliente: { id: "c1", nome: "João", cidade: "SP" },
  clienteId: "c1",
  statusPagamento: "PAGO",
  metodoPagamento: "PIX",
  itens: [{ quantidade: 1, valorUnit: 100, pesoUnit: 25 }],
  ...overrides,
})

describe("groupByMetodoPagamento", () => {
  it("returns empty array for no pedidos", () => {
    expect(groupByMetodoPagamento([])).toEqual([])
  })

  it("counts pedidos por método", () => {
    const pedidos = [
      makePedido({ metodoPagamento: "PIX" }),
      makePedido({ metodoPagamento: "PIX" }),
      makePedido({ metodoPagamento: "DINHEIRO" }),
    ]
    const result = groupByMetodoPagamento(pedidos)
    const pix = result.find((r) => r.metodo === "PIX")
    const dinheiro = result.find((r) => r.metodo === "DINHEIRO")
    expect(pix?.count).toBe(2)
    expect(dinheiro?.count).toBe(1)
  })

  it("sums total value per método", () => {
    const pedidos = [
      makePedido({ metodoPagamento: "PIX", itens: [{ quantidade: 2, valorUnit: 50, pesoUnit: 1 }] }),
      makePedido({ metodoPagamento: "PIX", itens: [{ quantidade: 1, valorUnit: 30, pesoUnit: 1 }] }),
    ]
    const result = groupByMetodoPagamento(pedidos)
    const pix = result.find((r) => r.metodo === "PIX")
    expect(pix?.total).toBe(130)
  })

  it("usa valorUnit do item (preço no momento do pedido), não preço atual do produto", () => {
    // valorUnit=50: preço quando o pedido foi criado
    // se produto fosse atualizado para 200, este total não muda
    const pedidos = [
      makePedido({ metodoPagamento: "DINHEIRO", itens: [{ quantidade: 3, valorUnit: 50, pesoUnit: 1 }] }),
    ]
    const result = groupByMetodoPagamento(pedidos)
    expect(result[0].total).toBe(150) // 3 × 50, nunca 3 × 200
  })

  it("ignores pedidos with null metodoPagamento", () => {
    const pedidos = [
      makePedido({ metodoPagamento: null }),
      makePedido({ metodoPagamento: "PIX" }),
    ]
    const result = groupByMetodoPagamento(pedidos)
    expect(result).toHaveLength(1)
    expect(result[0].metodo).toBe("PIX")
  })

  it("sorts by count descending", () => {
    const pedidos = [
      makePedido({ id: "a", metodoPagamento: "DINHEIRO" }),
      makePedido({ id: "b", metodoPagamento: "PIX" }),
      makePedido({ id: "c", metodoPagamento: "PIX" }),
    ]
    const result = groupByMetodoPagamento(pedidos)
    expect(result[0].metodo).toBe("PIX")
  })
})

describe("getTopClientes", () => {
  it("returns empty array for no pedidos", () => {
    expect(getTopClientes([], 5)).toEqual([])
  })

  it("returns top N clients by order count", () => {
    const pedidos = [
      makePedido({ id: "1", clienteId: "c1", cliente: { id: "c1", nome: "Alice", cidade: "SP" } }),
      makePedido({ id: "2", clienteId: "c1", cliente: { id: "c1", nome: "Alice", cidade: "SP" } }),
      makePedido({ id: "3", clienteId: "c2", cliente: { id: "c2", nome: "Bob", cidade: "RJ" } }),
    ]
    const result = getTopClientes(pedidos, 5)
    expect(result[0].nome).toBe("Alice")
    expect(result[0].count).toBe(2)
    expect(result[1].nome).toBe("Bob")
    expect(result[1].count).toBe(1)
  })

  it("limits to N clients", () => {
    const pedidos = Array.from({ length: 10 }, (_, i) =>
      makePedido({ id: `p${i}`, clienteId: `c${i}`, cliente: { id: `c${i}`, nome: `Cliente ${i}`, cidade: "SP" } })
    )
    expect(getTopClientes(pedidos, 3)).toHaveLength(3)
  })

  it("usa valorUnit do item (preço no momento do pedido) para calcular total do cliente", () => {
    // valorUnit=80: preço quando o pedido foi criado; produto pode ter mudado depois
    const pedidos = [
      makePedido({ clienteId: "c1", cliente: { id: "c1", nome: "Ana", cidade: "SP" }, itens: [{ quantidade: 2, valorUnit: 80, pesoUnit: 1 }] }),
    ]
    const result = getTopClientes(pedidos, 5)
    expect(result[0].total).toBe(160) // 2 × 80, histórico preservado
  })

  it("excludes pedidos without cliente", () => {
    const pedidos = [
      makePedido({ clienteId: null, cliente: null }),
      makePedido({ id: "2", clienteId: "c1", cliente: { id: "c1", nome: "Alice", cidade: "SP" } }),
    ]
    const result = getTopClientes(pedidos, 5)
    expect(result).toHaveLength(1)
    expect(result[0].nome).toBe("Alice")
  })
})
