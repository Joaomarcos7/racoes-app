import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { calcularStatusDesalocacao } from "@/lib/consolidacao-utils"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const { pedidoId } = await req.json()
  if (!pedidoId) return NextResponse.json({ error: "pedidoId obrigatório" }, { status: 400 })

  const [pedido, ci] = await Promise.all([
    prisma.pedido.findUnique({ where: { id: pedidoId } }),
    prisma.consolidacaoItem.findFirst({
      where: { consolidacaoRotaId: id, pedidoId },
      include: { detalhes: true },
    }),
  ])

  if (!pedido) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })

  const novoStatus = calcularStatusDesalocacao(pedido.statusEntrega, (ci?.detalhes?.length ?? 0) > 0)

  await prisma.$transaction(async (tx) => {
    await tx.consolidacaoItem.deleteMany({ where: { consolidacaoRotaId: id, pedidoId } })

    if (ci?.detalhes?.length) {
      for (const detalhe of ci.detalhes) {
        await tx.itemPedido.update({
          where: { id: detalhe.itemPedidoId },
          data: { quantidadeRestante: { increment: detalhe.quantidadeAlocada } },
        })
      }
    }

    if (novoStatus) {
      await tx.pedido.update({ where: { id: pedidoId }, data: { statusEntrega: novoStatus } })
    }
  })

  return NextResponse.json({ ok: true })
}
