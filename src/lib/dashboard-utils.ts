interface ItemBasico { quantidade: number; valorUnit: number }

export function getPeriodoDates(periodo: string): { start: Date; end: Date } {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  if (periodo === "hoje") {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    return { start, end }
  }
  const daysMap: Record<string, number> = { semana: 6, mes: 29, trimestre: 89, anual: 364 }
  const days = daysMap[periodo] ?? 0
  const start = new Date(now)
  start.setDate(now.getDate() - days)
  start.setHours(0, 0, 0, 0)
  return { start, end }
}

interface ItemPeso { quantidade: number; pesoUnit: number }
interface PedidoComPeso { itens: ItemPeso[] }

export function calcularPesoVendido(pedidos: PedidoComPeso[]): number {
  return pedidos.reduce((acc, p) => acc + p.itens.reduce((s, i) => s + i.quantidade * i.pesoUnit, 0), 0)
}

interface PedidoBasico {
  clienteId: string | null
  cliente: { id: string; nome: string; cidade: string } | null
  metodoPagamento: string | null
  pagamentos?: { metodo: string; valor: number }[]
  itens: ItemBasico[]
}

export interface MetodoPagamentoStat {
  metodo: string
  count: number
  total: number
}

export interface TopClienteStat {
  id: string
  nome: string
  cidade: string
  count: number
  total: number
}

export function groupByMetodoPagamento(pedidos: PedidoBasico[]): MetodoPagamentoStat[] {
  const map = new Map<string, MetodoPagamentoStat>()

  function addEntry(metodo: string, valor: number) {
    const existing = map.get(metodo)
    if (existing) { existing.count++; existing.total += valor }
    else map.set(metodo, { metodo, count: 1, total: valor })
  }

  for (const p of pedidos) {
    if (p.pagamentos && p.pagamentos.length > 0) {
      for (const pag of p.pagamentos) addEntry(pag.metodo, pag.valor)
    } else if (p.metodoPagamento) {
      const valor = p.itens.reduce((acc, i) => acc + i.quantidade * i.valorUnit, 0)
      addEntry(p.metodoPagamento, valor)
    }
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count)
}

export function getTopClientes(pedidos: PedidoBasico[], n: number): TopClienteStat[] {
  const map = new Map<string, TopClienteStat>()

  for (const p of pedidos) {
    if (!p.clienteId || !p.cliente) continue
    const valor = p.itens.reduce((acc, i) => acc + i.quantidade * i.valorUnit, 0)
    const existing = map.get(p.clienteId)
    if (existing) {
      existing.count++
      existing.total += valor
    } else {
      map.set(p.clienteId, { id: p.clienteId, nome: p.cliente.nome, cidade: p.cliente.cidade, count: 1, total: valor })
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
}
