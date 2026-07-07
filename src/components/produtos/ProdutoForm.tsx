"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatMoneyInput, parseMaskedMoney, formatDecimalInput, parseMaskedDecimal } from "@/lib/money-mask"
import { TIPOS_PRODUTO } from "@/lib/produto-utils"
import type { ProdutoDTO, TipoProduto } from "@/types/api"

interface ProdutoFormProps {
  initial?: ProdutoDTO
  onSubmit: (data: { nome: string; peso: number; valorUnitario: number; custo?: number | null; tipo: TipoProduto }) => void
  onCancel: () => void
  loading?: boolean
}

function toMoneyMasked(value: number | null | undefined): string {
  if (!value) return "0,00"
  return formatMoneyInput(Math.round(value * 100).toString())
}

function toKgMasked(value: number | undefined): string {
  if (!value) return "0,000"
  return formatDecimalInput(Math.round(value * 1000).toString(), 3)
}

export function ProdutoForm({ initial, onSubmit, onCancel, loading }: ProdutoFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? "")
  const [pesoMasked, setPesoMasked] = useState(toKgMasked(initial?.peso))
  const [valorMasked, setValorMasked] = useState(toMoneyMasked(initial?.valorUnitario))
  const [custoMasked, setCustoMasked] = useState(toMoneyMasked(initial?.custo))
  const [tipo, setTipo] = useState<TipoProduto>(initial?.tipo ?? "CONSUMIDOR_FINAL")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const custoVal = parseMaskedMoney(custoMasked)
    onSubmit({
      nome,
      peso: parseMaskedDecimal(pesoMasked),
      valorUnitario: parseMaskedMoney(valorMasked),
      custo: custoVal > 0 ? custoVal : null,
      tipo,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>Nome do produto</Label>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Peso (kg)</Label>
          <Input
            inputMode="numeric"
            value={pesoMasked}
            onChange={(e) => setPesoMasked(formatDecimalInput(e.target.value, 3))}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Valor unitário (R$)</Label>
          <Input
            inputMode="numeric"
            value={valorMasked}
            onChange={(e) => setValorMasked(formatMoneyInput(e.target.value))}
            required
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Tipo</Label>
        <Select value={tipo} onValueChange={(v) => setTipo(v as TipoProduto)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {TIPOS_PRODUTO.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Custo (R$) <span className="text-gray-400 text-xs font-normal">(opcional)</span></Label>
        <Input
          inputMode="numeric"
          value={custoMasked}
          onChange={(e) => setCustoMasked(formatMoneyInput(e.target.value))}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-700 hover:bg-blue-600" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
