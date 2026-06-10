export function shouldRegistrarHistoricoStatus(
  statusAnterior: string | null | undefined,
  statusNovo: string | null | undefined
): boolean {
  if (!statusNovo) return false
  return statusAnterior !== statusNovo
}
