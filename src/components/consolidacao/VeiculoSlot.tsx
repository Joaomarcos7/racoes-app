"use client"
import { cn } from "@/lib/utils"
import type { VeiculoDTO, ConsolidacaoRotaDTO, ConsolidacaoItemDetalheDTO } from "@/types/api"
import { PedidoCard } from "./PedidoCard"
import { aggregateProdutosAlocados } from "@/lib/consolidacao-utils"
import { TIPO_BADGE } from "@/lib/produto-utils"

type RotaItem = ConsolidacaoRotaDTO["itens"][number]

interface VeiculoSlotProps {
  veiculo: VeiculoDTO
  rotaItens: RotaItem[]
  pesoAtual: number
  onDesalocar?: (pedidoId: string) => void
  onRegistrarFalta?: (pedidoId: string, faltas: { itemPedidoId: string; quantidadeFalta: number }[]) => void
  loadingId?: string
}

export function VeiculoSlot({ veiculo, rotaItens, pesoAtual, onDesalocar, onRegistrarFalta, loadingId }: VeiculoSlotProps) {
  const pct = Math.min(100, (pesoAtual / veiculo.pesoMaximo) * 100)
  const barColor = pct >= 95 ? "bg-red-500" : pct >= 80 ? "bg-yellow-400" : "bg-green-600"

  const pedidosEnriquecidos = rotaItens.map((ci) => ({
    ...ci.pedido,
    itens: ci.pedido.itens.map((item) => {
      const detalhe = ci.detalhes.find((d) => d.itemPedidoId === item.id)
      return { ...item, quantidadeAlocada: detalhe?.quantidadeAlocada }
    }),
  }))

  const produtosAgregados = aggregateProdutosAlocados(
    pedidosEnriquecidos.map((p) => ({
      itens: p.itens.map((i) => ({
        produto: { nome: i.produto.nome, tipo: i.produto.tipo },
        quantidade: i.quantidade,
        pesoUnit: i.pesoUnit,
        quantidadeFalta: i.quantidadeFalta,
        quantidadeAlocada: (i as { quantidadeAlocada?: number }).quantidadeAlocada,
      })),
    }))
  )

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
                <span className="text-slate-700 flex-1 truncate flex items-center gap-1">
                  {p.nome}
                  {p.tipo && TIPO_BADGE[p.tipo] && (
                    <span className={`text-[10px] px-1 py-0 rounded font-medium shrink-0 ${TIPO_BADGE[p.tipo].className}`}>{TIPO_BADGE[p.tipo].label}</span>
                  )}
                </span>
                <span className="text-slate-500 whitespace-nowrap">{p.pesoTotal.toFixed(1)} kg</span>
                <span className="font-medium text-slate-800 whitespace-nowrap">{p.quantidade} un</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {rotaItens.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-2">Nenhum pedido alocado</p>
      ) : (
        <div className="space-y-2">
          {rotaItens.map((ci) => (
            <PedidoCard
              key={ci.pedido.id}
              pedido={ci.pedido}
              detalhes={ci.detalhes}
              variant="alocado"
              onDesalocar={onDesalocar ? () => onDesalocar(ci.pedido.id) : undefined}
              onRegistrarFalta={onRegistrarFalta ? (faltas) => onRegistrarFalta(ci.pedido.id, faltas) : undefined}
              loading={loadingId === ci.pedido.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
