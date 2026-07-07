"use client"
import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/layout/PageHeader"
import { useConsolidacoes, useCreateConsolidacao, useDeleteConsolidacao } from "@/hooks/use-consolidacao"
import { useVeiculos } from "@/hooks/use-veiculos"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/Pagination"
import { formatDate } from "@/lib/utils"
import { Plus, Trash2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog"

type Rota = { id: string; data: string; veiculo: { placa: string; modelo: string }; numeroPedidos: number; status: string }

export default function ConsolidacaoPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(15)
  const { data: result, isLoading } = useConsolidacoes(page, limit)
  const { data: veiculosResult } = useVeiculos(1, 100)
  const veiculos = veiculosResult?.data ?? []
  const createMutation = useCreateConsolidacao()
  const deleteMutation = useDeleteConsolidacao()
  const [open, setOpen] = useState(false)
  const [veiculoId, setVeiculoId] = useState("")
  const rotas = (result?.data ?? []) as Rota[]

  return (
    <div>
      <PageHeader title="Consolidação de Carga" action={
        <Button className="bg-blue-700 hover:bg-blue-600" onClick={() => setOpen(true)}>+ Nova Rota</Button>
      } />
      {isLoading ? <p className="text-sm text-gray-500">Carregando...</p> : rotas.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">Nenhuma rota criada ainda.</p>
      ) : (
        <>
          <div className="rounded-md border overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Data</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Veículo</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Pedidos</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rotas.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-3 py-3 whitespace-nowrap">{formatDate(r.data)}</td>
                    <td className="px-3 py-3 font-medium">{r.veiculo.placa} — {r.veiculo.modelo}</td>
                    <td className="px-3 py-3 text-center hidden sm:table-cell">{r.numeroPedidos}</td>
                    <td className="px-3 py-3 text-center">
                      <Badge className={r.status === "FECHADA" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}>
                        {r.status === "FECHADA" ? "Fechada" : "Aberta"}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" asChild>
                                <Link href={`/consolidacao/${r.id}`}><Plus size={14} /></Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Gerenciar rota</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <ConfirmDeleteDialog onConfirm={() => deleteMutation.mutate(r.id)}>
                          <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700">
                            <Trash2 size={14} />
                          </Button>
                        </ConfirmDeleteDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result && (
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              total={result.total}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          )}
        </>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Rota de Consolidação</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Select value={veiculoId} onValueChange={setVeiculoId}>
              <SelectTrigger><SelectValue placeholder="Selecione o veículo" /></SelectTrigger>
              <SelectContent>
                {veiculos.map((v) => <SelectItem key={v.id} value={v.id}>{v.placa} — {v.modelo} ({v.pesoMaximo}kg)</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button className="bg-blue-700 hover:bg-blue-600" disabled={!veiculoId || createMutation.isPending}
                onClick={() => createMutation.mutate(veiculoId, { onSuccess: (r: { id: string }) => { setOpen(false); window.location.href = `/consolidacao/${r.id}` } })}>
                Criar Rota
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
