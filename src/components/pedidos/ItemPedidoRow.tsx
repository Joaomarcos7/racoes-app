"use client"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { formatMoneyInput, parseMaskedMoney } from "@/lib/money-mask"
import { Trash2 } from "lucide-react"
import { calcularValorPesoVariavel } from "@/lib/pedido-utils"
import { TIPO_BADGE } from "@/lib/produto-utils"

export interface ItemLocal {
  produtoId: string
  nome: string
  tipo?: string
  pesoUnit: number    // peso padrão do saco (kg)
  valorUnit: number   // preço original por saco
  valorUnitOverride?: number  // preço negociado (desconto por unidade)
  quantidade: number  // número de sacos inteiros
  pesoVariavel: boolean
  pesoKg?: number     // peso digitado em modo variável (kg)
}

interface ItemPedidoRowProps {
  item: ItemLocal
  onChange: (id: string, quantidade: number) => void
  onTogglePesoVariavel?: (id: string) => void
  onChangePesoKg?: (id: string, pesoKg: number | undefined) => void
  onChangeValorUnit?: (id: string, valor: number | undefined) => void
  onRemove: (id: string) => void
  allowPesoVariavel?: boolean
}

export function ItemPedidoRow({ item, onChange, onTogglePesoVariavel, onChangePesoKg, onChangeValorUnit, onRemove, allowPesoVariavel }: ItemPedidoRowProps) {
  const [pesoInput, setPesoInput] = useState(item.pesoKg != null ? String(item.pesoKg) : "")
  const valorEfetivo = item.valorUnitOverride ?? item.valorUnit
  const [valorInput, setValorInput] = useState(formatMoneyInput(String(valorEfetivo.toFixed(2)).replace(".", ",")))

  // Sync local string when mode is toggled off externally
  useEffect(() => {
    if (!item.pesoVariavel) setPesoInput("")
  }, [item.pesoVariavel])

  const subtotal = item.pesoVariavel && item.pesoKg != null
    ? calcularValorPesoVariavel(item.pesoKg, valorEfetivo, item.pesoUnit)
    : item.quantidade * valorEfetivo

  function handlePesoChange(raw: string) {
    setPesoInput(raw)
    const parsed = parseFloat(raw.replace(",", "."))
    onChangePesoKg?.(item.produtoId, isNaN(parsed) ? undefined : parsed)
  }

  return (
    <tr className="border-b">
      <td className="py-2 pr-3 text-sm">
        <span className="flex items-center gap-1.5">
          {item.nome}
          {item.tipo && TIPO_BADGE[item.tipo] && (
            <span className={`text-[10px] px-1 py-0 rounded font-medium ${TIPO_BADGE[item.tipo].className}`}>{TIPO_BADGE[item.tipo].label}</span>
          )}
        </span>
      </td>
      <td className="py-2 pr-3 text-sm text-right text-gray-600">
        {item.pesoVariavel && item.pesoKg != null ? `${item.pesoKg} kg` : `${item.pesoUnit} kg/saco`}
      </td>
      <td className="py-2 pr-3 text-sm text-right">
        {onChangeValorUnit ? (
          <div className="flex flex-col items-end gap-0.5">
            <Input
              aria-label="Valor por unidade"
              inputMode="numeric"
              value={valorInput}
              onChange={(e) => {
                const masked = formatMoneyInput(e.target.value)
                setValorInput(masked)
                const parsed = parseMaskedMoney(masked)
                onChangeValorUnit(item.produtoId, parsed > 0 ? parsed : undefined)
              }}
              className={`w-24 h-7 text-right text-sm ${item.valorUnitOverride != null && item.valorUnitOverride < item.valorUnit ? "border-amber-400 bg-amber-50" : ""}`}
            />
            {item.valorUnitOverride != null && item.valorUnitOverride < item.valorUnit && (
              <span className="text-[10px] text-amber-700 line-through">{formatCurrency(item.valorUnit)}</span>
            )}
          </div>
        ) : (
          formatCurrency(valorEfetivo)
        )}
      </td>
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
