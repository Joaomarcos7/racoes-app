"use client"
import { cn } from "@/lib/utils"
import type { VeiculoDTO, PedidoDTO } from "@/types/api"
import { PedidoCard } from "./PedidoCard"

interface VeiculoSlotProps {
  veiculo: VeiculoDTO
  pedidos: PedidoDTO[]
  pesoAtual: number
  onDesalocar: (pedidoId: string) => void
  loadingId?: string
}

export function VeiculoSlot({ veiculo, pedidos, pesoAtual, onDesalocar, loadingId }: VeiculoSlotProps) {
  const pct = Math.min(100, (pesoAtual / veiculo.pesoMaximo) * 100)
  const barColor = pct >= 95 ? "bg-red-500" : pct >= 80 ? "bg-yellow-400" : "bg-green-600"
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="font-semibold text-blue-700">🚛 {veiculo.placa}</span>
          <span className="text-gray-500 text-xs ml-2">{veiculo.modelo}</span>
        </div>
        <span className="text-xs text-gray-500">{pesoAtual.toFixed(1)} / {veiculo.pesoMaximo} kg</span>
      </div>
      <div className="bg-gray-100 rounded-full h-2 mb-3">
        <div className={cn("h-2 rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
      </div>
      {pedidos.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-2">Nenhum pedido alocado</p>
      ) : (
        <div className="space-y-2">
          {pedidos.map((p) => (
            <PedidoCard key={p.id} pedido={p} variant="alocado" onDesalocar={() => onDesalocar(p.id)} loading={loadingId === p.id} />
          ))}
        </div>
      )}
    </div>
  )
}
