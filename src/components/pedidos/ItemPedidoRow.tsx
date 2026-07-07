"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Trash2 } from "lucide-react"
import { calcularValorPesoVariavel } from "@/lib/pedido-utils"

export interface ItemLocal {
  produtoId: string
  nome: string
  pesoUnit: number       // peso padrão do produto (kg/saco)
  valorUnit: number      // preço padrão do produto (por saco)
  quantidade: number
  pesoVariavelKg?: number // se definido, modo peso variável
}

interface ItemPedidoRowProps {
  item: ItemLocal
  onChange: (id: string, quantidade: number) => void
  onChangePesoVariavel?: (id: string, pesoKg: number | undefined) => void
  onRemove: (id: string) => void
  allowPesoVariavel?: boolean
}

export function ItemPedidoRow({ item, onChange, onChangePesoVariavel, onRemove, allowPesoVariavel }: ItemPedidoRowProps) {
  const isVariavel = item.pesoVariavelKg != null
  const subtotal = isVariavel
    ? calcularValorPesoVariavel(item.pesoVariavelKg!, item.valorUnit, item.pesoUnit)
    : item.quantidade * item.valorUnit

  return (
    <tr className="border-b">
      <td className="py-2 pr-3 text-sm">{item.nome}</td>
      <td className="py-2 pr-3 text-sm text-right text-gray-600">
        {isVariavel ? `${item.pesoVariavelKg} kg` : `${item.pesoUnit} kg`}
      </td>
      <td className="py-2 pr-3 text-sm text-right">{formatCurrency(item.valorUnit)}</td>
      <td className="py-2 pr-3">
        {isVariavel ? (
          <Input
            type="number"
            min="0.001"
            step="0.001"
            value={item.pesoVariavelKg ?? ""}
            onChange={(e) => onChangePesoVariavel?.(item.produtoId, e.target.value ? Number(e.target.value) : undefined)}
            className="w-24 text-right"
            placeholder="kg"
          />
        ) : (
          <Input
            type="number"
            min="1"
            value={item.quantidade}
            onChange={(e) => onChange(item.produtoId, Number(e.target.value))}
            className="w-20 text-right"
          />
        )}
      </td>
      <td className="py-2 pr-3 text-sm text-right font-medium">{formatCurrency(subtotal)}</td>
      <td className="py-2 text-right">
        <div className="flex gap-1 justify-end items-center">
          {allowPesoVariavel && (
            <button
              type="button"
              title={isVariavel ? "Modo saco inteiro" : "Modo peso variável"}
              onClick={() => onChangePesoVariavel?.(item.produtoId, isVariavel ? undefined : item.pesoUnit)}
              className={`text-xs px-1.5 py-0.5 rounded border ${isVariavel ? "bg-blue-100 text-blue-700 border-blue-300" : "text-gray-400 border-gray-200 hover:border-gray-400"}`}
            >
              kg
            </button>
          )}
          <Button type="button" size="icon" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => onRemove(item.produtoId)}>
            <Trash2 size={14} />
          </Button>
        </div>
      </td>
    </tr>
  )
}
