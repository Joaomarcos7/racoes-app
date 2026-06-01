"use client"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { PedidoDTO } from "@/types/api"
import { Eye } from "lucide-react"

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

interface PedidoTableProps { pedidos: PedidoDTO[] }

export function PedidoTable({ pedidos }: PedidoTableProps) {
  if (pedidos.length === 0) return <p className="text-sm text-gray-500 py-4">Nenhum pedido encontrado.</p>
  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#0C5E3A] text-white">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Data</th>
            <th className="px-4 py-3 text-left font-medium">Cliente</th>
            <th className="px-4 py-3 text-left font-medium">Cidade</th>
            <th className="px-4 py-3 text-right font-medium">Total</th>
            <th className="px-4 py-3 text-center font-medium">Entrega</th>
            <th className="px-4 py-3 text-center font-medium">Pagamento</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p, i) => {
            const total = p.itens.reduce((acc, item) => acc + item.quantidade * item.valorUnit, 0)
            return (
              <tr key={p.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-3">{formatDate(p.dataPedido)}</td>
                <td className="px-4 py-3 font-medium">{p.cliente.nome}</td>
                <td className="px-4 py-3 text-gray-600">{p.cliente.cidade}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(total)}</td>
                <td className="px-4 py-3 text-center">
                  <Badge className={entregaConfig[p.statusEntrega].className}>{entregaConfig[p.statusEntrega].label}</Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge className={pagConfig[p.statusPagamento].className}>{pagConfig[p.statusPagamento].label}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="icon" variant="ghost" asChild>
                    <Link href={`/pedidos/${p.id}`}><Eye size={14} /></Link>
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
