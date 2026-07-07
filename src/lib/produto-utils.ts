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
