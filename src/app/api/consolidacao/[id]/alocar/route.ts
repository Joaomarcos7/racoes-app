import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { calcularPesoAlocar, statusAposAlocar, validarPesoAlocacao } from "@/lib/consolidacao-utils"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const { id } = await params
    const { pedidoId, force } = await req.json()
    if (!pedidoId) return NextResponse.json({ error: "pedidoId obrigatório" }, { status: 400 })

    const rota = await prisma.consolidacaoRota.findUnique({
      where: { id },
      include: { veiculo: true, itens: { include: { pedido: { include: { itens: true } } } } },
    })

    if (!rota) return NextResponse.json({ error: "Rota não encontrada" }, { status: 404 })
    if (rota.status === "FECHADA") return NextResponse.json({ error: "Rota já está fechada" }, { status: 400 })

    const jaAlocado = rota.itens.some((ci) => ci.pedidoId === pedidoId)
    if (jaAlocado) return NextResponse.json({ error: "Pedido já alocado nesta rota" }, { status: 400 })

    const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId }, include: { itens: true } })
    if (!pedido) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })

    const pesoAtual = rota.itens.reduce((acc, ci) => acc + calcularPesoAlocar(ci.pedido.itens), 0)
    const pesoPedido = calcularPesoAlocar(pedido.itens)
    const overload = validarPesoAlocacao(pesoAtual, pesoPedido, rota.veiculo.pesoMaximo)

    if (overload && !force) {
      return NextResponse.json(
        { error: `Peso excede capacidade do veículo em ${overload.excesso.toFixed(1)} kg`, pesoExcedido: true, excesso: overload.excesso },
        { status: 400 }
      )
    }

    const novoStatus = statusAposAlocar(pedido.statusEntrega)
    await prisma.$transaction([
      prisma.consolidacaoItem.create({ data: { consolidacaoRotaId: id, pedidoId } }),
      ...(novoStatus ? [prisma.pedido.update({ where: { id: pedidoId }, data: { statusEntrega: novoStatus } })] : []),
    ])
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[POST /api/consolidacao/alocar]", e)
    return NextResponse.json({ error: "Erro interno ao alocar pedido" }, { status: 500 })
  }
}
