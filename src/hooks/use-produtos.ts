import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ProdutoDTO, HistoricoProdutoDTO, ProdutoStatsDTO } from "@/types/api"
import { toast } from "sonner"

interface PagedResult<T> { data: T[]; total: number; page: number; totalPages: number; hasNext: boolean; hasPrev: boolean }

async function fetchProdutos(search?: string, page = 1, limit = 15): Promise<PagedResult<ProdutoDTO>> {
  const params = new URLSearchParams()
  if (search) params.set("search", search)
  params.set("page", String(page))
  params.set("limit", String(limit))
  const res = await fetch(`/api/produtos?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar produtos")
  return res.json()
}

export function useProduto(id: string) {
  return useQuery({
    queryKey: ["produtos", id],
    queryFn: async () => {
      const res = await fetch(`/api/produtos/${id}`)
      if (!res.ok) throw new Error("Produto não encontrado")
      return res.json() as Promise<ProdutoDTO>
    },
    enabled: !!id,
  })
}

export function useProdutos(search?: string, page = 1, limit = 15) {
  return useQuery({
    queryKey: ["produtos", search, page, limit],
    queryFn: () => fetchProdutos(search, page, limit),
  })
}

export function useCreateProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { nome: string; peso: number; valorUnitario: number }) => {
      const res = await fetch("/api/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Erro ao criar produto")
      }
      return res.json() as Promise<ProdutoDTO>
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["produtos"] })
      toast.success("Produto criado com sucesso")
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useUpdateProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ProdutoDTO> & { id: string }) => {
      const res = await fetch(`/api/produtos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Erro ao atualizar produto")
      }
      return res.json() as Promise<ProdutoDTO>
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["produtos"] })
      qc.invalidateQueries({ queryKey: ["produto-historico", vars.id] })
      qc.invalidateQueries({ queryKey: ["produto-stats", vars.id] })
      toast.success("Produto atualizado")
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useProdutoHistorico(produtoId: string | null) {
  return useQuery({
    queryKey: ["produto-historico", produtoId],
    queryFn: async () => {
      const res = await fetch(`/api/produtos/${produtoId}/historico`)
      if (!res.ok) throw new Error("Erro ao buscar histórico")
      return res.json() as Promise<HistoricoProdutoDTO[]>
    },
    enabled: !!produtoId,
  })
}

export function useProdutoStats(produtoId: string | null, periodo: string) {
  return useQuery({
    queryKey: ["produto-stats", produtoId, periodo],
    queryFn: async () => {
      const res = await fetch(`/api/produtos/${produtoId}/stats?periodo=${periodo}`)
      if (!res.ok) throw new Error("Erro ao buscar stats")
      return res.json() as Promise<ProdutoStatsDTO>
    },
    enabled: !!produtoId,
  })
}

export function useDeleteProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/produtos/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Erro ao remover produto")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["produtos"] })
      toast.success("Produto removido")
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
