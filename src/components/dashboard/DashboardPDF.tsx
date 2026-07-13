import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { DashboardKPIsDTO } from "@/types/api"
import { labelTipoSaida } from "@/lib/saida-utils"

const s = StyleSheet.create({
  page: { padding: 32, fontFamily: "Helvetica" },
  title: { fontSize: 20, fontWeight: "bold", color: "#0C5E3A", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#666", marginBottom: 20 },
  row: { flexDirection: "row", gap: 12, marginBottom: 16 },
  kpi: { flex: 1, backgroundColor: "#f0fdf4", borderRadius: 4, padding: 10 },
  kpiLabel: { fontSize: 9, color: "#666", marginBottom: 3 },
  kpiValue: { fontSize: 14, fontWeight: "bold", color: "#0C5E3A" },
  sectionTitle: { fontSize: 12, fontWeight: "bold", color: "#333", marginBottom: 8, marginTop: 12 },
  tableHeader: { flexDirection: "row", backgroundColor: "#0C5E3A", padding: "4 8" },
  tableRow: { flexDirection: "row", padding: "4 8", borderBottom: "1 solid #eee" },
  th: { color: "#fff", fontSize: 9, fontWeight: "bold" },
  td: { fontSize: 9, color: "#333" },
  col1: { flex: 2 },
  col2: { flex: 1, textAlign: "right" },
})

function fmtBRL(v: number) {
  return "R$ " + v.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

const periodoLabel: Record<string, string> = { hoje: "Hoje", semana: "Última Semana", mes: "Último Mês" }

export function DashboardPDF({ data, periodo }: { data: DashboardKPIsDTO; periodo: string }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>Comercial Ouriques — Dashboard</Text>
        <Text style={s.subtitle}>Período: {periodoLabel[periodo] ?? periodo} · Gerado em {new Date().toLocaleDateString("pt-BR")}</Text>
        <View style={s.row}>
          <View style={s.kpi}><Text style={s.kpiLabel}>Vendas (Entradas)</Text><Text style={s.kpiValue}>{fmtBRL(data.vendasTotal)}</Text></View>
          <View style={s.kpi}><Text style={s.kpiLabel}>Total Saídas</Text><Text style={[s.kpiValue, { color: "#DC2626" }]}>{fmtBRL(data.totalSaidas)}</Text></View>
          <View style={s.kpi}><Text style={s.kpiLabel}>Saldo Líquido</Text><Text style={[s.kpiValue, { color: data.saldoLiquido >= 0 ? "#15803D" : "#DC2626" }]}>{fmtBRL(data.saldoLiquido)}</Text></View>
          <View style={s.kpi}><Text style={s.kpiLabel}>Fiado</Text><Text style={[s.kpiValue, { color: "#e67e22" }]}>{fmtBRL(data.totalFiado)}</Text></View>
        </View>
        <View style={s.row}>
          <View style={s.kpi}><Text style={s.kpiLabel}>Pedidos</Text><Text style={s.kpiValue}>{data.numeroPedidos}</Text></View>
          <View style={s.kpi}><Text style={s.kpiLabel}>Ticket Médio</Text><Text style={s.kpiValue}>{fmtBRL(data.ticketMedio)}</Text></View>
          <View style={s.kpi}><Text style={s.kpiLabel}>Entregas</Text><Text style={s.kpiValue}>{data.pedidosEntrega}</Text></View>
          <View style={s.kpi}><Text style={s.kpiLabel}>Balcão</Text><Text style={s.kpiValue}>{data.pedidosBalcao}</Text></View>
        </View>
        <Text style={s.sectionTitle}>Últimos Pedidos</Text>
        <View style={s.tableHeader}>
          <Text style={[s.th, s.col1]}>Cliente</Text>
          <Text style={[s.th, s.col2]}>Total</Text>
          <Text style={[s.th, s.col2]}>Pagamento</Text>
        </View>
        {(data.ultimosPedidos as (typeof data.ultimosPedidos[0] & { total?: number })[]).map((p, i) => (
          <View key={p.id} style={[s.tableRow, { backgroundColor: i % 2 === 0 ? "#fff" : "#f9f9f9" }]}>
            <Text style={[s.td, s.col1]}>{p.cliente?.nome ?? "—"}</Text>
            <Text style={[s.td, s.col2]}>{fmtBRL(p.total ?? 0)}</Text>
            <Text style={[s.td, s.col2]}>{p.statusPagamento}</Text>
          </View>
        ))}
        {data.topSaidasPorTipo && data.topSaidasPorTipo.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Maiores Custos por Tipo</Text>
            <View style={s.tableHeader}>
              <Text style={[s.th, s.col1]}>Tipo</Text>
              <Text style={[s.th, s.col2]}>Total</Text>
            </View>
            {data.topSaidasPorTipo.map((s2, i) => (
              <View key={s2.tipo} style={[s.tableRow, { backgroundColor: i % 2 === 0 ? "#fff" : "#f9f9f9" }]}>
                <Text style={[s.td, s.col1]}>{labelTipoSaida(s2.tipo)}</Text>
                <Text style={[s.td, s.col2]}>{fmtBRL(s2.total)}</Text>
              </View>
            ))}
          </>
        )}
        {data.clientesFiado.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Clientes com Fiado</Text>
            <View style={s.tableHeader}>
              <Text style={[s.th, s.col1]}>Cliente</Text>
              <Text style={[s.th, s.col2]}>Cidade</Text>
              <Text style={[s.th, s.col2]}>Total</Text>
            </View>
            {(data.clientesFiado as (typeof data.clientesFiado[0] & { totalFiado?: number })[]).map((c, i) => (
              <View key={c.id} style={[s.tableRow, { backgroundColor: i % 2 === 0 ? "#fff" : "#f9f9f9" }]}>
                <Text style={[s.td, s.col1]}>{c.nome}</Text>
                <Text style={[s.td, s.col2]}>{c.cidade}</Text>
                <Text style={[s.td, s.col2]}>{fmtBRL(c.totalFiado ?? 0)}</Text>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  )
}
