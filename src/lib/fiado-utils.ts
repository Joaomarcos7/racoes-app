import type { ClienteFiadoHub } from "@/hooks/use-fiado"

function normalizar(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

export function filtrarClientes(clientes: ClienteFiadoHub[], search: string): ClienteFiadoHub[] {
  if (!search.trim()) return clientes
  const termo = normalizar(search)
  return clientes.filter((c) => normalizar(c.nome).includes(termo))
}

export function ordenarClientes(
  clientes: ClienteFiadoHub[],
  sortBy: "nome" | "totalFiado",
  sortDir: "asc" | "desc"
): ClienteFiadoHub[] {
  return [...clientes].sort((a, b) => {
    let cmp: number
    if (sortBy === "nome") {
      cmp = normalizar(a.nome).localeCompare(normalizar(b.nome))
    } else {
      cmp = a.totalFiado - b.totalFiado
    }
    return sortDir === "asc" ? cmp : -cmp
  })
}

export function paginarClientes(clientes: ClienteFiadoHub[], page: number, limit: number): ClienteFiadoHub[] {
  const start = (page - 1) * limit
  return clientes.slice(start, start + limit)
}
