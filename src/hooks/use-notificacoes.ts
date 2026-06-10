import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface NotificacaoDTO {
  id: string
  tipo: string
  texto: string
  lida: boolean
  criadoEm: string
  pedidoId: string | null
}

async function fetchNotificacoes(): Promise<{ data: NotificacaoDTO[]; total: number }> {
  const res = await fetch("/api/notificacoes")
  if (!res.ok) throw new Error("Erro ao buscar notificações")
  return res.json()
}

export function useNotificacoes() {
  return useQuery({
    queryKey: ["notificacoes"],
    queryFn: fetchNotificacoes,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })
}

export function useMarcarTodasLidas() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notificacoes/ler-todas", { method: "PATCH" })
      if (!res.ok) throw new Error("Erro ao marcar notificações")
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notificacoes"] }),
  })
}
