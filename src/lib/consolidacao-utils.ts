export function validateReabrirRota(rota: { status: string }): string | null {
  if (rota.status !== "FECHADA") return "Rota já está aberta"
  return null
}

export function validateFecharRota(rota: { status: string; numItens: number }): string | null {
  if (rota.status === "FECHADA") return "Rota já está fechada"
  if (rota.numItens === 0) return "Rota sem pedidos alocados"
  return null
}
