"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ProdutoSearchInput } from "./ProdutoSearchInput"
import { ItemPedidoRow, type ItemLocal } from "./ItemPedidoRow"
import { useClientes } from "@/hooks/use-clientes"
import { formatCurrency } from "@/lib/utils"
import { formatMoneyInput, parseMaskedMoney } from "@/lib/money-mask"
import { validarAdiantadoFiado } from "@/lib/pedido-utils"
import type { ProdutoDTO, TipoFiado } from "@/types/api"

interface PedidoFormProps {
  onSubmit: (data: {
    clienteId: string
    itens: { produtoId: string; quantidade: number }[]
    statusPagamento: string
    metodoPagamento?: string
    observacoes?: string
    dataVencimentoFiado?: string
    tipoFiado?: TipoFiado
    valorAdiantadoFiado?: number
    desconto?: number
  }) => void
  onCancel: () => void
  loading?: boolean
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

export function PedidoForm({ onSubmit, onCancel, loading }: PedidoFormProps) {
  const [clienteId, setClienteId] = useState("")
  const [itens, setItens] = useState<ItemLocal[]>([])
  const [statusPagamento, setStatusPagamento] = useState("PENDENTE")
  const [metodoPagamento, setMetodoPagamento] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [dataVencimentoFiado, setDataVencimentoFiado] = useState("")
  const [tipoFiado, setTipoFiado] = useState<TipoFiado>("INTEGRAL")
  const [valorAdiantadoMasked, setValorAdiantadoMasked] = useState("0,00")
  const [adiantadoError, setAdiantadoError] = useState<string | null>(null)
  const [descontoMasked, setDescontoMasked] = useState("0,00")
  const { data: result } = useClientes({ page: 1, limit: 100 })
  const clientes = result?.data ?? []

  const total = itens.reduce((acc, i) => acc + i.quantidade * i.valorUnit, 0)
  const pesoTotal = itens.reduce((acc, i) => acc + i.quantidade * i.pesoUnit, 0)

  function handleAddProduto(p: ProdutoDTO) {
    setItens((prev) => {
      const existing = prev.find((i) => i.produtoId === p.id)
      if (existing) return prev.map((i) => i.produtoId === p.id ? { ...i, quantidade: i.quantidade + 1 } : i)
      return [...prev, { produtoId: p.id, nome: p.nome, tipo: p.tipo, pesoUnit: p.peso, valorUnit: p.valorUnitario, quantidade: 1, pesoVariavel: false }]
    })
  }

  function handleChangeQtd(produtoId: string, quantidade: number) {
    setItens((prev) => prev.map((i) => i.produtoId === produtoId ? { ...i, quantidade: Math.max(1, quantidade) } : i))
  }

  function handleRemove(produtoId: string) {
    setItens((prev) => prev.filter((i) => i.produtoId !== produtoId))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (statusPagamento === "FIADO" && tipoFiado === "PARCIAL") {
      const totalFinal = Math.max(0, total - parseMaskedMoney(descontoMasked))
      const err = validarAdiantadoFiado(parseMaskedMoney(valorAdiantadoMasked), totalFinal)
      if (err) { setAdiantadoError(err); return }
    }
    setAdiantadoError(null)
    onSubmit({
      clienteId,
      itens: itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade })),
      statusPagamento,
      metodoPagamento: statusPagamento === "FIADO" ? undefined : (metodoPagamento || undefined),
      observacoes: observacoes || undefined,
      dataVencimentoFiado: statusPagamento === "FIADO" && dataVencimentoFiado ? dataVencimentoFiado : undefined,
      tipoFiado: statusPagamento === "FIADO" ? tipoFiado : undefined,
      valorAdiantadoFiado: statusPagamento === "FIADO" && tipoFiado === "PARCIAL" ? parseMaskedMoney(valorAdiantadoMasked) : undefined,
      desconto: parseMaskedMoney(descontoMasked) || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1">
        <Label>Cliente *</Label>
        <Select value={clienteId} onValueChange={setClienteId} required>
          <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
          <SelectContent>
            {clientes.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.nome} — {c.cidade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Adicionar Produto</Label>
        <ProdutoSearchInput onSelect={handleAddProduto} />
      </div>
      {itens.length > 0 && (
        <div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b">
                <th className="text-left pb-1">Produto</th>
                <th className="text-right pb-1">Peso/un</th>
                <th className="text-right pb-1">Valor/un</th>
                <th className="text-right pb-1">Qtd</th>
                <th className="text-right pb-1">Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <ItemPedidoRow key={item.produtoId} item={item} onChange={handleChangeQtd} onRemove={handleRemove} />
              ))}
            </tbody>
          </table>
          <div className="mt-2 flex justify-between text-sm font-medium">
            <span className="text-gray-600">Peso total: {pesoTotal.toFixed(1)} kg</span>
            <span className="text-gray-600">Subtotal: {formatCurrency(total)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-gray-500 whitespace-nowrap">Desconto (R$)</Label>
            <Input
              className="h-7 text-sm w-32 text-right"
              inputMode="numeric"
              value={descontoMasked}
              onChange={(e) => setDescontoMasked(formatMoneyInput(e.target.value))}
            />
            <span className="text-sm font-semibold ml-auto">Total: {formatCurrency(Math.max(0, total - parseMaskedMoney(descontoMasked)))}</span>
          </div>
        </div>
      )}
      <div className={statusPagamento === "FIADO" ? "space-y-1" : "grid grid-cols-2 gap-3"}>
        <div className="space-y-1">
          <Label>Status Pagamento</Label>
          <Select value={statusPagamento} onValueChange={setStatusPagamento}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDENTE">Pendente</SelectItem>
              <SelectItem value="PAGO">Pago</SelectItem>
              <SelectItem value="FIADO">Fiado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {statusPagamento !== "FIADO" && (
          <div className="space-y-1">
            <Label>Método de Pagamento{statusPagamento === "PAGO" && " *"}</Label>
            <Select value={metodoPagamento} onValueChange={setMetodoPagamento}>
              <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
              <SelectContent>
                {METODOS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      {statusPagamento === "FIADO" && (
        <div className="space-y-3 rounded-md border border-amber-200 bg-amber-50 p-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Tipo de Fiado *</Label>
              <Select value={tipoFiado} onValueChange={(v) => setTipoFiado(v as TipoFiado)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTEGRAL">Integral — tudo em aberto</SelectItem>
                  <SelectItem value="PARCIAL">Parcial — pagou parte agora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Data máxima de pagamento *</Label>
              <Input type="date" value={dataVencimentoFiado} onChange={(e) => setDataVencimentoFiado(e.target.value)} required />
            </div>
          </div>
          {tipoFiado === "PARCIAL" && (
            <div className="space-y-1">
              <Label>Valor pago adiantado (R$) *</Label>
              <Input
                inputMode="numeric"
                value={valorAdiantadoMasked}
                onChange={(e) => { setValorAdiantadoMasked(formatMoneyInput(e.target.value)); setAdiantadoError(null) }}
                className={adiantadoError ? "border-red-500" : ""}
                required
              />
              {adiantadoError && <p className="text-xs text-red-600">{adiantadoError}</p>}
            </div>
          )}
        </div>
      )}
      <div className="space-y-1">
        <Label>Observações</Label>
        <Input value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="bg-blue-700 hover:bg-blue-600" disabled={loading || !clienteId || itens.length === 0}>
          {loading ? "Salvando..." : "Criar Pedido"}
        </Button>
      </div>
    </form>
  )
}
