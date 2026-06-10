import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import bcrypt from "bcryptjs"

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" })
const prisma = new PrismaClient({ adapter })

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(10 + Math.floor(Math.random() * 8), 0, 0, 0)
  return d
}

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10)

  await prisma.user.upsert({
    where: { email: "admin@racoes.com" },
    update: {},
    create: { name: "Administrador", email: "admin@racoes.com", passwordHash },
  })

  const [p1, p2, p3, p4, p5] = await Promise.all([
    prisma.produto.create({ data: { nome: "Ração Premium Cão Adulto 15kg", peso: 15, valorUnitario: 89.9 } }),
    prisma.produto.create({ data: { nome: "Ração Gato Filhote 10kg", peso: 10, valorUnitario: 74.5 } }),
    prisma.produto.create({ data: { nome: "Ração Frango e Arroz 20kg", peso: 20, valorUnitario: 112.0 } }),
    prisma.produto.create({ data: { nome: "Ração Bovina Premium 25kg", peso: 25, valorUnitario: 134.0 } }),
    prisma.produto.create({ data: { nome: "Petisco Ossinho 500g", peso: 0.5, valorUnitario: 12.9 } }),
  ])

  const [c1, c2, c3, c4, c5] = await Promise.all([
    prisma.cliente.create({ data: { nome: "Mercado Silva", telefone: "5399991111", cidade: "Arroio Grande" } }),
    prisma.cliente.create({ data: { nome: "Pet Shop Bonito", telefone: "5399992222", cidade: "Arroio Grande" } }),
    prisma.cliente.create({ data: { nome: "Fazenda São João", telefone: "5399993333", cidade: "Jaguarão" } }),
    prisma.cliente.create({ data: { nome: "Agro Müller", telefone: "5399994444", cidade: "Jaguarão" } }),
    prisma.cliente.create({ data: { nome: "Granja Esperança", telefone: "5399995555", cidade: "Pelotas" } }),
  ])

  await prisma.veiculo.upsert({ where: { placa: "IQE1234" }, update: {}, create: { placa: "IQE1234", modelo: "Iveco Daily", pesoMaximo: 500 } })
  await prisma.veiculo.upsert({ where: { placa: "RST5678" }, update: {}, create: { placa: "RST5678", modelo: "VW Delivery", pesoMaximo: 800 } })

  const pedidosSeed: {
    clienteId?: string
    tipoPedido: "ENTREGA" | "BALCAO"
    statusPagamento: "PAGO" | "PENDENTE" | "FIADO"
    metodoPagamento?: "DINHEIRO" | "PIX" | "BOLETO" | "CHEQUE" | "CARTAO_CREDITO" | "CARTAO_DEBITO"
    statusEntrega?: "AGUARDANDO" | "EM_ROTA" | "ENTREGUE"
    dataPedido: Date
    desconto?: number
    dataVencimentoFiado?: Date
    itens: { produtoId: string; quantidade: number; valorUnit: number; pesoUnit: number }[]
  }[] = [
    // --- HOJE ---
    {
      tipoPedido: "ENTREGA", clienteId: c1.id,
      statusPagamento: "PAGO", metodoPagamento: "PIX", statusEntrega: "ENTREGUE",
      dataPedido: daysAgo(0),
      itens: [{ produtoId: p1.id, quantidade: 3, valorUnit: p1.valorUnitario, pesoUnit: p1.peso }, { produtoId: p5.id, quantidade: 5, valorUnit: p5.valorUnitario, pesoUnit: p5.peso }],
    },
    {
      tipoPedido: "BALCAO", clienteId: c2.id,
      statusPagamento: "PAGO", metodoPagamento: "CARTAO_DEBITO",
      dataPedido: daysAgo(0),
      itens: [{ produtoId: p2.id, quantidade: 2, valorUnit: p2.valorUnitario, pesoUnit: p2.peso }],
    },
    {
      tipoPedido: "ENTREGA", clienteId: c3.id,
      statusPagamento: "FIADO", statusEntrega: "EM_ROTA",
      dataPedido: daysAgo(0),
      dataVencimentoFiado: new Date(Date.now() + 15 * 86400000),
      itens: [{ produtoId: p4.id, quantidade: 4, valorUnit: p4.valorUnitario, pesoUnit: p4.peso }],
    },
    // --- ONTEM ---
    {
      tipoPedido: "BALCAO", clienteId: c1.id,
      statusPagamento: "PAGO", metodoPagamento: "DINHEIRO",
      dataPedido: daysAgo(1),
      itens: [{ produtoId: p3.id, quantidade: 2, valorUnit: p3.valorUnitario, pesoUnit: p3.peso }, { produtoId: p1.id, quantidade: 1, valorUnit: p1.valorUnitario, pesoUnit: p1.peso }],
    },
    {
      tipoPedido: "ENTREGA", clienteId: c4.id,
      statusPagamento: "PAGO", metodoPagamento: "BOLETO", statusEntrega: "ENTREGUE",
      dataPedido: daysAgo(1), desconto: 20,
      itens: [{ produtoId: p4.id, quantidade: 2, valorUnit: p4.valorUnitario, pesoUnit: p4.peso }, { produtoId: p3.id, quantidade: 1, valorUnit: p3.valorUnitario, pesoUnit: p3.peso }],
    },
    // --- 3 DIAS ATRÁS ---
    {
      tipoPedido: "ENTREGA", clienteId: c5.id,
      statusPagamento: "FIADO", statusEntrega: "ENTREGUE",
      dataPedido: daysAgo(3),
      dataVencimentoFiado: new Date(Date.now() - 2 * 86400000),
      itens: [{ produtoId: p3.id, quantidade: 5, valorUnit: p3.valorUnitario, pesoUnit: p3.peso }],
    },
    {
      tipoPedido: "BALCAO", clienteId: c2.id,
      statusPagamento: "PAGO", metodoPagamento: "CARTAO_CREDITO",
      dataPedido: daysAgo(3),
      itens: [{ produtoId: p2.id, quantidade: 1, valorUnit: p2.valorUnitario, pesoUnit: p2.peso }, { produtoId: p5.id, quantidade: 10, valorUnit: p5.valorUnitario, pesoUnit: p5.peso }],
    },
    // --- 7 DIAS ATRÁS ---
    {
      tipoPedido: "ENTREGA", clienteId: c1.id,
      statusPagamento: "PAGO", metodoPagamento: "PIX", statusEntrega: "ENTREGUE",
      dataPedido: daysAgo(7),
      itens: [{ produtoId: p1.id, quantidade: 6, valorUnit: p1.valorUnitario, pesoUnit: p1.peso }],
    },
    {
      tipoPedido: "BALCAO", clienteId: c4.id,
      statusPagamento: "PENDENTE",
      dataPedido: daysAgo(7),
      itens: [{ produtoId: p3.id, quantidade: 3, valorUnit: p3.valorUnitario, pesoUnit: p3.peso }],
    },
    // --- 15 DIAS ATRÁS ---
    {
      tipoPedido: "ENTREGA", clienteId: c3.id,
      statusPagamento: "PAGO", metodoPagamento: "CHEQUE", statusEntrega: "ENTREGUE",
      dataPedido: daysAgo(15), desconto: 50,
      itens: [{ produtoId: p4.id, quantidade: 8, valorUnit: p4.valorUnitario, pesoUnit: p4.peso }, { produtoId: p1.id, quantidade: 2, valorUnit: p1.valorUnitario, pesoUnit: p1.peso }],
    },
    {
      tipoPedido: "ENTREGA", clienteId: c4.id,
      statusPagamento: "FIADO", statusEntrega: "AGUARDANDO",
      dataPedido: daysAgo(15),
      dataVencimentoFiado: new Date(Date.now() - 5 * 86400000),
      itens: [{ produtoId: p3.id, quantidade: 3, valorUnit: p3.valorUnitario, pesoUnit: p3.peso }],
    },
    // --- 25 DIAS ATRÁS ---
    {
      tipoPedido: "BALCAO", clienteId: c5.id,
      statusPagamento: "PAGO", metodoPagamento: "CARTAO_DEBITO",
      dataPedido: daysAgo(25),
      itens: [{ produtoId: p2.id, quantidade: 4, valorUnit: p2.valorUnitario, pesoUnit: p2.peso }, { produtoId: p5.id, quantidade: 6, valorUnit: p5.valorUnitario, pesoUnit: p5.peso }],
    },
  ]

  for (const p of pedidosSeed) {
    await prisma.pedido.create({
      data: {
        tipoPedido: p.tipoPedido,
        clienteId: p.clienteId,
        statusPagamento: p.statusPagamento,
        metodoPagamento: p.metodoPagamento,
        statusEntrega: p.statusEntrega ?? null,
        dataPedido: p.dataPedido,
        desconto: p.desconto ?? 0,
        dataVencimentoFiado: p.dataVencimentoFiado ?? null,
        itens: { create: p.itens },
      },
    })
  }

  console.log("Seed completo. Login: admin@racoes.com / admin123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
