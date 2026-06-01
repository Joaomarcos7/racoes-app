import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ProdutoDTO } from "@/types/api"
import { toast } from "sonner"

async function fetchProdutos(search?: string): Promise<ProdutoDTO[]> {
  const params = new URLSearchParams()
  if (search) params.set("search", search)
  const res = await fetch(`/api/produtos?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar produtos")
  return res.json()
}

export function useProdutos(search?: string) {
  return useQuery({
    queryKey: ["produtos", search],
    queryFn: () => fetchProdutos(search),
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["produtos"] })
      toast.success("Produto atualizado")
    },
    onError: (e: Error) => toast.error(e.message),
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
