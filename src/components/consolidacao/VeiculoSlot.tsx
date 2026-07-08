"use client"
import { cn } from "@/lib/utils"
import type { VeiculoDTO, PedidoDTO } from "@/types/api"
import { PedidoCard } from "./PedidoCard"
import { aggregateProdutosAlocados } from "@/lib/consolidacao-utils"

interface VeiculoSlotProps {
  veiculo: VeiculoDTO
  pedidos: PedidoDTO[]
  pesoAtual: number
  onDesalocar?: (pedidoId: string) => void
  onRegistrarFalta?: (pedidoId: string, faltas: { itemPedidoId: string; quantidadeFalta: number }[]) => void
  loadingId?: string
}

export function VeiculoSlot({ veiculo, pedidos, pesoAtual, onDesalocar, onRegistrarFalta, loadingId }: VeiculoSlotProps) {
  const pct = Math.min(100, (pesoAtual / veiculo.pesoMaximo) * 100)
  const barColor = pct >= 95 ? "bg-red-500" : pct >= 80 ? "bg-yellow-400" : "bg-green-600"
  const produtosAgregados = aggregateProdutosAlocados(pedidos)

  return (
    <div className="border rounded-lg p-4 bg-white space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <span className="font-semibold text-blue-700">🚛 {veiculo.placa}</span>
          <span className="text-gray-500 text-xs ml-2">{veiculo.modelo}</span>
        </div>
        <span className="text-xs text-gray-500">{pesoAtual.toFixed(1)} / {veiculo.pesoMaximo} kg</span>
      </div>
      <div className="bg-gray-100 rounded-full h-2">
        <div className={cn("h-2 rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
      </div>
      {produtosAgregados.length > 0 && (
        <div className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Produtos no veículo</p>
          <div className="space-y-1">
            {produtosAgregados.map((p) => (
              <div key={p.nome} className="flex justify-between text-xs gap-2">
                <span className="text-slate-700 flex-1 truncate">{p.nome}</span>
                <span className="text-slate-500 whitespace-nowrap">{p.pesoTotal.toFixed(1)} kg</span>
                <span className="font-medium text-slate-800 whitespace-nowrap">{p.quantidade} un</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {pedidos.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-2">Nenhum pedido alocado</p>
      ) : (
        <div className="space-y-2">
          {pedidos.map((p) => (
            <PedidoCard
              key={p.id}
              pedido={p}
              variant="alocado"
              onDesalocar={onDesalocar ? () => onDesalocar(p.id) : undefined}
              onRegistrarFalta={onRegistrarFalta ? (faltas) => onRegistrarFalta(p.id, faltas) : undefined}
              loading={loadingId === p.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
