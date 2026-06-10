import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ConsolidacaoRotaDTO } from "@/types/api"
import { toast } from "sonner"

interface PagedResult<T> { data: T[]; total: number; page: number; totalPages: number; hasNext: boolean; hasPrev: boolean }

export function useConsolidacoes(page = 1, limit = 15) {
  return useQuery({
    queryKey: ["consolidacoes", page, limit],
    queryFn: async (): Promise<PagedResult<unknown>> => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      const res = await fetch(`/api/consolidacao?${params}`)
      if (!res.ok) throw new Error("Erro ao buscar rotas")
      return res.json()
    },
  })
}

export function useConsolidacao(id: string) {
  return useQuery({
    queryKey: ["consolidacoes", id],
    queryFn: async (): Promise<ConsolidacaoRotaDTO & { pedidosDisponiveis: unknown[] }> => {
      const res = await fetch(`/api/consolidacao/${id}`)
      if (!res.ok) throw new Error("Rota não encontrada")
      return res.json()
    },
    enabled: !!id,
  })
}

export function useCreateConsolidacao() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (veiculoId: string) => {
      const res = await fetch("/api/consolidacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ veiculoId }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "Erro ao criar rota") }
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["consolidacoes"] }),
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useAlocarPedido(rotaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (pedidoId: string) => {
      const res = await fetch(`/api/consolidacao/${rotaId}/alocar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["consolidacoes", rotaId] }),
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useDesalocarPedido(rotaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (pedidoId: string) => {
      const res = await fetch(`/api/consolidacao/${rotaId}/desalocar`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId }),
      })
      if (!res.ok) throw new Error("Erro ao desalocar pedido")
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["consolidacoes", rotaId] }),
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useReabrirRota(rotaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/consolidacao/${rotaId}/reabrir`, { method: "POST" })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "Erro ao reabrir rota") }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consolidacoes"] })
      qc.invalidateQueries({ queryKey: ["consolidacoes", rotaId] })
      qc.invalidateQueries({ queryKey: ["pedidos"] })
      toast.success("Rota reaberta. Pedidos voltaram para Aguardando.")
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useFecharRota(rotaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/consolidacao/${rotaId}/fechar`, { method: "POST" })
      if (!res.ok) throw new Error("Erro ao fechar rota")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consolidacoes"] })
      qc.invalidateQueries({ queryKey: ["consolidacoes", rotaId] })
      qc.invalidateQueries({ queryKey: ["pedidos"] })
      toast.success("Rota fechada. Pedidos atualizados para Em Rota.")
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
