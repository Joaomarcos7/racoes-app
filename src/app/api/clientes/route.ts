import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { parsePaginationParams, buildPaginationMeta } from "@/lib/pagination-utils"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const search = req.nextUrl.searchParams.get("search") ?? ""
  const { page, limit } = parsePaginationParams(req.nextUrl.searchParams)

  const where = {
    ativo: true,
    nome: search ? { contains: search } : undefined,
  }

  const [total, clientes] = await Promise.all([
    prisma.cliente.count({ where }),
    prisma.cliente.findMany({
      where,
      orderBy: { nome: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        pedidos: { where: { statusPagamento: "FIADO" }, select: { id: true } },
      },
    }),
  ])

  const data = clientes.map((c) => ({ ...c, pedidos: undefined, temFiado: c.pedidos.length > 0 }))
  return NextResponse.json({ data, ...buildPaginationMeta({ total, page, limit }) })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await req.json()
  const { nome, telefone, email, cidade } = body

  if (!nome || !cidade) {
    return NextResponse.json({ error: "nome e cidade são obrigatórios" }, { status: 400 })
  }

  const cliente = await prisma.cliente.create({
    data: { nome, telefone: telefone || null, email: email || null, cidade },
  })

  return NextResponse.json(cliente, { status: 201 })
}
