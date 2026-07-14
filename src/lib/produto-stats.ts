interface ItemComPedido {
  pedidoId: string
  quantidade: number
  pesoUnit: number
  pedido: { tipoPedido: "ENTREGA" | "BALCAO" }
}

export interface ProdutoStats {
  totalPedidos: number
  kgBalcao: number
  kgEntrega: number
  kgTotal: number
  totalUnidades: number
}

export function calcProdutoStats(itens: ItemComPedido[]): ProdutoStats {
  const pedidoIds = new Set<string>()
  let kgEntrega = 0
  let kgBalcao = 0
  let totalUnidades = 0

  for (const item of itens) {
    pedidoIds.add(item.pedidoId)
    const kg = item.quantidade * item.pesoUnit
    totalUnidades += item.quantidade
    if (item.pedido.tipoPedido === "ENTREGA") {
      kgEntrega += kg
    } else {
      kgBalcao += kg
    }
  }

  return { totalPedidos: pedidoIds.size, kgEntrega, kgBalcao, kgTotal: kgEntrega + kgBalcao, totalUnidades }
}
