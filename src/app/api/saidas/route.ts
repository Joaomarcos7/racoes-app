import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const dataInicio = searchParams.get("dataInicio")
  const dataFim = searchParams.get("dataFim")
  const tipo = searchParams.get("tipo")
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")))

  const where = {
    ...(dataInicio && dataFim && {
      data: { gte: new Date(dataInicio), lte: new Date(dataFim + "T23:59:59.999Z") },
    }),
    ...(tipo && tipo !== "all" && { tipo: tipo as never }),
  }

  const [total, data] = await Promise.all([
    prisma.saida.count({ where }),
    prisma.saida.findMany({
      where,
      orderBy: { data: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const body = await req.json()
    const { data, tipo, descricao, valor } = body
    if (!data || !tipo || !valor) return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 })
    if (valor <= 0) return NextResponse.json({ error: "Valor deve ser maior que zero" }, { status: 400 })

    const saida = await prisma.saida.create({
      data: { data: new Date(data), tipo, descricao: descricao || null, valor: parseFloat(valor) },
    })
    return NextResponse.json(saida, { status: 201 })
  } catch (e) {
    console.error("[POST /api/saidas]", e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
