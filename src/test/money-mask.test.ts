import { describe, it, expect } from "vitest"
import { formatMoneyInput, parseMaskedMoney, formatDecimalInput, parseMaskedDecimal } from "@/lib/money-mask"

describe("formatMoneyInput", () => {
  it("retorna 0,00 para string vazia", () => {
    expect(formatMoneyInput("")).toBe("0,00")
  })

  it("formata dígitos como centavos (ex: '1' → '0,01')", () => {
    expect(formatMoneyInput("1")).toBe("0,01")
  })

  it("formata dois dígitos como centavos (ex: '12' → '0,12')", () => {
    expect(formatMoneyInput("12")).toBe("0,12")
  })

  it("formata três dígitos (ex: '123' → '1,23')", () => {
    expect(formatMoneyInput("123")).toBe("1,23")
  })

  it("formata com milhar (ex: '1234567' → '12.345,67')", () => {
    expect(formatMoneyInput("1234567")).toBe("12.345,67")
  })

  it("ignora caracteres não-numéricos na entrada", () => {
    expect(formatMoneyInput("abc12,34xyz")).toBe("12,34")
  })

  it("formata valor grande com múltiplos milhares", () => {
    expect(formatMoneyInput("1234567890")).toBe("12.345.678,90")
  })
})

describe("formatDecimalInput (kg, 3 casas)", () => {
  it("retorna 0,000 para string vazia", () => {
    expect(formatDecimalInput("", 3)).toBe("0,000")
  })

  it("'1' → '0,001'", () => {
    expect(formatDecimalInput("1", 3)).toBe("0,001")
  })

  it("'25000' → '25,000'", () => {
    expect(formatDecimalInput("25000", 3)).toBe("25,000")
  })

  it("'255' → '0,255'", () => {
    expect(formatDecimalInput("255", 3)).toBe("0,255")
  })

  it("'1234567' com milhar → '1.234,567'", () => {
    expect(formatDecimalInput("1234567", 3)).toBe("1.234,567")
  })

  it("ignora não-numéricos", () => {
    expect(formatDecimalInput("abc25,5xyz", 3)).toBe("0,255")
  })
})

describe("parseMaskedDecimal", () => {
  it("converte '0,000' para 0", () => {
    expect(parseMaskedDecimal("0,000")).toBe(0)
  })

  it("converte '25,000' para 25", () => {
    expect(parseMaskedDecimal("25,000")).toBe(25)
  })

  it("converte '0,500' para 0.5", () => {
    expect(parseMaskedDecimal("0,500")).toBe(0.5)
  })

  it("converte '1.234,567' para 1234.567", () => {
    expect(parseMaskedDecimal("1.234,567")).toBe(1234.567)
  })
})

describe("parseMaskedMoney", () => {
  it("converte '0,00' para 0", () => {
    expect(parseMaskedMoney("0,00")).toBe(0)
  })

  it("converte '1,23' para 1.23", () => {
    expect(parseMaskedMoney("1,23")).toBe(1.23)
  })

  it("converte '12.345,67' para 12345.67", () => {
    expect(parseMaskedMoney("12.345,67")).toBe(12345.67)
  })

  it("converte '1.234.567,89' para 1234567.89", () => {
    expect(parseMaskedMoney("1.234.567,89")).toBe(1234567.89)
  })
})
