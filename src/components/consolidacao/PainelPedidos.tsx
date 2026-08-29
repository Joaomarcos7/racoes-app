"use client"
import { useState, useMemo } from "react"
import { PedidoCard } from "./PedidoCard"
import { AlocarPedidoDialog } from "./AlocarPedidoDialog"
import { Input } from "@/components/ui/input"
import { filtrarPedidosPorCidade } from "@/lib/consolidacao-utils"
import type { PedidoDTO } from "@/types/api"
import type { AlocacaoItem } from "@/hooks/use-consolidacao"

function groupByCidade(pedidos: PedidoDTO[]): Record<string, PedidoDTO[]> {
  return pedidos.reduce((acc, p) => {
    const c = p.cliente?.cidade ?? "Sem cidade"
    if (!acc[c]) acc[c] = []
    acc[c].push(p)
    return acc
  }, {} as Record<string, PedidoDTO[]>)
}

interface PainelPedidosProps {
  pedidos: PedidoDTO[]
  onAlocar: (pedidoId: string, alocacoes: AlocacaoItem[], permitirAumentoQuantidade?: boolean) => void
  loadingId?: string
}

export function PainelPedidos({ pedidos, onAlocar, loadingId }: PainelPedidosProps) {
  const [dialogPedido, setDialogPedido] = useState<PedidoDTO | null>(null)
  const [search, setSearch] = useState("")

  const pedidosFiltrados = useMemo(
    () => filtrarPedidosPorCidade(pedidos, search),
    [pedidos, search]
  )
  const grouped = groupByCidade(pedidosFiltrados)
  const cidades = Object.keys(grouped).sort()

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
            Pedidos Disponíveis ({pedidos.length})
          </span>
        </div>
        <Input
          placeholder="Filtrar por cidade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm"
        />
        {pedidos.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Todos os pedidos foram alocados</p>
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
                    onAlocar={() => setDialogPedido(p)}
                    loading={loadingId === p.id}
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
