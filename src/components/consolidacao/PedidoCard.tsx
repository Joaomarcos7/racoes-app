"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog"
import { formatCurrency } from "@/lib/utils"
import { calcularPesoFaltante } from "@/lib/consolidacao-utils"
import type { PedidoDTO, ItemPedidoDTO, ConsolidacaoItemDetalheDTO } from "@/types/api"
import { ArrowRight, X, AlertTriangle, ChevronUp, BanIcon, CheckCircle2 } from "lucide-react"
import { TIPO_BADGE } from "@/lib/produto-utils"

interface PedidoCardProps {
  pedido: PedidoDTO
  variant: "disponivel" | "alocado"
  detalhes?: ConsolidacaoItemDetalheDTO[]
  onAlocar?: () => void
  onDesalocar?: () => void
  onRegistrarFalta?: (faltas: { itemPedidoId: string; quantidadeFalta: number }[]) => void
  onToggleDisponivel?: (disponivel: boolean) => void
  loading?: boolean
}

interface ItemFaltaRowProps {
  item: ItemPedidoDTO
  maxFalta: number
  value: number
  onChange: (v: number) => void
}

function ItemFaltaRow({ item, maxFalta, value, onChange }: ItemFaltaRowProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="flex-1 truncate text-slate-700 flex items-center gap-1">
        {item.produto.nome}
        {TIPO_BADGE[item.produto.tipo] && (
          <span className={`text-[10px] px-1 py-0 rounded font-medium shrink-0 ${TIPO_BADGE[item.produto.tipo].className}`}>{TIPO_BADGE[item.produto.tipo].label}</span>
        )}
      </span>
      <span className="text-slate-400 whitespace-nowrap">{maxFalta} alocado</span>
      <div className="flex items-center gap-1 whitespace-nowrap">
        <span className="text-slate-500">falta:</span>
        <Input
          type="number"
          min={0}
          max={maxFalta}
          value={value}
          onChange={(e) => onChange(Math.min(maxFalta, Math.max(0, Number(e.target.value))))}
          className="h-6 w-14 text-xs text-right px-1"
        />
        <span className="text-slate-400">un</span>
      </div>
    </div>
  )
}

