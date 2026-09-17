import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { disponivel } = body

  if (typeof disponivel !== "boolean") {
    return NextResponse.json({ error: "Campo 'disponivel' deve ser boolean" }, { status: 400 })
  }

  const pedido = await prisma.pedido.findUnique({ where: { id }, select: { id: true, ativo: true } })
  if (!pedido || !pedido.ativo) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })

  const updated = await prisma.pedido.update({
    where: { id },
    data: { disponivel },
    select: { id: true, disponivel: true },
  })

  return NextResponse.json(updated)
}
