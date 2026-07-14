import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      pedidos: {
        include: { itens: { include: { produto: true } }, baixas: { orderBy: { createdAt: "desc" } } },
        orderBy: { dataPedido: "desc" },
      },
    },
  })

  if (!cliente) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  return NextResponse.json(cliente)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const cliente = await prisma.cliente.update({ where: { id }, data: body })
  return NextResponse.json(cliente)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const cliente = await prisma.cliente.update({ where: { id }, data: { ativo: false } })
  return NextResponse.json(cliente)
}
