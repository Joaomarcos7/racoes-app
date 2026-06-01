"use client"
import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/layout/PageHeader"
import { useConsolidacoes, useCreateConsolidacao } from "@/hooks/use-consolidacao"
import { useVeiculos } from "@/hooks/use-veiculos"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate } from "@/lib/utils"
import { Eye } from "lucide-react"

export default function ConsolidacaoPage() {
  const { data: rotas = [], isLoading } = useConsolidacoes()
  const { data: veiculos = [] } = useVeiculos()
  const createMutation = useCreateConsolidacao()
  const [open, setOpen] = useState(false)
  const [veiculoId, setVeiculoId] = useState("")

  return (
    <div>
      <PageHeader title="Consolidação de Carga" action={
        <Button className="bg-green-800 hover:bg-green-700" onClick={() => setOpen(true)}>+ Nova Rota</Button>
      } />
      {isLoading ? <p className="text-sm text-gray-500">Carregando...</p> : (rotas as unknown[]).length === 0 ? (
        <p className="text-sm text-gray-500 py-4">Nenhuma rota criada ainda.</p>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#0C5E3A] text-white">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Data</th>
                <th className="px-4 py-3 text-left font-medium">Veículo</th>
                <th className="px-4 py-3 text-center font-medium">Pedidos</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(rotas as { id: string; data: string; veiculo: { placa: string; modelo: string }; numeroPedidos: number; status: string }[]).map((r, i) => (
                <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3">{formatDate(r.data)}</td>
                  <td className="px-4 py-3 font-medium">{r.veiculo.placa} — {r.veiculo.modelo}</td>
                  <td className="px-4 py-3 text-center">{r.numeroPedidos}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={r.status === "FECHADA" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>
                      {r.status === "FECHADA" ? "Fechada" : "Aberta"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="icon" variant="ghost" asChild>
                      <Link href={`/consolidacao/${r.id}`}><Eye size={14} /></Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              <Button className="bg-green-800 hover:bg-green-700" disabled={!veiculoId || createMutation.isPending}
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
