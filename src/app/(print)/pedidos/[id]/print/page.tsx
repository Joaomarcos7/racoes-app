import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  LINHA_WIDTH,
  calcularSubtotal,
  calcularTotal,
  formatarDataEmissao,
  gerarScriptImpressao,
} from "@/lib/cupom-fiscal-utils"

const METODO_LABELS: Record<string, string> = {
  DINHEIRO: "DINHEIRO",
  PIX: "PIX",
  BOLETO: "BOLETO",
  CHEQUE: "CHEQUE",
  CARTAO_CREDITO: "CARTAO CREDITO",
  CARTAO_DEBITO: "CARTAO DEBITO",
}

const STATUS_PAG_LABELS: Record<string, string> = {
  PENDENTE: "PENDENTE",
  PAGO: "PAGO",
  FIADO: "FIADO",
}

const SEP = "─".repeat(LINHA_WIDTH)
const SEP_DOUBLE = "═".repeat(LINHA_WIDTH)

const printStyles = `
  @page { size: 80mm auto; margin: 4mm; }
  *, *::before, *::after { box-sizing: border-box; }
  body {
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    width: 72mm;
    margin: 0;
    padding: 0;
    color: #000;
    background: white;
  }
  pre {
    white-space: pre;
    overflow-x: hidden;
    margin: 0;
    font-family: inherit;
    font-size: inherit;
  }
  .destaque {
    font-family: 'Courier New', Courier, monospace;
    font-size: 15px;
    font-weight: bold;
    margin: 0;
    white-space: pre;
  }
  table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    font-family: 'Courier New', Courier, monospace;
    font-size: 13px;
    font-weight: bold;
    margin: 0;
  }
  th, td {
    padding: 0;
    white-space: nowrap;
    overflow: hidden;
    font-family: inherit;
    font-size: inherit;
    font-weight: bold;
    vertical-align: top;
  }
  th:first-child, td:first-child { text-align: left; }
  th:nth-child(2), td:nth-child(2) { text-align: left; padding-right: 4px; white-space: normal; overflow: visible; word-break: break-word; }
  th:nth-child(3), td:nth-child(3) { text-align: right; padding-right: 4px; }
  th:last-child, td:last-child { text-align: right; }
  thead { border-bottom: 1px solid #000; }
  .peso-total {
    font-family: 'Courier New', Courier, monospace;
    font-size: 15px;
    font-weight: bold;
    margin: 2px 0 0 0;
  }
  [data-sonner-toaster], header, nav, aside { display: none !important; }
  @media print {
    body { margin: 0; }
    [data-sonner-toaster], header, nav, aside { display: none !important; }
  }
`

export default async function CupomFiscalPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: { cliente: true, itens: { include: { produto: true } } },
  })

  if (!pedido) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: printStyles }} />
        <p>Pedido não encontrado.</p>
      </>
    )
  }

  const subtotal = calcularSubtotal(pedido.itens)
  const desconto = pedido.desconto ?? 0
  const total = calcularTotal(subtotal, desconto)
  const dataEmissao = formatarDataEmissao(new Date())

  const isEntrega = pedido.tipoPedido === "ENTREGA"
  const clienteInfo =
    isEntrega && pedido.cliente
      ? `ENTREGA | ${pedido.cliente.nome}`
      : "VENDA BALCAO"
  const cidadeInfo = isEntrega && pedido.cliente ? pedido.cliente.cidade : null

  const metodoLabel = pedido.metodoPagamento
    ? ` | ${METODO_LABELS[pedido.metodoPagamento] ?? pedido.metodoPagamento}`
    : ""
  const pagamentoLine = `${STATUS_PAG_LABELS[pedido.statusPagamento] ?? pedido.statusPagamento}${metodoLabel}`

  const pesoTotal = pedido.itens.reduce(
    (acc, item) => acc + item.pesoUnit * item.quantidade,
    0
  )

  const topLines = [
    SEP_DOUBLE,
    "               COMERCIAL OURIQUES               ",
    SEP_DOUBLE,
    "PEDIDO",
    "",
    `Data emissao: ${dataEmissao}`,
  ]

  const footerLines = [
    SEP,
    rightAlign("Subtotal:", formatBRL(subtotal)),
    ...(desconto > 0 ? [rightAlign("Desconto:", `-${formatBRL(desconto)}`)] : []),
    rightAlign("TOTAL:   ", formatBRL(total)),
    SEP,
    `Pagamento: ${pagamentoLine}`,
    ...(pedido.observacoes ? [SEP, ...wrapText(`Obs: ${pedido.observacoes}`, LINHA_WIDTH)] : []),
    SEP_DOUBLE,
  ]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <script dangerouslySetInnerHTML={{ __html: gerarScriptImpressao("/pedidos") }} />
      <pre>{topLines.join("\n")}</pre>
      <div className="destaque">{`Pedido: ${clienteInfo}`}</div>
      {cidadeInfo && <div className="destaque">{`Cidade:  ${cidadeInfo}`}</div>}
      <pre>{SEP}</pre>
      <table>
        <colgroup>
          <col style={{ width: "10%" }} />
          <col style={{ width: "50%" }} />
          <col style={{ width: "21%" }} />
          <col style={{ width: "19%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>QTD</th>
            <th>PRODUTO</th>
            <th>V.UNIT</th>
            <th>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {pedido.itens.map((item) => (
            <tr key={item.id}>
              <td>{item.quantidade}</td>
              <td>{item.produto.nome}</td>
              <td>{item.valorUnit.toFixed(2).replace(".", ",")}</td>
              <td>{(item.quantidade * item.valorUnit).toFixed(2).replace(".", ",")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="peso-total">{`PESO TOTAL: ${pesoTotal.toFixed(1)} kg`}</div>
      <pre>{footerLines.join("\n")}</pre>
    </>
  )
}

function formatBRL(value: number): string {
  return `R$${value.toFixed(2).replace(".", ",")}`
}

function rightAlign(label: string, value: string, width: number = LINHA_WIDTH): string {
  const padding = Math.max(0, width - label.length - value.length)
  return `${label}${" ".repeat(padding)}${value}`
}

function wrapText(text: string, width: number): string[] {
  const words = text.split(" ")
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    if (current.length === 0) {
      current = word
    } else if (current.length + 1 + word.length <= width) {
      current += " " + word
    } else {
      lines.push(current)
      current = word
    }
  }
  if (current.length > 0) lines.push(current)
  return lines
}
