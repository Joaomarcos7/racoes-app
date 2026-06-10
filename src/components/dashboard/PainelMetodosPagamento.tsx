"use client"
import { formatCurrency } from "@/lib/utils"
import type { MetodoPagamentoStat } from "@/lib/dashboard-utils"

interface PainelMetodosPagamentoProps {
  stats: MetodoPagamentoStat[]
}

const CORES: Record<string, string> = {
  PIX: "bg-blue-500",
  DINHEIRO: "bg-green-500",
  BOLETO: "bg-yellow-500",
  CHEQUE: "bg-purple-500",
  CARTAO_CREDITO: "bg-blue-600",
  CARTAO_DEBITO: "bg-cyan-500",
}

const LABELS: Record<string, string> = {
  DINHEIRO: "Dinheiro",
  PIX: "Pix",
  BOLETO: "Boleto",
  CHEQUE: "Cheque",
  CARTAO_CREDITO: "Cartão de Crédito",
  CARTAO_DEBITO: "Cartão de Débito",
}

export function PainelMetodosPagamento({ stats }: PainelMetodosPagamentoProps) {
  if (stats.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Métodos de Pagamento</h3>
        <p className="text-sm text-gray-400">Nenhum pagamento registrado no período.</p>
      </div>
    )
  }

  const maxCount = stats[0].count

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold text-gray-700 mb-3">Métodos de Pagamento</h3>
      <div className="space-y-3">
        {stats.map((s) => (
          <div key={s.metodo}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{LABELS[s.metodo] ?? s.metodo}</span>
              <span className="text-gray-500">{s.count} pedidos · {formatCurrency(s.total)}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${CORES[s.metodo] ?? "bg-gray-400"}`}
                style={{ width: `${(s.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
