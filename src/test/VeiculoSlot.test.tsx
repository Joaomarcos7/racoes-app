import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { VeiculoSlot } from "@/components/consolidacao/VeiculoSlot"
import type { VeiculoDTO, PedidoDTO } from "@/types/api"

const veiculo: VeiculoDTO = { id: "v1", placa: "ABC-1234", modelo: "Fiat", ano: 2022, carroceria: "BAU", cor: "Branco", pesoMaximo: 1000, ativo: true }

const pedido: PedidoDTO = {
  id: "p1",
  tipoPedido: "ENTREGA",
  clienteId: "c1",
  cliente: { id: "c1", nome: "João", cidade: "SP", telefone: null, instituicao: null, cep: null, endereco: null, complemento: null, ativo: true, createdAt: "" },
  dataPedido: "",
  statusEntrega: "AGUARDANDO",
  statusPagamento: "PENDENTE",
  metodoPagamento: null,
  observacoes: null,
  desconto: 0,
  dataVencimentoFiado: null,
  itens: [{ id: "i1", pedidoId: "p1", produtoId: "pr1", produto: { id: "pr1", nome: "Ração", peso: 25, valorUnitario: 100, custo: null, tipo: "CONSUMIDOR_FINAL" as const, ativo: true, createdAt: "" }, quantidade: 1, pesoUnit: 25, valorUnit: 100 }],
  createdAt: "",
  updatedAt: "",
}

describe("VeiculoSlot", () => {
  it("mostra botão Remover quando onDesalocar fornecido", () => {
    render(<VeiculoSlot veiculo={veiculo} pedidos={[pedido]} pesoAtual={25} onDesalocar={() => {}} />)
    expect(screen.getByText("Remover")).toBeInTheDocument()
  })

  it("não mostra botão Remover quando onDesalocar não fornecido (rota fechada)", () => {
    render(<VeiculoSlot veiculo={veiculo} pedidos={[pedido]} pesoAtual={25} />)
    expect(screen.queryByText("Remover")).not.toBeInTheDocument()
  })
})
