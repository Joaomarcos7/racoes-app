"use client"
import { useState } from "react"
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const PAGE_SIZE = 5

interface ClienteFiado { id: string; nome: string; cidade: string; totalFiado: number }

export function PainelFiado({ clientes, totalFiado }: { clientes: ClienteFiado[]; totalFiado: number }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(clientes.length / PAGE_SIZE)
  const paginated = clientes.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm text-gray-700">Fiado em Aberto</h3>
            <p className="text-xs text-gray-400">{clientes.length} clientes</p>
          </div>
        </div>
        <span className="text-sm font-bold text-orange-600">{formatCurrency(totalFiado)}</span>
      </div>
      {clientes.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">Nenhum fiado em aberto</p>
      ) : (
        <>
          <div className="space-y-2">
            {paginated.map((c) => (
              <div key={c.id} className="flex justify-between text-sm border-b pb-2 last:border-0 last:pb-0">
                <div><p className="font-medium">{c.nome}</p><p className="text-xs text-gray-400">{c.cidade}</p></div>
                <span className="text-orange-600 font-semibold">{formatCurrency(c.totalFiado)}</span>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3 pt-2 border-t">
              <button
                aria-label="Página anterior"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs text-gray-400">{page + 1} / {totalPages}</span>
              <button
                aria-label="Próxima página"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
