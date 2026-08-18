"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import { TIPO_BADGE } from "@/lib/produto-utils"
import type { PedidoDTO, ItemPedidoDTO } from "@/types/api"
import type { AlocacaoItem } from "@/hooks/use-consolidacao"

interface AlocarPedidoDialogProps {
  pedido: PedidoDTO
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (alocacoes: AlocacaoItem[]) => void
  loading?: boolean
}

function getAvailable(item: ItemPedidoDTO): number {
  return item.quantidadeRestante > 0 ? item.quantidadeRestante : item.quantidade
}

export function AlocarPedidoDialog({ pedido, open, onOpenChange, onConfirm, loading }: AlocarPedidoDialogProps) {
  const [qtdMap, setQtdMap] = useState<Record<string, number>>(() =>
    Object.fromEntries(pedido.itens.map((i) => [i.id, getAvailable(i)]))
  )

  const isRestante = pedido.itens.some((i) => i.quantidadeRestante > 0)
  const pesoEstimado = pedido.itens.reduce((acc, i) => {
    return acc + (qtdMap[i.id] ?? getAvailable(i)) * i.pesoUnit
  }, 0)

  function handleConfirm() {
    const alocacoes: AlocacaoItem[] = pedido.itens.map((i) => ({
      itemPedidoId: i.id,
      quantidadeAlocada: qtdMap[i.id] ?? getAvailable(i),
    }))
    onConfirm(alocacoes)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Alocar pedido
            {isRestante && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">Restante</Badge>
            )}
          </DialogTitle>
          <p className="text-sm text-gray-500">{pedido.cliente?.nome} · {pedido.cliente?.cidade}</p>
        </DialogHeader>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {pedido.itens.map((item) => {
            const available = getAvailable(item)
            const val = qtdMap[item.id] ?? available
            return (
              <div key={item.id} className="flex items-center gap-2 text-sm border rounded-md px-3 py-2">
                <div className="flex-1 min-w-0">
                  <span className="truncate text-slate-800 flex items-center gap-1">
                    {item.produto.nome}
                    {TIPO_BADGE[item.produto.tipo] && (
                      <span className={`text-[10px] px-1 py-0 rounded font-medium shrink-0 ${TIPO_BADGE[item.produto.tipo].className}`}>
                        {TIPO_BADGE[item.produto.tipo].label}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-slate-400">
                    {isRestante ? `${available} restante` : `${available} un pedidas`}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Input
                    type="number"
                    min={1}
                    max={available}
                    value={val}
                    onChange={(e) => {
                      const v = Math.min(available, Math.max(1, Number(e.target.value)))
                      setQtdMap((prev) => ({ ...prev, [item.id]: v }))
                    }}
                    className="h-7 w-16 text-xs text-right px-1"
                  />
                  <span className="text-xs text-slate-400">/ {available}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-xs text-slate-500 border-t pt-2">
          Peso estimado: <span className="font-medium text-slate-700">{pesoEstimado.toFixed(1)} kg</span>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button size="sm" className="bg-blue-700 hover:bg-blue-600" onClick={handleConfirm} disabled={loading}>
            <ArrowRight size={14} className="mr-1" />
            {loading ? "Alocando..." : "Confirmar alocação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
