"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { usePedido, useUpdatePedido } from "@/hooks/use-pedidos"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, formatDate } from "@/lib/utils"

const entregaConfig: Record<string, { label: string; className: string }> = {
  AGUARDANDO: { label: "Aguardando", className: "bg-gray-100 text-gray-700" },
  EM_ROTA: { label: "Em Rota", className: "bg-blue-100 text-blue-700" },
  ENTREGUE: { label: "Entregue", className: "bg-green-100 text-green-700" },
}

const pagConfig: Record<string, { label: string; className: string }> = {
  PENDENTE: { label: "Pendente", className: "bg-yellow-100 text-yellow-700" },
  PAGO: { label: "Pago", className: "bg-green-100 text-green-700" },
  FIADO: { label: "Fiado", className: "bg-orange-100 text-orange-700" },
}

export default function PedidoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: pedido, isLoading } = usePedido(id)
  const updateMutation = useUpdatePedido()
  const [statusEntrega, setStatusEntrega] = useState("")
  const [statusPagamento, setStatusPagamento] = useState("")
  const [metodoPagamento, setMetodoPagamento] = useState("")

  if (isLoading) return <p className="text-sm text-gray-500">Carregando...</p>
  if (!pedido) return <p className="text-sm text-red-500">Pedido não encontrado.</p>

  const total = pedido.itens.reduce((acc, item) => acc + item.quantidade * item.valorUnit, 0)
  const pesoTotal = pedido.itens.reduce((acc, item) => acc + item.quantidade * item.pesoUnit, 0)

  return (
    <div className="max-w-2xl space-y-4">
      <PageHeader
        title={`Pedido — ${pedido.cliente.nome}`}
        description={`${formatDate(pedido.dataPedido)} · ${pedido.cliente.cidade}`}
      />
      <div className="bg-white rounded-lg border p-6">
        <div className="flex gap-3 mb-4">
          <Badge className={entregaConfig[pedido.statusEntrega].className}>{entregaConfig[pedido.statusEntrega].label}</Badge>
          <Badge className={pagConfig[pedido.statusPagamento].className}>{pagConfig[pedido.statusPagamento].label}</Badge>
          {pedido.metodoPagamento && <Badge variant="outline">{pedido.metodoPagamento}</Badge>}
        </div>
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="text-gray-500 text-xs border-b">
              <th className="text-left pb-1">Produto</th>
              <th className="text-right pb-1">Peso/un</th>
              <th className="text-right pb-1">Qtd</th>
              <th className="text-right pb-1">Valor/un</th>
              <th className="text-right pb-1">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.itens.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{item.produto.nome}</td>
                <td className="py-2 text-right text-gray-600">{item.pesoUnit}kg</td>
                <td className="py-2 text-right">{item.quantidade}</td>
                <td className="py-2 text-right">{formatCurrency(item.valorUnit)}</td>
                <td className="py-2 text-right font-medium">{formatCurrency(item.quantidade * item.valorUnit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between text-sm font-medium pt-2 border-t">
          <span className="text-gray-600">Peso total: {pesoTotal.toFixed(1)} kg</span>
          <span className="text-lg">Total: {formatCurrency(total)}</span>
        </div>
        {pedido.observacoes && <p className="text-sm text-gray-500 mt-3">Obs: {pedido.observacoes}</p>}
      </div>
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-3 text-gray-700">Atualizar Status</h3>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Entrega</label>
            <Select value={statusEntrega} onValueChange={setStatusEntrega}>
              <SelectTrigger><SelectValue placeholder={entregaConfig[pedido.statusEntrega].label} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AGUARDANDO">Aguardando</SelectItem>
                <SelectItem value="EM_ROTA">Em Rota</SelectItem>
                <SelectItem value="ENTREGUE">Entregue</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                {["DINHEIRO","PIX","BOLETO","CHEQUE","FIADO"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          className="bg-green-800 hover:bg-green-700"
          disabled={updateMutation.isPending || (!statusEntrega && !statusPagamento && !metodoPagamento)}
          onClick={() => updateMutation.mutate({ id, statusEntrega: statusEntrega || undefined, statusPagamento: statusPagamento || undefined, metodoPagamento: metodoPagamento || undefined })}
        >
          {updateMutation.isPending ? "Salvando..." : "Salvar Status"}
        </Button>
      </div>
    </div>
  )
}
