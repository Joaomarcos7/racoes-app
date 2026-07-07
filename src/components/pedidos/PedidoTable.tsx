"use client"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { PedidoDTO } from "@/types/api"
import { Plus, Printer, Trash2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog"

const entregaConfig: Record<string, { label: string; className: string }> = {
  AGUARDANDO: { label: "Aguardando", className: "bg-gray-100 text-gray-700" },
  EM_ROTA: { label: "Em Rota", className: "bg-blue-100 text-blue-700" },
  ENTREGUE: { label: "Entregue", className: "bg-blue-100 text-blue-700" },
}

const pagConfig: Record<string, { label: string; className: string }> = {
  PENDENTE: { label: "Pendente", className: "bg-yellow-100 text-yellow-700" },
  PAGO: { label: "Pago", className: "bg-blue-100 text-blue-700" },
  FIADO: { label: "Fiado", className: "bg-orange-100 text-orange-700" },
}

interface PedidoTableProps { pedidos: PedidoDTO[]; onDelete: (id: string) => void }

export function PedidoTable({ pedidos, onDelete }: PedidoTableProps) {
  if (pedidos.length === 0) return <p className="text-sm text-gray-500 py-4">Nenhum pedido encontrado.</p>
  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
      <table className="text-sm" style={{ minWidth: "720px" }}>
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Data</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tipo</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Cliente</th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Cidade</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Total</th>
            <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Entrega</th>
            <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Pgto</th>
            <th className="px-3 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p, i) => {
            const total = p.itens.reduce((acc, item) => acc + item.quantidade * item.valorUnit, 0)
            return (
              <tr key={p.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-3 py-3 whitespace-nowrap">{formatDate(p.dataPedido)}</td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <Badge className="bg-blue-100 text-blue-700">
                    {p.tipoPedido === "ENTREGA" ? "Entrega" : "Balcão"}
                  </Badge>
                </td>
                <td className="px-3 py-3 font-medium whitespace-nowrap">{p.cliente?.nome ?? <span className="text-gray-400 italic">—</span>}</td>
                <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{p.cliente?.cidade ?? "—"}</td>
                <td className="px-3 py-3 text-right whitespace-nowrap">{formatCurrency(total)}</td>
                <td className="px-3 py-3 text-center whitespace-nowrap">
                  {p.statusEntrega
                    ? <Badge className={entregaConfig[p.statusEntrega].className}>{entregaConfig[p.statusEntrega].label}</Badge>
                    : <span className="text-gray-400 text-xs">—</span>}
                </td>
                <td className="px-3 py-3 text-center">
                  <Badge className={pagConfig[p.statusPagamento].className}>{pagConfig[p.statusPagamento].label}</Badge>
                </td>
                <td className="px-3 py-3 text-right whitespace-nowrap">
                  <div className="flex gap-1 justify-end">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Imprimir cupom"
                            onClick={() => window.open(`/pedidos/${p.id}/print`, "_blank")}
                          >
                            <Printer size={14} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Imprimir cupom</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
                    <ConfirmDeleteDialog onConfirm={() => onDelete(p.id)}>
                      <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700">
                        <Trash2 size={14} />
                      </Button>
                    </ConfirmDeleteDialog>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
    </div>
  )
}
