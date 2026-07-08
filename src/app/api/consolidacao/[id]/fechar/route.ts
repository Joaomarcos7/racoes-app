import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { calcularStatusFechamento } from "@/lib/consolidacao-utils"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const rota = await prisma.consolidacaoRota.findUnique({
    where: { id },
    include: {
      itens: {
        include: { pedido: { include: { itens: true } } },
      },
    },
  })

  if (!rota) return NextResponse.json({ error: "Rota não encontrada" }, { status: 404 })

  const updates: Parameters<typeof prisma.$transaction>[0] = [
    prisma.consolidacaoRota.update({ where: { id }, data: { status: "FECHADA" } }),
  ]

  for (const ci of rota.itens) {
    const { status, resetFalta } = calcularStatusFechamento(
      ci.pedido.statusEntrega,
      ci.temFaltaRegistrada,
      ci.pedido.itens
    )
    updates.push(prisma.pedido.update({ where: { id: ci.pedidoId }, data: { statusEntrega: status } }))
    if (resetFalta) {
      updates.push(
        prisma.itemPedido.updateMany({
          where: { pedidoId: ci.pedidoId },
          data: { quantidadeFalta: 0 },
        })
      )
    }
  }

  await prisma.$transaction(updates)
  return NextResponse.json({ ok: true })
}
