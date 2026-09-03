import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { groupByMetodoPagamento, getTopClientes, calcularPesoVendido, getDiaDates, calcularVendasPagas } from "@/lib/dashboard-utils"
import { aggregateSaidasPorTipo, calcularSaldoLiquido } from "@/lib/saida-utils"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const dateParam = req.nextUrl.searchParams.get("date")
  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json({ error: "Parâmetro date inválido. Use YYYY-MM-DD." }, { status: 400 })
  }

  const { start, end } = getDiaDates(dateParam)

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

  const grafico = [
    {
      label: dateParam,
      valor: pedidos
        .filter((p) => p.statusPagamento === "PAGO")
        .reduce((acc, p) => acc + p.itens.reduce((s, i) => s + i.quantidade * i.valorUnit, 0), 0),
    },
  ]

  const ultimosPedidos = pedidos.slice(0, 5).map((p) => ({
    ...p,
    total: p.itens.reduce((acc, i) => acc + i.quantidade * i.valorUnit, 0),
  }))

  const totalSaidas = saidas.reduce((acc, s) => acc + s.valor, 0)
  const saldoLiquido = calcularSaldoLiquido(vendasTotal, totalSaidas)
  const topSaidasPorTipo = aggregateSaidasPorTipo(saidas)

  return NextResponse.json({ vendasTotal, numeroPedidos, ticketMedio, totalFiado, pesoVendido, clientesComFiado: clientesFiado.length, totalClientes, novosClientes, pedidosEntrega: pedidosEntrega.length, pedidosBalcao: pedidosBalcao.length, vendasEntrega, vendasBalcao, entregasRealizadas, metodosPagamento, topClientes, grafico, ultimosPedidos, clientesFiado, totalSaidas, saldoLiquido, topSaidasPorTipo })
}
