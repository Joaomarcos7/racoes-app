"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatMoneyInput, parseMaskedMoney } from "@/lib/money-mask"
import { TIPOS_SAIDA, validateSaida } from "@/lib/saida-utils"
import type { SaidaDTO } from "@/types/api"

interface SaidaFormProps {
  initial?: Partial<SaidaDTO>
  onSubmit: (data: { data: string; tipo: string; descricao?: string; valor: number }) => void
  onCancel: () => void
  loading?: boolean
}

export function SaidaForm({ initial, onSubmit, onCancel, loading }: SaidaFormProps) {
  const toLocalDatetimeValue = (iso?: string) => {
    if (!iso) return new Date().toISOString().slice(0, 16)
    return new Date(iso).toISOString().slice(0, 16)
  }

  const [data, setData] = useState(toLocalDatetimeValue(initial?.data))
  const [tipo, setTipo] = useState(initial?.tipo ?? "")
  const [descricao, setDescricao] = useState(initial?.descricao ?? "")
  const [valorMasked, setValorMasked] = useState(
    initial?.valor ? initial.valor.toFixed(2).replace(".", ",") : "0,00"
  )
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const valor = parseMaskedMoney(valorMasked)
    const err = validateSaida({ data, tipo, valor, descricao: descricao || undefined })
    if (err) { setError(err); return }
    setError(null)
    onSubmit({ data: new Date(data).toISOString(), tipo, descricao: descricao || undefined, valor })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Data e Hora *</Label>
          <Input type="datetime-local" value={data} onChange={(e) => setData(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>Tipo *</Label>
          <Select value={tipo} onValueChange={setTipo} required>
            <SelectTrigger><SelectValue placeholder="Selecionar tipo..." /></SelectTrigger>
            <SelectContent>
              {TIPOS_SAIDA.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {tipo === "OUTRO" && (
        <div className="space-y-1">
          <Label>Descrição *</Label>
          <Input
            placeholder="Especifique o tipo da saída..."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
          />
        </div>
      )}

      <div className="space-y-1">
        <Label>Valor (R$) *</Label>
        <Input
          inputMode="numeric"
          value={valorMasked}
          onChange={(e) => setValorMasked(formatMoneyInput(e.target.value))}
          className={error?.includes("Valor") ? "border-red-500" : ""}
          required
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-700 hover:bg-blue-600" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
