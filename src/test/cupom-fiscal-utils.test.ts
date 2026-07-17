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
  it("produces lines of exactly LINHA_WIDTH chars", () => {
    const linha1 = formatarLinhaProduto("Produto", 5, 1, 10)
    const linha2 = formatarLinhaProduto("Produto", 5, 1, 9999.99)
    expect(linha1.length).toBe(LINHA_WIDTH)
    expect(linha2.length).toBe(LINHA_WIDTH)
  })

  it("truncates long product names to fit exactly LINHA_WIDTH", () => {
    const linha = formatarLinhaProduto("Nome Muito Longo De Produto Especial Super", 10, 1, 50)
    expect(linha.length).toBe(LINHA_WIDTH)
  })

  it("includes product weight, quantity and total", () => {
    const linha = formatarLinhaProduto("Ração Premium", 25, 2, 180)
    expect(linha).toContain("25kg")
    expect(linha).toContain("2")
    expect(linha).toContain("180")
  })

  it("has exactly 2 pipes — one before KG/QT zone, one before TOTAL", () => {
    const linha = formatarLinhaProduto("Produto", 25, 3, 100)
    const pipes = (linha.match(/\|/g) ?? []).length
    expect(pipes).toBe(2)
  })

  it("uses ' | ' (space-pipe-space) as separator", () => {
    const linha = formatarLinhaProduto("Produto", 25, 3, 100)
    expect(linha).toContain(" | ")
    const count = (linha.match(/ \| /g) ?? []).length
    expect(count).toBe(2)
  })

  it("TOTAL is flush at extreme right — last char is last char of total value", () => {
    const linha = formatarLinhaProduto("Produto", 5, 1, 300)
    expect(linha.endsWith("R$300,00")).toBe(true)
  })

  it("PRODUTO starts at position 0 — no leading whitespace", () => {
    const linha = formatarLinhaProduto("Racao", 5, 1, 100)
    expect(linha[0]).toBe("R")
  })

  it("KG ends at same position regardless of name length", () => {
    const linha1 = formatarLinhaProduto("A", 25, 1, 100)
    const linha2 = formatarLinhaProduto("Nome Longo Truncado", 25, 1, 100)
    const end1 = linha1.indexOf("25kg") + "25kg".length
    const end2 = linha2.indexOf("25kg") + "25kg".length
    expect(end1).toBe(end2)
  })

  it("second pipe at same position regardless of KG or QT value", () => {
    const linha1 = formatarLinhaProduto("Produto", 5, 1, 100)
    const linha2 = formatarLinhaProduto("Produto", 100, 99, 100)
    const pipe2pos1 = linha1.lastIndexOf("|")
    const pipe2pos2 = linha2.lastIndexOf("|")
    expect(pipe2pos1).toBe(pipe2pos2)
  })
})

describe("headerLinhaProduto", () => {
  it("tem exatamente LINHA_WIDTH caracteres", () => {
    expect(headerLinhaProduto().length).toBe(LINHA_WIDTH)
  })

  it("contém labels KG, QT e TOTAL", () => {
    const h = headerLinhaProduto()
    expect(h).toContain("KG")
    expect(h).toContain("QT")
    expect(h).toContain("TOTAL")
  })

  it("has exactly 2 ' | ' separators", () => {
    const h = headerLinhaProduto()
    const count = (h.match(/ \| /g) ?? []).length
    expect(count).toBe(2)
  })

  it("pipes do header nas mesmas posições que os das linhas de dados", () => {
    const header = headerLinhaProduto()
    const linha = formatarLinhaProduto("Produto", 5, 1, 100)
    const headerPipes = [...header.matchAll(/\|/g)].map((m) => m.index!)
    const linhaPipes = [...linha.matchAll(/\|/g)].map((m) => m.index!)
    expect(headerPipes).toEqual(linhaPipes)
  })

  it("TOTAL label flush at extreme right", () => {
    const h = headerLinhaProduto()
    expect(h.endsWith("TOTAL")).toBe(true)
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

  it("has exactly 2 ' | ' separators", () => {
    const header = headerLinhaProdutoRota()
    const count = (header.match(/ \| /g) ?? []).length
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

  it("usa ' | ' como separador de coluna", () => {
    const linha = formatarLinhaProdutoRota("Produto X", 5, 125)
    const count = (linha.match(/ \| /g) ?? []).length
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
