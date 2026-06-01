import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { VeiculoDTO } from "@/types/api"
import { toast } from "sonner"

export function useVeiculos() {
  return useQuery({
    queryKey: ["veiculos"],
    queryFn: async (): Promise<VeiculoDTO[]> => {
      const res = await fetch("/api/veiculos")
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
