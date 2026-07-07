"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TIPOS_CARROCERIA } from "@/lib/veiculo-utils"
import type { VeiculoDTO, TipoCarroceria } from "@/types/api"

interface VeiculoFormProps {
  initial?: VeiculoDTO
  onSubmit: (data: { placa: string; modelo: string; ano: number; carroceria: TipoCarroceria; cor: string; pesoMaximo: number }) => void
  onCancel: () => void
  loading?: boolean
}

const ANO_ATUAL = new Date().getFullYear()

export function VeiculoForm({ initial, onSubmit, onCancel, loading }: VeiculoFormProps) {
  const [placa, setPlaca] = useState(initial?.placa ?? "")
  const [modelo, setModelo] = useState(initial?.modelo ?? "")
  const [ano, setAno] = useState(String(initial?.ano ?? ANO_ATUAL))
  const [carroceria, setCarroceria] = useState<TipoCarroceria>(initial?.carroceria ?? "BAU")
  const [cor, setCor] = useState(initial?.cor ?? "")
  const [pesoMaximo, setPesoMaximo] = useState(String(initial?.pesoMaximo ?? ""))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ placa, modelo, ano: Number(ano), carroceria, cor, pesoMaximo: Number(pesoMaximo) })
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Ano *</Label>
          <Input
            type="number"
            min="1950"
            max={ANO_ATUAL + 1}
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Cor *</Label>
          <Input value={cor} onChange={(e) => setCor(e.target.value)} placeholder="Branco" required />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Carroceria *</Label>
        <Select value={carroceria} onValueChange={(v) => setCarroceria(v as TipoCarroceria)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {TIPOS_CARROCERIA.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
