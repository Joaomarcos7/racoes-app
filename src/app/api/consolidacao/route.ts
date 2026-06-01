import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const rotas = await prisma.consolidacaoRota.findMany({
    include: { veiculo: true, _count: { select: { itens: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(rotas.map((r) => ({
    id: r.id, data: r.data, status: r.status,
    veiculo: r.veiculo, numeroPedidos: r._count.itens, createdAt: r.createdAt,
  })))
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { veiculoId } = await req.json()
  if (!veiculoId) return NextResponse.json({ error: "veiculoId obrigatório" }, { status: 400 })

  const veiculo = await prisma.veiculo.findUnique({ where: { id: veiculoId } })
  if (!veiculo) return NextResponse.json({ error: "Veículo não encontrado" }, { status: 404 })

  const rota = await prisma.consolidacaoRota.create({
    data: { veiculoId },
    include: { veiculo: true, itens: true },
  })

  return NextResponse.json({ ...rota, pesoTotal: 0 }, { status: 201 })
}
