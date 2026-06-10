"use client"
import { useState } from "react"
import { useProdutoHistorico, useProdutoStats } from "@/hooks/use-produtos"
import { formatCurrency } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ProdutoDTO } from "@/types/api"

interface Props {
  produto: ProdutoDTO
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export function ProdutoDetalhesPanel({ produto }: Props) {
  const [periodo, setPeriodo] = useState("mes")
  const { data: historico, isLoading: loadingHistorico } = useProdutoHistorico(produto.id)
  const { data: stats, isLoading: loadingStats } = useProdutoStats(produto.id, periodo)

  return (
    <div className="px-4 py-4 bg-gray-50 border-t space-y-5">
      {/* Stats */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Estatísticas de Vendas</span>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
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

      {/* Histórico de preços */}
      <div>
        <span className="text-sm font-semibold text-gray-700">Histórico de Preços</span>
        {loadingHistorico ? (
          <p className="text-xs text-gray-400 mt-1">Carregando...</p>
        ) : !historico || historico.length === 0 ? (
          <p className="text-xs text-gray-400 mt-1">Nenhuma alteração de preço registrada.</p>
        ) : (
          <table className="w-full text-xs mt-2">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="text-left pb-1">Data / Hora</th>
                <th className="text-right pb-1">Preço Anterior</th>
                <th className="text-right pb-1">Preço Novo</th>
              </tr>
            </thead>
            <tbody>
              {historico.map((h) => (
                <tr key={h.id} className="border-b border-gray-100">
                  <td className="py-1.5 text-gray-600">{formatDateTime(h.criadoEm)}</td>
                  <td className="py-1.5 text-right text-red-600 line-through">{formatCurrency(h.precoAnterior)}</td>
                  <td className="py-1.5 text-right text-blue-700 font-medium">{formatCurrency(h.precoNovo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded border px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  )
}
