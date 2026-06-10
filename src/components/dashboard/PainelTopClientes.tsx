"use client"
import { formatCurrency } from "@/lib/utils"
import type { TopClienteStat } from "@/lib/dashboard-utils"

interface PainelTopClientesProps {
  clientes: TopClienteStat[]
}

export function PainelTopClientes({ clientes }: PainelTopClientesProps) {
  if (clientes.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Top Clientes</h3>
        <p className="text-sm text-gray-400">Nenhum cliente com pedidos no período.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold text-gray-700 mb-3">Top Clientes</h3>
      <div className="space-y-2">
        {clientes.map((c, i) => (
          <div key={c.id} className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{c.nome}</p>
              <p className="text-xs text-gray-400">{c.cidade}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-blue-700">{formatCurrency(c.total)}</p>
              <p className="text-xs text-gray-400">{c.count} pedidos</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
