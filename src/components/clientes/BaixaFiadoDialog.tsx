"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { formatMoneyInput, parseMaskedMoney } from "@/lib/money-mask"
import { validarBaixaFiado } from "@/lib/pedido-utils"
import type { PedidoDTO } from "@/types/api"

const METODOS = [
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "PIX", label: "Pix" },
  { value: "PIX_TERCEIROS", label: "Pix Terceiros" },
  { value: "BOLETO", label: "Boleto" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "CARTAO_CREDITO", label: "Cartão de Crédito" },
  { value: "CARTAO_DEBITO", label: "Cartão de Débito" },
]

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  pedidosFiado: PedidoDTO[]
  onSubmit: (data: { pagamentos: { pedidoId: string; valor: number }[]; metodoPagamento: string }) => void
  loading?: boolean
}

export function BaixaFiadoDialog({ open, onOpenChange, pedidosFiado, onSubmit, loading }: Props) {
  const [metodoPagamento, setMetodoPagamento] = useState("")
  const [valores, setValores] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleValorChange(pedidoId: string, raw: string) {
    setValores((prev) => ({ ...prev, [pedidoId]: formatMoneyInput(raw) }))
    setErrors((prev) => { const next = { ...prev }; delete next[pedidoId]; return next })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    const pagamentos: { pedidoId: string; valor: number }[] = []

    for (const pedido of pedidosFiado) {
      const masked = valores[pedido.id]
      if (!masked || parseMaskedMoney(masked) === 0) continue
      const valor = parseMaskedMoney(masked)
      const valorAberto = pedido.valorEmAbertoFiado ?? 0
      const err = validarBaixaFiado(valor, valorAberto)
      if (err) { newErrors[pedido.id] = err; continue }
      pagamentos.push({ pedidoId: pedido.id, valor })
    }

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    if (pagamentos.length === 0) return
    if (!metodoPagamento) return

    onSubmit({ pagamentos, metodoPagamento })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setValores({}); setErrors({}); setMetodoPagamento("") }; onOpenChange(v) }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Dar Baixa em Fiado</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Método de Pagamento *</Label>
            <Select value={metodoPagamento} onValueChange={setMetodoPagamento}>
              <SelectTrigger aria-label="Método de Pagamento"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
              <SelectContent>
                {METODOS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-gray-500 uppercase tracking-wide">Pedidos com Fiado em Aberto</Label>
            <div className="rounded-md border divide-y">
              {pedidosFiado.map((pedido) => (
                <div key={pedido.id} className="px-3 py-2 space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{new Date(pedido.dataPedido).toLocaleDateString("pt-BR")}</p>
                      <p className="text-xs text-amber-700 font-medium">Em aberto: {formatCurrency(pedido.valorEmAbertoFiado ?? 0)}</p>
                    </div>
                    <div className="w-32">
                      <Input
                        inputMode="numeric"
                        placeholder="0,00"
                        value={valores[pedido.id] ?? ""}
                        onChange={(e) => handleValorChange(pedido.id, e.target.value)}
                        className={`text-right h-8 text-sm ${errors[pedido.id] ? "border-red-500" : ""}`}
                      />
                    </div>
                  </div>
                  {errors[pedido.id] && <p className="text-xs text-red-600">{errors[pedido.id]}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-500"
              disabled={loading || !metodoPagamento || Object.values(valores).every((v) => !v || parseMaskedMoney(v) === 0)}
            >
              {loading ? "Salvando..." : "Registrar Baixa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
