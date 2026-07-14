"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { usePedido, useUpdatePedido } from "@/hooks/use-pedidos"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EditarPedidoForm } from "@/components/pedidos/EditarPedidoForm"
import { formatCurrency, formatDate } from "@/lib/utils"
import { TIPO_BADGE } from "@/lib/produto-utils"
import { Pencil, Printer, Truck } from "lucide-react"
import Link from "next/link"

const entregaConfig: Record<string, { label: string; className: string }> = {
  AGUARDANDO: { label: "Aguardando", className: "bg-gray-100 text-gray-700" },
  EM_ROTA: { label: "Em Rota", className: "bg-blue-100 text-blue-700" },
  ENTREGA_PARCIAL: { label: "Entrega Parcial", className: "bg-amber-100 text-amber-700" },
  ENTREGUE: { label: "Entregue", className: "bg-green-100 text-green-700" },
}

const METODO_LABELS: Record<string, string> = {
  DINHEIRO: "Dinheiro",
  PIX: "Pix",
  PIX_TERCEIROS: "Pix Terceiros",
  BOLETO: "Boleto",
  CHEQUE: "Cheque",
  CARTAO_CREDITO: "Cartão de Crédito",
  CARTAO_DEBITO: "Cartão de Débito",
}

const pagConfig: Record<string, { label: string; className: string }> = {
  PENDENTE: { label: "Pendente", className: "bg-yellow-100 text-yellow-700" },
  PAGO: { label: "Pago", className: "bg-blue-100 text-blue-700" },
  FIADO: { label: "Fiado", className: "bg-orange-100 text-orange-700" },
}

