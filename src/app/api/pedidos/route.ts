import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

const pedidoInclude = {
  cliente: true,
  itens: { include: { produto: true } },
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const search = req.nextUrl.searchParams.get("search") ?? ""
  const statusEntrega = req.nextUrl.searchParams.get("statusEntrega")
  const statusPagamento = req.nextUrl.searchParams.get("statusPagamento")

  const pedidos = await prisma.pedido.findMany({
    where: {
      ...(search && { cliente: { nome: { contains: search } } }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(statusEntrega && { statusEntrega: statusEntrega as any }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(statusPagamento && { statusPagamento: statusPagamento as any }),
    },
    include: pedidoInclude,
    orderBy: { dataPedido: "desc" },
  })

  return NextResponse.json(pedidos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await req.json()
  const { clienteId, itens, statusPagamento, metodoPagamento, observacoes } = body

  if (!clienteId || !itens || itens.length === 0) {
    return NextResponse.json({ error: "clienteId e ao menos um item são obrigatórios" }, { status: 400 })
  }

  if (statusPagamento === "PAGO" && !metodoPagamento) {
    return NextResponse.json({ error: "Método de pagamento obrigatório ao marcar como PAGO" }, { status: 400 })
  }

  const produtoIds: string[] = itens.map((i: { produtoId: string }) => i.produtoId)
  const produtos = await prisma.produto.findMany({ where: { id: { in: produtoIds } } })
  const produtoMap = new Map(produtos.map((p) => [p.id, p]))

  const pedido = await prisma.pedido.create({
    data: {
      clienteId,
      statusPagamento: statusPagamento ?? "PENDENTE",
      metodoPagamento: metodoPagamento ?? null,
      observacoes: observacoes ?? null,
      itens: {
        create: itens.map((item: { produtoId: string; quantidade: number }) => {
          const produto = produtoMap.get(item.produtoId)
          if (!produto) throw new Error(`Produto ${item.produtoId} não encontrado`)
          return {
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            pesoUnit: produto.peso,
            valorUnit: produto.valorUnitario,
          }
        }),
      },
    },
    include: pedidoInclude,
  })

  return NextResponse.json(pedido, { status: 201 })
}
