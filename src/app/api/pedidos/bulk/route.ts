import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { validarBulkUpdatePedidos } from "@/lib/pedido-utils"
import { shouldRegistrarHistoricoStatus } from "@/lib/pedido-status-utils"
import type { StatusEntrega } from "@prisma/client"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await req.json()
  const { ids, action, value } = body as { ids: string[]; action: "statusEntrega" | "statusPagamento"; value: string }

  const erro = validarBulkUpdatePedidos({ ids, action, value })
  if (erro) return NextResponse.json({ error: erro }, { status: 400 })

  if (action === "statusEntrega") {
    const pedidos = await prisma.pedido.findMany({
      where: { id: { in: ids } },
      select: { id: true, statusEntrega: true },
    })

    await prisma.$transaction(async (tx) => {
      await tx.pedido.updateMany({
        where: { id: { in: ids } },
        data: { statusEntrega: value as never },
      })

      const historicoEntries = pedidos
        .filter((p) => shouldRegistrarHistoricoStatus(p.statusEntrega, value))
        .map((p) => ({
          pedidoId: p.id,
          statusAnterior: p.statusEntrega ?? null,
          statusNovo: value as StatusEntrega,
        }))

      if (historicoEntries.length > 0) {
        await tx.historicoStatusPedido.createMany({ data: historicoEntries })
      }
    })
  } else {
    await prisma.pedido.updateMany({
      where: { id: { in: ids } },
      data: { statusPagamento: value as never },
    })
  }

  return NextResponse.json({ updated: ids.length })
}
