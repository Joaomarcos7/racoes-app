import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PedidoEntregaForm } from "@/components/pedidos/PedidoEntregaForm"
import type { ClienteDTO } from "@/types/api"

const mockCliente: ClienteDTO = {
  id: "cliente-1",
  nome: "João Silva",
  cidade: "São Paulo",
  telefone: null,
  instituicao: null,
  cep: null,
  endereco: null,
  complemento: null,
  ativo: true,
}

vi.mock("@/hooks/use-clientes", () => ({
  useClientes: () => ({ data: { data: [mockCliente] }, isLoading: false }),
}))

vi.mock("@/hooks/use-produtos", () => ({
  useProdutos: () => ({ data: [], isLoading: false }),
}))

vi.mock("@/components/pedidos/ClienteSearchInput", () => ({
  ClienteSearchInput: ({ onSelect, selected }: { onSelect: (c: ClienteDTO) => void; selected: ClienteDTO | null; onClear: () => void }) =>
    selected
      ? <div data-testid="cliente-selecionado">{selected.nome}</div>
      : <button type="button" onClick={() => onSelect(mockCliente)}>Selecionar Cliente</button>,
}))

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
}

describe("PedidoEntregaForm", () => {
  it("does not show campos nome/cidade for auto-create cliente", () => {
    render(<PedidoEntregaForm onSubmit={vi.fn()} onCancel={vi.fn()} />, { wrapper })
    expect(screen.queryByPlaceholderText(/nome do cliente/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/novo cliente/i)).not.toBeInTheDocument()
  })

  it("disables submit button when no client selected", () => {
    render(<PedidoEntregaForm onSubmit={vi.fn()} onCancel={vi.fn()} />, { wrapper })
    const btn = screen.getByRole("button", { name: /criar pedido/i })
    expect(btn).toBeDisabled()
  })

  it("shows link to cadastrar client when no client selected", () => {
    render(<PedidoEntregaForm onSubmit={vi.fn()} onCancel={vi.fn()} />, { wrapper })
    expect(screen.getByRole("link", { name: /cadastrar cliente/i })).toBeInTheDocument()
  })

  it("does not show statusEntrega selector", () => {
    render(<PedidoEntregaForm onSubmit={vi.fn()} onCancel={vi.fn()} />, { wrapper })
    expect(screen.queryByText(/status.*entrega/i)).not.toBeInTheDocument()
  })

  it("calls onSubmit with tipoPedido ENTREGA and clienteId when client selected", () => {
    const onSubmit = vi.fn()
    render(<PedidoEntregaForm onSubmit={onSubmit} onCancel={vi.fn()} />, { wrapper })

    fireEvent.click(screen.getByRole("button", { name: /selecionar cliente/i }))
    expect(screen.getByTestId("cliente-selecionado")).toBeInTheDocument()

    fireEvent.submit(screen.getByRole("form"))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        tipoPedido: "ENTREGA",
        clienteId: "cliente-1",
      })
    )
    expect(onSubmit).not.toHaveBeenCalledWith(
      expect.objectContaining({ clienteNome: expect.anything() })
    )
  })

  it("calls onCancel when cancel clicked", () => {
    const onCancel = vi.fn()
    render(<PedidoEntregaForm onSubmit={vi.fn()} onCancel={onCancel} />, { wrapper })
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })
})
