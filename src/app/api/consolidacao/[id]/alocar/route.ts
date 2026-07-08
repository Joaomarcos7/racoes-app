import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const { pedidoId } = await req.json()
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

  // Para pedidos com entrega parcial, considerar apenas o peso dos itens restantes
  const pesoAtual = rota.itens.reduce((acc, ci) =>
    acc + ci.pedido.itens.reduce((s, i) => s + (i.quantidade - i.quantidadeFalta) * i.pesoUnit, 0), 0)
  const pesoPedido = pedido.itens.reduce((s, i) => s + (i.quantidade - i.quantidadeFalta) * i.pesoUnit, 0)

  if (pesoAtual + pesoPedido > rota.veiculo.pesoMaximo) {
    const disponivel = (rota.veiculo.pesoMaximo - pesoAtual).toFixed(1)
    return NextResponse.json(
      { error: `Peso excede capacidade do veículo (${disponivel} kg disponível)` },
      { status: 400 }
    )
  }

  await prisma.consolidacaoItem.create({ data: { consolidacaoRotaId: id, pedidoId } })
  return NextResponse.json({ ok: true })
}
