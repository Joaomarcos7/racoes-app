"use client"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Trash2 } from "lucide-react"
import { calcularValorPesoVariavel } from "@/lib/pedido-utils"

export interface ItemLocal {
  produtoId: string
  nome: string
  pesoUnit: number    // peso padrão do saco (kg)
  valorUnit: number   // preço por saco
  quantidade: number  // número de sacos inteiros
  pesoVariavel: boolean
  pesoKg?: number     // peso digitado em modo variável (kg)
}

interface ItemPedidoRowProps {
  item: ItemLocal
  onChange: (id: string, quantidade: number) => void
  onTogglePesoVariavel?: (id: string) => void
  onChangePesoKg?: (id: string, pesoKg: number | undefined) => void
  onRemove: (id: string) => void
  allowPesoVariavel?: boolean
}

export function ItemPedidoRow({ item, onChange, onTogglePesoVariavel, onChangePesoKg, onRemove, allowPesoVariavel }: ItemPedidoRowProps) {
  const [pesoInput, setPesoInput] = useState(item.pesoKg != null ? String(item.pesoKg) : "")

  // Sync local string when mode is toggled off externally
  useEffect(() => {
    if (!item.pesoVariavel) setPesoInput("")
  }, [item.pesoVariavel])

  const subtotal = item.pesoVariavel && item.pesoKg != null
    ? calcularValorPesoVariavel(item.pesoKg, item.valorUnit, item.pesoUnit)
    : item.quantidade * item.valorUnit

  function handlePesoChange(raw: string) {
    setPesoInput(raw)
    const parsed = parseFloat(raw.replace(",", "."))
    onChangePesoKg?.(item.produtoId, isNaN(parsed) ? undefined : parsed)
  }

  return (
    <tr className="border-b">
      <td className="py-2 pr-3 text-sm">{item.nome}</td>
      <td className="py-2 pr-3 text-sm text-right text-gray-600">
        {item.pesoVariavel && item.pesoKg != null ? `${item.pesoKg} kg` : `${item.pesoUnit} kg/saco`}
      </td>
      <td className="py-2 pr-3 text-sm text-right">{formatCurrency(item.valorUnit)}</td>
      <td className="py-2 pr-3">
        {item.pesoVariavel ? (
          <Input
            type="text"
            inputMode="decimal"
            value={pesoInput}
            onChange={(e) => handlePesoChange(e.target.value)}
            className="w-24 text-right"
            placeholder="ex: 0.75"
            autoFocus
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
              title={item.pesoVariavel ? "Voltar para sacos inteiros" : "Modo peso variável"}
              onClick={() => onTogglePesoVariavel?.(item.produtoId)}
              className={`text-xs px-1.5 py-0.5 rounded border ${item.pesoVariavel ? "bg-blue-100 text-blue-700 border-blue-300" : "text-gray-400 border-gray-200 hover:border-gray-400"}`}
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
