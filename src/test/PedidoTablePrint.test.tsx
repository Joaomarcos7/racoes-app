import { describe, it, expect, vi } from "vitest"
import { render, fireEvent } from "@testing-library/react"
import { PedidoTable } from "@/components/pedidos/PedidoTable"

const makePedido = (id: string) => ({
  id,
  tipoPedido: "BALCAO" as const,
  cliente: null,
  dataPedido: "2026-06-05",
  statusEntrega: null,
  statusPagamento: "PAGO" as const,
  metodoPagamento: "PIX" as const,
  observacoes: null,
  desconto: 0,
  dataVencimentoFiado: null,
  itens: [],
  createdAt: "2026-06-05",
  updatedAt: "2026-06-05",
})

describe("PedidoTable print button", () => {
  it("opens print page in new tab when printer icon is clicked", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)

    const { getAllByLabelText } = render(
      <PedidoTable pedidos={[makePedido("abc123")]} onDelete={vi.fn()} />
    )

    const printBtn = getAllByLabelText("Imprimir cupom")[0]
    fireEvent.click(printBtn)

    expect(openSpy).toHaveBeenCalledWith("/pedidos/abc123/print", "_blank")
    openSpy.mockRestore()
  })
})
