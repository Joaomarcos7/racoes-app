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
import type { ProdutoDTO } from "@/types/api"

interface PedidoFormProps {
  onSubmit: (data: {
    clienteId: string
    itens: { produtoId: string; quantidade: number }[]
    statusPagamento: string
    metodoPagamento?: string
    observacoes?: string
  }) => void
  onCancel: () => void
  loading?: boolean
}

const METODOS = ["DINHEIRO", "PIX", "BOLETO", "CHEQUE", "FIADO"]

export function PedidoForm({ onSubmit, onCancel, loading }: PedidoFormProps) {
  const [clienteId, setClienteId] = useState("")
  const [itens, setItens] = useState<ItemLocal[]>([])
  const [statusPagamento, setStatusPagamento] = useState("PENDENTE")
  const [metodoPagamento, setMetodoPagamento] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const { data: clientes = [] } = useClientes()

  const total = itens.reduce((acc, i) => acc + i.quantidade * i.valorUnit, 0)
  const pesoTotal = itens.reduce((acc, i) => acc + i.quantidade * i.pesoUnit, 0)

  function handleAddProduto(p: ProdutoDTO) {
    setItens((prev) => {
      const existing = prev.find((i) => i.produtoId === p.id)
      if (existing) return prev.map((i) => i.produtoId === p.id ? { ...i, quantidade: i.quantidade + 1 } : i)
      return [...prev, { produtoId: p.id, nome: p.nome, pesoUnit: p.peso, valorUnit: p.valorUnitario, quantidade: 1 }]
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
    onSubmit({
      clienteId,
      itens: itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade })),
      statusPagamento,
      metodoPagamento: metodoPagamento || undefined,
      observacoes: observacoes || undefined,
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
            <span>Total: {formatCurrency(total)}</span>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
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
        <div className="space-y-1">
          <Label>Método de Pagamento{statusPagamento === "PAGO" && " *"}</Label>
          <Select value={metodoPagamento} onValueChange={setMetodoPagamento}>
            <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
            <SelectContent>
              {METODOS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label>Observações</Label>
        <Input value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="bg-green-800 hover:bg-green-700" disabled={loading || !clienteId || itens.length === 0}>
          {loading ? "Salvando..." : "Criar Pedido"}
        </Button>
      </div>
    </form>
  )
}
