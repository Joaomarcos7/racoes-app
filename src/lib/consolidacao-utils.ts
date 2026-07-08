interface ItemSimples { produto: { nome: string; tipo?: string }; quantidade: number; pesoUnit: number; quantidadeFalta?: number }
interface PedidoSimples { itens: ItemSimples[] }

interface ItemComFalta { quantidade: number; pesoUnit: number; quantidadeFalta: number }

export function statusAposAlocar(statusAtual: string | null): "EM_ROTA" | null {
  return statusAtual === "ENTREGA_PARCIAL" ? "EM_ROTA" : null
}

export function calcularStatusEntregaAlocacao(itens: ItemComFalta[]): "EM_ROTA" | "ENTREGA_PARCIAL" {
  return itens.some((i) => i.quantidadeFalta > 0) ? "ENTREGA_PARCIAL" : "EM_ROTA"
}

export function calcularPesoFaltante(itens: ItemComFalta[]): number {
  return itens.reduce((acc, i) => acc + i.quantidadeFalta * i.pesoUnit, 0)
}

export function calcularPesoRestante(itens: ItemComFalta[]): number {
  return itens.reduce((acc, i) => acc + (i.quantidade - i.quantidadeFalta) * i.pesoUnit, 0)
}

export function calcularStatusFechamento(
  statusAtual: string | null,
  temFaltaRegistrada: boolean,
  itens: ItemComFalta[]
): { status: "EM_ROTA" | "ENTREGA_PARCIAL" | "ENTREGUE"; resetFalta: boolean } {
  if (statusAtual === "ENTREGA_PARCIAL" && !temFaltaRegistrada) {
    return { status: "ENTREGUE", resetFalta: true }
  }
  if (itens.some((i) => i.quantidadeFalta > 0)) {
    return { status: "ENTREGA_PARCIAL", resetFalta: false }
  }
  if (statusAtual === "ENTREGA_PARCIAL") {
    return { status: "ENTREGUE", resetFalta: true }
  }
  return { status: "EM_ROTA", resetFalta: false }
}

export function calcularPesoAlocar(itens: ItemComFalta[]): number {
  const isParcial = itens.some((i) => i.quantidadeFalta > 0)
  if (isParcial) return itens.reduce((acc, i) => acc + i.quantidadeFalta * i.pesoUnit, 0)
  return itens.reduce((acc, i) => acc + i.quantidade * i.pesoUnit, 0)
}

export function validateFalta(quantidade: number, quantidadeFalta: number): string | null {
  if (quantidadeFalta < 0) return "Quantidade em falta não pode ser negativa"
  if (quantidadeFalta > quantidade) return "Quantidade em falta não pode exceder a quantidade do item"
  return null
}

export function aggregateProdutosAlocados(pedidos: PedidoSimples[]): { nome: string; tipo?: string; quantidade: number; pesoTotal: number }[] {
  const map = new Map<string, { tipo?: string; quantidade: number; pesoTotal: number }>()
  for (const pedido of pedidos) {
    for (const item of pedido.itens) {
      const prev = map.get(item.produto.nome) ?? { quantidade: 0, pesoTotal: 0 }
      const falta = item.quantidadeFalta ?? 0
      const isParcial = falta > 0
      const qtd = isParcial ? falta : item.quantidade
      map.set(item.produto.nome, {
        tipo: item.produto.tipo,
        quantidade: prev.quantidade + qtd,
        pesoTotal: prev.pesoTotal + qtd * item.pesoUnit,
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
