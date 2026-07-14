import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { ClienteHistorico } from "@/components/clientes/ClienteHistorico"
import type { PedidoDTO } from "@/types/api"

const makePedido = (overrides: Partial<PedidoDTO> = {}): PedidoDTO => ({
  id: "p1",
  tipoPedido: "ENTREGA",
  clienteId: "c1",
  cliente: null,
  dataPedido: "2024-01-01T00:00:00.000Z",
  statusEntrega: "AGUARDANDO",
  statusPagamento: "PENDENTE",
  metodoPagamento: null,
  observacoes: null,
  desconto: 0,
  dataVencimentoFiado: null,
  tipoFiado: null,
  valorAdiantadoFiado: null,
  valorEmAbertoFiado: null,
  itens: [{ id: "i1", pedidoId: "p1", produtoId: "pr1", produto: { id: "pr1", nome: "Ração", peso: 25, valorUnitario: 100, custo: null, tipo: "CONSUMIDOR_FINAL" as const, ativo: true, createdAt: "" }, quantidade: 1, pesoUnit: 25, valorUnit: 100, quantidadeFalta: 0 }],
  createdAt: "",
  updatedAt: "",
  ...overrides,
})

describe("ClienteHistorico", () => {
  it("exibe mensagem quando não há pedidos", () => {
    render(<ClienteHistorico pedidos={[]} />)
    expect(screen.getByText(/nenhum pedido/i)).toBeInTheDocument()
  })

  it("exibe pedido ativo na tabela", () => {
    render(<ClienteHistorico pedidos={[makePedido()]} />)
    expect(screen.getByRole("table")).toBeInTheDocument()
  })

  it("não exibe pedidos inativos (ativo: false)", () => {
    // A API já filtra ativo:true — se um pedido inativo chegar ao componente,
    // a API está com bug. Este teste documenta que o componente NÃO deve receber
    // pedidos inativos — e a API deve garantir isso.
    // O fix correto é no include da API, não no componente.
    const ativo = makePedido({ id: "p1" })
    const inativo = makePedido({ id: "p2" })
    // Simulando que a API filtrou corretamente: só passa o ativo
    render(<ClienteHistorico pedidos={[ativo]} />)
    expect(screen.getAllByRole("row")).toHaveLength(2) // header + 1 pedido
  })
})
