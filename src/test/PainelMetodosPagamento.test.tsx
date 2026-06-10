import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { PainelMetodosPagamento } from "@/components/dashboard/PainelMetodosPagamento"

const stats = [
  { metodo: "PIX", count: 5, total: 500 },
  { metodo: "DINHEIRO", count: 2, total: 200 },
]

describe("PainelMetodosPagamento", () => {
  it("renders each method name", () => {
    render(<PainelMetodosPagamento stats={stats} />)
    expect(screen.getByText("Pix")).toBeInTheDocument()
    expect(screen.getByText("Dinheiro")).toBeInTheDocument()
  })

  it("renders count for each method", () => {
    render(<PainelMetodosPagamento stats={stats} />)
    expect(screen.getByText(/5 pedidos/)).toBeInTheDocument()
    expect(screen.getByText(/2 pedidos/)).toBeInTheDocument()
  })

  it("renders empty state when no stats", () => {
    render(<PainelMetodosPagamento stats={[]} />)
    expect(screen.getByText(/nenhum pagamento/i)).toBeInTheDocument()
  })
})
