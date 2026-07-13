"use client"
import { useState } from "react"
import dynamic from "next/dynamic"
import { PageHeader } from "@/components/layout/PageHeader"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { PainelFiado } from "@/components/dashboard/PainelFiado"
import { PainelMetodosPagamento } from "@/components/dashboard/PainelMetodosPagamento"
import { PainelTopClientes } from "@/components/dashboard/PainelTopClientes"
import { PainelTopSaidas } from "@/components/dashboard/PainelTopSaidas"
import { useDashboard } from "@/hooks/use-dashboard"
import { cn, formatCurrency } from "@/lib/utils"
import { DollarSign, ShoppingBag, Users, Truck, CheckCircle2, Store, Weight, TrendingDown, Scale } from "lucide-react"

const GraficoVendas = dynamic(() => import("@/components/dashboard/GraficoVendas").then(m => m.GraficoVendas), { ssr: false })
const ExportButton = dynamic(() => import("@/components/dashboard/ExportButton").then(m => m.ExportButton), { ssr: false })

type Periodo = "hoje" | "semana" | "mes" | "trimestre" | "anual"

const PERIODO_LABELS: Record<Periodo, string> = {
  hoje: "Hoje",
  semana: "Semana",
  mes: "Mês",
  trimestre: "Trimestre",
  anual: "Ano",
}

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<Periodo>("hoje")
  const { data, isLoading } = useDashboard(periodo)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex border rounded-md overflow-hidden">
              {(["hoje","semana","mes","trimestre","anual"] as Periodo[]).map((p) => (
                <button key={p} onClick={() => setPeriodo(p)}
                  className={cn("px-2.5 py-1.5 text-xs sm:text-sm transition-colors", periodo === p ? "bg-blue-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50")}>
                  {PERIODO_LABELS[p]}
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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            <KpiCard label="Vendas" value={data.vendasTotal} isCurrency subtext={`${data.numeroPedidos} pedidos`} accentColor="#1d4ed8" icon={DollarSign} />
            <KpiCard label="Pedidos" value={data.numeroPedidos} subtext={`Ticket médio ${formatCurrency(data.ticketMedio)}`} accentColor="#1E6FBF" icon={ShoppingBag} />
            <KpiCard label="Clientes" value={data.totalClientes} subtext={data.novosClientes > 0 ? `+${data.novosClientes} novos` : undefined} accentColor="#6B21A8" icon={Users} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
            <KpiCard label="Entregas" value={data.pedidosEntrega} subtext={`${formatCurrency(data.vendasEntrega)} em vendas`} accentColor="#0C5E3A" icon={Truck} />
            <KpiCard label="Realizadas" value={data.entregasRealizadas} subtext={`de ${data.pedidosEntrega} pedidos`} accentColor="#15803D" icon={CheckCircle2} />
            <KpiCard label="Balcão" value={data.pedidosBalcao} subtext={`${formatCurrency(data.vendasBalcao)} em vendas`} accentColor="#1D4ED8" icon={Store} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
            <KpiCard label="Peso Vendido" value={`${data.pesoVendido.toFixed(1)} kg`} subtext={`${PERIODO_LABELS[periodo].toLowerCase()}`} accentColor="#92400E" icon={Weight} />
            <KpiCard label="Total Saídas" value={data.totalSaidas} isCurrency subtext="custos do período" accentColor="#DC2626" icon={TrendingDown} />
            <KpiCard label="Saldo Líquido" value={data.saldoLiquido} isCurrency subtext="entradas − saídas" accentColor={data.saldoLiquido >= 0 ? "#15803D" : "#DC2626"} icon={Scale} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2"><GraficoVendas data={data.grafico} /></div>
            <PainelFiado clientes={(data.clientesFiado as unknown as { id: string; nome: string; cidade: string; totalFiado: number }[])} totalFiado={data.totalFiado} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PainelMetodosPagamento stats={data.metodosPagamento} />
            <PainelTopClientes clientes={data.topClientes} />
            <PainelTopSaidas saidas={data.topSaidasPorTipo} totalSaidas={data.totalSaidas} />
          </div>
        </div>
      )}
    </div>
  )
}
