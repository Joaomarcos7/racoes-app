import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const veiculos = await prisma.veiculo.findMany({
    where: { ativo: true },
    orderBy: { modelo: "asc" },
  })
  return NextResponse.json(veiculos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await req.json()
  const { placa, modelo, pesoMaximo } = body

  if (!placa || !modelo || typeof pesoMaximo !== "number") {
    return NextResponse.json({ error: "placa, modelo e pesoMaximo são obrigatórios" }, { status: 400 })
  }

  try {
    const veiculo = await prisma.veiculo.create({ data: { placa, modelo, pesoMaximo } })
    return NextResponse.json(veiculo, { status: 201 })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Já existe veículo com esta placa" }, { status: 400 })
    }
    throw e
  }
}
