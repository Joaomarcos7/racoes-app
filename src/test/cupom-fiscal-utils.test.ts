import { describe, it, expect } from "vitest"
import {
  padEnd,
  truncate,
  formatarLinhaProduto,
  calcularSubtotal,
  calcularTotal,
  formatarDataEmissao,
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
