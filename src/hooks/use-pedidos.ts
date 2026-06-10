import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { PedidoDTO } from "@/types/api"
import { toast } from "sonner"

interface PedidoFilters {
  search?: string
  statusEntrega?: string
  statusPagamento?: string
  tipoPedido?: string
  page?: number
  limit?: number
}

interface PagedResult<T> { data: T[]; total: number; page: number; totalPages: number; hasNext: boolean; hasPrev: boolean }

async function fetchPedidos(filters: PedidoFilters = {}): Promise<PagedResult<PedidoDTO>> {
  const params = new URLSearchParams()
  if (filters.search) params.set("search", filters.search)
  if (filters.statusEntrega) params.set("statusEntrega", filters.statusEntrega)
  if (filters.statusPagamento) params.set("statusPagamento", filters.statusPagamento)
  if (filters.tipoPedido) params.set("tipoPedido", filters.tipoPedido)
  params.set("page", String(filters.page ?? 1))
  params.set("limit", String(filters.limit ?? 15))
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

type CreatePedidoData =
  | {
      tipoPedido: "ENTREGA"
      clienteNome: string
      clienteCidade: string
      itens: { produtoId: string; quantidade: number }[]
      statusPagamento?: string
      metodoPagamento?: string
      observacoes?: string
      dataVencimentoFiado?: string
      desconto?: number
    }
  | {
      tipoPedido: "BALCAO"
      clienteId?: string
      itens: { produtoId: string; quantidade: number }[]
      statusPagamento?: string
      metodoPagamento?: string
      observacoes?: string
      dataVencimentoFiado?: string
      desconto?: number
    }

export function useCreatePedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreatePedidoData) => {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const text = await res.text()
        let message = "Erro ao criar pedido"
        try { message = JSON.parse(text).error ?? message } catch { /* non-JSON body */ }
        throw new Error(message)
      }
      return res.json() as Promise<PedidoDTO>
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] })
      qc.invalidateQueries({ queryKey: ["notificacoes"] })
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

export function useDeletePedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/pedidos/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Erro ao remover pedido")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pedidos"] })
      toast.success("Pedido removido")
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
