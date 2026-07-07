export const TIPOS_CARROCERIA: { value: string; label: string }[] = [
  { value: "BAU", label: "Baú" },
  { value: "GRADE_BAIXA", label: "Grade Baixa" },
  { value: "SIDER", label: "Sider" },
  { value: "GRANELEIRO", label: "Graneleiro" },
  { value: "PLATAFORMA", label: "Plataforma" },
  { value: "FURGAO", label: "Furgão" },
  { value: "OUTROS", label: "Outros" },
]

const CARROCERIA_LABELS: Record<string, string> = Object.fromEntries(
  TIPOS_CARROCERIA.map((t) => [t.value, t.label])
)

export function labelCarroceria(tipo: string): string {
  return CARROCERIA_LABELS[tipo] ?? tipo
}
