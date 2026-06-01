import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

const pedidoInclude = {
  cliente: true,
  itens: { include: { produto: true } },
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const pedido = await prisma.pedido.findUnique({ where: { id }, include: pedidoInclude })
  if (!pedido) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  return NextResponse.json(pedido)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { statusEntrega, statusPagamento, metodoPagamento, observacoes } = body

  if (statusPagamento === "PAGO" && !metodoPagamento) {
    return NextResponse.json({ error: "Método de pagamento obrigatório ao marcar como PAGO" }, { status: 400 })
  }

  const pedido = await prisma.pedido.update({
    where: { id },
    data: {
      ...(statusEntrega && { statusEntrega }),
      ...(statusPagamento && { statusPagamento }),
      ...(metodoPagamento !== undefined && { metodoPagamento }),
      ...(observacoes !== undefined && { observacoes }),
    },
    include: pedidoInclude,
  })
  return NextResponse.json(pedido)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  await prisma.pedido.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
