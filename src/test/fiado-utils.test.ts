import { describe, it, expect } from "vitest"
import { filtrarClientes, ordenarClientes, paginarClientes } from "@/lib/fiado-utils"

const clientes = [
  { id: "1", nome: "João Silva", cidade: "SP", telefone: null, totalFiado: 500, pedidosFiado: [] },
  { id: "2", nome: "Ana Souza", cidade: "RJ", telefone: null, totalFiado: 1500, pedidosFiado: [] },
  { id: "3", nome: "Carlos Mendes", cidade: "MG", telefone: null, totalFiado: 200, pedidosFiado: [] },
  { id: "4", nome: "Beatriz Lima", cidade: "SP", telefone: null, totalFiado: 800, pedidosFiado: [] },
]

describe("filtrarClientes", () => {
  it("retorna todos quando search vazio", () => {
    expect(filtrarClientes(clientes, "")).toHaveLength(4)
  })

  it("filtra por nome case insensitive", () => {
    const result = filtrarClientes(clientes, "ana")
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("2")
  })

  it("normaliza acentos — 'joao' encontra 'João'", () => {
    const result = filtrarClientes(clientes, "joao")
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("1")
  })

  it("normaliza acentos no termo de busca — 'João' encontra 'joao'", () => {
    const clientesSemAcento = [{ id: "x", nome: "joao silva", cidade: "", telefone: null, totalFiado: 0, pedidosFiado: [] }]
    const result = filtrarClientes(clientesSemAcento, "João")
    expect(result).toHaveLength(1)
  })

  it("retorna vazio quando nenhum nome corresponde", () => {
    expect(filtrarClientes(clientes, "xyz")).toHaveLength(0)
  })

  it("match parcial — 'silva' encontra 'João Silva'", () => {
    const result = filtrarClientes(clientes, "silva")
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("1")
  })
})

describe("ordenarClientes", () => {
  it("ordena por nome ASC", () => {
    const result = ordenarClientes(clientes, "nome", "asc")
    expect(result.map((c) => c.nome)).toEqual(["Ana Souza", "Beatriz Lima", "Carlos Mendes", "João Silva"])
  })

  it("ordena por nome DESC", () => {
    const result = ordenarClientes(clientes, "nome", "desc")
    expect(result.map((c) => c.nome)).toEqual(["João Silva", "Carlos Mendes", "Beatriz Lima", "Ana Souza"])
  })

  it("ordena por totalFiado ASC", () => {
    const result = ordenarClientes(clientes, "totalFiado", "asc")
    expect(result.map((c) => c.totalFiado)).toEqual([200, 500, 800, 1500])
  })

  it("ordena por totalFiado DESC", () => {
    const result = ordenarClientes(clientes, "totalFiado", "desc")
    expect(result.map((c) => c.totalFiado)).toEqual([1500, 800, 500, 200])
  })

  it("não muta o array original", () => {
    const original = [...clientes]
    ordenarClientes(clientes, "nome", "asc")
    expect(clientes).toEqual(original)
  })
})

describe("paginarClientes", () => {
  it("retorna slice da página 1 com limit 2", () => {
    const result = paginarClientes(clientes, 1, 2)
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe("1")
    expect(result[1].id).toBe("2")
  })

  it("retorna slice da página 2 com limit 2", () => {
    const result = paginarClientes(clientes, 2, 2)
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe("3")
    expect(result[1].id).toBe("4")
  })

  it("retorna menos itens na última página incompleta", () => {
    const result = paginarClientes(clientes, 2, 3)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("4")
  })

  it("retorna vazio quando página além do total", () => {
    expect(paginarClientes(clientes, 10, 2)).toHaveLength(0)
  })

  it("retorna todos quando limit maior que total", () => {
    expect(paginarClientes(clientes, 1, 100)).toHaveLength(4)
  })
})
