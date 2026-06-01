"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Trash2 } from "lucide-react"

export interface ItemLocal {
  produtoId: string
  nome: string
  pesoUnit: number
  valorUnit: number
  quantidade: number
}

interface ItemPedidoRowProps {
  item: ItemLocal
  onChange: (id: string, quantidade: number) => void
  onRemove: (id: string) => void
}

export function ItemPedidoRow({ item, onChange, onRemove }: ItemPedidoRowProps) {
  return (
    <tr className="border-b">
      <td className="py-2 pr-3 text-sm">{item.nome}</td>
      <td className="py-2 pr-3 text-sm text-right text-gray-600">{item.pesoUnit} kg</td>
      <td className="py-2 pr-3 text-sm text-right">{formatCurrency(item.valorUnit)}</td>
      <td className="py-2 pr-3">
        <Input
          type="number"
          min="1"
          value={item.quantidade}
          onChange={(e) => onChange(item.produtoId, Number(e.target.value))}
          className="w-20 text-right"
        />
      </td>
      <td className="py-2 pr-3 text-sm text-right font-medium">
        {formatCurrency(item.quantidade * item.valorUnit)}
      </td>
      <td className="py-2">
        <Button type="button" size="icon" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => onRemove(item.produtoId)}>
          <Trash2 size={14} />
        </Button>
      </td>
    </tr>
  )
}
