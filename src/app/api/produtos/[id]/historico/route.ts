import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const historico = await prisma.historicoProduto.findMany({
    where: { produtoId: id },
    orderBy: { criadoEm: "desc" },
  })

  return NextResponse.json(historico)
}
