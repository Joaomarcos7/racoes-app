import { describe, it, expect } from "vitest"
import {
  padEnd,
  truncate,
  formatarLinhaProduto,
  formatarLinhaProdutoRota,
  calcularSubtotal,
  calcularTotal,
  formatarDataEmissao,
  gerarScriptImpressao,
  LINHA_WIDTH,
} from "@/lib/cupom-fiscal-utils"

describe("padEnd", () => {
  it("pads string to exact width with spaces on the right", () => {
    expect(padEnd("ABC", 6)).toBe("ABC   ")
  })

  it("returns string unchanged when already at width", () => {
    expect(padEnd("ABCDEF", 6)).toBe("ABCDEF")
  })

  it("truncates string when longer than width", () => {
    expect(padEnd("ABCDEFGH", 6)).toBe("ABCDEF")
  })
})

describe("truncate", () => {
  it("returns string unchanged when shorter than max", () => {
    expect(truncate("ABC", 6)).toBe("ABC")
  })

  it("truncates to max length", () => {
    expect(truncate("ABCDEFGH", 6)).toBe("ABCDEF")
  })
})

describe("formatarLinhaProduto", () => {
  it("formats product line within 42 chars", () => {
    const linha = formatarLinhaProduto("Ração Premium", 25, 2, 180)
    expect(linha.length).toBeLessThanOrEqual(LINHA_WIDTH)
  })

  it("includes product name, weight, quantity and total", () => {
    const linha = formatarLinhaProduto("Ração Premium", 25, 2, 180)
    expect(linha).toContain("25kg")
    expect(linha).toContain("2")
    expect(linha).toContain("180")
  })

  it("truncates long product names to fit in 42 chars", () => {
    const linha = formatarLinhaProduto("Nome Muito Longo De Produto Especial Super", 10, 1, 50)
    expect(linha.length).toBeLessThanOrEqual(LINHA_WIDTH)
  })

  it("keeps KG column at the same position regardless of total amount", () => {
    const linha1 = formatarLinhaProduto("Produto", 5, 1, 10)
    const linha2 = formatarLinhaProduto("Produto", 5, 1, 1000)
    const kgPos1 = linha1.indexOf("5kg")
    const kgPos2 = linha2.indexOf("5kg")
    expect(kgPos1).toBe(kgPos2)
  })

  it("produces lines of exactly LINHA_WIDTH chars", () => {
    const linha1 = formatarLinhaProduto("Produto", 5, 1, 10)
    const linha2 = formatarLinhaProduto("Produto", 5, 1, 9999.99)
    expect(linha1.length).toBe(LINHA_WIDTH)
    expect(linha2.length).toBe(LINHA_WIDTH)
  })
})

describe("calcularSubtotal", () => {
  it("sums all item quantities times valorUnit", () => {
    const itens = [
      { quantidade: 2, valorUnit: 90 },
      { quantidade: 1, valorUnit: 50 },
    ]
    expect(calcularSubtotal(itens)).toBe(230)
  })

  it("returns 0 for empty items", () => {
    expect(calcularSubtotal([])).toBe(0)
  })
})

describe("calcularTotal", () => {
  it("subtracts desconto from subtotal", () => {
    expect(calcularTotal(270, 10)).toBe(260)
  })

  it("returns subtotal when desconto is 0", () => {
    expect(calcularTotal(270, 0)).toBe(270)
  })

  it("never returns negative total", () => {
    expect(calcularTotal(10, 999)).toBe(0)
  })
})

describe("formatarDataEmissao", () => {
  it("formats date as DD/MM/AAAA HH:MM in pt-BR", () => {
    const date = new Date("2026-06-05T14:32:00")
    const result = formatarDataEmissao(date)
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/)
  })
})

describe("gerarScriptImpressao", () => {
  it("includes window.print() call", () => {
    const script = gerarScriptImpressao("/pedidos")
    expect(script).toContain("window.print()")
  })

  it("adds afterprint event listener that redirects to given URL", () => {
    const script = gerarScriptImpressao("/pedidos")
    expect(script).toContain("afterprint")
    expect(script).toContain("/pedidos")
    expect(script).toContain("window.location")
  })

  it("uses the provided redirect URL, not a hardcoded one", () => {
    const script = gerarScriptImpressao("/outra-pagina")
    expect(script).toContain("/outra-pagina")
    expect(script).not.toContain("/pedidos")
  })
})

describe("formatarLinhaProdutoRota", () => {
  it("linha tem exatamente LINHA_WIDTH caracteres", () => {
    const linha = formatarLinhaProdutoRota("Ração 25kg Premiatta", 10, 250)
    expect(linha.length).toBe(LINHA_WIDTH)
  })

  it("contém nome do produto", () => {
    const linha = formatarLinhaProdutoRota("Ração 25kg", 5, 125)
    expect(linha).toContain("Ra") // início do nome presente
  })

  it("contém quantidade formatada", () => {
    const linha = formatarLinhaProdutoRota("Produto X", 20, 400)
    expect(linha).toContain("20")
  })

  it("contém peso total formatado em kg", () => {
    const linha = formatarLinhaProdutoRota("Produto X", 5, 125.5)
    expect(linha).toContain("125")
  })

  it("trunca nome longo sem estourar largura", () => {
    const nomeGrande = "Ração Premium Super Especial 40kg Saco Grande"
    const linha = formatarLinhaProdutoRota(nomeGrande, 3, 120)
    expect(linha.length).toBe(LINHA_WIDTH)
  })
})
