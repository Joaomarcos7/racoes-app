import { useQuery } from "@tanstack/react-query"
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
