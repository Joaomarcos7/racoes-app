import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const clientes = await prisma.cliente.findMany({
    where: {
      ativo: true,
      pedidos: {
        some: { statusPagamento: "FIADO", valorEmAbertoFiado: { gt: 0 }, ativo: true },
      },
    },
    include: {
      pedidos: {
        where: { statusPagamento: "FIADO", valorEmAbertoFiado: { gt: 0 }, ativo: true },
        include: { itens: { include: { produto: true } } },
      },
    },
  })

  const result = clientes
    .map((c) => ({
      id: c.id,
      nome: c.nome,
      cidade: c.cidade,
      telefone: c.telefone,
      totalFiado: c.pedidos.reduce((acc, p) => acc + (p.valorEmAbertoFiado ?? 0), 0),
      pedidosFiado: c.pedidos,
    }))
    .sort((a, b) => b.totalFiado - a.totalFiado)

  const totalGeral = result.reduce((acc, c) => acc + c.totalFiado, 0)

  return NextResponse.json({ totalGeral, clientes: result })
}
