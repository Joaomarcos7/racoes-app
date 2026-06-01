"use client"
import { VeiculoSlot } from "./VeiculoSlot"
import type { ConsolidacaoRotaDTO, PedidoDTO } from "@/types/api"

interface PainelVeiculosProps {
  rota: ConsolidacaoRotaDTO
  onDesalocar: (pedidoId: string) => void
  loadingId?: string
}

export function PainelVeiculos({ rota, onDesalocar, loadingId }: PainelVeiculosProps) {
  const pedidosAlocados: PedidoDTO[] = rota.itens.map((ci) => ci.pedido)
  return (
    <div className="border rounded-lg bg-gray-50 p-4 h-full overflow-y-auto">
      <div className="font-semibold text-sm text-gray-600 mb-3 uppercase tracking-wide">Veículo da Rota</div>
      <VeiculoSlot veiculo={rota.veiculo} pedidos={pedidosAlocados} pesoAtual={rota.pesoTotal} onDesalocar={onDesalocar} loadingId={loadingId} />
    </div>
  )
}
