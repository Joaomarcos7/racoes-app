import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { VeiculoDTO } from "@/types/api"
import { toast } from "sonner"

interface PagedResult<T> { data: T[]; total: number; page: number; totalPages: number; hasNext: boolean; hasPrev: boolean }

export function useVeiculos(page = 1, limit = 15) {
  return useQuery({
    queryKey: ["veiculos", page, limit],
    queryFn: async (): Promise<PagedResult<VeiculoDTO>> => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      const res = await fetch(`/api/veiculos?${params}`)
      if (!res.ok) throw new Error("Erro ao buscar veículos")
      return res.json()
    },
  })
}

export function useCreateVeiculo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { placa: string; modelo: string; pesoMaximo: number }) => {
      const res = await fetch("/api/veiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Erro ao criar veículo")
      }
      return res.json() as Promise<VeiculoDTO>
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["veiculos"] })
      toast.success("Veículo cadastrado")
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useUpdateVeiculo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<VeiculoDTO> & { id: string }) => {
      const res = await fetch(`/api/veiculos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Erro ao atualizar veículo")
      }
      return res.json() as Promise<VeiculoDTO>
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["veiculos"] })
      toast.success("Veículo atualizado")
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useDeleteVeiculo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/veiculos/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Erro ao remover veículo")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["veiculos"] })
      toast.success("Veículo removido")
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
