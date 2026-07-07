interface ItemInput { produtoId: string; quantidade: number }
interface ProdutoBasico { id: string; peso: number; valorUnitario: number }

export function validateItensPedido(
  itens: ItemInput[],
  produtoMap: Map<string, ProdutoBasico>
): string | null {
  for (const item of itens) {
    if (!produtoMap.has(item.produtoId)) {
      return `Produto ${item.produtoId} não encontrado`
    }
  }
  return null
}

export function calcTotalComDesconto(subtotal: number, desconto: number): number {
  return Math.max(0, subtotal - desconto)
}

export function calcularValorPesoVariavel(pesoKg: number, valorUnitario: number, pesoUnit: number): number {
  return pesoKg * (valorUnitario / pesoUnit)
}

export function shouldRegistrarHistoricoCusto(anterior: number | null, novo: number | null | undefined): boolean {
  if (novo === undefined) return false
  return anterior !== novo
}
