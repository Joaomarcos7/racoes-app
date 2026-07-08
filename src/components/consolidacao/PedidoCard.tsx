"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { calcularPesoFaltante } from "@/lib/consolidacao-utils"
import type { PedidoDTO, ItemPedidoDTO } from "@/types/api"
import { ArrowRight, X, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import { TIPO_BADGE } from "@/lib/produto-utils"

interface PedidoCardProps {
  pedido: PedidoDTO
  variant: "disponivel" | "alocado"
  rotaId?: string
  onAlocar?: () => void
  onDesalocar?: () => void
  onRegistrarFalta?: (faltas: { itemPedidoId: string; quantidadeFalta: number }[]) => void
  loading?: boolean
}

function ItemFaltaRow({ item, value, onChange }: { item: ItemPedidoDTO; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="flex-1 truncate text-slate-700 flex items-center gap-1">
        {item.produto.nome}
        {TIPO_BADGE[item.produto.tipo] && (
          <span className={`text-[10px] px-1 py-0 rounded font-medium shrink-0 ${TIPO_BADGE[item.produto.tipo].className}`}>{TIPO_BADGE[item.produto.tipo].label}</span>
        )}
      </span>
      <span className="text-slate-400 whitespace-nowrap">{item.quantidade} un</span>
      <div className="flex items-center gap-1 whitespace-nowrap">
        <span className="text-slate-500">falta:</span>
        <Input
          type="number"
          min={0}
          max={item.quantidade}
          value={value}
          onChange={(e) => onChange(Math.min(item.quantidade, Math.max(0, Number(e.target.value))))}
          className="h-6 w-14 text-xs text-right px-1"
        />
        <span className="text-slate-400">un</span>
      </div>
    </div>
  )
}

export function PedidoCard({ pedido, variant, onAlocar, onDesalocar, onRegistrarFalta, loading }: PedidoCardProps) {
  const [showFalta, setShowFalta] = useState(false)
  const [faltaMap, setFaltaMap] = useState<Record<string, number>>(() =>
    Object.fromEntries(pedido.itens.map((i) => [i.id, i.quantidadeFalta ?? 0]))
  )

  const pesoFaltante = calcularPesoFaltante(
    pedido.itens.map((i) => ({ quantidade: i.quantidade, pesoUnit: i.pesoUnit, quantidadeFalta: faltaMap[i.id] ?? 0 }))
  )
  const temFaltaRegistrada = pedido.itens.some((i) => (i.quantidadeFalta ?? 0) > 0)
  const peso = pedido.itens.reduce((acc, i) => acc + i.quantidade * i.pesoUnit, 0)
  const total = pedido.itens.reduce((acc, i) => acc + i.quantidade * i.valorUnit, 0)

  function handleSalvarFalta() {
    const faltas = pedido.itens.map((i) => ({ itemPedidoId: i.id, quantidadeFalta: faltaMap[i.id] ?? 0 }))
    onRegistrarFalta?.(faltas)
    setShowFalta(false)
  }

  return (
    <div className="border rounded-md p-3 bg-white text-sm space-y-1">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-1.5">
          <span className="font-medium">{pedido.cliente?.nome ?? "—"}</span>
          {temFaltaRegistrada && (
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
      <div className="pt-1 space-y-1">
        {variant === "disponivel" && onAlocar && (
          <Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={onAlocar} disabled={loading}>
            <ArrowRight size={12} className="mr-1" /> Alocar nesta rota
          </Button>
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
  )
}
