import { describe, it, expect } from "vitest"
import { filtrarClientes, ordenarClientes } from "@/lib/cliente-utils"

const clientes = [
  { id: "1", nome: "Zé da Silva", cidade: "Florianópolis" },
  { id: "2", nome: "Ana Souza", cidade: "Joinville" },
  { id: "3", nome: "Bruno Lima", cidade: "Florianópolis" },
  { id: "4", nome: "Carla Melo", cidade: "Blumenau" },
]

describe("filtrarClientes", () => {
  it("retorna todos quando cidade vazia", () => {
    expect(filtrarClientes(clientes, "")).toHaveLength(4)
  })

  it("filtra por cidade exata (case insensitive)", () => {
    const result = filtrarClientes(clientes, "florianópolis")
    expect(result).toHaveLength(2)
    expect(result.map((c) => c.id)).toEqual(["1", "3"])
  })

  it("filtra por cidade parcial", () => {
    const result = filtrarClientes(clientes, "join")
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("2")
  })

  it("retorna vazio quando cidade nao existe", () => {
    expect(filtrarClientes(clientes, "Curitiba")).toHaveLength(0)
  })
})

describe("ordenarClientes", () => {
  it("ordena por nome asc", () => {
    const result = ordenarClientes(clientes, "nome", "asc")
    expect(result.map((c) => c.nome)).toEqual(["Ana Souza", "Bruno Lima", "Carla Melo", "Zé da Silva"])
  })

  it("ordena por nome desc", () => {
    const result = ordenarClientes(clientes, "nome", "desc")
    expect(result.map((c) => c.nome)).toEqual(["Zé da Silva", "Carla Melo", "Bruno Lima", "Ana Souza"])
  })

  it("ordena por cidade asc", () => {
    const result = ordenarClientes(clientes, "cidade", "asc")
    expect(result[0].cidade).toBe("Blumenau")
    expect(result[result.length - 1].cidade).toBe("joinville".toLocaleLowerCase() > "florianópolis".toLocaleLowerCase() ? "Joinville" : "Florianópolis")
  })

  it("ordena por cidade desc", () => {
    const result = ordenarClientes(clientes, "cidade", "desc")
    expect(result[0].cidade).toBe("Joinville")
  })

  it("nao muta array original", () => {
    const original = [...clientes]
    ordenarClientes(clientes, "nome", "desc")
    expect(clientes).toEqual(original)
  })
})
