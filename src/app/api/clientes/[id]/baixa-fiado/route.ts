import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { MetodoPagamento } from "@prisma/client"
import { calcularNovoValorEmAberto, resolverStatusPosBaixa, validarBaixaFiado } from "@/lib/pedido-utils"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id: clienteId } = await params
  const body = await req.json()
  const { pagamentos, metodoPagamento } = body as {
    pagamentos: { pedidoId: string; valor: number }[]
    metodoPagamento: string
  }

  if (!pagamentos || pagamentos.length === 0) {
    return NextResponse.json({ error: "Ao menos um pagamento é obrigatório" }, { status: 400 })
  }
  if (!metodoPagamento) {
    return NextResponse.json({ error: "Método de pagamento obrigatório" }, { status: 400 })
  }

  const pedidoIds = pagamentos.map((p) => p.pedidoId)
  const pedidos = await prisma.pedido.findMany({
    where: { id: { in: pedidoIds }, clienteId, statusPagamento: "FIADO", ativo: true },
  })

  if (pedidos.length !== pedidoIds.length) {
    return NextResponse.json({ error: "Um ou mais pedidos não encontrados ou não são fiado deste cliente" }, { status: 400 })
  }

  const pedidoMap = new Map(pedidos.map((p) => [p.id, p]))

  for (const pag of pagamentos) {
    const pedido = pedidoMap.get(pag.pedidoId)!
    const valorAberto = pedido.valorEmAbertoFiado ?? 0
    const err = validarBaixaFiado(pag.valor, valorAberto)
    if (err) return NextResponse.json({ error: err }, { status: 400 })
  }

  await prisma.$transaction(
    pagamentos.flatMap((pag) => {
      const pedido = pedidoMap.get(pag.pedidoId)!
      const novoValor = calcularNovoValorEmAberto(pedido.valorEmAbertoFiado ?? 0, pag.valor)
      const novoStatus = resolverStatusPosBaixa(novoValor)
      return [
        prisma.baixaFiado.create({
          data: {
            pedidoId: pag.pedidoId,
            valor: pag.valor,
            metodoPagamento: metodoPagamento as MetodoPagamento,
          },
        }),
        prisma.pedido.update({
          where: { id: pag.pedidoId },
          data: {
            valorEmAbertoFiado: novoValor,
            statusPagamento: novoStatus,
            ...(novoStatus === "PAGO" ? { metodoPagamento: metodoPagamento as MetodoPagamento } : {}),
          },
        }),
      ]
    })
  )

  return NextResponse.json({ ok: true })
}
