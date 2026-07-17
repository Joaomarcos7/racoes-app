export const LINHA_WIDTH = 42
// Pedido line 2: 8(indent) + 7(kg) + 7(gap) + 4(qt) + 4(gap) + 12(total) = 42
const L2_INDENT = 8
const L2_KG_WIDTH = 7
const L2_GAP1 = 7
const L2_QT_WIDTH = 4
const L2_GAP2 = 4
const L2_TOTAL_WIDTH = LINHA_WIDTH - L2_INDENT - L2_KG_WIDTH - L2_GAP1 - L2_QT_WIDTH - L2_GAP2 // = 12
export const TOTAL_COL_WIDTH = L2_TOTAL_WIDTH
export const NOME_COL_WIDTH = LINHA_WIDTH

export function padEnd(str: string, width: number): string {
  if (str.length >= width) return str.slice(0, width)
  return str + " ".repeat(width - str.length)
}

export function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max)
}

function padStart(str: string, width: number): string {
  if (str.length >= width) return str.slice(0, width)
  return " ".repeat(width - str.length) + str
}

function buildLine2(kgStr: string, qtStr: string, totalStr: string): string {
  return (
    " ".repeat(L2_INDENT) +
    padStart(kgStr, L2_KG_WIDTH) +
    " ".repeat(L2_GAP1) +
    padStart(qtStr, L2_QT_WIDTH) +
    " ".repeat(L2_GAP2) +
    padStart(totalStr, L2_TOTAL_WIDTH)
  )
}

export function formatarLinhaProduto(
  nome: string,
  pesoKg: number,
  quantidade: number,
  total: number
): string {
  const totalStr = `R$${total.toFixed(2).replace(".", ",")}`
  const line1 = padEnd(truncate(nome, LINHA_WIDTH), LINHA_WIDTH)
  const line2 = buildLine2(`${pesoKg}kg`, String(quantidade), totalStr)
  return `${line1}\n${line2}`
}

export function headerLinhaProduto(): string {
  const line1 = padEnd("PRODUTO", LINHA_WIDTH)
  const line2 = buildLine2("KG", "QT", "TOTAL")
  return `${line1}\n${line2}`
}

// Rota: NOME(18) + '  |  '(5) + QTD(5) + '  |  '(5) + PESO(9) = 42
const ROTA_NOME_WIDTH = 18
const ROTA_QTD_WIDTH = 5
const ROTA_PESO_WIDTH = LINHA_WIDTH - ROTA_NOME_WIDTH - 5 - ROTA_QTD_WIDTH - 5 // = 9

export function headerLinhaProdutoRota(): string {
  return `${padEnd("PRODUTO", ROTA_NOME_WIDTH)}  |  ${padStart("QTD", ROTA_QTD_WIDTH)}  |  ${padStart("PESO", ROTA_PESO_WIDTH)}`
}

export function formatarLinhaProdutoRota(nome: string, quantidade: number, pesoTotal: number): string {
  const nomeCol = padEnd(truncate(nome, ROTA_NOME_WIDTH), ROTA_NOME_WIDTH)
  const qtdCol = padStart(String(quantidade), ROTA_QTD_WIDTH)
  const pesoCol = padStart(`${pesoTotal.toFixed(1)}kg`, ROTA_PESO_WIDTH)
  return `${nomeCol}  |  ${qtdCol}  |  ${pesoCol}`
}

export function calcularSubtotal(
  itens: { quantidade: number; valorUnit: number }[]
): number {
  return itens.reduce((acc, item) => acc + item.quantidade * item.valorUnit, 0)
}

export function calcularTotal(subtotal: number, desconto: number): number {
  return Math.max(0, subtotal - desconto)
}

export function gerarScriptImpressao(redirectUrl: string): string {
  return `window.onload = function() { window.print(); window.addEventListener('afterprint', function() { window.location.href = '${redirectUrl}'; }); };`
}

export function formatarDataEmissao(date: Date): string {
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }
  return date.toLocaleString("pt-BR", opts).replace(",", "")
}