export default function PedidoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: pedido, isLoading } = usePedido(id)
  const updateMutation = useUpdatePedido()
  const [statusEntrega, setStatusEntrega] = useState("")
  const [statusPagamento, setStatusPagamento] = useState("")
  const [metodoPagamento, setMetodoPagamento] = useState("")
  const [editOpen, setEditOpen] = useState(false)

  if (isLoading) return <p className="text-sm text-gray-500">Carregando...</p>
  if (!pedido) return <p className="text-sm text-red-500">Pedido não encontrado.</p>

  const subtotal = pedido.itens.reduce((acc, item) => acc + item.quantidade * item.valorUnit, 0)
  const desconto = pedido.desconto ?? 0
  const total = Math.max(0, subtotal - desconto)
  const pesoTotal = pedido.itens.reduce((acc, item) => acc + item.quantidade * item.pesoUnit, 0)
  const isEntrega = pedido.tipoPedido === "ENTREGA"

  return (
    <>
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Pedido</DialogTitle>
        </DialogHeader>
        <EditarPedidoForm
          pedido={pedido}
          loading={updateMutation.isPending}
          onCancel={() => setEditOpen(false)}
          onSubmit={(data) => {
            updateMutation.mutate(
              { id, ...data },
              { onSuccess: () => setEditOpen(false) }
            )
          }}
        />
      </DialogContent>
    </Dialog>
    <div className="max-w-2xl space-y-4">
      <PageHeader
        title={pedido.cliente ? `Pedido — ${pedido.cliente.nome}` : "Venda Balcão"}
        description={`${formatDate(pedido.dataPedido)}${pedido.cliente ? ` · ${pedido.cliente.cidade}` : ""}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil size={14} className="mr-1.5" />
              Editar Pedido
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open(`/pedidos/${id}/print`, "_blank")}>
              <Printer size={14} className="mr-1.5" />
              Imprimir Cupom
            </Button>
          </div>
        }
      />
      <div className="bg-white rounded-lg border p-6">
        <div className="flex gap-3 mb-4 flex-wrap">
          <Badge className={pedido.tipoPedido === "ENTREGA" ? "bg-blue-100 text-blue-700" : "bg-blue-100 text-blue-700"}>
            {pedido.tipoPedido === "ENTREGA" ? "Entrega" : "Balcão"}
          </Badge>
          {pedido.statusEntrega && (
            <Badge className={entregaConfig[pedido.statusEntrega].className}>{entregaConfig[pedido.statusEntrega].label}</Badge>
          )}
          <Badge className={pagConfig[pedido.statusPagamento].className}>{pagConfig[pedido.statusPagamento].label}</Badge>
          {pedido.pagamentos && pedido.pagamentos.length > 0
            ? pedido.pagamentos.map((pag) => (
                <Badge key={pag.id} variant="outline">{METODO_LABELS[pag.metodo] ?? pag.metodo}</Badge>
              ))
            : pedido.metodoPagamento && <Badge variant="outline">{METODO_LABELS[pedido.metodoPagamento] ?? pedido.metodoPagamento}</Badge>
          }
        </div>
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="text-gray-500 text-xs border-b">
              <th className="text-left pb-1">Produto</th>
              <th className="text-right pb-1">Peso/un</th>
              <th className="text-right pb-1">Qtd</th>
              <th className="text-right pb-1">Em Falta</th>
              <th className="text-right pb-1">Valor/un</th>
              <th className="text-right pb-1">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.itens.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">
                  <span className="flex items-center gap-1.5">
                    {item.produto.nome}
                    {TIPO_BADGE[item.produto.tipo] && (
                      <span className={`text-[10px] px-1 py-0 rounded font-medium ${TIPO_BADGE[item.produto.tipo].className}`}>{TIPO_BADGE[item.produto.tipo].label}</span>
                    )}
                  </span>
                </td>
                <td className="py-2 text-right text-gray-600">{item.pesoUnit}kg</td>
                <td className="py-2 text-right">{item.quantidade}</td>
                <td className="py-2 text-right">
                  {(item.quantidadeFalta ?? 0) > 0 ? (
                    <span className="text-amber-700 font-medium">{item.quantidadeFalta} un</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="py-2 text-right">{formatCurrency(item.valorUnit)}</td>
                <td className="py-2 text-right font-medium">{formatCurrency(item.quantidade * item.valorUnit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pt-2 border-t space-y-1">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Peso total: {pesoTotal.toFixed(1)} kg</span>
            <span>Subtotal: {formatCurrency(subtotal)}</span>
          </div>
          {desconto > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-red-600 font-medium">Desconto</span>
              <span className="text-red-600 font-medium">− {formatCurrency(desconto)}</span>
            </div>
          )}
          <div className="flex justify-end">
            <span className="text-lg font-semibold">Total: {formatCurrency(total)}</span>
          </div>
        </div>
        {pedido.pagamentos && pedido.pagamentos.length > 0 && (
          <div className="mt-3 pt-3 border-t space-y-1">
            <p className="text-xs font-medium text-gray-500 mb-1">Pagamentos</p>
            {pedido.pagamentos.map((pag) => (
              <div key={pag.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{METODO_LABELS[pag.metodo] ?? pag.metodo}</span>
                <span className="font-medium">{formatCurrency(pag.valor)}</span>
              </div>
            ))}
          </div>
        )}
        {pedido.observacoes && <p className="text-sm text-gray-500 mt-3">Obs: {pedido.observacoes}</p>}
      </div>
      {pedido.statusPagamento === "FIADO" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 space-y-3">
          <h3 className="font-semibold text-amber-800">Fiado em Aberto</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <p className="text-xs text-amber-600 mb-0.5">Tipo</p>
              <p className="font-medium text-amber-900">
                {pedido.tipoFiado === "INTEGRAL" ? "Integral" : pedido.tipoFiado === "PARCIAL" ? "Parcial" : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-amber-600 mb-0.5">Vencimento</p>
              <p className="font-medium text-amber-900">
                {pedido.dataVencimentoFiado ? formatDate(pedido.dataVencimentoFiado) : "—"}
              </p>
            </div>
            {pedido.tipoFiado === "PARCIAL" && (
              <div>
                <p className="text-xs text-amber-600 mb-0.5">Valor adiantado</p>
                <p className="font-medium text-amber-900">
                  {pedido.valorAdiantadoFiado != null ? formatCurrency(pedido.valorAdiantadoFiado) : "—"}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-amber-600 mb-0.5">Em aberto</p>
              <p className="text-lg font-bold text-amber-900">
                {pedido.valorEmAbertoFiado != null ? formatCurrency(pedido.valorEmAbertoFiado) : "—"}
              </p>
            </div>
          </div>
        </div>
      )}
      {pedido.baixas && pedido.baixas.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold mb-3 text-gray-700">Baixas de Fiado</h3>
          <div className="divide-y">
            {pedido.baixas.map((b) => (
              <div key={b.id} className="py-2 flex justify-between items-center text-sm">
                <div>
                  <p className="text-gray-600">{METODO_LABELS[b.metodoPagamento] ?? b.metodoPagamento}</p>
                  <p className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <span className="font-semibold text-green-700">+ {formatCurrency(b.valor)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {pedido.historicoStatus && pedido.historicoStatus.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold mb-3 text-gray-700">Histórico de Status</h3>
          <ol className="relative border-l border-slate-200 space-y-4 ml-2">
            {pedido.historicoStatus.map((h) => (
              <li key={h.id} className="ml-4">
                <span className="absolute -left-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
                <div className="flex items-center gap-2 flex-wrap">
                  {h.statusAnterior ? (
                    <Badge className={entregaConfig[h.statusAnterior]?.className ?? "bg-gray-100 text-gray-700"}>
                      {entregaConfig[h.statusAnterior]?.label ?? h.statusAnterior}
                    </Badge>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                  <span className="text-xs text-gray-400">→</span>
                  <Badge className={entregaConfig[h.statusNovo]?.className ?? "bg-gray-100 text-gray-700"}>
                    {entregaConfig[h.statusNovo]?.label ?? h.statusNovo}
                  </Badge>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(h.criadoEm).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
      {pedido.consolidacoes && pedido.consolidacoes.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
            <Truck size={16} className="text-blue-600" />
            Rotas de Entrega
          </h3>
          <div className="space-y-3">
            {pedido.consolidacoes.map((ci, idx) => (
              <div key={ci.id} className="rounded-md border px-4 py-3 space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Rota {idx + 1}</span>
                    <Link href={`/consolidacao/${ci.rota.id}`} className="font-semibold text-blue-700 hover:underline text-sm">
                      {ci.rota.veiculo.placa}
                    </Link>
                    <span className="text-xs text-gray-500">{ci.rota.veiculo.modelo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={ci.rota.status === "FECHADA" ? "bg-slate-100 text-slate-600" : "bg-blue-100 text-blue-700"}>
                      {ci.rota.status === "FECHADA" ? "Fechada" : "Aberta"}
                    </Badge>
                    {ci.temFaltaRegistrada && (
                      <Badge className="bg-amber-100 text-amber-700">Falta registrada</Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400">{formatDate(ci.rota.data)}</p>
                {ci.temFaltaRegistrada && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-amber-700">Itens em falta nesta rota:</p>
                    {pedido.itens.filter(i => (i.quantidadeFalta ?? 0) > 0).map(i => (
                      <p key={i.id} className="text-xs text-amber-600 ml-2">
                        {i.produto.nome}: {i.quantidadeFalta} un ({(i.quantidadeFalta! * i.pesoUnit).toFixed(1)} kg)
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-3 text-gray-700">Atualizar Status</h3>
        <div className={`grid gap-3 mb-3 ${isEntrega ? "grid-cols-3" : "grid-cols-2"}`}>
          {isEntrega && (
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Entrega</label>
              <Select value={statusEntrega} onValueChange={setStatusEntrega}>
                <SelectTrigger><SelectValue placeholder={pedido.statusEntrega ? entregaConfig[pedido.statusEntrega].label : "—"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AGUARDANDO">Aguardando</SelectItem>
                  <SelectItem value="EM_ROTA">Em Rota</SelectItem>
                  <SelectItem value="ENTREGA_PARCIAL">Entrega Parcial</SelectItem>
                  <SelectItem value="ENTREGUE">Entregue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Pagamento</label>
            <Select value={statusPagamento} onValueChange={setStatusPagamento}>
              <SelectTrigger><SelectValue placeholder={pagConfig[pedido.statusPagamento].label} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="PAGO">Pago</SelectItem>
                <SelectItem value="FIADO">Fiado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Método</label>
            <Select value={metodoPagamento} onValueChange={setMetodoPagamento}>
              <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
              <SelectContent>
                {Object.entries(METODO_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          className="bg-blue-700 hover:bg-blue-600"
          disabled={updateMutation.isPending || (!statusEntrega && !statusPagamento && !metodoPagamento)}
          onClick={() => updateMutation.mutate({ id, statusEntrega: statusEntrega || undefined, statusPagamento: statusPagamento || undefined, metodoPagamento: metodoPagamento || undefined })}
        >
          {updateMutation.isPending ? "Salvando..." : "Salvar Status"}
        </Button>
      </div>
    </div>
    </>
  )
}
