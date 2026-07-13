export function normalizeNome(nome: string): string {
  return nome.trim().toLowerCase()
}

export function clienteMatchesDuplicate(
  a: { nome: string; cidade: string },
  b: { nome: string; cidade: string }
): boolean {
  return normalizeNome(a.nome) === normalizeNome(b.nome) && a.cidade === b.cidade
}

interface ClienteComparavel {
  nome: string
  cidade: string
}

export function filtrarClientes<T extends ClienteComparavel>(
  clientes: T[],
  cidade: string
): T[] {
  if (!cidade.trim()) return clientes
  const lower = cidade.trim().toLowerCase()
  return clientes.filter((c) => c.cidade.toLowerCase().includes(lower))
}

export function ordenarClientes<T extends ClienteComparavel>(
  clientes: T[],
  campo: "nome" | "cidade",
  direcao: "asc" | "desc"
): T[] {
  return [...clientes].sort((a, b) => {
    const va = a[campo].toLowerCase()
    const vb = b[campo].toLowerCase()
    const cmp = va.localeCompare(vb, "pt-BR")
    return direcao === "asc" ? cmp : -cmp
  })
}
