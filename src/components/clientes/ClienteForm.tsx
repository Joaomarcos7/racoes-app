"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ClienteDTO } from "@/types/api"
import { fetchViaCep } from "@/lib/viacep"
import { formatTelefoneInput, validateDDD, parseTelefoneDigits } from "@/lib/phone-mask"

interface ClienteFormProps {
  initial?: ClienteDTO
  onSubmit: (data: { nome: string; telefone?: string; instituicao?: string; cidade: string; cep?: string; endereco?: string; complemento?: string }) => void
  onCancel?: () => void
  loading?: boolean
}

export function ClienteForm({ initial, onSubmit, onCancel, loading }: ClienteFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? "")
  const [telefone, setTelefone] = useState(() => {
    const raw = initial?.telefone ?? ""
    return raw ? formatTelefoneInput(parseTelefoneDigits(raw)) : ""
  })
  const [instituicao, setInstituicao] = useState(initial?.instituicao ?? "")
  const [cidade, setCidade] = useState(initial?.cidade ?? "")
  const [cep, setCep] = useState(initial?.cep ?? "")
  const [endereco, setEndereco] = useState(initial?.endereco ?? "")
  const [complemento, setComplemento] = useState(initial?.complemento ?? "")
  const [cepLoading, setCepLoading] = useState(false)

  const telefoneDigits = parseTelefoneDigits(telefone)
  const ddd = telefoneDigits.slice(0, 2)
  const dddError = telefoneDigits.length >= 2 && !validateDDD(ddd)
    ? `DDD ${ddd} inválido`
    : null
  const telefoneCompleto = telefoneDigits.length === 11
  const telefoneValido = !telefoneDigits || (telefoneCompleto && !dddError)

  async function handleCepBlur() {
    const digits = cep.replace(/\D/g, "")
    if (digits.length !== 8) return
    setCepLoading(true)
    const result = await fetchViaCep(digits)
    setCepLoading(false)
    if (result) {
      setEndereco(result.logradouro)
      setCidade(result.localidade)
    }
  }

  function handleTelefoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTelefone(formatTelefoneInput(e.target.value))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!telefoneValido) return
    onSubmit({
      nome,
      telefone: telefone || undefined,
      instituicao: instituicao || undefined,
      cidade,
      cep: cep || undefined,
      endereco: endereco || undefined,
      complemento: complemento || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>Nome *</Label>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Telefone</Label>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-slate-500 font-medium whitespace-nowrap">+55</span>
            <Input
              value={telefone}
              onChange={handleTelefoneChange}
              placeholder="(11) 98765-4321"
              inputMode="numeric"
              className={dddError ? "border-red-500" : ""}
            />
          </div>
          {dddError && <p className="text-xs text-red-600">{dddError}</p>}
        </div>
        <div className="space-y-1">
          <Label>Instituição</Label>
          <Input value={instituicao ?? ""} onChange={(e) => setInstituicao(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>CEP</Label>
          <Input
            value={cep ?? ""}
            onChange={(e) => setCep(e.target.value)}
            onBlur={handleCepBlur}
            placeholder="00000-000"
            disabled={cepLoading}
          />
        </div>
        <div className="space-y-1">
          <Label>Cidade *</Label>
          <Input value={cidade} onChange={(e) => setCidade(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Endereço / Rua</Label>
        <Input value={endereco ?? ""} onChange={(e) => setEndereco(e.target.value)} disabled={cepLoading} />
      </div>
      <div className="space-y-1">
        <Label>Complemento</Label>
        <Input value={complemento ?? ""} onChange={(e) => setComplemento(e.target.value)} />
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" className="bg-blue-700 hover:bg-blue-600" disabled={loading || cepLoading || !telefoneValido}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
