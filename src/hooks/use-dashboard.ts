import { useQuery } from "@tanstack/react-query"
import type { DashboardKPIsDTO } from "@/types/api"

export function useDashboard(periodo: "hoje" | "semana" | "mes") {
  return useQuery({
    queryKey: ["dashboard", periodo],
    queryFn: async (): Promise<DashboardKPIsDTO> => {
      const res = await fetch(`/api/dashboard?periodo=${periodo}`)
      if (!res.ok) throw new Error("Erro ao carregar dashboard")
      return res.json()
    },
  })
}
