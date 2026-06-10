"use client"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { PedidoDTO } from "@/types/api"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const statusEntregaLabel: Record<string, { label: string; color: string }> = {
  AGUARDANDO: { label: "Aguardando", color: "bg-gray-100 text-gray-700" },
  EM_ROTA: { label: "Em Rota", color: "bg-blue-100 text-blue-700" },
  ENTREGUE: { label: "Entregue", color: "bg-blue-100 text-blue-700" },
}

const statusPagLabel: Record<string, { label: string; color: string }> = {
  PENDENTE: { label: "Pendente", color: "bg-yellow-100 text-yellow-700" },
  PAGO: { label: "Pago", color: "bg-blue-100 text-blue-700" },
  FIADO: { label: "Fiado", color: "bg-orange-100 text-orange-700" },
}

interface ClienteHistoricoProps {
  pedidos: PedidoDTO[]
}

export function ClienteHistorico({ pedidos }: ClienteHistoricoProps) {
  if (pedidos.length === 0) {
    return <p className="text-sm text-gray-500 py-2">Nenhum pedido registrado.</p>
  }

  return (
    <div className="rounded-md border overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Data</th>
            <th className="px-4 py-3 text-right font-medium">Total</th>
            <th className="px-4 py-3 text-center font-medium">Entrega</th>
            <th className="px-4 py-3 text-center font-medium">Pagamento</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p, i) => {
            const total = p.itens.reduce(
              (acc, item) => acc + item.quantidade * item.valorUnit,
              0
            )
            const entrega = p.statusEntrega ? statusEntregaLabel[p.statusEntrega] : null
            const pag = statusPagLabel[p.statusPagamento]
            return (
              <tr key={p.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-3">{formatDate(p.dataPedido)}</td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(total)}</td>
                <td className="px-4 py-3 text-center">
                  {entrega ? <Badge className={entrega.color}>{entrega.label}</Badge> : <span className="text-gray-400 text-xs">—</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge className={pag.color}>{pag.label}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" asChild>
                          <Link href={`/pedidos/${p.id}`}><Plus size={14} /></Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ver detalhes</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
