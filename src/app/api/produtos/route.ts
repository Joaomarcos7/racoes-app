import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { parsePaginationParams, buildPaginationMeta } from "@/lib/pagination-utils"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const search = req.nextUrl.searchParams.get("search") ?? ""
  const ativo = req.nextUrl.searchParams.get("ativo")
  const { page, limit } = parsePaginationParams(req.nextUrl.searchParams)

  const where = {
    ativo: ativo === "false" ? false : true,
    nome: search ? { contains: search } : undefined,
  }

  const [total, data] = await Promise.all([
    prisma.produto.count({ where }),
    prisma.produto.findMany({ where, orderBy: { nome: "asc" }, skip: (page - 1) * limit, take: limit }),
  ])

  return NextResponse.json({ data, ...buildPaginationMeta({ total, page, limit }) })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await req.json()
  const { nome, peso, valorUnitario, custo, tipo } = body

  if (!nome || typeof peso !== "number" || typeof valorUnitario !== "number") {
    return NextResponse.json({ error: "nome, peso e valorUnitario são obrigatórios" }, { status: 400 })
  }

  const produto = await prisma.produto.create({
    data: { nome, peso, valorUnitario, custo: custo ?? null, tipo: tipo ?? "CONSUMIDOR_FINAL" },
  })

  return NextResponse.json(produto, { status: 201 })
}
