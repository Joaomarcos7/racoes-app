import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  LINHA_WIDTH,
  formatarDataEmissao,
  gerarScriptImpressao,
} from "@/lib/cupom-fiscal-utils"
import { aggregateProdutosAlocados } from "@/lib/consolidacao-utils"

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
  table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    font-family: 'Courier New', Courier, monospace;
    font-size: 11px;
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
  }
  th:first-child, td:first-child { text-align: right; padding-right: 8px; }
  th:last-child, td:last-child { text-align: left; }
  thead { border-bottom: 1px solid #000; }
  .totais {
    font-family: 'Courier New', Courier, monospace;
    font-size: 15px;
    font-weight: bold;
    margin-top: 4px;
  }
  .totais-linha {
    display: flex;
    justify-content: space-between;
  }
  [data-sonner-toaster], header, nav, aside { display: none !important; }
  @media print {
    body { margin: 0; }
    [data-sonner-toaster], header, nav, aside { display: none !important; }
  }
`

export default async function RotaPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params
  const rota = await prisma.consolidacaoRota.findUnique({
    where: { id },
    include: {
      veiculo: true,
      itens: {
        include: { pedido: { include: { cliente: true, itens: { include: { produto: true } } } } },
        orderBy: { pedido: { cliente: { cidade: "asc" } } },
      },
    },
  })

  if (!rota) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: printStyles }} />
        <p>Rota não encontrada.</p>
      </>
    )
  }

  const dataEmissao = formatarDataEmissao(new Date())
  const dataRota = new Date(rota.data).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  const cidades = [...new Set(
    rota.itens
      .map((ci) => ci.pedido.cliente?.cidade)
      .filter(Boolean) as string[]
  )]

  const pedidosSimples = rota.itens.map((ci) => ({
    itens: ci.pedido.itens.map((i) => ({
      produto: { nome: i.produto.nome, tipo: i.produto.tipo },
      quantidade: i.quantidade,
      pesoUnit: i.pesoUnit,
      quantidadeFalta: i.quantidadeFalta ?? 0,
    })),
  }))

  const produtos = aggregateProdutosAlocados(pedidosSimples)
  const totalUnidades = produtos.reduce((acc, p) => acc + p.quantidade, 0)
  const totalPeso = produtos.reduce((acc, p) => acc + p.pesoTotal, 0)

  const headerLines = [
    SEP_DOUBLE,
    "               COMERCIAL OURIQUES               ",
    SEP_DOUBLE,
    "CUPOM NAO FISCAL - ROTA",
    "",
    `Data emissao: ${dataEmissao}`,
    `Data rota:    ${dataRota}`,
    `Veiculo:      ${rota.veiculo.placa} ${rota.veiculo.modelo}`,
    ...(cidades.length > 0 ? [`Cidades:      ${cidades.join(", ")}`] : []),
    SEP,
  ]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <script dangerouslySetInnerHTML={{ __html: gerarScriptImpressao("/consolidacao") }} />
      <pre>{headerLines.join("\n")}</pre>
      <table>
        <colgroup>
          <col style={{ width: "20%" }} />
          <col style={{ width: "80%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>QTD</th>
            <th>PRODUTO</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p, i) => (
            <tr key={i}>
              <td>{p.quantidade}</td>
              <td>{p.nome}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <pre>{SEP}</pre>
      <div className="totais">
        <div className="totais-linha">
          <span>TOTAL UNIDADES:</span>
          <span>{totalUnidades} un</span>
        </div>
        <div className="totais-linha">
          <span>PESO TOTAL:</span>
          <span>{totalPeso.toFixed(1)} kg</span>
        </div>
      </div>
      <pre>{SEP_DOUBLE}</pre>
    </>
  )
}
