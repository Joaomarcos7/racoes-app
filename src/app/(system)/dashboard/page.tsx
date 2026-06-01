"use client"
import { useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { GraficoVendas } from "@/components/dashboard/GraficoVendas"
import { PainelFiado } from "@/components/dashboard/PainelFiado"
import { ExportButton } from "@/components/dashboard/ExportButton"
import { useDashboard } from "@/hooks/use-dashboard"
import { cn, formatCurrency } from "@/lib/utils"

type Periodo = "hoje" | "semana" | "mes"

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<Periodo>("hoje")
  const { data, isLoading } = useDashboard(periodo)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        action={
          <div className="flex items-center gap-3">
            <div className="flex border rounded-md overflow-hidden">
              {(["hoje","semana","mes"] as Periodo[]).map((p) => (
                <button key={p} onClick={() => setPeriodo(p)}
                  className={cn("px-3 py-1.5 text-sm transition-colors", periodo === p ? "bg-green-800 text-white" : "bg-white text-gray-600 hover:bg-gray-50")}>
                  {p === "hoje" ? "Hoje" : p === "semana" ? "Semana" : "Mês"}
                </button>
              ))}
            </div>
            {data && <ExportButton data={data} periodo={periodo} />}
          </div>
        }
      />
      {isLoading || !data ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <KpiCard label="💰 Vendas" value={data.vendasTotal} isCurrency subtext={`${data.numeroPedidos} pedidos`} accentColor="#0C5E3A" />
            <KpiCard label="📦 Pedidos" value={data.numeroPedidos} subtext={`Ticket médio ${formatCurrency(data.ticketMedio)}`} accentColor="#1E6FBF" />
            <KpiCard label="⚠️ Fiado" value={data.totalFiado} isCurrency subtext={`${data.clientesComFiado} clientes`} accentColor="#E67E22" />
            <KpiCard label="👥 Clientes" value={data.totalClientes} subtext={data.novosClientes > 0 ? `+${data.novosClientes} novos` : undefined} accentColor="#7B1FA2" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2"><GraficoVendas data={data.grafico} /></div>
            <PainelFiado clientes={(data.clientesFiado as unknown as { id: string; nome: string; cidade: string; totalFiado: number }[])} totalFiado={data.totalFiado} />
          </div>
        </div>
      )}
    </div>
  )
}
