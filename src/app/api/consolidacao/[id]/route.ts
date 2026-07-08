import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { calcularPesoAlocar } from "@/lib/consolidacao-utils"

function calcPesoTotal(itens: { pedido: { itens: { quantidade: number; pesoUnit: number; quantidadeFalta: number }[] } }[]): number {
  return itens.reduce((acc, ci) => acc + calcularPesoAlocar(ci.pedido.itens), 0)
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const rota = await prisma.consolidacaoRota.findUnique({
    where: { id },
    include: {
      veiculo: true,
      itens: { include: { pedido: { include: { cliente: true, itens: { include: { produto: true } } } } } },
    },
  })

  if (!rota) return NextResponse.json({ error: "Rota não encontrada" }, { status: 404 })

  const pedidosDisponiveis = await prisma.pedido.findMany({
    where: {
      statusEntrega: { in: ["AGUARDANDO", "ENTREGA_PARCIAL"] },
      NOT: { consolidacoes: { some: { rota: { status: "ABERTA" } } } },
    },
    include: { cliente: true, itens: { include: { produto: true } } },
    orderBy: [{ cliente: { cidade: "asc" } }, { dataPedido: "asc" }],
  })

  return NextResponse.json({ ...rota, pesoTotal: calcPesoTotal(rota.itens), pedidosDisponiveis })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  await prisma.consolidacaoRota.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
