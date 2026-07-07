import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { PedidoBalcaoForm } from "@/components/pedidos/PedidoBalcaoForm"

vi.mock("@/hooks/use-produtos", () => ({
  useProdutos: () => ({ data: [], isLoading: false }),
}))

vi.mock("@/hooks/use-clientes", () => ({
  useClientes: () => ({ data: [], isLoading: false }),
}))

describe("PedidoBalcaoForm", () => {
  it("client field is marked as optional in the label", () => {
    render(<PedidoBalcaoForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getAllByText(/opcional/i).length).toBeGreaterThanOrEqual(1)
  })

  it("client search input placeholder indicates optional", () => {
    render(<PedidoBalcaoForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByPlaceholderText(/opcional/i)).toBeInTheDocument()
  })

  it("does not show statusEntrega field", () => {
    render(<PedidoBalcaoForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.queryByText(/status.*entrega/i)).not.toBeInTheDocument()
  })

  it("calls onCancel when cancel clicked", () => {
    const onCancel = vi.fn()
    render(<PedidoBalcaoForm onSubmit={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })
})
