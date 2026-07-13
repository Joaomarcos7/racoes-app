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

export function calcularValorEmAberto(total: number, tipoFiado: string, valorAdiantado: number | undefined): number {
  if (tipoFiado === "INTEGRAL") return total
  return Math.max(0, total - (valorAdiantado ?? 0))
}

export function resolverValorUnitItem(valorUnitario: number, override: number | undefined): number {
  if (override == null || override <= 0) return valorUnitario
  return override
}

export function validarValorUnitOverride(override: number | undefined, valorUnitario: number): string | null {
  if (override == null) return null
  if (override <= 0) return "Valor por unidade deve ser maior que zero"
  if (override > valorUnitario) return "Valor por unidade não pode ser maior que o preço original"
  return null
}

export function validarAdiantadoFiado(valorAdiantado: number, totalPedido: number): string | null {
  if (valorAdiantado >= totalPedido) return "Valor adiantado deve ser menor que o total do pedido"
  return null
}
