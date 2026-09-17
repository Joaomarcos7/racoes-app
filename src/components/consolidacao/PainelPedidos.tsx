"use client"
import { useState, useMemo } from "react"
import { PedidoCard } from "./PedidoCard"
import { AlocarPedidoDialog } from "./AlocarPedidoDialog"
import { Input } from "@/components/ui/input"
import { filtrarPedidosPorCidade } from "@/lib/consolidacao-utils"
import { useToggleDisponibilidade } from "@/hooks/use-pedidos"
import type { PedidoDTO } from "@/types/api"
import type { AlocacaoItem } from "@/hooks/use-consolidacao"
import { cn } from "@/lib/utils"

function groupByCidade(pedidos: PedidoDTO[]): Record<string, PedidoDTO[]> {
  return pedidos.reduce((acc, p) => {
    const c = p.cliente?.cidade ?? "Sem cidade"
    if (!acc[c]) acc[c] = []
    acc[c].push(p)
    return acc
  }, {} as Record<string, PedidoDTO[]>)
}

type FiltroDisponibilidade = "disponivel" | "indisponivel"

interface PainelPedidosProps {
  pedidos: PedidoDTO[]
  onAlocar: (pedidoId: string, alocacoes: AlocacaoItem[], permitirAumentoQuantidade?: boolean) => void
  loadingId?: string
}

export function PainelPedidos({ pedidos, onAlocar, loadingId }: PainelPedidosProps) {
  const [dialogPedido, setDialogPedido] = useState<PedidoDTO | null>(null)
  const [search, setSearch] = useState("")
  const [filtro, setFiltro] = useState<FiltroDisponibilidade>("disponivel")
  const toggleMutation = useToggleDisponibilidade()

  const pedidosFiltradosPorDisp = useMemo(
    () => pedidos.filter((p) => filtro === "disponivel" ? p.disponivel : !p.disponivel),
    [pedidos, filtro]
  )

  const pedidosFiltrados = useMemo(
    () => filtrarPedidosPorCidade(pedidosFiltradosPorDisp, search),
    [pedidosFiltradosPorDisp, search]
  )
  const grouped = groupByCidade(pedidosFiltrados)
  const cidades = Object.keys(grouped).sort()

  const countDisp = pedidos.filter((p) => p.disponivel).length
  const countIndisp = pedidos.filter((p) => !p.disponivel).length

  function handleConfirmar(alocacoes: AlocacaoItem[], permitirAumentoQuantidade: boolean) {
    if (!dialogPedido) return
    onAlocar(dialogPedido.id, alocacoes, permitirAumentoQuantidade)
    setDialogPedido(null)
  }

  return (
    <>
      {dialogPedido && (
        <AlocarPedidoDialog
          pedido={dialogPedido}
          open={!!dialogPedido}
          onOpenChange={(open) => { if (!open) setDialogPedido(null) }}
          onConfirm={handleConfirmar}
          loading={loadingId === dialogPedido.id}
        />
      )}
      <div className="border rounded-lg bg-gray-50 p-4 h-full overflow-y-auto flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm text-gray-600 uppercase tracking-wide">
            Pedidos ({pedidos.length})
          </span>
        </div>
        <div className="flex border rounded-md overflow-hidden text-xs">
          <button
            onClick={() => setFiltro("disponivel")}
            className={cn("flex-1 px-2 py-1.5 transition-colors", filtro === "disponivel" ? "bg-blue-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50")}
          >
            Disponíveis ({countDisp})
          </button>
          <button
            onClick={() => setFiltro("indisponivel")}
            className={cn("flex-1 px-2 py-1.5 transition-colors", filtro === "indisponivel" ? "bg-red-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50")}
          >
            Indisponíveis ({countIndisp})
          </button>
        </div>
        <Input
          placeholder="Filtrar por cidade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm"
        />
        {pedidosFiltradosPorDisp.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            {filtro === "disponivel" ? "Todos os pedidos foram alocados ou estão indisponíveis" : "Nenhum pedido indisponível"}
          </p>
        ) : pedidosFiltrados.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Nenhum pedido em "{search}"</p>
        ) : (
          cidades.map((cidade) => (
            <div key={cidade} className="mb-2">
              <div className="text-xs font-semibold text-blue-800 uppercase mb-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                {cidade}
              </div>
              <div className="space-y-2">
                {grouped[cidade].map((p) => (
                  <PedidoCard
                    key={p.id}
                    pedido={p}
                    variant="disponivel"
                    onAlocar={p.disponivel ? () => setDialogPedido(p) : undefined}
                    onToggleDisponivel={(disponivel) => toggleMutation.mutate({ id: p.id, disponivel })}
                    loading={loadingId === p.id || toggleMutation.isPending}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
