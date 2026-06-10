import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { calcProdutoStats } from "@/lib/produto-stats"

function getPeriodoStart(periodo: string): Date {
  const now = new Date()
  if (periodo === "hoje") {
    const d = new Date(now); d.setHours(0, 0, 0, 0); return d
  }
  const days = periodo === "semana" ? 6 : 29
  const d = new Date(now); d.setDate(now.getDate() - days); d.setHours(0, 0, 0, 0); return d
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const periodo = req.nextUrl.searchParams.get("periodo") ?? "mes"
  const start = getPeriodoStart(periodo)

  const itens = await prisma.itemPedido.findMany({
    where: {
      produtoId: id,
      pedido: { ativo: true, dataPedido: { gte: start } },
    },
    include: { pedido: { select: { tipoPedido: true } } },
  })

  return NextResponse.json(calcProdutoStats(itens))
}
