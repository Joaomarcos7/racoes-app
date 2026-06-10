export const LINHA_WIDTH = 42

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
  const totalStr = `R$${total.toFixed(2)}`
  const qtdStr = String(quantidade)
  const pesoStr = `${pesoKg}kg`
  const rightSide = ` ${padEnd(pesoStr, 5)} ${padEnd(qtdStr, 3)} ${totalStr}`
  const nomeWidth = LINHA_WIDTH - rightSide.length
  return padEnd(truncate(nome, nomeWidth), nomeWidth) + rightSide
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
