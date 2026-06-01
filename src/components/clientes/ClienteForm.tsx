"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ClienteDTO } from "@/types/api"

interface ClienteFormProps {
  initial?: ClienteDTO
  onSubmit: (data: { nome: string; telefone?: string; email?: string; cidade: string }) => void
  onCancel?: () => void
  loading?: boolean
}

export function ClienteForm({ initial, onSubmit, onCancel, loading }: ClienteFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? "")
  const [telefone, setTelefone] = useState(initial?.telefone ?? "")
  const [email, setEmail] = useState(initial?.email ?? "")
  const [cidade, setCidade] = useState(initial?.cidade ?? "")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ nome, telefone: telefone || undefined, email: email || undefined, cidade })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>Nome *</Label>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
      </div>
      <div className="space-y-1">
        <Label>Cidade *</Label>
        <Input value={cidade} onChange={(e) => setCidade(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Telefone</Label>
          <Input value={telefone ?? ""} onChange={(e) => setTelefone(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Email</Label>
          <Input type="email" value={email ?? ""} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" className="bg-green-800 hover:bg-green-700" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
