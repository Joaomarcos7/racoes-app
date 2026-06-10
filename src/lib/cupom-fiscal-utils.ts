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

export function formatarLinhaProduto(
  nome: string,
  pesoKg: number,
  quantidade: number,
  total: number
): string {
  const totalStr = `R$${total.toFixed(2).replace(".", ",")}`
  const totalCol = " ".repeat(Math.max(0, TOTAL_COL_WIDTH - totalStr.length)) + totalStr
  const qtdStr = String(quantidade)
  const pesoStr = `${pesoKg}kg`
  const rightSide = ` ${padEnd(pesoStr, 5)} ${padEnd(qtdStr, 3)} ${totalCol}`
  return padEnd(truncate(nome, NOME_COL_WIDTH), NOME_COL_WIDTH) + rightSide
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
