"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatMoneyInput, parseMaskedMoney } from "@/lib/money-mask"
import { formatCurrency } from "@/lib/utils"
import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"

export interface PagamentoItem {
  metodo: string
  valor: number
  valorMasked: string
}

const METODOS: { value: string; label: string }[] = [
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "PIX", label: "Pix" },
  { value: "PIX_TERCEIROS", label: "Pix Terceiros" },
  { value: "BOLETO", label: "Boleto" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "CARTAO_CREDITO", label: "Cartão de Crédito" },
  { value: "CARTAO_DEBITO", label: "Cartão de Débito" },
]

interface Props {
  pagamentos: PagamentoItem[]
  onChange: (pagamentos: PagamentoItem[]) => void
  total: number
}

export function PagamentoMultiploInput({ pagamentos, onChange, total }: Props) {
  const metodosUsados = pagamentos.map((p) => p.metodo)
  const metodosDisponiveis = METODOS.filter((m) => !metodosUsados.includes(m.value))

  const soma = pagamentos.reduce((acc, p) => acc + p.valor, 0)
  const resto = Math.max(0, total - soma)

  function addPagamento() {
    if (metodosDisponiveis.length === 0) return
    const metodo = metodosDisponiveis[0].value
    onChange([...pagamentos, { metodo, valor: resto, valorMasked: formatMoneyInput(resto.toFixed(2).replace(".", ",")) }])
  }

  function removePagamento(idx: number) {
    onChange(pagamentos.filter((_, i) => i !== idx))
  }

  function updateMetodo(idx: number, metodo: string) {
    onChange(pagamentos.map((p, i) => i === idx ? { ...p, metodo } : p))
  }

  function updateValor(idx: number, raw: string) {
    const masked = formatMoneyInput(raw)
    const valor = parseMaskedMoney(masked)
    onChange(pagamentos.map((p, i) => i === idx ? { ...p, valor, valorMasked: masked } : p))
  }

  const diff = Math.abs(soma - total)
  const somaBate = diff <= 0.01

  return (
    <div className="space-y-2">
      {pagamentos.map((p, idx) => {
        const metodosParaEsteItem = METODOS.filter((m) => m.value === p.metodo || !metodosUsados.includes(m.value))
        return (
          <div key={idx} className="flex gap-2 items-center">
            <Select value={p.metodo} onValueChange={(v) => updateMetodo(idx, v)}>
              <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {metodosParaEsteItem.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              inputMode="numeric"
              value={p.valorMasked}
              onChange={(e) => updateValor(idx, e.target.value)}
              className="w-32 text-right"
              aria-label="Valor do pagamento"
            />
            <Button type="button" variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => removePagamento(idx)}>
              <Trash2 size={14} />
            </Button>
          </div>
        )
      })}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPagamento}
          disabled={metodosDisponiveis.length === 0}
          className="text-xs"
        >
          <Plus size={12} className="mr-1" />
          Adicionar método
        </Button>
        {pagamentos.length > 0 && (
          <span className={`text-xs font-medium ${somaBate ? "text-green-700" : "text-red-600"}`}>
            {somaBate ? `✓ ${formatCurrency(soma)}` : `Falta ${formatCurrency(diff)} (soma: ${formatCurrency(soma)})`}
          </span>
        )}
      </div>
    </div>
  )
}
