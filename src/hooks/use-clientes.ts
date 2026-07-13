import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ClienteDTO, PedidoDTO } from "@/types/api"
import { toast } from "sonner"

interface PagedResult<T> { data: T[]; total: number; page: number; totalPages: number; hasNext: boolean; hasPrev: boolean }

interface FetchClientesParams { search?: string; cidade?: string; sortBy?: "nome" | "cidade"; sortDir?: "asc" | "desc"; page?: number; limit?: number }

async function fetchClientes({ search, cidade, sortBy = "nome", sortDir = "asc", page = 1, limit = 15 }: FetchClientesParams = {}): Promise<PagedResult<ClienteDTO>> {
  const params = new URLSearchParams()
  if (search) params.set("search", search)
  if (cidade) params.set("cidade", cidade)
  params.set("sortBy", sortBy)
  params.set("sortDir", sortDir)
  params.set("page", String(page))
  params.set("limit", String(limit))
  const res = await fetch(`/api/clientes?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar clientes")
  return res.json()
}

async function fetchCliente(id: string): Promise<ClienteDTO & { pedidos: PedidoDTO[] }> {
  const res = await fetch(`/api/clientes/${id}`)
  if (!res.ok) throw new Error("Erro ao buscar cliente")
  return res.json()
}

export function useClientes(params: FetchClientesParams = {}) {
  return useQuery({
    queryKey: ["clientes", params],
    queryFn: () => fetchClientes(params),
  })
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: ["clientes", id],
    queryFn: () => fetchCliente(id),
    enabled: !!id,
  })
}

export function useCreateCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { nome: string; telefone?: string; instituicao?: string; cidade: string; cep?: string; endereco?: string; complemento?: string }) => {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Erro ao criar cliente")
      }
      return res.json() as Promise<ClienteDTO>
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] })
      toast.success("Cliente criado com sucesso")
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useUpdateCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ClienteDTO> & { id: string }) => {
      const res = await fetch(`/api/clientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Erro ao atualizar cliente")
      }
      return res.json() as Promise<ClienteDTO>
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] })
      toast.success("Cliente atualizado")
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useDeleteCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Erro ao remover cliente")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] })
      toast.success("Cliente removido")
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
