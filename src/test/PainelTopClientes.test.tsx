import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { PainelTopClientes } from "@/components/dashboard/PainelTopClientes"

const clientes = [
  { id: "c1", nome: "Alice", cidade: "SP", count: 5, total: 1000 },
  { id: "c2", nome: "Bob", cidade: "RJ", count: 2, total: 300 },
]

describe("PainelTopClientes", () => {
  it("renders client names", () => {
    render(<PainelTopClientes clientes={clientes} />)
    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
  })

  it("renders order count for each client", () => {
    render(<PainelTopClientes clientes={clientes} />)
    expect(screen.getByText("5 pedidos")).toBeInTheDocument()
    expect(screen.getByText("2 pedidos")).toBeInTheDocument()
  })

  it("renders empty state when no clients", () => {
    render(<PainelTopClientes clientes={[]} />)
    expect(screen.getByText(/nenhum cliente/i)).toBeInTheDocument()
  })
})
