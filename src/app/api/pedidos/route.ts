import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { normalizeNome } from "@/lib/cliente-utils"
import { validateItensPedido, calcularValorPesoVariavel } from "@/lib/pedido-utils"
import { parsePaginationParams, buildPaginationMeta } from "@/lib/pagination-utils"

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
  const tipoPedido = req.nextUrl.searchParams.get("tipoPedido")
  const { page, limit } = parsePaginationParams(req.nextUrl.searchParams)

  const where = {
    ativo: true,
    ...(search && { cliente: { nome: { contains: search } } }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(statusEntrega && { statusEntrega: statusEntrega as any }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(statusPagamento && { statusPagamento: statusPagamento as any }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(tipoPedido && { tipoPedido: tipoPedido as any }),
  }

  const [total, data] = await Promise.all([
    prisma.pedido.count({ where }),
    prisma.pedido.findMany({ where, include: pedidoInclude, orderBy: { dataPedido: "desc" }, skip: (page - 1) * limit, take: limit }),
  ])

  return NextResponse.json({ data, ...buildPaginationMeta({ total, page, limit }) })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await req.json()
  const { tipoPedido = "ENTREGA", itens, statusPagamento, metodoPagamento, observacoes, dataVencimentoFiado, desconto } = body

  if (!itens || itens.length === 0) {
    return NextResponse.json({ error: "Ao menos um item é obrigatório" }, { status: 400 })
  }

  if (statusPagamento === "PAGO" && !metodoPagamento) {
    return NextResponse.json({ error: "Método de pagamento obrigatório ao marcar como PAGO" }, { status: 400 })
  }

  if (statusPagamento === "FIADO" && !dataVencimentoFiado) {
    return NextResponse.json({ error: "Data de vencimento obrigatória para pagamento Fiado" }, { status: 400 })
  }

  let clienteId: string | null = null

  if (tipoPedido === "ENTREGA") {
    const { clienteNome, clienteCidade } = body
    if (!clienteNome || !clienteCidade) {
      return NextResponse.json({ error: "Nome e cidade do cliente são obrigatórios para pedido de entrega" }, { status: 400 })
    }

    const nomeNorm = normalizeNome(clienteNome)
    const existing = await prisma.cliente.findFirst({
      where: {
        ativo: true,
        cidade: clienteCidade.trim(),
      },
    })

    if (existing && normalizeNome(existing.nome) === nomeNorm) {
      clienteId = existing.id
    } else {
      const novo = await prisma.cliente.create({
        data: { nome: clienteNome.trim(), cidade: clienteCidade.trim() },
      })
      clienteId = novo.id
    }
  } else {
    clienteId = body.clienteId ?? null
  }

  const produtoIds: string[] = itens.map((i: { produtoId: string }) => i.produtoId)
  const produtos = await prisma.produto.findMany({ where: { id: { in: produtoIds } } })
  const produtoMap = new Map(produtos.map((p) => [p.id, p]))

  const itemError = validateItensPedido(itens, produtoMap)
  if (itemError) {
    return NextResponse.json({ error: itemError }, { status: 400 })
  }

  try {
    const pedido = await prisma.pedido.create({
      data: {
        tipoPedido,
        clienteId,
        statusEntrega: tipoPedido === "ENTREGA" ? "AGUARDANDO" : null,
        statusPagamento: statusPagamento ?? "PENDENTE",
        metodoPagamento: metodoPagamento ?? null,
        observacoes: observacoes ?? null,
        dataVencimentoFiado: statusPagamento === "FIADO" && dataVencimentoFiado ? new Date(dataVencimentoFiado) : null,
        desconto: typeof desconto === "number" && desconto > 0 ? desconto : 0,
        itens: {
          create: itens.map((item: { produtoId: string; quantidade: number; pesoVariavelKg?: number }) => {
            const produto = produtoMap.get(item.produtoId)!
            if (item.pesoVariavelKg != null) {
              return {
                produtoId: item.produtoId,
                quantidade: 1,
                pesoUnit: item.pesoVariavelKg,
                valorUnit: calcularValorPesoVariavel(item.pesoVariavelKg, produto.valorUnitario, produto.peso),
              }
            }
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
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[POST /api/pedidos]", e)
    return NextResponse.json({ error: "Erro interno ao criar pedido", detail: msg }, { status: 500 })
  }
}
