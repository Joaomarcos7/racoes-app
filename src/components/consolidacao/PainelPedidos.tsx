"use client"
import { PedidoCard } from "./PedidoCard"
import type { PedidoDTO } from "@/types/api"

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
  onAlocar: (pedidoId: string) => void
  loadingId?: string
}

export function PainelPedidos({ pedidos, onAlocar, loadingId }: PainelPedidosProps) {
  const grouped = groupByCidade(pedidos)
  const cidades = Object.keys(grouped).sort()
  return (
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
                <PedidoCard key={p.id} pedido={p} variant="disponivel" onAlocar={() => onAlocar(p.id)} loading={loadingId === p.id} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
