export function normalizeNome(nome: string): string {
  return nome.toLowerCase().trim()
}

export function clienteMatchesDuplicate(
  a: { nome: string; cidade: string },
  b: { nome: string; cidade: string }
): boolean {
  return normalizeNome(a.nome) === normalizeNome(b.nome) && a.cidade.trim() === b.cidade.trim()
}
