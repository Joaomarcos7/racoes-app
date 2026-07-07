interface ItemSimples { produto: { nome: string }; quantidade: number }
interface PedidoSimples { itens: ItemSimples[] }

export function aggregateProdutosAlocados(pedidos: PedidoSimples[]): { nome: string; quantidade: number }[] {
  const map = new Map<string, number>()
  for (const pedido of pedidos) {
    for (const item of pedido.itens) {
      map.set(item.produto.nome, (map.get(item.produto.nome) ?? 0) + item.quantidade)
    }
  }
  return Array.from(map.entries()).map(([nome, quantidade]) => ({ nome, quantidade }))
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
