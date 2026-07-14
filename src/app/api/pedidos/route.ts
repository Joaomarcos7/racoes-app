import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { MetodoPagamento } from "@prisma/client"
import { auth } from "@/lib/auth"
import { validateItensPedido, calcularValorPesoVariavel, calcularValorEmAberto, validarAdiantadoFiado, resolverValorUnitItem, validarPagamentosMultiplos } from "@/lib/pedido-utils"
import { parsePaginationParams, buildPaginationMeta } from "@/lib/pagination-utils"

const pedidoInclude = {
  cliente: true,
  itens: { include: { produto: true } },
  pagamentos: true,
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
  const { tipoPedido = "ENTREGA", itens, statusPagamento, metodoPagamento, pagamentos: pagamentosBody, observacoes, dataVencimentoFiado, desconto, tipoFiado, valorAdiantadoFiado } = body
  // pagamentosBody: [{ metodo: string, valor: number }] — multi-method; takes precedence over metodoPagamento

  if (!itens || itens.length === 0) {
    return NextResponse.json({ error: "Ao menos um item é obrigatório" }, { status: 400 })
  }

  const usandoPagamentosMultiplos = Array.isArray(pagamentosBody) && pagamentosBody.length > 0

  if (statusPagamento === "PAGO" && !usandoPagamentosMultiplos && !metodoPagamento) {
    return NextResponse.json({ error: "Método de pagamento obrigatório ao marcar como PAGO" }, { status: 400 })
  }

  if (statusPagamento === "FIADO" && !dataVencimentoFiado) {
    return NextResponse.json({ error: "Data de vencimento obrigatória para pagamento Fiado" }, { status: 400 })
  }

  if (statusPagamento === "FIADO" && !tipoFiado) {
    return NextResponse.json({ error: "Tipo de fiado (INTEGRAL ou PARCIAL) obrigatório" }, { status: 400 })
  }

  let clienteId: string | null = null

  if (tipoPedido === "ENTREGA") {
    const cid = body.clienteId
    if (!cid) {
      return NextResponse.json({ error: "Cliente cadastrado obrigatório para pedido de entrega" }, { status: 400 })
    }
    const cliente = await prisma.cliente.findFirst({ where: { id: cid, ativo: true } })
    if (!cliente) {
      return NextResponse.json({ error: "Cliente não encontrado ou inativo" }, { status: 400 })
    }
    clienteId = cliente.id
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

  // pre-compute item values to calculate totalPedido for fiado
  const itensComValor = itens.map((item: { produtoId: string; quantidade: number; pesoVariavelKg?: number; valorUnitOverride?: number }) => {
    const produto = produtoMap.get(item.produtoId)!
    const valorBase = resolverValorUnitItem(produto.valorUnitario, item.valorUnitOverride)
    if (item.pesoVariavelKg != null) {
      return { ...item, valorUnit: calcularValorPesoVariavel(item.pesoVariavelKg, valorBase, produto.peso), pesoUnit: item.pesoVariavelKg, quantidadeFinal: 1 }
    }
    return { ...item, valorUnit: valorBase, pesoUnit: produto.peso, quantidadeFinal: item.quantidade }
  })
  const descontoVal = typeof desconto === "number" && desconto > 0 ? desconto : 0
  const subtotal = itensComValor.reduce((acc: number, i: { quantidadeFinal: number; valorUnit: number }) => acc + i.quantidadeFinal * i.valorUnit, 0)
  const totalPedido = Math.max(0, subtotal - descontoVal)
  if (statusPagamento === "FIADO" && tipoFiado === "PARCIAL") {
    const adiantadoErr = validarAdiantadoFiado(valorAdiantadoFiado ?? 0, totalPedido)
    if (adiantadoErr) return NextResponse.json({ error: adiantadoErr }, { status: 400 })
  }

  if (usandoPagamentosMultiplos && statusPagamento === "PAGO") {
    const pagErr = validarPagamentosMultiplos(pagamentosBody, totalPedido)
    if (pagErr) return NextResponse.json({ error: pagErr }, { status: 400 })
  }

  const resolvedValorEmAberto = statusPagamento === "FIADO" ? calcularValorEmAberto(totalPedido, tipoFiado, valorAdiantadoFiado ?? 0) : null
  const metodoPagamentoFinal = usandoPagamentosMultiplos || statusPagamento === "FIADO" ? null : (metodoPagamento ?? null)

  try {
    const pedido = await prisma.pedido.create({
      data: {
        tipoPedido,
        clienteId,
        statusEntrega: tipoPedido === "ENTREGA" ? "AGUARDANDO" : null,
        statusPagamento: statusPagamento ?? "PENDENTE",
        metodoPagamento: metodoPagamentoFinal,
        observacoes: observacoes ?? null,
        dataVencimentoFiado: statusPagamento === "FIADO" && dataVencimentoFiado ? new Date(dataVencimentoFiado) : null,
        tipoFiado: statusPagamento === "FIADO" ? tipoFiado : null,
        valorAdiantadoFiado: statusPagamento === "FIADO" && tipoFiado === "PARCIAL" ? (valorAdiantadoFiado ?? 0) : null,
        valorEmAbertoFiado: resolvedValorEmAberto,
        desconto: descontoVal,
        itens: {
          create: itensComValor.map((item: { produtoId: string; quantidadeFinal: number; pesoUnit: number; valorUnit: number }) => ({
            produtoId: item.produtoId,
            quantidade: item.quantidadeFinal,
            pesoUnit: item.pesoUnit,
            valorUnit: item.valorUnit,
          })),
        },
        ...(usandoPagamentosMultiplos && {
          pagamentos: {
            create: (pagamentosBody as { metodo: string; valor: number }[]).map((p) => ({
              metodo: p.metodo as MetodoPagamento,
              valor: p.valor,
            })),
          },
        }),
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
