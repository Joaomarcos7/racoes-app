"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ProdutoSearchInput } from "./ProdutoSearchInput"
import { ClienteSearchInput } from "./ClienteSearchInput"
import { ItemPedidoRow, type ItemLocal } from "./ItemPedidoRow"
import { formatCurrency } from "@/lib/utils"
import { formatMoneyInput, parseMaskedMoney } from "@/lib/money-mask"
import type { ClienteDTO, PedidoDTO, ProdutoDTO } from "@/types/api"

interface EditarPedidoFormProps {
  pedido: PedidoDTO
  onSubmit: (data: {
    clienteId?: string
    itens: { produtoId: string; quantidade: number; valorUnit: number; pesoUnit: number }[]
    desconto: number
    observacoes?: string
  }) => void
  onCancel: () => void
  loading?: boolean
}

export function EditarPedidoForm({ pedido, onSubmit, onCancel, loading }: EditarPedidoFormProps) {
  const isEntrega = pedido.tipoPedido === "ENTREGA"
  const tipoProduto = isEntrega ? "ATACADO" : "CONSUMIDOR_FINAL"

  const [selectedCliente, setSelectedCliente] = useState<ClienteDTO | null>(pedido.cliente ?? null)
  const [itens, setItens] = useState<ItemLocal[]>(
    pedido.itens.map((i) => ({
      produtoId: i.produtoId,
      nome: i.produto.nome,
      tipo: i.produto.tipo,
      pesoUnit: i.pesoUnit,
      valorUnit: i.valorUnit,
      quantidade: i.quantidade,
      pesoVariavel: false,
    }))
  )
  const [descontoMasked, setDescontoMasked] = useState(
    pedido.desconto > 0 ? pedido.desconto.toFixed(2).replace(".", ",") : "0,00"
  )
  const [observacoes, setObservacoes] = useState(pedido.observacoes ?? "")

  const subtotal = itens.reduce((acc, i) => acc + i.quantidade * (i.valorUnitOverride ?? i.valorUnit), 0)
  const desconto = parseMaskedMoney(descontoMasked)
  const total = Math.max(0, subtotal - desconto)
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

  function handleChangeValorUnit(produtoId: string, valor: number | undefined) {
    setItens((prev) => prev.map((i) => i.produtoId === produtoId ? { ...i, valorUnitOverride: valor } : i))
  }

  function handleRemove(produtoId: string) {
    setItens((prev) => prev.filter((i) => i.produtoId !== produtoId))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      clienteId: isEntrega ? selectedCliente?.id : undefined,
      itens: itens.map((i) => ({
        produtoId: i.produtoId,
        quantidade: i.quantidade,
        valorUnit: i.valorUnitOverride ?? i.valorUnit,
        pesoUnit: i.pesoUnit,
      })),
      desconto: parseMaskedMoney(descontoMasked),
      observacoes: observacoes || undefined,
    })
  }

  const canSubmit = itens.length > 0 && !(isEntrega && !selectedCliente)

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {isEntrega && (
        <div className="space-y-1">
          <Label>Cliente *</Label>
          <ClienteSearchInput
            selected={selectedCliente}
            onSelect={setSelectedCliente}
            onClear={() => setSelectedCliente(null)}
            placeholder="Buscar cliente cadastrado..."
          />
        </div>
      )}
      <div className="space-y-2">
        <Label>Adicionar Produto</Label>
        <ProdutoSearchInput onSelect={handleAddProduto} tipoProduto={tipoProduto} />
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
                <ItemPedidoRow
                  key={item.produtoId}
                  item={item}
                  onChange={handleChangeQtd}
                  onChangeValorUnit={handleChangeValorUnit}
                  onRemove={handleRemove}
                />
              ))}
            </tbody>
          </table>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Peso total: {pesoTotal.toFixed(1)} kg</span>
              <span className="text-gray-600">Subtotal: {formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-gray-500 whitespace-nowrap">Desconto (R$)</Label>
              <Input
                className="h-7 text-sm w-32 text-right"
                inputMode="numeric"
                value={descontoMasked}
                onChange={(e) => setDescontoMasked(formatMoneyInput(e.target.value))}
              />
              <span className="text-sm font-semibold ml-auto">Total: {formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-1">
        <Label>Observações</Label>
        <Input value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="bg-blue-700 hover:bg-blue-600" disabled={loading || !canSubmit}>
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  )
}
