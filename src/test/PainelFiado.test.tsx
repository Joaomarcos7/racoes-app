import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { PainelFiado } from "@/components/dashboard/PainelFiado"

const clientes = [
  { id: "1", nome: "João Silva", cidade: "Porto Alegre", totalFiado: 150.5 },
  { id: "2", nome: "Maria Souza", cidade: "Florianópolis", totalFiado: 300.0 },
]

describe("PainelFiado", () => {
  it("shows total client count", () => {
    render(<PainelFiado clientes={clientes} totalFiado={450.5} />)
    expect(screen.getByText("2 clientes")).toBeInTheDocument()
  })

  it("shows total fiado value", () => {
    render(<PainelFiado clientes={clientes} totalFiado={450.5} />)
    expect(screen.getByText("R$ 450,50")).toBeInTheDocument()
  })

  it("lists each client name", () => {
    render(<PainelFiado clientes={clientes} totalFiado={450.5} />)
    expect(screen.getByText("João Silva")).toBeInTheDocument()
    expect(screen.getByText("Maria Souza")).toBeInTheDocument()
  })

  it("shows empty state when no clients", () => {
    render(<PainelFiado clientes={[]} totalFiado={0} />)
    expect(screen.getByText(/nenhum fiado em aberto/i)).toBeInTheDocument()
  })
})
