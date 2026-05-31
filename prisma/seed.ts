import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import bcrypt from "bcryptjs"

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" })
const prisma = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10)

  await prisma.user.upsert({
    where: { email: "admin@racoes.com" },
    update: {},
    create: { name: "Administrador", email: "admin@racoes.com", passwordHash },
  })

  const produtos = [
    { nome: "Ração Premium Cão Adulto 15kg", peso: 15, valorUnitario: 89.9 },
    { nome: "Ração Gato Filhote 10kg", peso: 10, valorUnitario: 74.5 },
    { nome: "Ração Frango e Arroz 20kg", peso: 20, valorUnitario: 112.0 },
    { nome: "Ração Bovina Premium 25kg", peso: 25, valorUnitario: 134.0 },
    { nome: "Petisco Ossinho 500g", peso: 0.5, valorUnitario: 12.9 },
  ]

  for (const p of produtos) {
    await prisma.produto.create({ data: p }).catch(() => {})
  }

  const clientes = [
    { nome: "Mercado Silva", telefone: "5399991111", cidade: "Arroio Grande" },
    { nome: "Pet Shop Bonito", telefone: "5399992222", cidade: "Arroio Grande" },
    { nome: "Fazenda São João", telefone: "5399993333", cidade: "Jaguarão" },
    { nome: "Agro Müller", telefone: "5399994444", cidade: "Jaguarão" },
  ]

  for (const c of clientes) {
    await prisma.cliente.create({ data: c }).catch(() => {})
  }

  await prisma.veiculo.upsert({
    where: { placa: "IQE1234" },
    update: {},
    create: { placa: "IQE1234", modelo: "Iveco Daily", pesoMaximo: 500 },
  })

  console.log("Seed complete. Login: admin@racoes.com / admin123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
