import { describe, it, expect } from "vitest"
import { groupByMetodoPagamento, getTopClientes, calcularPesoVendido, getPeriodoDates, calcularVendasPagas } from "@/lib/dashboard-utils"

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

  it("usa pagamentos[] quando presente, ignorando metodoPagamento", () => {
    const pedidos = [
      makePedido({
        metodoPagamento: null,
        pagamentos: [
          { metodo: "PIX", valor: 1400 },
          { metodo: "CARTAO_CREDITO", valor: 1100 },
        ],
      }),
    ]
    const result = groupByMetodoPagamento(pedidos)
    const pix = result.find((r) => r.metodo === "PIX")
    const cartao = result.find((r) => r.metodo === "CARTAO_CREDITO")
    expect(pix?.total).toBe(1400)
    expect(cartao?.total).toBe(1100)
    expect(pix?.count).toBe(1)
    expect(cartao?.count).toBe(1)
  })

  it("mistura legado (metodoPagamento) e multi-pagamento no mesmo conjunto", () => {
    const pedidos = [
      makePedido({ id: "a", metodoPagamento: "DINHEIRO", pagamentos: [] }),
      makePedido({
        id: "b",
        metodoPagamento: null,
        pagamentos: [
          { metodo: "PIX", valor: 200 },
          { metodo: "DINHEIRO", valor: 100 },
        ],
        itens: [{ quantidade: 1, valorUnit: 300, pesoUnit: 1 }],
      }),
    ]
    const result = groupByMetodoPagamento(pedidos)
    const dinheiro = result.find((r) => r.metodo === "DINHEIRO")
    const pix = result.find((r) => r.metodo === "PIX")
    expect(dinheiro?.count).toBe(2) // legado + multi
    expect(pix?.count).toBe(1)
    expect(pix?.total).toBe(200)
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

  it("excludes pedidos without cliente (peso)", () => {
    const pedidos = [
      makePedido({ clienteId: null, cliente: null }),
      makePedido({ id: "2", clienteId: "c1", cliente: { id: "c1", nome: "Alice", cidade: "SP" } }),
    ]
    const result = getTopClientes(pedidos, 5)
    expect(result).toHaveLength(1)
    expect(result[0].nome).toBe("Alice")
  })
})

describe("calcularPesoVendido", () => {
  it("retorna 0 para lista vazia", () => {
    expect(calcularPesoVendido([])).toBe(0)
  })

  it("soma quantidade * pesoUnit de um pedido", () => {
    const pedidos = [{ itens: [{ quantidade: 3, pesoUnit: 5 }] }]
    expect(calcularPesoVendido(pedidos)).toBe(15)
  })

  it("soma múltiplos itens e múltiplos pedidos", () => {
    const pedidos = [
      { itens: [{ quantidade: 2, pesoUnit: 10 }, { quantidade: 1, pesoUnit: 5 }] },
      { itens: [{ quantidade: 3, pesoUnit: 2 }] },
    ]
    expect(calcularPesoVendido(pedidos)).toBe(31)
  })
})

describe("calcularVendasPagas", () => {
  it("retorna 0 para lista vazia", () => {
    expect(calcularVendasPagas([])).toBe(0)
  })

  it("soma apenas pedidos com statusPagamento PAGO", () => {
    const pedidos = [
      makePedido({ statusPagamento: "PAGO", itens: [{ quantidade: 2, valorUnit: 50, pesoUnit: 1 }] }),
      makePedido({ statusPagamento: "PENDENTE", itens: [{ quantidade: 1, valorUnit: 200, pesoUnit: 1 }] }),
      makePedido({ statusPagamento: "FIADO", itens: [{ quantidade: 3, valorUnit: 100, pesoUnit: 1 }] }),
    ]
    expect(calcularVendasPagas(pedidos)).toBe(100) // apenas 2 × 50
  })

  it("soma múltiplos pedidos PAGO", () => {
    const pedidos = [
      makePedido({ statusPagamento: "PAGO", itens: [{ quantidade: 1, valorUnit: 100, pesoUnit: 1 }] }),
      makePedido({ statusPagamento: "PAGO", itens: [{ quantidade: 2, valorUnit: 75, pesoUnit: 1 }] }),
    ]
    expect(calcularVendasPagas(pedidos)).toBe(250)
  })
})

describe("getPeriodoDates", () => {
  it("hoje: start e end no mesmo dia", () => {
    const { start, end } = getPeriodoDates("hoje")
    expect(start.getDate()).toBe(end.getDate())
    expect(start.getHours()).toBe(0)
    expect(end.getHours()).toBe(23)
  })

  it("semana: start ~6 dias atrás", () => {
    const { start, end } = getPeriodoDates("semana")
    const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    expect(diffDays).toBe(6)
  })

  it("mes: start ~29 dias atrás", () => {
    const { start, end } = getPeriodoDates("mes")
    const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    expect(diffDays).toBe(29)
  })

  it("trimestre: start ~89 dias atrás", () => {
    const { start, end } = getPeriodoDates("trimestre")
    const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    expect(diffDays).toBe(89)
  })

  it("anual: start ~364 dias atrás", () => {
    const { start, end } = getPeriodoDates("anual")
    const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    expect(diffDays).toBe(364)
  })
})
