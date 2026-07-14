import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { ItemPedidoRow, type ItemLocal } from "@/components/pedidos/ItemPedidoRow"

const item: ItemLocal = {
  produtoId: "p1",
  nome: "Ração 25kg",
  pesoUnit: 25,
  valorUnit: 100,
  quantidade: 1,
  pesoVariavel: false,
}

describe("ItemPedidoRow — quantidade input", () => {
  it("permite digitar quantidade livremente sem acumular dígitos anteriores", () => {
    const onChange = vi.fn()
    render(<ItemPedidoRow item={item} onChange={onChange} onRemove={vi.fn()} />)

    const input = screen.getByRole("spinbutton")
    // Simula o usuário limpando e digitando "20"
    fireEvent.change(input, { target: { value: "20" } })

    expect(onChange).toHaveBeenCalledWith("p1", 20)
    // Não deve ter chamado com 120 (1 + "20")
    expect(onChange).not.toHaveBeenCalledWith("p1", 120)
  })

  it("ignora entrada vazia sem chamar onChange com NaN", () => {
    const onChange = vi.fn()
    render(<ItemPedidoRow item={item} onChange={onChange} onRemove={vi.fn()} />)

    const input = screen.getByRole("spinbutton")
    fireEvent.change(input, { target: { value: "" } })

    expect(onChange).not.toHaveBeenCalledWith("p1", NaN)
  })

  it("mostra valor local enquanto digita antes de propagar", () => {
    render(<ItemPedidoRow item={item} onChange={vi.fn()} onRemove={vi.fn()} />)

    const input = screen.getByRole("spinbutton") as HTMLInputElement
    fireEvent.change(input, { target: { value: "2" } })

    expect(input.value).toBe("2")
  })
})
