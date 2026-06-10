"use client"
import { Button } from "@/components/ui/button"
import { Truck, ShoppingBag } from "lucide-react"

interface TipoPedidoSelectorProps {
  onSelect: (tipo: "ENTREGA" | "BALCAO") => void
}

export function TipoPedidoSelector({ onSelect }: TipoPedidoSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        type="button"
        variant="outline"
        className="h-32 flex-col gap-3 text-base border-2 hover:border-blue-700 hover:bg-blue-50"
        onClick={() => onSelect("ENTREGA")}
      >
        <Truck size={32} className="text-blue-700" />
        Pedido Entrega
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-32 flex-col gap-3 text-base border-2 hover:border-blue-600 hover:bg-blue-50"
        onClick={() => onSelect("BALCAO")}
      >
        <ShoppingBag size={32} className="text-blue-600" />
        Pedido Balcão
      </Button>
    </div>
  )
}
