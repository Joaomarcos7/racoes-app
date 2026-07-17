import { describe, it, expect } from "vitest"
import {
  padEnd,
  truncate,
  formatarLinhaProduto,
  headerLinhaProduto,
  formatarLinhaProdutoRota,
  headerLinhaProdutoRota,
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
  it("is exactly LINHA_WIDTH chars (single line)", () => {
    expect(formatarLinhaProduto("Produto", 25, 3, 100).length).toBe(LINHA_WIDTH)
    expect(formatarLinhaProduto("Produto", 5, 1, 9999.99).length).toBe(LINHA_WIDTH)
  })

  it("no newline — single line", () => {
    expect(formatarLinhaProduto("Produto", 25, 3, 100)).not.toContain("\n")
  })

  it("starts with product name", () => {
    expect(formatarLinhaProduto("Racao", 25, 3, 100)).toContain("Racao")
  })

  it("truncates long names to fit LINHA_WIDTH", () => {
    const linha = formatarLinhaProduto("Nome Muito Longo De Produto Especial Super Extra", 10, 1, 50)
    expect(linha.length).toBe(LINHA_WIDTH)
    expect(linha).not.toContain("\n")
  })

  it("TOTAL is flush at extreme right", () => {
    expect(formatarLinhaProduto("Produto", 5, 1, 300).endsWith("R$300,00")).toBe(true)
  })

  it("TOTAL position fixed regardless of KG or QT value", () => {
    const a = formatarLinhaProduto("Produto", 5, 1, 300)
    const b = formatarLinhaProduto("Produto", 100, 999, 300)
    expect(a.lastIndexOf("R$300,00")).toBe(b.lastIndexOf("R$300,00"))
  })

  it("KG ends at same position regardless of product name", () => {
    const a = formatarLinhaProduto("A", 25, 1, 100)
    const b = formatarLinhaProduto("Nome Muito Longo Produto", 25, 1, 100)
    expect(a.indexOf("25kg") + 4).toBe(b.indexOf("25kg") + 4)
  })

  it("QT ends at same position regardless of KG value", () => {
    const a = formatarLinhaProduto("Produto", 5, 3, 100)
    const b = formatarLinhaProduto("Produto", 100, 3, 100)
    const pipeA = a.lastIndexOf("|")
    const pipeB = b.lastIndexOf("|")
    expect(pipeA).toBe(pipeB)
  })

  it("has exactly 2 ' | ' separators", () => {
    const count = (formatarLinhaProduto("Produto", 25, 3, 100).match(/ \| /g) ?? []).length
    expect(count).toBe(2)
  })
})

describe("headerLinhaProduto", () => {
  it("is exactly LINHA_WIDTH chars (single line)", () => {
    expect(headerLinhaProduto().length).toBe(LINHA_WIDTH)
  })

  it("no newline — single line", () => {
    expect(headerLinhaProduto()).not.toContain("\n")
  })

  it("contém labels KG, QT e TOTAL", () => {
    const h = headerLinhaProduto()
    expect(h).toContain("KG")
    expect(h).toContain("QT")
    expect(h).toContain("TOTAL")
  })

  it("TOTAL label flush at extreme right", () => {
    expect(headerLinhaProduto().endsWith("TOTAL")).toBe(true)
  })

  it("has exactly 2 ' | ' separators", () => {
    const count = (headerLinhaProduto().match(/ \| /g) ?? []).length
    expect(count).toBe(2)
  })

  it("pipes do header nas mesmas posições que os das linhas de dados", () => {
    const header = headerLinhaProduto()
    const linha = formatarLinhaProduto("Produto", 5, 1, 100)
    const headerPipes = [...header.matchAll(/\|/g)].map((m) => m.index!)
    const linhaPipes = [...linha.matchAll(/\|/g)].map((m) => m.index!)
    expect(headerPipes).toEqual(linhaPipes)
  })

  it("KG label ends at same position as KG data", () => {
    const header = headerLinhaProduto()
    const linha = formatarLinhaProduto("Produto", 25, 1, 100)
    expect(header.indexOf("KG") + 2).toBe(linha.indexOf("25kg") + 4)
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

describe("headerLinhaProdutoRota", () => {
  it("header tem exatamente LINHA_WIDTH caracteres", () => {
    expect(headerLinhaProdutoRota().length).toBe(LINHA_WIDTH)
  })

  it("header contém QTD e PESO", () => {
    const header = headerLinhaProdutoRota()
    expect(header).toContain("QTD")
    expect(header).toContain("PESO")
  })

  it("uses '  |  ' (double-space each side) as separator", () => {
    const count = (headerLinhaProdutoRota().match(/  \|  /g) ?? []).length
    expect(count).toBe(2)
  })

  it("pipes do header nas mesmas posições que os das linhas de dados", () => {
    const header = headerLinhaProdutoRota()
    const linha = formatarLinhaProdutoRota("Ração 25kg", 5, 125)
    const headerPipes = [...header.matchAll(/\|/g)].map((m) => m.index!)
    const linhaPipes = [...linha.matchAll(/\|/g)].map((m) => m.index!)
    expect(headerPipes).toEqual(linhaPipes)
  })

  it("PESO label flush at extreme right", () => {
    expect(headerLinhaProdutoRota().endsWith("PESO")).toBe(true)
  })
})

describe("formatarLinhaProdutoRota", () => {
  it("linha tem exatamente LINHA_WIDTH caracteres", () => {
    expect(formatarLinhaProdutoRota("Ração 25kg Premiatta", 10, 250).length).toBe(LINHA_WIDTH)
  })

  it("uses '  |  ' (double-space each side) as separator", () => {
    const count = (formatarLinhaProdutoRota("Produto X", 5, 125).match(/  \|  /g) ?? []).length
    expect(count).toBe(2)
  })

  it("contém quantidade formatada", () => {
    expect(formatarLinhaProdutoRota("Produto X", 20, 400)).toContain("20")
  })

  it("PESO is flush at extreme right", () => {
    expect(formatarLinhaProdutoRota("Produto X", 5, 125.5).endsWith("125.5kg")).toBe(true)
  })

  it("first pipe at same position regardless of name length", () => {
    const a = formatarLinhaProdutoRota("Curto", 5, 100)
    const b = formatarLinhaProdutoRota("Nome Muito Longo De Produto Especial", 5, 100)
    expect(a.indexOf("|")).toBe(b.indexOf("|"))
  })

  it("PRODUTO starts at position 0", () => {
    expect(formatarLinhaProdutoRota("Racao", 5, 100)[0]).toBe("R")
  })

  it("trunca nome longo sem estourar largura", () => {
    const linha = formatarLinhaProdutoRota("Ração Premium Super Especial 40kg Saco Grande", 3, 120)
    expect(linha.length).toBe(LINHA_WIDTH)
  })
})
