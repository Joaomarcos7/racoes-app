"use client"
import { VeiculoSlot } from "./VeiculoSlot"
import type { ConsolidacaoRotaDTO, PedidoDTO } from "@/types/api"

interface PainelVeiculosProps {
  rota: ConsolidacaoRotaDTO
  onDesalocar?: (pedidoId: string) => void
  onRegistrarFalta?: (pedidoId: string, faltas: { itemPedidoId: string; quantidadeFalta: number }[]) => void
  loadingId?: string
  isFechada?: boolean
}

export function PainelVeiculos({ rota, onDesalocar, onRegistrarFalta, loadingId, isFechada }: PainelVeiculosProps) {
  const pedidosAlocados: PedidoDTO[] = rota.itens.map((ci) => ci.pedido)
  return (
    <div className="border rounded-lg bg-gray-50 p-4 h-full overflow-y-auto">
      <div className="font-semibold text-sm text-gray-600 mb-3 uppercase tracking-wide flex items-center justify-between">
        <span>Veículo da Rota</span>
        {isFechada && <span className="text-xs text-blue-700 font-medium normal-case">Rota fechada — somente leitura</span>}
      </div>
      <VeiculoSlot
        veiculo={rota.veiculo}
        pedidos={pedidosAlocados}
        pesoAtual={rota.pesoTotal}
        onDesalocar={isFechada ? undefined : onDesalocar}
        onRegistrarFalta={isFechada ? undefined : onRegistrarFalta}
        loadingId={loadingId}
      />
    </div>
  )
}
