import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { SaidaDTO, SaidasListDTO } from "@/types/api"
import { toast } from "sonner"

interface SaidaFilters {
  dataInicio?: string
  dataFim?: string
  tipo?: string
  page?: number
  limit?: number
}

async function fetchSaidas(filters: SaidaFilters = {}): Promise<SaidasListDTO> {
  const params = new URLSearchParams()
  if (filters.dataInicio) params.set("dataInicio", filters.dataInicio)
  if (filters.dataFim) params.set("dataFim", filters.dataFim)
  if (filters.tipo && filters.tipo !== "all") params.set("tipo", filters.tipo)
  params.set("page", String(filters.page ?? 1))
  params.set("limit", String(filters.limit ?? 20))
  const res = await fetch(`/api/saidas?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar saídas")
  return res.json()
}

async function fetchSaida(id: string): Promise<SaidaDTO> {
  const res = await fetch(`/api/saidas/${id}`)
  if (!res.ok) throw new Error("Saída não encontrada")
  return res.json()
}

export function useSaidas(filters: SaidaFilters = {}) {
  return useQuery({ queryKey: ["saidas", filters], queryFn: () => fetchSaidas(filters) })
}

export function useSaida(id: string) {
  return useQuery({ queryKey: ["saida", id], queryFn: () => fetchSaida(id), enabled: !!id })
}

export function useCreateSaida() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<SaidaDTO, "id" | "createdAt" | "updatedAt">) => {
      const res = await fetch("/api/saidas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "Erro ao criar saída") }
      return res.json()
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["saidas"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); toast.success("Saída registrada") },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useUpdateSaida() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<SaidaDTO> & { id: string }) => {
      const res = await fetch(`/api/saidas/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "Erro ao atualizar saída") }
      return res.json()
    },
    onSuccess: (_d, vars) => { qc.invalidateQueries({ queryKey: ["saidas"] }); qc.invalidateQueries({ queryKey: ["saida", vars.id] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); toast.success("Saída atualizada") },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useDeleteSaida() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/saidas/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Erro ao excluir saída")
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["saidas"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); toast.success("Saída excluída") },
    onError: (e: Error) => toast.error(e.message),
  })
}
