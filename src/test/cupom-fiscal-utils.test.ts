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

// Fixed column positions (no separators): NOME[0..27] KG[28..33] QT[34..38] TOTAL[39..47]
const NOME_END = 28
const KG_END = 34
const QT_END = 39

describe("formatarLinhaProduto", () => {
  it("is exactly LINHA_WIDTH chars", () => {
    expect(formatarLinhaProduto("Produto", 25, 3, 100).length).toBe(LINHA_WIDTH)
    expect(formatarLinhaProduto("Produto", 5, 1, 9999.99).length).toBe(LINHA_WIDTH)
  })

  it("no newline, no pipe — just fixed-width columns", () => {
    const linha = formatarLinhaProduto("Produto", 25, 3, 100)
    expect(linha).not.toContain("\n")
    expect(linha).not.toContain("|")
  })

  it("PRODUTO starts at position 0", () => {
    expect(formatarLinhaProduto("Racao", 25, 3, 100)[0]).toBe("R")
  })

  it("truncates long names so KG always starts at same column", () => {
    const a = formatarLinhaProduto("A", 25, 1, 100)
    const b = formatarLinhaProduto("Nome Muito Longo De Produto Especial Super Extra", 25, 1, 100)
    expect(a.indexOf("25kg")).toBe(b.indexOf("25kg"))
  })

  it("KG column ends at fixed position regardless of name length", () => {
    const a = formatarLinhaProduto("A", 25, 1, 100)
    const b = formatarLinhaProduto("Nome Longo Produto Especial XPTO", 25, 1, 100)
    expect(a.indexOf("25kg") + 4).toBe(KG_END)
    expect(b.indexOf("25kg") + 4).toBe(KG_END)
  })

  it("QT column ends at fixed position regardless of KG value", () => {
    const a = formatarLinhaProduto("Produto", 5, 3, 100)
    const b = formatarLinhaProduto("Produto", 100, 3, 100)
    // find '3' after KG_END
    expect(a.indexOf("3", KG_END) + 1).toBe(QT_END)
    expect(b.indexOf("3", KG_END) + 1).toBe(QT_END)
  })

  it("TOTAL is flush at extreme right", () => {
    expect(formatarLinhaProduto("Produto", 5, 1, 300).endsWith("R$300,00")).toBe(true)
  })

  it("TOTAL start position fixed regardless of any other column value", () => {
    const a = formatarLinhaProduto("Produto", 5, 1, 300)
    const b = formatarLinhaProduto("Nome Muito Longo", 100, 99, 300)
    expect(a.indexOf("R$300,00")).toBe(b.indexOf("R$300,00"))
  })
})

describe("headerLinhaProduto", () => {
  it("is exactly LINHA_WIDTH chars", () => {
    expect(headerLinhaProduto().length).toBe(LINHA_WIDTH)
  })

  it("no newline, no pipe", () => {
    const h = headerLinhaProduto()
    expect(h).not.toContain("\n")
    expect(h).not.toContain("|")
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

  it("KG label ends at same position as KG data (column alignment)", () => {
    const header = headerLinhaProduto()
    const linha = formatarLinhaProduto("Produto", 25, 1, 100)
    const headerKgEnd = header.indexOf("KG") + 2
    const dataKgEnd = linha.indexOf("25kg") + 4
    expect(headerKgEnd).toBe(dataKgEnd)
  })

  it("QT label ends at same position as QT data (column alignment)", () => {
    const header = headerLinhaProduto()
    const linha = formatarLinhaProduto("Produto", 5, 3, 100)
    const kgEnd = header.indexOf("KG") + 2
    const headerQtEnd = header.indexOf("QT", kgEnd) + 2
    const dataQtEnd = linha.indexOf("3", KG_END) + 1
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

// Rota fixed columns: NOME[0..27] QTD[28..35] PESO[36..47]
const ROTA_NOME_END = 28
const ROTA_QTD_END = 36

describe("headerLinhaProdutoRota", () => {
  it("header tem exatamente LINHA_WIDTH caracteres", () => {
    expect(headerLinhaProdutoRota().length).toBe(LINHA_WIDTH)
  })

  it("no newline, no pipe — fixed columns only", () => {
    const h = headerLinhaProdutoRota()
    expect(h).not.toContain("\n")
    expect(h).not.toContain("|")
  })

  it("header contém QTD e PESO", () => {
    const header = headerLinhaProdutoRota()
    expect(header).toContain("QTD")
    expect(header).toContain("PESO")
  })

  it("PESO label flush at extreme right", () => {
    expect(headerLinhaProdutoRota().endsWith("PESO")).toBe(true)
  })

  it("QTD label ends at same column as QTD data", () => {
    const header = headerLinhaProdutoRota()
    const linha = formatarLinhaProdutoRota("Produto", 5, 125)
    const headerQtdEnd = header.indexOf("QTD") + 3
    const dataQtdEnd = linha.indexOf("5", ROTA_NOME_END) + 1
    expect(headerQtdEnd).toBe(dataQtdEnd)
  })
})

describe("formatarLinhaProdutoRota", () => {
  it("linha tem exatamente LINHA_WIDTH caracteres", () => {
    expect(formatarLinhaProdutoRota("Ração 25kg Premiatta", 10, 250).length).toBe(LINHA_WIDTH)
  })

  it("no newline, no pipe — fixed columns only", () => {
    const linha = formatarLinhaProdutoRota("Produto X", 5, 125)
    expect(linha).not.toContain("\n")
    expect(linha).not.toContain("|")
  })

  it("PRODUTO starts at position 0", () => {
    expect(formatarLinhaProdutoRota("Racao", 5, 100)[0]).toBe("R")
  })

  it("QTD starts at same column regardless of name length", () => {
    const a = formatarLinhaProdutoRota("Curto", 5, 100)
    const b = formatarLinhaProdutoRota("Nome Muito Longo De Produto Especial XPTO", 5, 100)
    expect(a.indexOf("5", ROTA_NOME_END)).toBe(b.indexOf("5", ROTA_NOME_END))
  })

  it("PESO is flush at extreme right", () => {
    expect(formatarLinhaProdutoRota("Produto X", 5, 125.5).endsWith("125.5kg")).toBe(true)
  })

  it("PESO start position fixed regardless of name or QTD", () => {
    const a = formatarLinhaProdutoRota("Curto", 5, 100)
    const b = formatarLinhaProdutoRota("Nome Longo Produto", 999, 100)
    expect(a.indexOf("100.0kg")).toBe(b.indexOf("100.0kg"))
  })

  it("trunca nome longo sem estourar largura", () => {
    const linha = formatarLinhaProdutoRota("Ração Premium Super Especial 40kg Saco Grande", 3, 120)
    expect(linha.length).toBe(LINHA_WIDTH)
  })
})
