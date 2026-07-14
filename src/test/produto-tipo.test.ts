import { describe, it, expect } from "vitest"
import { labelTipoProduto, TIPOS_PRODUTO, tipoProdutoParaPedido } from "@/lib/produto-utils"

describe("labelTipoProduto", () => {
  it("returns label for CONSUMIDOR_FINAL", () => {
    expect(labelTipoProduto("CONSUMIDOR_FINAL")).toBe("Consumidor Final")
  })

  it("returns label for ATACADO", () => {
    expect(labelTipoProduto("ATACADO")).toBe("Atacado")
  })

  it("returns the key itself for unknown type", () => {
    expect(labelTipoProduto("DESCONHECIDO")).toBe("DESCONHECIDO")
  })
})

describe("tipoProdutoParaPedido", () => {
  it("ENTREGA retorna ATACADO", () => {
    expect(tipoProdutoParaPedido("ENTREGA")).toBe("ATACADO")
  })

  it("BALCAO retorna CONSUMIDOR_FINAL", () => {
    expect(tipoProdutoParaPedido("BALCAO")).toBe("CONSUMIDOR_FINAL")
  })
})

describe("TIPOS_PRODUTO", () => {
  it("includes CONSUMIDOR_FINAL and ATACADO", () => {
    const values = TIPOS_PRODUTO.map((t) => t.value)
    expect(values).toContain("CONSUMIDOR_FINAL")
    expect(values).toContain("ATACADO")
  })

  it("each entry has value and label", () => {
    TIPOS_PRODUTO.forEach((t) => {
      expect(t.value).toBeTruthy()
      expect(t.label).toBeTruthy()
    })
  })
})
