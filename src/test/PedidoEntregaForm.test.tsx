import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PedidoEntregaForm } from "@/components/pedidos/PedidoEntregaForm"

vi.mock("@/hooks/use-clientes", () => ({
  useClientes: () => ({ data: [], isLoading: false }),
}))

vi.mock("@/hooks/use-produtos", () => ({
  useProdutos: () => ({ data: [], isLoading: false }),
}))

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
}

describe("PedidoEntregaForm", () => {
  it("renders nome do cliente and cidade fields for auto-create", () => {
    render(<PedidoEntregaForm onSubmit={vi.fn()} onCancel={vi.fn()} />, { wrapper })
    expect(screen.getByPlaceholderText(/nome do cliente/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/cidade/i)).toBeInTheDocument()
  })

  it("does not show statusEntrega selector (only set after creation)", () => {
    render(<PedidoEntregaForm onSubmit={vi.fn()} onCancel={vi.fn()} />, { wrapper })
    expect(screen.queryByText(/status.*entrega/i)).not.toBeInTheDocument()
  })

  it("calls onSubmit with tipoPedido ENTREGA and cliente fields", () => {
    const onSubmit = vi.fn()
    render(<PedidoEntregaForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText(/nome do cliente/i), { target: { value: "João Silva" } })
    fireEvent.change(screen.getByPlaceholderText(/cidade/i), { target: { value: "São Paulo" } })

    fireEvent.submit(screen.getByRole("form"))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        tipoPedido: "ENTREGA",
        clienteNome: "João Silva",
        clienteCidade: "São Paulo",
      })
    )
  })

  it("calls onCancel when cancel clicked", () => {
    const onCancel = vi.fn()
    render(<PedidoEntregaForm onSubmit={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })
})
