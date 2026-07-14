import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { shouldRegistrarHistoricoStatus } from "@/lib/pedido-status-utils"
import { validarEdicaoPedido } from "@/lib/pedido-utils"

const pedidoInclude = {
  cliente: true,
  itens: { include: { produto: true } },
  pagamentos: true,
  baixas: { orderBy: { createdAt: "desc" as const } },
  historicoStatus: { orderBy: { criadoEm: "asc" as const } },
  consolidacoes: {
    include: { rota: { include: { veiculo: true } } },
    orderBy: { rota: { data: "asc" as const } },
  },
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const pedido = await prisma.pedido.findUnique({ where: { id }, include: pedidoInclude })
  if (!pedido) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  return NextResponse.json(pedido)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { statusEntrega, statusPagamento, metodoPagamento, observacoes, clienteId, itens, desconto } = body

  if (statusPagamento === "PAGO" && !metodoPagamento) {
    return NextResponse.json({ error: "Método de pagamento obrigatório ao marcar como PAGO" }, { status: 400 })
  }

  const pedidoAtual = await prisma.pedido.findUnique({
    where: { id },
    select: { statusEntrega: true, tipoPedido: true },
  })
  if (!pedidoAtual) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })

  // Se payload contém itens, trata como edição completa de itens
  if (itens !== undefined) {
    const requireCliente = pedidoAtual.tipoPedido === "ENTREGA"
    const erroValidacao = validarEdicaoPedido({ clienteId: clienteId ?? "", itens, requireCliente })
    if (erroValidacao) return NextResponse.json({ error: erroValidacao }, { status: 400 })

    const pedido = await prisma.$transaction(async (tx) => {
      // Deletar itens atuais e recriar
      await tx.itemPedido.deleteMany({ where: { pedidoId: id } })
      await tx.pedido.update({
        where: { id },
        data: {
          ...(clienteId !== undefined && { clienteId }),
          ...(desconto !== undefined && { desconto }),
          ...(observacoes !== undefined && { observacoes }),
          itens: {
            create: itens.map((item: { produtoId: string; quantidade: number; valorUnit: number; pesoUnit: number }) => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              valorUnit: item.valorUnit,
              pesoUnit: item.pesoUnit,
              quantidadeFalta: 0,
            })),
          },
        },
      })
      return tx.pedido.findUnique({ where: { id }, include: pedidoInclude })
    })

    return NextResponse.json(pedido)
  }

  const pedido = await prisma.pedido.update({
    where: { id },
    data: {
      ...(statusEntrega && { statusEntrega }),
      ...(statusPagamento && { statusPagamento }),
      ...(metodoPagamento !== undefined && { metodoPagamento }),
      ...(observacoes !== undefined && { observacoes }),
    },
    include: pedidoInclude,
  })

  if (shouldRegistrarHistoricoStatus(pedidoAtual.statusEntrega, statusEntrega)) {
    await prisma.historicoStatusPedido.create({
      data: {
        pedidoId: id,
        statusAnterior: pedidoAtual.statusEntrega ?? null,
        statusNovo: statusEntrega,
      },
    })
  }

  return NextResponse.json(pedido)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const pedido = await prisma.pedido.update({ where: { id }, data: { ativo: false } })
  return NextResponse.json(pedido)
}
