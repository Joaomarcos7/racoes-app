"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { TIPO_BADGE } from "@/lib/produto-utils"
import { calcularDisponivelParaAlocacao, calcularAumentosQuantidade } from "@/lib/consolidacao-utils"
import type { PedidoDTO, ItemPedidoDTO } from "@/types/api"
import type { AlocacaoItem } from "@/hooks/use-consolidacao"

interface AlocarPedidoDialogProps {
  pedido: PedidoDTO
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (alocacoes: AlocacaoItem[], permitirAumentoQuantidade: boolean) => void
  loading?: boolean
}

function getAvailable(pedido: PedidoDTO, item: ItemPedidoDTO): number {
  return calcularDisponivelParaAlocacao(pedido.statusEntrega, item.quantidade, item.quantidadeRestante)
}

export function AlocarPedidoDialog({ pedido, open, onOpenChange, onConfirm, loading }: AlocarPedidoDialogProps) {
  const itensDisponiveis = pedido.itens.filter((i) => getAvailable(pedido, i) > 0)

  const [qtdMap, setQtdMap] = useState<Record<string, number>>(() =>
    Object.fromEntries(itensDisponiveis.map((i) => [i.id, getAvailable(pedido, i)]))
  )
  const [confirmAumento, setConfirmAumento] = useState<{ nome: string; delta: number }[] | null>(null)

  const isRestante = pedido.statusEntrega === "ENTREGA_PARCIAL"
  const pesoEstimado = itensDisponiveis.reduce((acc, i) => {
    return acc + (qtdMap[i.id] ?? getAvailable(pedido, i)) * i.pesoUnit
  }, 0)

  function buildAlocacoes(): AlocacaoItem[] {
    return itensDisponiveis.map((i) => ({
      itemPedidoId: i.id,
      quantidadeAlocada: qtdMap[i.id] ?? getAvailable(pedido, i),
    }))
  }

  function handleConfirm() {
    const alocacoes = buildAlocacoes()
    const aumentos = calcularAumentosQuantidade(
      pedido.statusEntrega,
      pedido.itens.map((i) => ({ id: i.id, produto: { nome: i.produto.nome }, quantidade: i.quantidade, quantidadeRestante: i.quantidadeRestante })),
      alocacoes
    )
    if (aumentos.length > 0) {
      setConfirmAumento(aumentos.map((a) => ({ nome: a.nome, delta: a.delta })))
      return
    }
    onConfirm(alocacoes, false)
  }

  function handleConfirmarAumento() {
    onConfirm(buildAlocacoes(), true)
    setConfirmAumento(null)
  }

  return (
    <>
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
            {itensDisponiveis.map((item) => {
              const available = getAvailable(pedido, item)
              const val = qtdMap[item.id] ?? available
              const isAcima = val > available
              return (
                <div key={item.id} className={`flex items-center gap-2 text-sm border rounded-md px-3 py-2 ${isAcima ? "border-amber-300 bg-amber-50" : ""}`}>
                  <div className="flex-1 min-w-0">
                    <span className="truncate text-slate-800 flex items-center gap-1">
                      {item.produto.nome}
                      {TIPO_BADGE[item.produto.tipo] && (
                        <span className={`text-[10px] px-1 py-0 rounded font-medium shrink-0 ${TIPO_BADGE[item.produto.tipo].className}`}>
                          {TIPO_BADGE[item.produto.tipo].label}
                        </span>
                      )}
                    </span>
                    <span className={`text-xs ${isAcima ? "text-amber-600 font-medium" : "text-slate-400"}`}>
                      {isRestante ? `${available} restante` : `${available} un pedidas`}
                      {isAcima && ` · +${val - available} acima do pedido`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Input
                      type="number"
                      min={1}
                      value={val}
                      onChange={(e) => {
                        const v = Math.max(1, Number(e.target.value))
                        setQtdMap((prev) => ({ ...prev, [item.id]: v }))
                      }}
                      className={`h-7 w-16 text-xs text-right px-1 ${isAcima ? "border-amber-400" : ""}`}
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

      <Dialog open={!!confirmAumento} onOpenChange={(open) => { if (!open) setConfirmAumento(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle size={16} />
              Quantidade acima do pedido
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-slate-600 space-y-2">
            {confirmAumento?.map((a, i) => (
              <p key={i}>
                Você selecionou <span className="font-semibold text-amber-700">+{a.delta} {a.nome}</span> a mais do que no pedido original.
              </p>
            ))}
            <p className="text-slate-500 text-xs pt-1">
              Confirme que o pedido será alterado e seus valores recalculados.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setConfirmAumento(null)}>
              Cancelar
            </Button>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-500" onClick={handleConfirmarAumento}>
              Confirmar e atualizar pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
