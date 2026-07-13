export const TIPOS_SAIDA: { value: string; label: string }[] = [
  { value: "PAGAMENTO_FUNCIONARIO", label: "Pagamento Funcionário" },
  { value: "DIESEL", label: "Diesel" },
  { value: "VIAGEM_MOTORISTA", label: "Viagem Motorista" },
  { value: "OFICINA", label: "Oficina" },
  { value: "PRODUCAO_TERCEIRIZADA", label: "Produção Terceirizada" },
  { value: "DESPACHO_VIAGEM", label: "Despacho Viagem" },
  { value: "OUTRO", label: "Outro" },
]

const TIPO_LABEL_MAP = Object.fromEntries(TIPOS_SAIDA.map((t) => [t.value, t.label]))

export function labelTipoSaida(tipo: string): string {
  return TIPO_LABEL_MAP[tipo] ?? tipo
}

export function aggregateSaidasPorTipo(
  saidas: { tipo: string; valor: number }[]
): { tipo: string; total: number }[] {
  const map = new Map<string, number>()
  for (const s of saidas) {
    map.set(s.tipo, (map.get(s.tipo) ?? 0) + s.valor)
  }
  return Array.from(map.entries())
    .map(([tipo, total]) => ({ tipo, total }))
    .sort((a, b) => b.total - a.total)
}

export function calcularSaldoLiquido(totalEntradas: number, totalSaidas: number): number {
  return totalEntradas - totalSaidas
}

export function validateSaida(data: {
  data: string
  tipo: string
  valor: number
  descricao?: string
}): string | null {
  if (!data.data) return "Data obrigatória"
  if (!data.tipo) return "Tipo obrigatório"
  if (data.valor <= 0) return "Valor deve ser maior que zero"
  if (data.tipo === "OUTRO" && !data.descricao?.trim()) return "Descrição obrigatória para tipo Outro"
  return null
}
