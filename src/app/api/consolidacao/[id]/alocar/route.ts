import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { calcularStatusAlocacao, calcularPesoAlocado, validarPesoAlocacao, calcularDisponivelParaAlocacao } from "@/lib/consolidacao-utils"

interface AlocacaoItem { itemPedidoId: string; quantidadeAlocada: number }

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  try {
    const { id } = await params
    const { pedidoId, alocacoes, force } = await req.json() as { pedidoId: string; alocacoes: AlocacaoItem[]; force?: boolean }

    if (!pedidoId) return NextResponse.json({ error: "pedidoId obrigatório" }, { status: 400 })
    if (!Array.isArray(alocacoes) || alocacoes.length === 0)
      return NextResponse.json({ error: "alocacoes obrigatório" }, { status: 400 })

    const rota = await prisma.consolidacaoRota.findUnique({
      where: { id },
      include: {
        veiculo: true,
        itens: { include: { detalhes: { include: { itemPedido: true } } } },
      },
    })

    if (!rota) return NextResponse.json({ error: "Rota não encontrada" }, { status: 404 })
    if (rota.status === "FECHADA") return NextResponse.json({ error: "Rota já está fechada" }, { status: 400 })

    const jaAlocado = rota.itens.some((ci) => ci.pedidoId === pedidoId)
    if (jaAlocado) return NextResponse.json({ error: "Pedido já alocado nesta rota" }, { status: 400 })

    const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId }, include: { itens: true } })
    if (!pedido) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })

    // Validate alocacoes against available quantities using status-aware logic
    for (const aloc of alocacoes) {
      const item = pedido.itens.find((i) => i.id === aloc.itemPedidoId)
      if (!item) return NextResponse.json({ error: `Item ${aloc.itemPedidoId} não encontrado no pedido` }, { status: 400 })
      const available = calcularDisponivelParaAlocacao(pedido.statusEntrega, item.quantidade, item.quantidadeRestante)
      if (available === 0)
        return NextResponse.json({ error: `Item ${item.id} já entregue integralmente — não pode ser alocado novamente` }, { status: 400 })
      if (aloc.quantidadeAlocada < 1 || aloc.quantidadeAlocada > available)
        return NextResponse.json({ error: `Quantidade inválida para item ${item.id}: deve ser entre 1 e ${available}` }, { status: 400 })
    }

    // Calculate peso from alocacoes
    const alocacoesComPeso = alocacoes.map((aloc) => {
      const item = pedido.itens.find((i) => i.id === aloc.itemPedidoId)!
      return { quantidadeAlocada: aloc.quantidadeAlocada, pesoUnit: item.pesoUnit }
    })
    const pesoPedido = calcularPesoAlocado(alocacoesComPeso)

    // Calculate current route peso from existing detalhes
    const pesoAtual = rota.itens.reduce((acc, ci) => {
      return acc + calcularPesoAlocado(ci.detalhes.map((d) => ({ quantidadeAlocada: d.quantidadeAlocada, pesoUnit: d.itemPedido.pesoUnit })))
    }, 0)

    const overload = validarPesoAlocacao(pesoAtual, pesoPedido, rota.veiculo.pesoMaximo)
    if (overload && !force) {
      return NextResponse.json(
        { error: `Peso excede capacidade do veículo em ${overload.excesso.toFixed(1)} kg`, pesoExcedido: true, excesso: overload.excesso },
        { status: 400 }
      )
    }

    // Determine if allocation is partial (some item allocated < its available)
    // Also check if there are items with available > 0 not included in alocacoes
    const itensComRestante = pedido.itens.filter((item) =>
      calcularDisponivelParaAlocacao(pedido.statusEntrega, item.quantidade, item.quantidadeRestante) > 0
    )
    const isAlocacaoParcial =
      itensComRestante.some((item) => !alocacoes.find((a) => a.itemPedidoId === item.id)) ||
      alocacoes.some((aloc) => {
        const item = pedido.itens.find((i) => i.id === aloc.itemPedidoId)!
        const available = calcularDisponivelParaAlocacao(pedido.statusEntrega, item.quantidade, item.quantidadeRestante)
        return aloc.quantidadeAlocada < available
      })

    const novoStatus = calcularStatusAlocacao(pedido.statusEntrega, isAlocacaoParcial)

    await prisma.$transaction(async (tx) => {
      const ci = await tx.consolidacaoItem.create({ data: { consolidacaoRotaId: id, pedidoId } })

      // Create detalhes and update quantidadeRestante per item
      for (const aloc of alocacoes) {
        const item = pedido.itens.find((i) => i.id === aloc.itemPedidoId)!
        const available = calcularDisponivelParaAlocacao(pedido.statusEntrega, item.quantidade, item.quantidadeRestante)
        const novoRestante = available - aloc.quantidadeAlocada

        await tx.consolidacaoItemDetalhe.create({
          data: { consolidacaoItemId: ci.id, itemPedidoId: aloc.itemPedidoId, quantidadeAlocada: aloc.quantidadeAlocada },
        })

        await tx.itemPedido.update({ where: { id: aloc.itemPedidoId }, data: { quantidadeRestante: novoRestante } })
      }

      if (novoStatus) {
        await tx.pedido.update({ where: { id: pedidoId }, data: { statusEntrega: novoStatus } })
      }
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[POST /api/consolidacao/alocar]", e)
    return NextResponse.json({ error: "Erro interno ao alocar pedido" }, { status: 500 })
  }
}
