export function formatDecimalInput(raw: string, decimals: number): string {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return `0,${"0".repeat(decimals)}`
  const padded = digits.padStart(decimals + 1, "0")
  const intPart = padded.slice(0, -decimals).replace(/^0+/, "") || "0"
  const decPart = padded.slice(-decimals)
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `${intFormatted},${decPart}`
}

export function parseMaskedDecimal(masked: string): number {
  const normalized = masked.replace(/\./g, "").replace(",", ".")
  return parseFloat(normalized) || 0
}

export function formatMoneyInput(raw: string): string {
  return formatDecimalInput(raw, 2)
}

export function parseMaskedMoney(masked: string): number {
  return parseMaskedDecimal(masked)
}
