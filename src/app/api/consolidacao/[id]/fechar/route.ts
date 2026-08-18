import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { calcularStatusFechamentoV2 } from "@/lib/consolidacao-utils"

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

  await prisma.$transaction(async (tx) => {
    await tx.consolidacaoRota.update({ where: { id }, data: { status: "FECHADA" } })

    for (const ci of rota.itens) {
      let totalRestante = ci.pedido.itens.reduce((acc, i) => acc + i.quantidadeRestante, 0)

      // Absorb delivery falta into quantidadeRestante, reset quantidadeFalta
      if (ci.temFaltaRegistrada) {
        for (const item of ci.pedido.itens) {
          if (item.quantidadeFalta > 0) {
            await tx.itemPedido.update({
              where: { id: item.id },
              data: { quantidadeRestante: item.quantidadeRestante + item.quantidadeFalta, quantidadeFalta: 0 },
            })
            totalRestante += item.quantidadeFalta
          }
        }
      }

      const status = calcularStatusFechamentoV2(ci.pedido.statusEntrega, totalRestante)
      await tx.pedido.update({ where: { id: ci.pedidoId }, data: { statusEntrega: status } })
    }
  })

  return NextResponse.json({ ok: true })
}
