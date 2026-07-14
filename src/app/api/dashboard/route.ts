import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { groupByMetodoPagamento, getTopClientes, calcularPesoVendido, getPeriodoDates, calcularVendasPagas } from "@/lib/dashboard-utils"
import { aggregateSaidasPorTipo, calcularSaldoLiquido } from "@/lib/saida-utils"

const weekdays = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]
const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]

function getGraficoSlots(periodo: string, start: Date, end: Date): { label: string; rangeStart: Date; rangeEnd: Date }[] {
  if (periodo === "hoje") {
    const s = new Date(start); s.setHours(0,0,0,0)
    const e = new Date(start); e.setHours(23,59,59,999)
    return [{ label: "Hoje", rangeStart: s, rangeEnd: e }]
  }
  if (periodo === "semana") {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i)
      const s = new Date(d); s.setHours(0,0,0,0)
      const e = new Date(d); e.setHours(23,59,59,999)
      return { label: weekdays[d.getDay()], rangeStart: s, rangeEnd: e }
    })
  }
  if (periodo === "mes") {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i)
      const s = new Date(d); s.setHours(0,0,0,0)
      const e = new Date(d); e.setHours(23,59,59,999)
      return { label: `${d.getDate()}/${months[d.getMonth()]}`, rangeStart: s, rangeEnd: e }
    })
  }
  if (periodo === "trimestre") {
    // 13 semanas
    return Array.from({ length: 13 }, (_, i) => {
      const s = new Date(start); s.setDate(start.getDate() + i * 7); s.setHours(0,0,0,0)
      const e = new Date(s); e.setDate(s.getDate() + 6); e.setHours(23,59,59,999)
      if (e > end) { e.setTime(end.getTime()) }
      return { label: `S${i + 1}`, rangeStart: s, rangeEnd: e }
    })
  }
  // anual: 12 meses
  return Array.from({ length: 12 }, (_, i) => {
    const s = new Date(start.getFullYear(), start.getMonth() + i, 1, 0, 0, 0, 0)
    const e = new Date(start.getFullYear(), start.getMonth() + i + 1, 0, 23, 59, 59, 999)
    if (e > end) { e.setTime(end.getTime()) }
    return { label: months[(start.getMonth() + i) % 12], rangeStart: s, rangeEnd: e }
  })
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const periodo = req.nextUrl.searchParams.get("periodo") ?? "hoje"
  const { start, end } = getPeriodoDates(periodo)

  const pedidos = await prisma.pedido.findMany({
    where: { ativo: true, dataPedido: { gte: start, lte: end } },
    include: { cliente: true, itens: true, pagamentos: true },
    orderBy: { dataPedido: "desc" },
  })

  const saidas = await prisma.saida.findMany({ where: { data: { gte: start, lte: end } } })

  const [totalClientes, novosClientes] = await Promise.all([
    prisma.cliente.count({ where: { ativo: true } }),
    prisma.cliente.count({ where: { ativo: true, createdAt: { gte: start, lte: end } } }),
  ])

  const clientesComFiadoRaw = await prisma.cliente.findMany({
    where: { ativo: true, pedidos: { some: { statusPagamento: "FIADO", ativo: true } } },
    include: { pedidos: { where: { statusPagamento: "FIADO", ativo: true } } },
  })

  const clientesFiado = clientesComFiadoRaw.map((c) => ({
    id: c.id, nome: c.nome, cidade: c.cidade, telefone: c.telefone, instituicao: c.instituicao,
    cep: c.cep, endereco: c.endereco, complemento: c.complemento,
    ativo: c.ativo, createdAt: c.createdAt, temFiado: true,
    totalFiado: c.pedidos.reduce((acc, p) => acc + (p.valorEmAbertoFiado ?? 0), 0),
  }))

  const totalFiado = clientesFiado.reduce((acc, c) => acc + c.totalFiado, 0)
  const pedidosEntrega = pedidos.filter((p) => p.tipoPedido === "ENTREGA")
  const pedidosBalcao = pedidos.filter((p) => p.tipoPedido === "BALCAO")
  const entregasRealizadas = pedidosEntrega.filter((p) => p.statusEntrega === "ENTREGUE").length
  const metodosPagamento = groupByMetodoPagamento(pedidos)
  const topClientes = getTopClientes(pedidos, 5)

  const vendasEntrega = calcularVendasPagas(pedidosEntrega)
  const vendasBalcao = calcularVendasPagas(pedidosBalcao)
  const vendasTotal = vendasEntrega + vendasBalcao
  const numeroPedidos = pedidos.length
  const ticketMedio = numeroPedidos > 0 ? vendasTotal / numeroPedidos : 0
  const pesoVendido = calcularPesoVendido(pedidos)

  const grafico = getGraficoSlots(periodo, start, end).map(({ label, rangeStart, rangeEnd }) => {
    const valor = pedidos
      .filter((p) => { const d = new Date(p.dataPedido); return d >= rangeStart && d <= rangeEnd && p.statusPagamento === "PAGO" })
      .reduce((acc, p) => acc + p.itens.reduce((s, i) => s + i.quantidade * i.valorUnit, 0), 0)
    return { label, valor }
  })

  const ultimosPedidos = pedidos.slice(0, 5).map((p) => ({
    ...p,
    total: p.itens.reduce((acc, i) => acc + i.quantidade * i.valorUnit, 0),
  }))

  const totalSaidas = saidas.reduce((acc, s) => acc + s.valor, 0)
  const saldoLiquido = calcularSaldoLiquido(vendasTotal, totalSaidas)
  const topSaidasPorTipo = aggregateSaidasPorTipo(saidas)

  return NextResponse.json({ vendasTotal, numeroPedidos, ticketMedio, totalFiado, pesoVendido, clientesComFiado: clientesFiado.length, totalClientes, novosClientes, pedidosEntrega: pedidosEntrega.length, pedidosBalcao: pedidosBalcao.length, vendasEntrega, vendasBalcao, entregasRealizadas, metodosPagamento, topClientes, grafico, ultimosPedidos, clientesFiado, totalSaidas, saldoLiquido, topSaidasPorTipo })
}
