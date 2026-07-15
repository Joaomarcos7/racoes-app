export const LINHA_WIDTH = 42
// Fixed column widths: 1(sep) + 5(kg) + 1(sep) + 3(qtd) + 1(sep) + 9(total) = 20
export const TOTAL_COL_WIDTH = 9
export const NOME_COL_WIDTH = LINHA_WIDTH - 20 // = 22

export function padEnd(str: string, width: number): string {
  if (str.length >= width) return str.slice(0, width)
  return str + " ".repeat(width - str.length)
}

export function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max)
}

const PESO_COL_WIDTH = 5
const QTD_COL_WIDTH = 3

function padStart(str: string, width: number): string {
  if (str.length >= width) return str.slice(0, width)
  return " ".repeat(width - str.length) + str
}

export function formatarLinhaProduto(
  nome: string,
  pesoKg: number,
  quantidade: number,
  total: number
): string {
  const totalStr = `R$${total.toFixed(2).replace(".", ",")}`
  const totalCol = padStart(totalStr, TOTAL_COL_WIDTH)
  const qtdStr = String(quantidade)
  const pesoStr = `${pesoKg}kg`
  const rightSide = ` ${padStart(pesoStr, PESO_COL_WIDTH)} ${padStart(qtdStr, QTD_COL_WIDTH)} ${totalCol}`
  return padEnd(truncate(nome, NOME_COL_WIDTH), NOME_COL_WIDTH) + rightSide
}

export function headerLinhaProduto(): string {
  const rightSide = ` ${padStart("KG", PESO_COL_WIDTH)} ${padStart("QT", QTD_COL_WIDTH)} ${padStart("TOTAL", TOTAL_COL_WIDTH)}`
  return padEnd("PRODUTO", NOME_COL_WIDTH) + rightSide
}

// Rota print: NOME(24) + QTD(6) + PESO(12) = 42
const ROTA_NOME_WIDTH = 24
const ROTA_QTD_WIDTH = 6
const ROTA_PESO_WIDTH = LINHA_WIDTH - ROTA_NOME_WIDTH - ROTA_QTD_WIDTH

function rotaQtdCol(str: string): string {
  return " ".repeat(Math.max(0, ROTA_QTD_WIDTH - str.length)) + str
}

function rotaPesoCol(str: string): string {
  return " ".repeat(Math.max(0, ROTA_PESO_WIDTH - str.length)) + str
}

export function headerLinhaProdutoRota(): string {
  return padEnd("PRODUTO", ROTA_NOME_WIDTH) + rotaQtdCol("QTD") + rotaPesoCol("PESO(kg)")
}

export function formatarLinhaProdutoRota(nome: string, quantidade: number, pesoTotal: number): string {
  const nomeCol = padEnd(truncate(nome, ROTA_NOME_WIDTH), ROTA_NOME_WIDTH)
  const qtdCol = rotaQtdCol(String(quantidade))
  const pesoCol = rotaPesoCol(`${pesoTotal.toFixed(1)}kg`)
  return nomeCol + qtdCol + pesoCol
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
