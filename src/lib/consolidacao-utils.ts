interface ItemSimples { produto: { nome: string }; quantidade: number; pesoUnit: number }
interface PedidoSimples { itens: ItemSimples[] }

export function aggregateProdutosAlocados(pedidos: PedidoSimples[]): { nome: string; quantidade: number; pesoTotal: number }[] {
  const map = new Map<string, { quantidade: number; pesoTotal: number }>()
  for (const pedido of pedidos) {
    for (const item of pedido.itens) {
      const prev = map.get(item.produto.nome) ?? { quantidade: 0, pesoTotal: 0 }
      map.set(item.produto.nome, {
        quantidade: prev.quantidade + item.quantidade,
        pesoTotal: prev.pesoTotal + item.quantidade * item.pesoUnit,
      })
    }
  }
  return Array.from(map.entries()).map(([nome, v]) => ({ nome, ...v }))
}

export function validateReabrirRota(rota: { status: string }): string | null {
  if (rota.status !== "FECHADA") return "Rota já está aberta"
  return null
}

export function validateFecharRota(rota: { status: string; numItens: number }): string | null {
  if (rota.status === "FECHADA") return "Rota já está fechada"
  if (rota.numItens === 0) return "Rota sem pedidos alocados"
  return null
}
