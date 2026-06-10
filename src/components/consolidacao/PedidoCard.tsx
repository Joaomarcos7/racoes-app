"use client"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import type { PedidoDTO } from "@/types/api"
import { ArrowRight, X } from "lucide-react"

interface PedidoCardProps {
  pedido: PedidoDTO
  variant: "disponivel" | "alocado"
  onAlocar?: () => void
  onDesalocar?: () => void
  loading?: boolean
}

export function PedidoCard({ pedido, variant, onAlocar, onDesalocar, loading }: PedidoCardProps) {
  const total = pedido.itens.reduce((acc, i) => acc + i.quantidade * i.valorUnit, 0)
  const peso = pedido.itens.reduce((acc, i) => acc + i.quantidade * i.pesoUnit, 0)
  return (
    <div className="border rounded-md p-3 bg-white text-sm space-y-1">
      <div className="flex justify-between items-start">
        <span className="font-medium">{pedido.cliente?.nome ?? "—"}</span>
        <span className="text-blue-700 font-semibold">{peso.toFixed(1)} kg</span>
      </div>
      <div className="text-gray-500 text-xs">{pedido.cliente?.cidade ?? "—"} · {formatCurrency(total)}</div>
      <div className="pt-1">
        {variant === "disponivel" && onAlocar && (
          <Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={onAlocar} disabled={loading}>
            <ArrowRight size={12} className="mr-1" /> Alocar nesta rota
          </Button>
        )}
        {variant === "alocado" && onDesalocar && (
          <Button size="sm" variant="ghost" className="w-full text-xs h-7 text-red-500 hover:text-red-700" onClick={onDesalocar} disabled={loading}>
            <X size={12} className="mr-1" /> Remover
          </Button>
        )}
      </div>
    </div>
  )
}
