import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect } from "vitest"
import { PainelFiado } from "@/components/dashboard/PainelFiado"

const clientes = [
  { id: "1", nome: "João Silva", cidade: "Porto Alegre", totalFiado: 150.5 },
  { id: "2", nome: "Maria Souza", cidade: "Florianópolis", totalFiado: 300.0 },
]

const make6Clientes = () =>
  Array.from({ length: 6 }, (_, i) => ({
    id: String(i + 1),
    nome: `Cliente ${i + 1}`,
    cidade: "Cidade",
    totalFiado: 100,
  }))

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

  it("shows at most 5 clients per page by default", () => {
    render(<PainelFiado clientes={make6Clientes()} totalFiado={600} />)
    expect(screen.getByText("Cliente 1")).toBeInTheDocument()
    expect(screen.getByText("Cliente 5")).toBeInTheDocument()
    expect(screen.queryByText("Cliente 6")).not.toBeInTheDocument()
  })

  it("shows next page clients after clicking next", async () => {
    render(<PainelFiado clientes={make6Clientes()} totalFiado={600} />)
    await userEvent.click(screen.getByRole("button", { name: /próxima página/i }))
    expect(screen.getByText("Cliente 6")).toBeInTheDocument()
    expect(screen.queryByText("Cliente 1")).not.toBeInTheDocument()
  })

  it("no pagination shown when 5 or fewer clients", () => {
    render(<PainelFiado clientes={clientes} totalFiado={450.5} />)
    expect(screen.queryByRole("button", { name: /próxima página/i })).not.toBeInTheDocument()
  })
})
