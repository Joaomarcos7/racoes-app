export const LINHA_WIDTH = 48
// Fixed column positions: NOME[0..27] KG[28..33] QT[34..38] TOTAL[39..47]
const PEDIDO_NOME_WIDTH = 28
const PEDIDO_KG_WIDTH = 6
const PEDIDO_QT_WIDTH = 5
const PEDIDO_TOTAL_WIDTH = LINHA_WIDTH - PEDIDO_NOME_WIDTH - PEDIDO_KG_WIDTH - PEDIDO_QT_WIDTH // = 9
export const TOTAL_COL_WIDTH = PEDIDO_TOTAL_WIDTH
export const NOME_COL_WIDTH = PEDIDO_NOME_WIDTH

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

export function formatarLinhaProduto(
  nome: string,
  pesoKg: number,
  quantidade: number,
  total: number
): string {
  const totalStr = `R$${total.toFixed(2).replace(".", ",")}`
  return (
    padEnd(truncate(nome, PEDIDO_NOME_WIDTH), PEDIDO_NOME_WIDTH) +
    padStart(`${pesoKg}kg`, PEDIDO_KG_WIDTH) +
    padStart(String(quantidade), PEDIDO_QT_WIDTH) +
    padStart(totalStr, PEDIDO_TOTAL_WIDTH)
  )
}

export function headerLinhaProduto(): string {
  return (
    padEnd("PRODUTO", PEDIDO_NOME_WIDTH) +
    padStart("KG", PEDIDO_KG_WIDTH) +
    padStart("QT", PEDIDO_QT_WIDTH) +
    padStart("TOTAL", PEDIDO_TOTAL_WIDTH)
  )
}

// Rota fixed columns: NOME[0..27] QTD[28..35] PESO[36..47]
const ROTA_NOME_WIDTH = 28
const ROTA_QTD_WIDTH = 8
const ROTA_PESO_WIDTH = LINHA_WIDTH - ROTA_NOME_WIDTH - ROTA_QTD_WIDTH // = 12

export function headerLinhaProdutoRota(): string {
  return (
    padEnd("PRODUTO", ROTA_NOME_WIDTH) +
    padStart("QTD", ROTA_QTD_WIDTH) +
    padStart("PESO", ROTA_PESO_WIDTH)
  )
}

export function formatarLinhaProdutoRota(nome: string, quantidade: number, pesoTotal: number): string {
  return (
    padEnd(truncate(nome, ROTA_NOME_WIDTH), ROTA_NOME_WIDTH) +
    padStart(String(quantidade), ROTA_QTD_WIDTH) +
    padStart(`${pesoTotal.toFixed(1)}kg`, ROTA_PESO_WIDTH)
  )
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
