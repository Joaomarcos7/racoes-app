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
  it("returns 2 lines separated by newline", () => {
    const result = formatarLinhaProduto("Produto", 25, 3, 100)
    const lines = result.split("\n")
    expect(lines).toHaveLength(2)
  })

  it("line 1 is exactly LINHA_WIDTH chars", () => {
    const [line1] = formatarLinhaProduto("Produto", 25, 3, 100).split("\n")
    expect(line1.length).toBe(LINHA_WIDTH)
  })

  it("line 2 is exactly LINHA_WIDTH chars", () => {
    const [, line2] = formatarLinhaProduto("Produto", 25, 3, 100).split("\n")
    expect(line2.length).toBe(LINHA_WIDTH)
  })

  it("line 1 starts with product name", () => {
    const [line1] = formatarLinhaProduto("Racao", 25, 3, 100).split("\n")
    expect(line1).toContain("Racao")
  })

  it("line 1 truncates long names to LINHA_WIDTH", () => {
    const [line1] = formatarLinhaProduto("Nome Muito Longo De Produto Especial Super Extra", 10, 1, 50).split("\n")
    expect(line1.length).toBe(LINHA_WIDTH)
  })

  it("line 2 TOTAL is flush at extreme right", () => {
    const [, line2] = formatarLinhaProduto("Produto", 5, 1, 300).split("\n")
    expect(line2.endsWith("R$300,00")).toBe(true)
  })

  it("line 2 TOTAL position fixed regardless of KG or QT value", () => {
    const [, line2a] = formatarLinhaProduto("Produto", 5, 1, 300).split("\n")
    const [, line2b] = formatarLinhaProduto("Produto", 100, 999, 300).split("\n")
    expect(line2a.lastIndexOf("R$300,00")).toBe(line2b.lastIndexOf("R$300,00"))
  })

  it("line 2 KG ends at same position regardless of product name", () => {
    const [, line2a] = formatarLinhaProduto("A", 25, 1, 100).split("\n")
    const [, line2b] = formatarLinhaProduto("Nome Longo Produto Especial", 25, 1, 100).split("\n")
    const end1 = line2a.indexOf("25kg") + "25kg".length
    const end2 = line2b.indexOf("25kg") + "25kg".length
    expect(end1).toBe(end2)
  })

  it("line 2 QT ends at same position regardless of KG value", () => {
    const [, line2a] = formatarLinhaProduto("Produto", 5, 3, 100).split("\n")
    const [, line2b] = formatarLinhaProduto("Produto", 100, 3, 100).split("\n")
    const end1 = line2a.indexOf("3", 10) + 1
    const end2 = line2b.indexOf("3", 10) + 1
    expect(end1).toBe(end2)
  })
})

describe("headerLinhaProduto", () => {
  it("returns 2 lines separated by newline", () => {
    const lines = headerLinhaProduto().split("\n")
    expect(lines).toHaveLength(2)
  })

  it("line 1 is exactly LINHA_WIDTH chars", () => {
    const [line1] = headerLinhaProduto().split("\n")
    expect(line1.length).toBe(LINHA_WIDTH)
  })

  it("line 2 is exactly LINHA_WIDTH chars", () => {
    const [, line2] = headerLinhaProduto().split("\n")
    expect(line2.length).toBe(LINHA_WIDTH)
  })

  it("line 2 contém labels KG, QT e TOTAL", () => {
    const [, line2] = headerLinhaProduto().split("\n")
    expect(line2).toContain("KG")
    expect(line2).toContain("QT")
    expect(line2).toContain("TOTAL")
  })

  it("line 2 TOTAL label flush at extreme right", () => {
    const [, line2] = headerLinhaProduto().split("\n")
    expect(line2.endsWith("TOTAL")).toBe(true)
  })

  it("KG label ends at same position as KG data", () => {
    const [, headerLine2] = headerLinhaProduto().split("\n")
    const [, dataLine2] = formatarLinhaProduto("Produto", 25, 1, 100).split("\n")
    const headerKgEnd = headerLine2.indexOf("KG") + "KG".length
    const dataKgEnd = dataLine2.indexOf("25kg") + "25kg".length
    expect(headerKgEnd).toBe(dataKgEnd)
  })

  it("QT label ends at same position as QT data", () => {
    const [, headerLine2] = headerLinhaProduto().split("\n")
    const [, dataLine2] = formatarLinhaProduto("Produto", 5, 3, 100).split("\n")
    const kgEnd = headerLine2.indexOf("KG") + "KG".length
    const headerQtEnd = headerLine2.indexOf("QT", kgEnd) + "QT".length
    const dataKgEnd = dataLine2.indexOf("5kg") + "5kg".length
    const dataQtEnd = dataLine2.indexOf("3", dataKgEnd) + 1
    expect(headerQtEnd).toBe(dataQtEnd)
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
    const header = headerLinhaProdutoRota()
    const count = (header.match(/  \|  /g) ?? []).length
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
    const h = headerLinhaProdutoRota()
    expect(h.endsWith("PESO")).toBe(true)
  })
})

describe("formatarLinhaProdutoRota", () => {
  it("linha tem exatamente LINHA_WIDTH caracteres", () => {
    const linha = formatarLinhaProdutoRota("Ração 25kg Premiatta", 10, 250)
    expect(linha.length).toBe(LINHA_WIDTH)
  })

  it("uses '  |  ' (double-space each side) as separator", () => {
    const linha = formatarLinhaProdutoRota("Produto X", 5, 125)
    const count = (linha.match(/  \|  /g) ?? []).length
    expect(count).toBe(2)
  })

  it("contém quantidade formatada", () => {
    const linha = formatarLinhaProdutoRota("Produto X", 20, 400)
    expect(linha).toContain("20")
  })

  it("PESO is flush at extreme right", () => {
    const linha = formatarLinhaProdutoRota("Produto X", 5, 125.5)
    expect(linha.endsWith("125.5kg")).toBe(true)
  })

  it("first pipe at same position regardless of name length", () => {
    const linha1 = formatarLinhaProdutoRota("Curto", 5, 100)
    const linha2 = formatarLinhaProdutoRota("Nome Muito Longo De Produto Especial", 5, 100)
    const pipe1 = linha1.indexOf("|")
    const pipe2 = linha2.indexOf("|")
    expect(pipe1).toBe(pipe2)
  })

  it("PRODUTO starts at position 0", () => {
    const linha = formatarLinhaProdutoRota("Racao", 5, 100)
    expect(linha[0]).toBe("R")
  })

  it("trunca nome longo sem estourar largura", () => {
    const nomeGrande = "Ração Premium Super Especial 40kg Saco Grande"
    const linha = formatarLinhaProdutoRota(nomeGrande, 3, 120)
    expect(linha.length).toBe(LINHA_WIDTH)
  })
})
