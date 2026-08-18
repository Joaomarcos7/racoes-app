"use client"
import { useState } from "react"
import { PedidoCard } from "./PedidoCard"
import { AlocarPedidoDialog } from "./AlocarPedidoDialog"
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
  onAlocar: (pedidoId: string, alocacoes: AlocacaoItem[]) => void
  loadingId?: string
}

export function PainelPedidos({ pedidos, onAlocar, loadingId }: PainelPedidosProps) {
  const [dialogPedido, setDialogPedido] = useState<PedidoDTO | null>(null)
  const grouped = groupByCidade(pedidos)
  const cidades = Object.keys(grouped).sort()

  function handleConfirmar(alocacoes: AlocacaoItem[]) {
    if (!dialogPedido) return
    onAlocar(dialogPedido.id, alocacoes)
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
      <div className="border rounded-lg bg-gray-50 p-4 h-full overflow-y-auto">
        <div className="font-semibold text-sm text-gray-600 mb-3 uppercase tracking-wide">
          Pedidos Disponíveis ({pedidos.length})
        </div>
        {pedidos.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Todos os pedidos foram alocados</p>
        ) : (
          cidades.map((cidade) => (
            <div key={cidade} className="mb-4">
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
