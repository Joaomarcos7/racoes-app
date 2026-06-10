import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { shouldGerarNotificacaoFiado, buildFiadoNotificacaoTexto, jaExisteNotificacaoFiado } from "@/lib/notificacao-utils"

async function gerarNotificacoesFiadoVencido() {
  const [pedidosFiadoVencidos, notificacoesExistentes] = await Promise.all([
    prisma.pedido.findMany({
      where: { ativo: true, statusPagamento: "FIADO", dataVencimentoFiado: { not: null } },
      include: { cliente: true },
    }),
    prisma.notificacao.findMany({
      where: { tipo: "FIADO_VENCIDO" },
      select: { pedidoId: true, tipo: true },
    }),
  ])

  for (const pedido of pedidosFiadoVencidos) {
    if (!shouldGerarNotificacaoFiado({ statusPagamento: pedido.statusPagamento, dataVencimentoFiado: pedido.dataVencimentoFiado })) continue
    if (jaExisteNotificacaoFiado(notificacoesExistentes, pedido.id)) continue

    const clienteNome = pedido.cliente?.nome ?? "Cliente"
    await prisma.notificacao.create({
      data: {
        tipo: "FIADO_VENCIDO",
        texto: buildFiadoNotificacaoTexto({ clienteNome, dataVencimento: pedido.dataVencimentoFiado! }),
        pedidoId: pedido.id,
      },
    })
  }
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  await gerarNotificacoesFiadoVencido()

  const notificacoes = await prisma.notificacao.findMany({
    where: { lida: false },
    orderBy: { criadoEm: "desc" },
  })

  return NextResponse.json({ data: notificacoes, total: notificacoes.length })
}
