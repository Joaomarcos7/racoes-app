"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { VeiculoDTO } from "@/types/api"

interface VeiculoFormProps {
  initial?: VeiculoDTO
  onSubmit: (data: { placa: string; modelo: string; pesoMaximo: number }) => void
  onCancel: () => void
  loading?: boolean
}

export function VeiculoForm({ initial, onSubmit, onCancel, loading }: VeiculoFormProps) {
  const [placa, setPlaca] = useState(initial?.placa ?? "")
  const [modelo, setModelo] = useState(initial?.modelo ?? "")
  const [pesoMaximo, setPesoMaximo] = useState(String(initial?.pesoMaximo ?? ""))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ placa, modelo, pesoMaximo: Number(pesoMaximo) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Placa *</Label>
          <Input
            value={placa}
            onChange={(e) => setPlaca(e.target.value.toUpperCase())}
            placeholder="IQE1234"
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Modelo *</Label>
          <Input value={modelo} onChange={(e) => setModelo(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Peso máximo (kg) *</Label>
        <Input
          type="number"
          step="1"
          min="1"
          value={pesoMaximo}
          onChange={(e) => setPesoMaximo(e.target.value)}
          required
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="bg-blue-700 hover:bg-blue-600" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
