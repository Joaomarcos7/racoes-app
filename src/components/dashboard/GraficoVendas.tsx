"use client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface GraficoVendasProps {
  data: Array<{ label: string; valor: number }>
}

export function GraficoVendas({ data }: GraficoVendasProps) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold text-sm text-gray-700 mb-3">Vendas por período</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `R$${(v/1000).toFixed(0)}k`} />
          <Tooltip formatter={(v) => formatCurrency(Number(v))} />
          <Bar dataKey="valor" fill="#0C5E3A" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
