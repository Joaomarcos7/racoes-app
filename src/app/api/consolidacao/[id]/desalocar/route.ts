import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const { pedidoId } = await req.json()
  if (!pedidoId) return NextResponse.json({ error: "pedidoId obrigatório" }, { status: 400 })

  await prisma.consolidacaoItem.deleteMany({ where: { consolidacaoRotaId: id, pedidoId } })
  return NextResponse.json({ ok: true })
}
