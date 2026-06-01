"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ProdutoDTO } from "@/types/api"

interface ProdutoFormProps {
  initial?: ProdutoDTO
  onSubmit: (data: { nome: string; peso: number; valorUnitario: number }) => void
  onCancel: () => void
  loading?: boolean
}

export function ProdutoForm({ initial, onSubmit, onCancel, loading }: ProdutoFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? "")
  const [peso, setPeso] = useState(String(initial?.peso ?? ""))
  const [valorUnitario, setValorUnitario] = useState(String(initial?.valorUnitario ?? ""))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ nome, peso: Number(peso), valorUnitario: Number(valorUnitario) })
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
            type="number"
            step="0.1"
            min="0"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Valor unitário (R$)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={valorUnitario}
            onChange={(e) => setValorUnitario(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-green-800 hover:bg-green-700" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
