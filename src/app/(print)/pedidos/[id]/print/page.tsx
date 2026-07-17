import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  LINHA_WIDTH,
  calcularSubtotal,
  calcularTotal,
  formatarLinhaProduto,
  headerLinhaProduto,
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
    font-size: 9px;
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

  const linhasItens = pedido.itens.map((item) =>
    formatarLinhaProduto(item.produto.nome, item.pesoUnit, item.quantidade, item.quantidade * item.valorUnit)
  )

  const cupomLines = [
    SEP_DOUBLE,
    "               COMERCIAL OURIQUES               ",
    SEP_DOUBLE,
    "CUPOM NAO FISCAL",
    "",
    `Data emissao: ${dataEmissao}`,
    `Pedido: ${clienteInfo}`,
    ...(cidadeInfo ? [`Cidade: ${cidadeInfo}`] : []),
    SEP,
    headerLinhaProduto(),
    ...linhasItens,
    SEP,
    rightAlign("Subtotal:", formatBRL(subtotal)),
    ...(desconto > 0 ? [rightAlign("Desconto:", `-${formatBRL(desconto)}`)] : []),
    rightAlign("TOTAL:   ", formatBRL(total)),
    SEP,
    `Pagamento: ${pagamentoLine}`,
    ...(pedido.observacoes ? [SEP, `Obs: ${pedido.observacoes}`] : []),
    SEP_DOUBLE,
  ]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <script dangerouslySetInnerHTML={{ __html: gerarScriptImpressao("/pedidos") }} />
      <pre>{cupomLines.join("\n")}</pre>
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
