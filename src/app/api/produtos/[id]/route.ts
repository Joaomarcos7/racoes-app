import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { shouldRegistrarHistoricoCusto } from "@/lib/pedido-utils"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const produto = await prisma.produto.findUnique({ where: { id } })
  if (!produto) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  return NextResponse.json(produto)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const atual = await prisma.produto.findUnique({ where: { id } })
  if (!atual) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })

  const produto = await prisma.produto.update({ where: { id }, data: body })

  if (body.valorUnitario !== undefined && body.valorUnitario !== atual.valorUnitario) {
    await prisma.historicoProduto.create({
      data: { produtoId: id, precoAnterior: atual.valorUnitario, precoNovo: body.valorUnitario },
    })
  }

  if (shouldRegistrarHistoricoCusto(atual.custo, body.custo)) {
    await prisma.historicoCusto.create({
      data: { produtoId: id, custoAnterior: atual.custo, custoNovo: body.custo ?? null },
    })
  }

  return NextResponse.json(produto)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const produto = await prisma.produto.update({ where: { id }, data: { ativo: false } })
  return NextResponse.json(produto)
}
