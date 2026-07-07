"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { ProdutoForm } from "@/components/produtos/ProdutoForm"
import { useProduto, useProdutoHistorico, useProdutoHistoricoCusto, useProdutoStats, useUpdateProduto } from "@/hooks/use-produtos"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded border px-3 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  )
}

export default function ProdutoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: produto, isLoading } = useProduto(id)
  const updateMutation = useUpdateProduto()
  const [editOpen, setEditOpen] = useState(false)
  const [periodo, setPeriodo] = useState("mes")
  const { data: historico, isLoading: loadingHistorico } = useProdutoHistorico(id)
  const { data: historicoCusto, isLoading: loadingHistoricoCusto } = useProdutoHistoricoCusto(id)
  const { data: stats, isLoading: loadingStats } = useProdutoStats(id, periodo)

  if (isLoading) return <p className="text-sm text-gray-500">Carregando...</p>
  if (!produto) return <p className="text-sm text-red-500">Produto não encontrado.</p>

  return (
    <div>
      <PageHeader
        title={produto.nome}
        description={`${produto.peso} kg/saco • ${formatCurrency(produto.valorUnitario)}/saco${produto.custo ? ` • Custo: ${formatCurrency(produto.custo)}` : ""}`}
        action={
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            Editar
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Estatísticas de Vendas */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Estatísticas de Vendas</h2>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="semana">Últimos 7 dias</SelectItem>
                <SelectItem value="mes">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {loadingStats ? (
            <p className="text-xs text-gray-400">Carregando...</p>
          ) : stats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Pedidos" value={String(stats.totalPedidos)} />
              <StatCard label="Total kg" value={`${stats.kgTotal.toFixed(1)} kg`} />
              <StatCard label="kg Entrega" value={`${stats.kgEntrega.toFixed(1)} kg`} />
              <StatCard label="kg Balcão" value={`${stats.kgBalcao.toFixed(1)} kg`} />
            </div>
          ) : null}
        </div>

        {/* Histórico de Custo */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Histórico de Custo</h2>
          {loadingHistoricoCusto ? (
            <p className="text-xs text-gray-400">Carregando...</p>
          ) : !historicoCusto || historicoCusto.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma alteração de custo registrada.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b">
                  <th className="text-left pb-2">Data / Hora</th>
                  <th className="text-right pb-2">Custo Anterior</th>
                  <th className="text-right pb-2">Custo Novo</th>
                </tr>
              </thead>
              <tbody>
                {historicoCusto.map((h) => (
                  <tr key={h.id} className="border-b border-gray-100">
                    <td className="py-2 text-gray-600">{formatDateTime(h.criadoEm)}</td>
                    <td className="py-2 text-right text-red-600 line-through">{h.custoAnterior != null ? formatCurrency(h.custoAnterior) : "—"}</td>
                    <td className="py-2 text-right text-blue-700 font-medium">{h.custoNovo != null ? formatCurrency(h.custoNovo) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Histórico de Preços */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Histórico de Preços</h2>
          {loadingHistorico ? (
            <p className="text-xs text-gray-400">Carregando...</p>
          ) : !historico || historico.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma alteração de preço registrada.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b">
                  <th className="text-left pb-2">Data / Hora</th>
                  <th className="text-right pb-2">Preço Anterior</th>
                  <th className="text-right pb-2">Preço Novo</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((h) => (
                  <tr key={h.id} className="border-b border-gray-100">
                    <td className="py-2 text-gray-600">{formatDateTime(h.criadoEm)}</td>
                    <td className="py-2 text-right text-red-600 line-through">{formatCurrency(h.precoAnterior)}</td>
                    <td className="py-2 text-right text-blue-700 font-medium">{formatCurrency(h.precoNovo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          <ProdutoForm
            initial={produto}
            onSubmit={(data) => updateMutation.mutate({ id, ...data }, { onSuccess: () => setEditOpen(false) })}
            onCancel={() => setEditOpen(false)}
            loading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
