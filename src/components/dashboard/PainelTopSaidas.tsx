import { formatCurrency } from "@/lib/utils"
import { labelTipoSaida } from "@/lib/saida-utils"

interface Props {
  saidas: { tipo: string; total: number }[]
  totalSaidas: number
}

export function PainelTopSaidas({ saidas, totalSaidas }: Props) {
  return (
    <div className="bg-white rounded-lg border p-5">
      <h3 className="font-semibold text-gray-700 mb-1">Maiores Custos por Tipo</h3>
      <p className="text-xs text-gray-400 mb-4">Total: {formatCurrency(totalSaidas)}</p>
      {saidas.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Nenhuma saída no período</p>
      ) : (
        <div className="space-y-3">
          {saidas.map((s, idx) => {
            const pct = totalSaidas > 0 ? (s.total / totalSaidas) * 100 : 0
            return (
              <div key={s.tipo}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}</span>
                    <span className="font-medium text-gray-700">{labelTipoSaida(s.tipo)}</span>
                  </span>
                  <span className="font-semibold text-red-700">{formatCurrency(s.total)}</span>
                </div>
                <div className="bg-gray-100 rounded-full h-1.5">
                  <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
