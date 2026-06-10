export function isVencido(dataVencimento: Date): boolean {
  return dataVencimento.getTime() < Date.now()
}

export function shouldGerarNotificacaoFiado(pedido: { statusPagamento: string; dataVencimentoFiado: Date | null }): boolean {
  if (pedido.statusPagamento !== "FIADO") return false
  if (!pedido.dataVencimentoFiado) return false
  return isVencido(pedido.dataVencimentoFiado)
}

export function jaExisteNotificacaoFiado(
  notificacoes: { pedidoId: string | null; tipo: string }[],
  pedidoId: string
): boolean {
  return notificacoes.some((n) => n.pedidoId === pedidoId && n.tipo === "FIADO_VENCIDO")
}

export function buildFiadoNotificacaoTexto({ clienteNome, dataVencimento }: { clienteNome: string; dataVencimento: Date }): string {
  const dia = String(dataVencimento.getUTCDate()).padStart(2, "0")
  const mes = String(dataVencimento.getUTCMonth() + 1).padStart(2, "0")
  const ano = dataVencimento.getUTCFullYear()
  return `Fiado vencido: ${clienteNome} tem pagamento em atraso desde ${dia}/${mes}/${ano}.`
}
