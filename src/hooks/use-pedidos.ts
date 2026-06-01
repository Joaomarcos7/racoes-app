import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { PedidoDTO } from "@/types/api"
import { toast } from "sonner"

interface PedidoFilters {
  search?: string
  statusEntrega?: string
  statusPagamento?: string
}

async function fetchPedidos(filters: PedidoFilters = {}): Promise<PedidoDTO[]> {
  const params = new URLSearchParams()
  if (filters.search) params.set("search", filters.search)
  if (filters.statusEntrega) params.set("statusEntrega", filters.statusEntrega)
  if (filters.statusPagamento) params.set("statusPagamento", filters.statusPagamento)
  const res = await fetch(`/api/pedidos?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar pedidos")
  return res.json()
}

async function fetchPedido(id: string): Promise<PedidoDTO> {
  const res = await fetch(`/api/pedidos/${id}`)
  if (!res.ok) throw new Error("Pedido não encontrado")
  return res.json()
}

export function usePedidos(filters?: PedidoFilters) {
  return useQuery({
    queryKey: ["pedidos", filters],
    queryFn: () => fetchPedidos(filters),
  })
}

export function usePedido(id: string) {
  return useQuery({
    queryKey: ["pedidos", id],
    queryFn: () => fetchPedido(id),
    enabled: !!id,
  })
}

export function useCreatePedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      clienteId: string
      itens: { produtoId: string; quantidade: number }[]
      statusPagamento?: string
      metodoPagamento?: string
      observacoes?: string
    }) => {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Erro ao criar pedido")
      }
      return res.json() as Promise<PedidoDTO>
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] })
      toast.success("Pedido criado com sucesso")
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useUpdatePedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string
      statusEntrega?: string
      statusPagamento?: string
      metodoPagamento?: string | null
      observacoes?: string
    }) => {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Erro ao atualizar pedido")
      }
      return res.json() as Promise<PedidoDTO>
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["pedidos"] })
      qc.invalidateQueries({ queryKey: ["pedidos", vars.id] })
      toast.success("Pedido atualizado")
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
