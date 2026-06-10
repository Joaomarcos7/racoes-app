"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatMoneyInput, parseMaskedMoney, formatDecimalInput, parseMaskedDecimal } from "@/lib/money-mask"
import type { ProdutoDTO } from "@/types/api"

interface ProdutoFormProps {
  initial?: ProdutoDTO
  onSubmit: (data: { nome: string; peso: number; valorUnitario: number }) => void
  onCancel: () => void
  loading?: boolean
}

function toMoneyMasked(value: number | undefined): string {
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

  function handleValorChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValorMasked(formatMoneyInput(e.target.value))
  }

  function handlePesoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPesoMasked(formatDecimalInput(e.target.value, 3))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ nome, peso: parseMaskedDecimal(pesoMasked), valorUnitario: parseMaskedMoney(valorMasked) })
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
            onChange={handlePesoChange}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Valor unitário (R$)</Label>
          <Input
            inputMode="numeric"
            value={valorMasked}
            onChange={handleValorChange}
            required
          />
        </div>
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
