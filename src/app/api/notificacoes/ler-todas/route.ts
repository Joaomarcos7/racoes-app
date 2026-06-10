import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PATCH() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  await prisma.notificacao.updateMany({ where: { lida: false }, data: { lida: true } })
  return NextResponse.json({ ok: true })
}