export function PedidoCard({ pedido, variant, detalhes, onAlocar, onDesalocar, onRegistrarFalta, onToggleDisponivel, loading }: PedidoCardProps) {
  const [showFalta, setShowFalta] = useState(false)
  const [confirmDisponivel, setConfirmDisponivel] = useState<boolean | null>(null)
  const [faltaMap, setFaltaMap] = useState<Record<string, number>>(() =>
    Object.fromEntries(pedido.itens.map((i) => [i.id, i.quantidadeFalta ?? 0]))
  )

  const pesoFaltante = calcularPesoFaltante(
    pedido.itens.map((i) => ({ quantidade: i.quantidade, pesoUnit: i.pesoUnit, quantidadeFalta: faltaMap[i.id] ?? 0 }))
  )
  const temFaltaRegistrada = pedido.itens.some((i) => (i.quantidadeFalta ?? 0) > 0)
  const temRestante = pedido.itens.some((i) => (i.quantidadeRestante ?? 0) > 0)
  const peso = pedido.itens.reduce((acc, i) => acc + i.quantidade * i.pesoUnit, 0)
  const total = pedido.itens.reduce((acc, i) => acc + i.quantidade * i.valorUnit, 0)

  function getMaxFalta(item: ItemPedidoDTO): number {
    const detalhe = detalhes?.find((d) => d.itemPedidoId === item.id)
    return detalhe?.quantidadeAlocada ?? item.quantidade
  }

  function handleSalvarFalta() {
    const faltas = pedido.itens.map((i) => ({ itemPedidoId: i.id, quantidadeFalta: faltaMap[i.id] ?? 0 }))
    onRegistrarFalta?.(faltas)
    setShowFalta(false)
  }

  return (
    <>
      <ConfirmActionDialog
        open={confirmDisponivel !== null}
        onOpenChange={(open) => { if (!open) setConfirmDisponivel(null) }}
        title={confirmDisponivel === false ? "Tornar pedido indisponível?" : "Tornar pedido disponível?"}
        description={
          confirmDisponivel === false
            ? "O pedido não aparecerá mais na lista de alocação de rotas. Você poderá revertê-lo depois."
            : "O pedido voltará a aparecer na lista de pedidos disponíveis para alocação."
        }
        confirmLabel={confirmDisponivel === false ? "Tornar indisponível" : "Tornar disponível"}
        confirmClassName={confirmDisponivel === false ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
        onConfirm={() => {
          if (confirmDisponivel !== null) {
            onToggleDisponivel?.(confirmDisponivel)
            setConfirmDisponivel(null)
          }
        }}
      />
    <div className={`border rounded-md p-3 bg-white text-sm space-y-1 ${!pedido.disponivel ? "opacity-60 border-dashed border-red-200" : ""}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-1.5">
          <span className="font-medium">{pedido.cliente?.nome ?? "—"}</span>
          {!pedido.disponivel && (
            <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] px-1 py-0 h-4">
              <BanIcon size={9} className="mr-0.5" /> Indisponível
            </Badge>
          )}
          {(temFaltaRegistrada || temRestante) && (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] px-1 py-0 h-4">
              <AlertTriangle size={9} className="mr-0.5" /> Parcial
            </Badge>
          )}
        </div>
        <span className="text-blue-700 font-semibold">{peso.toFixed(1)} kg</span>
      </div>
      <div className="text-gray-500 text-xs">{pedido.cliente?.cidade ?? "—"} · {formatCurrency(total)}</div>
      {temFaltaRegistrada && (
        <div className="text-xs text-amber-600">{pesoFaltante.toFixed(1)} kg em falta</div>
      )}
      {temRestante && !temFaltaRegistrada && (
        <div className="text-xs text-amber-600">
          {pedido.itens.filter(i => i.quantidadeRestante > 0).map(i => `${i.quantidadeRestante} ${i.produto.nome} restante`).join(", ")}
        </div>
      )}
      <div className="pt-1 space-y-1">
        {variant === "disponivel" && (
          <div className="flex gap-1.5">
            {onAlocar && pedido.disponivel && (
              <Button size="sm" variant="outline" className="flex-1 text-xs h-7" onClick={onAlocar} disabled={loading}>
                <ArrowRight size={12} className="mr-1" /> Alocar nesta rota
              </Button>
            )}
            {onToggleDisponivel && (
              pedido.disponivel ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                  onClick={() => setConfirmDisponivel(false)}
                  disabled={loading}
                  title="Tornar indisponível"
                >
                  <BanIcon size={12} />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-xs h-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => setConfirmDisponivel(true)}
                  disabled={loading}
                >
                  <CheckCircle2 size={12} className="mr-1" /> Tornar disponível
                </Button>
              )
            )}
          </div>
        )}
        {variant === "alocado" && (
          <>
            {onRegistrarFalta && (
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs h-7 text-amber-700 border-amber-300 hover:bg-amber-50"
                onClick={() => setShowFalta((v) => !v)}
                disabled={loading}
              >
                <AlertTriangle size={12} className="mr-1" />
                {showFalta ? <><ChevronUp size={12} className="mr-1" /> Fechar</> : "Registrar falta"}
              </Button>
            )}
            {showFalta && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-2 space-y-2">
                <p className="text-xs font-medium text-amber-800">Itens em falta:</p>
                <div className="space-y-1.5">
                  {pedido.itens.map((item) => (
                    <ItemFaltaRow
                      key={item.id}
                      item={item}
                      maxFalta={getMaxFalta(item)}
                      value={faltaMap[item.id] ?? 0}
                      onChange={(v) => setFaltaMap((prev) => ({ ...prev, [item.id]: v }))}
                    />
                  ))}
                </div>
                <Button size="sm" className="w-full h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white" onClick={handleSalvarFalta}>
                  Salvar falta
                </Button>
              </div>
            )}
            {onDesalocar && (
              <Button size="sm" variant="ghost" className="w-full text-xs h-7 text-red-500 hover:text-red-700" onClick={onDesalocar} disabled={loading}>
                <X size={12} className="mr-1" /> Remover
              </Button>
            )}
          </>
        )}
      </div>
    </div>
    </>
  )
}
