import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const saida = await prisma.saida.findUnique({ where: { id } })
  if (!saida) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  return NextResponse.json(saida)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    const { data, tipo, descricao, valor } = body

    const saida = await prisma.saida.update({
      where: { id },
      data: {
        ...(data && { data: new Date(data) }),
        ...(tipo && { tipo }),
        ...(descricao !== undefined && { descricao: descricao || null }),
        ...(valor !== undefined && { valor: parseFloat(valor) }),
      },
    })
    return NextResponse.json(saida)
  } catch (e) {
    console.error("[PUT /api/saidas/[id]]", e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  await prisma.saida.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
