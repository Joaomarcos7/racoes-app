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

export function somarPagamentos(pagamentos: { metodo?: string; valor: number }[]): number {
  return pagamentos.reduce((acc, p) => acc + p.valor, 0)
}

export function validarPagamentosMultiplos(
  pagamentos: { metodo: string; valor: number }[],
  totalEsperado: number
): string | null {
  if (pagamentos.length === 0) return null
  for (const p of pagamentos) {
    if (p.valor <= 0) return "Todos os valores de pagamento devem ser maiores que zero"
  }
  const metodos = pagamentos.map((p) => p.metodo)
  if (new Set(metodos).size !== metodos.length) return "Método de pagamento duplicado"
  const soma = somarPagamentos(pagamentos)
  if (Math.abs(soma - totalEsperado) > 0.01) return `Soma dos pagamentos (${soma.toFixed(2)}) deve ser igual ao total do pedido (${totalEsperado.toFixed(2)})`
  return null
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

export function calcularNovoValorEmAberto(valorAtual: number, valorBaixa: number): number {
  return Math.max(0, valorAtual - valorBaixa)
}

export function resolverStatusPosBaixa(novoValorEmAberto: number): "PAGO" | "FIADO" {
  return novoValorEmAberto < 0.01 ? "PAGO" : "FIADO"
}

export function validarBaixaFiado(valorBaixa: number, valorEmAberto: number): string | null {
  if (valorBaixa <= 0) return "Valor da baixa deve ser maior que zero"
  if (valorBaixa > valorEmAberto) return "Valor da baixa não pode exceder o valor em aberto"
  return null
}

interface ItemEdicao { produtoId: string; quantidade: number; valorUnit: number }
interface EdicaoPedidoInput { clienteId: string; itens: ItemEdicao[]; requireCliente?: boolean }

const VALORES_STATUS_ENTREGA = ["AGUARDANDO", "EM_ROTA", "ENTREGUE", "ENTREGA_PARCIAL"]
const VALORES_STATUS_PAGAMENTO = ["PENDENTE", "PAGO", "FIADO"]

export function validarBulkUpdatePedidos({
  ids,
  action,
  value,
}: {
  ids: string[]
  action: "statusEntrega" | "statusPagamento"
  value: string
}): string | null {
  if (ids.length === 0) return "Selecione ao menos um pedido"
  if (action === "statusEntrega") {
    if (!VALORES_STATUS_ENTREGA.includes(value)) return `Status de entrega inválido: ${value}`
    return null
  }
  if (action === "statusPagamento") {
    if (!VALORES_STATUS_PAGAMENTO.includes(value)) return `Status de pagamento inválido: ${value}`
    return null
  }
  return "Ação inválida"
}

export function validarEdicaoPedido({ clienteId, itens, requireCliente }: EdicaoPedidoInput): string | null {
  if (requireCliente && !clienteId) return "Cliente obrigatório"
  if (itens.length === 0) return "Pedido deve ter ao menos um item"
  for (const item of itens) {
    if (item.quantidade < 1) return "Quantidade deve ser maior que zero"
    if (item.valorUnit <= 0) return "Valor unitário deve ser maior que zero"
  }
  return null
}
