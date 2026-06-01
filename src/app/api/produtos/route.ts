import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const search = req.nextUrl.searchParams.get("search") ?? ""
  const ativo = req.nextUrl.searchParams.get("ativo")

  const produtos = await prisma.produto.findMany({
    where: {
      ativo: ativo === "false" ? false : true,
      nome: search ? { contains: search } : undefined,
    },
    orderBy: { nome: "asc" },
  })

  return NextResponse.json(produtos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await req.json()
  const { nome, peso, valorUnitario } = body

  if (!nome || typeof peso !== "number" || typeof valorUnitario !== "number") {
    return NextResponse.json({ error: "nome, peso e valorUnitario são obrigatórios" }, { status: 400 })
  }

  const produto = await prisma.produto.create({
    data: { nome, peso, valorUnitario },
  })

  return NextResponse.json(produto, { status: 201 })
}
