import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { validateFaltaAlocada } from "@/lib/consolidacao-utils"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const { pedidoId, faltas } = await req.json()

  if (!pedidoId || !Array.isArray(faltas)) {
    return NextResponse.json({ error: "pedidoId e faltas são obrigatórios" }, { status: 400 })
  }

  const rota = await prisma.consolidacaoRota.findUnique({ where: { id } })
  if (!rota) return NextResponse.json({ error: "Rota não encontrada" }, { status: 404 })
  if (rota.status === "FECHADA") return NextResponse.json({ error: "Rota já está fechada" }, { status: 400 })

  // Load ConsolidacaoItem with detalhes to get quantidadeAlocada per item
  const consolidacaoItem = await prisma.consolidacaoItem.findFirst({
    where: { consolidacaoRotaId: id, pedidoId },
    include: { detalhes: true },
  })

  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { itens: true },
  })
  if (!pedido) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })

  for (const falta of faltas as { itemPedidoId: string; quantidadeFalta: number }[]) {
    const item = pedido.itens.find((i) => i.id === falta.itemPedidoId)
    if (!item) return NextResponse.json({ error: `Item ${falta.itemPedidoId} não encontrado` }, { status: 400 })

    // Use quantidadeAlocada from this route's detalhe; fall back to item.quantidade
    const detalhe = consolidacaoItem?.detalhes.find((d) => d.itemPedidoId === falta.itemPedidoId)
    const quantidadeAlocada = detalhe?.quantidadeAlocada ?? item.quantidade
    const err = validateFaltaAlocada(quantidadeAlocada, falta.quantidadeFalta)
    if (err) return NextResponse.json({ error: err }, { status: 400 })
  }

  await prisma.$transaction([
    ...(faltas as { itemPedidoId: string; quantidadeFalta: number }[]).map((f) =>
      prisma.itemPedido.update({
        where: { id: f.itemPedidoId },
        data: { quantidadeFalta: f.quantidadeFalta },
      })
    ),
    prisma.consolidacaoItem.updateMany({
      where: { consolidacaoRotaId: id, pedidoId },
      data: { temFaltaRegistrada: true },
    }),
  ])

  return NextResponse.json({ ok: true })
}
