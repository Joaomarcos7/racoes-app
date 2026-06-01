import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const produto = await prisma.produto.findUnique({ where: { id } })
  if (!produto) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  return NextResponse.json(produto)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const produto = await prisma.produto.update({ where: { id }, data: body })
  return NextResponse.json(produto)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const produto = await prisma.produto.update({ where: { id }, data: { ativo: false } })
  return NextResponse.json(produto)
}
