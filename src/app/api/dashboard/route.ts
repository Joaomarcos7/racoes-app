import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

function getPeriodoDates(periodo: string): { start: Date; end: Date } {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  if (periodo === "hoje") {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    return { start, end }
  }
  const days = periodo === "semana" ? 6 : 29
  const start = new Date(now)
  start.setDate(now.getDate() - days)
  start.setHours(0, 0, 0, 0)
  return { start, end }
}

const weekdays = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]
const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]

function getGraficoLabels(periodo: string, start: Date) {
  const dias = periodo === "hoje" ? 1 : periodo === "semana" ? 7 : 30
  return Array.from({ length: dias }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const label = periodo === "hoje" ? "Hoje" : periodo === "semana" ? weekdays[d.getDay()] : `${d.getDate()}/${months[d.getMonth()]}`
    return { label, date: d }
  })
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const periodo = req.nextUrl.searchParams.get("periodo") ?? "hoje"
  const { start, end } = getPeriodoDates(periodo)

  const pedidos = await prisma.pedido.findMany({
    where: { dataPedido: { gte: start, lte: end } },
    include: { cliente: true, itens: true },
    orderBy: { dataPedido: "desc" },
  })

  const [totalClientes, novosClientes] = await Promise.all([
    prisma.cliente.count({ where: { ativo: true } }),
    prisma.cliente.count({ where: { ativo: true, createdAt: { gte: start, lte: end } } }),
  ])

  const clientesComFiadoRaw = await prisma.cliente.findMany({
    where: { ativo: true, pedidos: { some: { statusPagamento: "FIADO" } } },
    include: { pedidos: { where: { statusPagamento: "FIADO" }, include: { itens: true } } },
  })

  const clientesFiado = clientesComFiadoRaw.map((c) => ({
    id: c.id, nome: c.nome, cidade: c.cidade, telefone: c.telefone, email: c.email,
    ativo: c.ativo, createdAt: c.createdAt, temFiado: true,
    totalFiado: c.pedidos.reduce((acc, p) => acc + p.itens.reduce((s, i) => s + i.quantidade * i.valorUnit, 0), 0),
  }))

  const totalFiado = clientesFiado.reduce((acc, c) => acc + c.totalFiado, 0)
  const vendasTotal = pedidos.reduce((acc, p) => acc + p.itens.reduce((s, i) => s + i.quantidade * i.valorUnit, 0), 0)
  const numeroPedidos = pedidos.length
  const ticketMedio = numeroPedidos > 0 ? vendasTotal / numeroPedidos : 0

  const grafico = getGraficoLabels(periodo, start).map(({ label, date }) => {
    const ds = new Date(date); ds.setHours(0,0,0,0)
    const de = new Date(date); de.setHours(23,59,59,999)
    const valor = pedidos.filter((p) => { const d = new Date(p.dataPedido); return d >= ds && d <= de })
      .reduce((acc, p) => acc + p.itens.reduce((s, i) => s + i.quantidade * i.valorUnit, 0), 0)
    return { label, valor }
  })

  const ultimosPedidos = pedidos.slice(0, 5).map((p) => ({
    ...p,
    total: p.itens.reduce((acc, i) => acc + i.quantidade * i.valorUnit, 0),
  }))

  return NextResponse.json({ vendasTotal, numeroPedidos, ticketMedio, totalFiado, clientesComFiado: clientesFiado.length, totalClientes, novosClientes, grafico, ultimosPedidos, clientesFiado })
}
