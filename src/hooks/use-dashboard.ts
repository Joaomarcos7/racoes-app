import { useQuery } from "@tanstack/react-query"
import type { DashboardKPIsDTO } from "@/types/api"

export function useDashboard(periodo: "hoje" | "semana" | "mes" | "trimestre" | "anual") {
  return useQuery({
    queryKey: ["dashboard", periodo],
    queryFn: async (): Promise<DashboardKPIsDTO> => {
      const res = await fetch(`/api/dashboard?periodo=${periodo}`)
      if (!res.ok) throw new Error("Erro ao carregar dashboard")
      return res.json()
    },
  })
}

export function useDashboardDia(date: string | null) {
  return useQuery({
    queryKey: ["dashboard-dia", date],
    queryFn: async (): Promise<DashboardKPIsDTO> => {
      const res = await fetch(`/api/dashboard/dia?date=${date}`)
      if (!res.ok) throw new Error("Erro ao carregar dashboard do dia")
      return res.json()
    },
    enabled: !!date,
  })
}
