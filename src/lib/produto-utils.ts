export const TIPOS_PRODUTO: { value: string; label: string }[] = [
  { value: "CONSUMIDOR_FINAL", label: "Consumidor Final" },
  { value: "ATACADO", label: "Atacado" },
]

const TIPO_LABELS: Record<string, string> = Object.fromEntries(
  TIPOS_PRODUTO.map((t) => [t.value, t.label])
)

export function labelTipoProduto(tipo: string): string {
  return TIPO_LABELS[tipo] ?? tipo
}

export const TIPO_BADGE: Record<string, { label: string; className: string }> = {
  CONSUMIDOR_FINAL: { label: "Consumidor Final", className: "bg-gray-100 text-gray-600" },
  ATACADO:          { label: "Atacado",          className: "bg-blue-100 text-blue-700" },
}
