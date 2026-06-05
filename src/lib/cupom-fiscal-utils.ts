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

export function formatarDataEmissao(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${day}/${month}/${year} ${hours}:${minutes}`
}
