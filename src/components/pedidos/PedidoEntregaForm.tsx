"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ProdutoSearchInput } from "./ProdutoSearchInput"
import { ClienteSearchInput } from "./ClienteSearchInput"
import { ItemPedidoRow, type ItemLocal } from "./ItemPedidoRow"
import { PagamentoMultiploInput, type PagamentoItem } from "./PagamentoMultiploInput"
import { formatCurrency } from "@/lib/utils"
import { formatMoneyInput, parseMaskedMoney } from "@/lib/money-mask"
import { validarAdiantadoFiado } from "@/lib/pedido-utils"
import type { ClienteDTO, ProdutoDTO, TipoFiado } from "@/types/api"

interface PedidoEntregaFormProps {
  onSubmit: (data: {
    tipoPedido: "ENTREGA"
    clienteId: string
    itens: { produtoId: string; quantidade: number }[]
    statusPagamento: string
    metodoPagamento?: string
    pagamentos?: { metodo: string; valor: number }[]
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

export function PedidoEntregaForm({ onSubmit, onCancel, loading }: PedidoEntregaFormProps) {
  const [selectedCliente, setSelectedCliente] = useState<ClienteDTO | null>(null)
  const [itens, setItens] = useState<ItemLocal[]>([])
  const [statusPagamento, setStatusPagamento] = useState("PENDENTE")
  const [metodoPagamento, setMetodoPagamento] = useState("")
  const [pagamentosMultiplos, setPagamentosMultiplos] = useState<PagamentoItem[]>([])
  const [observacoes, setObservacoes] = useState("")
  const [dataVencimentoFiado, setDataVencimentoFiado] = useState("")
  const [tipoFiado, setTipoFiado] = useState<TipoFiado>("INTEGRAL")
  const [valorAdiantadoMasked, setValorAdiantadoMasked] = useState("0,00")
  const [adiantadoError, setAdiantadoError] = useState<string | null>(null)
  const [descontoMasked, setDescontoMasked] = useState("0,00")

  const total = itens.reduce((acc, i) => acc + i.quantidade * (i.valorUnitOverride ?? i.valorUnit), 0)
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
    if (!selectedCliente) return
    if (statusPagamento === "FIADO" && tipoFiado === "PARCIAL") {
      const totalFinal = Math.max(0, total - parseMaskedMoney(descontoMasked))
      const err = validarAdiantadoFiado(parseMaskedMoney(valorAdiantadoMasked), totalFinal)
      if (err) { setAdiantadoError(err); return }
    }
    setAdiantadoError(null)
    onSubmit({
      tipoPedido: "ENTREGA",
      clienteId: selectedCliente.id,
      itens: itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade, valorUnitOverride: i.valorUnitOverride })),
      statusPagamento,
      metodoPagamento: statusPagamento === "PAGO" && pagamentosMultiplos.length === 0 ? (metodoPagamento || undefined) : undefined,
      pagamentos: statusPagamento === "PAGO" && pagamentosMultiplos.length > 0 ? pagamentosMultiplos.map((p) => ({ metodo: p.metodo, valor: p.valor })) : undefined,
      observacoes: observacoes || undefined,
      dataVencimentoFiado: statusPagamento === "FIADO" && dataVencimentoFiado ? dataVencimentoFiado : undefined,
      tipoFiado: statusPagamento === "FIADO" ? tipoFiado : undefined,
      valorAdiantadoFiado: statusPagamento === "FIADO" && tipoFiado === "PARCIAL" ? parseMaskedMoney(valorAdiantadoMasked) : undefined,
      desconto: parseMaskedMoney(descontoMasked) || undefined,
    })
  }

  const canSubmit = !!selectedCliente && itens.length > 0 && !(statusPagamento === "FIADO" && !dataVencimentoFiado)

  return (
    <form onSubmit={handleSubmit} aria-label="Pedido Entrega" className="space-y-5">
      <div className="space-y-1">
        <Label>Cliente *</Label>
        <ClienteSearchInput
          selected={selectedCliente}
          onSelect={setSelectedCliente}
          onClear={() => setSelectedCliente(null)}
          placeholder="Buscar cliente cadastrado..."
        />
        {!selectedCliente && (
          <p className="text-xs text-amber-700 flex items-center gap-1 mt-1">
            Cliente obrigatório para pedido de entrega.{" "}
            <Link href="/clientes/novo" className="underline font-medium" aria-label="Cadastrar cliente">
              Cadastrar cliente
            </Link>
          </p>
        )}
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
                <ItemPedidoRow key={item.produtoId} item={item} onChange={handleChangeQtd} onChangeValorUnit={handleChangeValorUnit} onRemove={handleRemove} />
              ))}
            </tbody>
          </table>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-sm">
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
        </div>
      )}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="status-pagamento-entrega">Status Pagamento</Label>
            <Select value={statusPagamento} onValueChange={(v) => { setStatusPagamento(v); setPagamentosMultiplos([]) }}>
              <SelectTrigger id="status-pagamento-entrega" aria-label="Status Pagamento"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="PAGO">Pago</SelectItem>
                <SelectItem value="FIADO">Fiado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {statusPagamento === "PAGO" && pagamentosMultiplos.length === 0 && (
            <div className="space-y-1">
              <Label>Método de Pagamento *</Label>
              <Select value={metodoPagamento} onValueChange={setMetodoPagamento}>
                <SelectTrigger aria-label="Método de Pagamento"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  {METODOS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {statusPagamento === "PENDENTE" && (
            <div className="space-y-1">
              <Label>Método de Pagamento</Label>
              <Select value={metodoPagamento} onValueChange={setMetodoPagamento}>
                <SelectTrigger aria-label="Método de Pagamento"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  {METODOS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {statusPagamento === "PAGO" && (
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Métodos de pagamento</Label>
            <PagamentoMultiploInput
              pagamentos={pagamentosMultiplos}
              onChange={setPagamentosMultiplos}
              total={Math.max(0, total - parseMaskedMoney(descontoMasked))}
            />
          </div>
        )}
      </div>
      {statusPagamento === "FIADO" && (
        <div className="space-y-3 rounded-md border border-amber-200 bg-amber-50 p-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="tipo-fiado-entrega">Tipo de Fiado *</Label>
              <Select value={tipoFiado} onValueChange={(v) => setTipoFiado(v as TipoFiado)}>
                <SelectTrigger id="tipo-fiado-entrega" aria-label="Tipo de Fiado"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTEGRAL">Integral — tudo em aberto</SelectItem>
                  <SelectItem value="PARCIAL">Parcial — pagou parte agora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="data-vencimento-entrega">Data máxima de pagamento *</Label>
              <Input id="data-vencimento-entrega" type="date" value={dataVencimentoFiado} onChange={(e) => setDataVencimentoFiado(e.target.value)} required />
            </div>
          </div>
          {tipoFiado === "PARCIAL" && (
            <div className="space-y-1">
              <Label htmlFor="valor-adiantado-entrega">Valor pago adiantado (R$) *</Label>
              <Input
                id="valor-adiantado-entrega"
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-600"
                  disabled={loading || !canSubmit}
                >
                  {loading ? "Salvando..." : "Criar Pedido"}
                </Button>
              </span>
            </TooltipTrigger>
            {!selectedCliente && (
              <TooltipContent>
                <p>Selecione um cliente cadastrado para continuar</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </form>
  )
}
