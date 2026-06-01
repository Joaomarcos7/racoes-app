import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ClienteDTO, PedidoDTO } from "@/types/api"
import { toast } from "sonner"

async function fetchClientes(search?: string): Promise<ClienteDTO[]> {
  const params = new URLSearchParams()
  if (search) params.set("search", search)
  const res = await fetch(`/api/clientes?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar clientes")
  return res.json()
}

async function fetchCliente(id: string): Promise<ClienteDTO & { pedidos: PedidoDTO[] }> {
  const res = await fetch(`/api/clientes/${id}`)
  if (!res.ok) throw new Error("Erro ao buscar cliente")
  return res.json()
}

export function useClientes(search?: string) {
  return useQuery({
    queryKey: ["clientes", search],
    queryFn: () => fetchClientes(search),
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
    mutationFn: async (data: { nome: string; telefone?: string; email?: string; cidade: string }) => {
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
