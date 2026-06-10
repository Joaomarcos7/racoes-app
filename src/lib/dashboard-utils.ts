interface ItemBasico { quantidade: number; valorUnit: number }
interface PedidoBasico {
  clienteId: string | null
  cliente: { id: string; nome: string; cidade: string } | null
  metodoPagamento: string | null
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

  for (const p of pedidos) {
    if (!p.metodoPagamento) continue
    const valor = p.itens.reduce((acc, i) => acc + i.quantidade * i.valorUnit, 0)
    const existing = map.get(p.metodoPagamento)
    if (existing) {
      existing.count++
      existing.total += valor
    } else {
      map.set(p.metodoPagamento, { metodo: p.metodoPagamento, count: 1, total: valor })
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
