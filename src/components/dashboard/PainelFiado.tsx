import { AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface ClienteFiado { id: string; nome: string; cidade: string; totalFiado: number }

export function PainelFiado({ clientes, totalFiado }: { clientes: ClienteFiado[]; totalFiado: number }) {
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
        <div className="space-y-2">
          {clientes.map((c) => (
            <div key={c.id} className="flex justify-between text-sm border-b pb-2 last:border-0 last:pb-0">
              <div><p className="font-medium">{c.nome}</p><p className="text-xs text-gray-400">{c.cidade}</p></div>
              <span className="text-orange-600 font-semibold">{formatCurrency(c.totalFiado)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
