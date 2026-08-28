import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { filtrarPedidosParaEntregar } from "@/lib/consolidacao-utils"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const rota = await prisma.consolidacaoRota.findUnique({
    where: { id },
    include: { itens: { include: { pedido: true } } },
  })

  if (!rota) return NextResponse.json({ error: "Rota não encontrada" }, { status: 404 })
  if (rota.status !== "FECHADA") return NextResponse.json({ error: "Rota não está fechada" }, { status: 400 })

  const pedidosParaEntregar = filtrarPedidosParaEntregar(
    rota.itens.map((ci) => ({ id: ci.pedidoId, statusEntrega: ci.pedido.statusEntrega }))
  )

  if (pedidosParaEntregar.length === 0) {
    return NextResponse.json({ ok: true, atualizados: 0 })
  }

  await prisma.pedido.updateMany({
    where: { id: { in: pedidosParaEntregar.map((p) => p.id) } },
    data: { statusEntrega: "ENTREGUE" },
  })

  return NextResponse.json({ ok: true, atualizados: pedidosParaEntregar.length })
}
