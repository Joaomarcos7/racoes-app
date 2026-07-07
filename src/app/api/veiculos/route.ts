import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { parsePaginationParams, buildPaginationMeta } from "@/lib/pagination-utils"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { page, limit } = parsePaginationParams(req.nextUrl.searchParams)
  const where = { ativo: true }

  const [total, data] = await Promise.all([
    prisma.veiculo.count({ where }),
    prisma.veiculo.findMany({ where, orderBy: { modelo: "asc" }, skip: (page - 1) * limit, take: limit }),
  ])

  return NextResponse.json({ data, ...buildPaginationMeta({ total, page, limit }) })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await req.json()
  const { placa, modelo, ano, carroceria, cor, pesoMaximo } = body

  if (!placa || !modelo || !carroceria || !cor || typeof ano !== "number" || typeof pesoMaximo !== "number") {
    return NextResponse.json({ error: "placa, modelo, ano, carroceria, cor e pesoMaximo são obrigatórios" }, { status: 400 })
  }

  try {
    const veiculo = await prisma.veiculo.create({ data: { placa, modelo, ano, carroceria, cor, pesoMaximo } })
    return NextResponse.json(veiculo, { status: 201 })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Já existe veículo com esta placa" }, { status: 400 })
    }
    throw e
  }
}
