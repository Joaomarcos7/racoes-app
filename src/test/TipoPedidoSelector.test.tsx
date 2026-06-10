import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { TipoPedidoSelector } from "@/components/pedidos/TipoPedidoSelector"

describe("TipoPedidoSelector", () => {
  it("renders both options", () => {
    render(<TipoPedidoSelector onSelect={vi.fn()} />)
    expect(screen.getByText(/entrega/i)).toBeInTheDocument()
    expect(screen.getByText(/balcão/i)).toBeInTheDocument()
  })

  it("calls onSelect with ENTREGA when entrega option clicked", () => {
    const onSelect = vi.fn()
    render(<TipoPedidoSelector onSelect={onSelect} />)
    fireEvent.click(screen.getByRole("button", { name: /entrega/i }))
    expect(onSelect).toHaveBeenCalledWith("ENTREGA")
  })

  it("calls onSelect with BALCAO when balcão option clicked", () => {
    const onSelect = vi.fn()
    render(<TipoPedidoSelector onSelect={onSelect} />)
    fireEvent.click(screen.getByRole("button", { name: /balcão/i }))
    expect(onSelect).toHaveBeenCalledWith("BALCAO")
  })
})
