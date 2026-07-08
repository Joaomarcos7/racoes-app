import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { calcularStatusEntregaAlocacao } from "@/lib/consolidacao-utils"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const rota = await prisma.consolidacaoRota.findUnique({
    where: { id },
    include: { itens: { include: { pedido: { include: { itens: true } } } } },
  })

  if (!rota) return NextResponse.json({ error: "Rota não encontrada" }, { status: 404 })

  await prisma.$transaction([
    prisma.consolidacaoRota.update({ where: { id }, data: { status: "FECHADA" } }),
    ...rota.itens.map((ci) => {
      const statusEntrega = calcularStatusEntregaAlocacao(ci.pedido.itens)
      return prisma.pedido.update({ where: { id: ci.pedidoId }, data: { statusEntrega } })
    }),
  ])

  return NextResponse.json({ ok: true })
}
