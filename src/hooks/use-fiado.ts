import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { PedidoDTO } from "@/types/api"

export interface ClienteFiadoHub {
  id: string
  nome: string
  cidade: string
  telefone: string | null
  totalFiado: number
  pedidosFiado: PedidoDTO[]
}

export interface FiadoHubData {
  totalGeral: number
  clientes: ClienteFiadoHub[]
}

export function useBaixaLote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (pagamentos: { pedidoId: string; valor: number; metodoPagamento: string }[]) => {
      const res = await fetch("/api/fiado/baixa-lote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pagamentos }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "Erro ao dar baixa em lote") }
      return res.json() as Promise<{ ok: boolean; processados: number }>
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["fiado"] })
      qc.invalidateQueries({ queryKey: ["pedidos"] })
      toast.success(`Baixa registrada para ${data.processados} pedido${data.processados !== 1 ? "s" : ""}.`)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useFiado() {
  return useQuery<FiadoHubData>({
    queryKey: ["fiado"],
    queryFn: async () => {
      const res = await fetch("/api/fiado")
      if (!res.ok) throw new Error("Erro ao buscar fiados")
      return res.json()
    },
  })
}
