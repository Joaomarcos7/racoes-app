"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useNotificacoes, useMarcarTodasLidas } from "@/hooks/use-notificacoes"
import { cn } from "@/lib/utils"

function formatarData(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

const TIPO_LABEL: Record<string, string> = {
  FIADO_VENCIDO: "Fiado Vencido",
  PEDIDO_ENTREGUE: "Pedido Entregue",
}

export function NotificacaoBell({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { data, refetch } = useNotificacoes()
  const marcarLidas = useMarcarTodasLidas()

  const total = data?.total ?? 0
  const notificacoes = data?.data ?? []

  function handleOpen() {
    refetch()
    setOpen(true)
  }

  function handleMarcarLidas() {
    marcarLidas.mutate()
  }

  function handleClickNotificacao(n: { pedidoId: string | null }) {
    if (!n.pedidoId) return
    setOpen(false)
    router.push(`/pedidos/${n.pedidoId}`)
  }

  return (
    <>
      <button
        onClick={handleOpen}
        aria-label="Notificações"
        className={cn(
          "relative p-2 rounded-lg transition-colors",
          variant === "dark"
            ? "text-slate-400 hover:text-white hover:bg-white/10"
            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
        )}
      >
        <Bell size={18} />
        {total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center px-0.5">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle>Notificações {total > 0 && <span className="text-sm font-normal text-slate-500">({total} não lidas)</span>}</DialogTitle>
              {total > 0 && (
                <Button variant="ghost" size="sm" className="text-xs text-blue-600" onClick={handleMarcarLidas} disabled={marcarLidas.isPending}>
                  Marcar todas como lidas
                </Button>
              )}
            </div>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 -mx-6 px-6">
            {notificacoes.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Nenhuma notificação não lida</p>
            ) : (
              <div className="space-y-2 py-2">
                {notificacoes.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleClickNotificacao(n)}
                    className={cn("rounded-lg border p-3", !n.lida && "bg-blue-50 border-blue-100", n.pedidoId && "cursor-pointer hover:bg-blue-100 transition-colors")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">{TIPO_LABEL[n.tipo] ?? n.tipo}</span>
                      <span className="text-xs text-slate-400 flex-shrink-0">{formatarData(n.criadoEm)}</span>
                    </div>
                    <p className="text-sm text-slate-700 mt-1">{n.texto}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
