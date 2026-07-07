import { describe, it, expect } from "vitest"
import { formatTelefoneInput, validateDDD, parseTelefoneDigits } from "@/lib/phone-mask"

describe("formatTelefoneInput", () => {
  it("retorna vazio para string vazia", () => {
    expect(formatTelefoneInput("")).toBe("")
  })

  it("formata DDD parcial", () => {
    expect(formatTelefoneInput("1")).toBe("(1")
    expect(formatTelefoneInput("11")).toBe("(11) ")
  })

  it("formata número parcial", () => {
    expect(formatTelefoneInput("119")).toBe("(11) 9")
    expect(formatTelefoneInput("11912")).toBe("(11) 912")
  })

  it("formata número completo 11 dígitos", () => {
    expect(formatTelefoneInput("11987654321")).toBe("(11) 98765-4321")
  })

  it("ignora dígitos além de 11", () => {
    expect(formatTelefoneInput("119876543219999")).toBe("(11) 98765-4321")
  })

  it("funciona com string já mascarada como input", () => {
    expect(formatTelefoneInput("(11) 98765-4321")).toBe("(11) 98765-4321")
  })
})

describe("validateDDD", () => {
  it("valida DDDs da região SP", () => {
    expect(validateDDD("11")).toBe(true)
    expect(validateDDD("19")).toBe(true)
  })

  it("valida DDDs da região RJ", () => {
    expect(validateDDD("21")).toBe(true)
    expect(validateDDD("22")).toBe(true)
    expect(validateDDD("24")).toBe(true)
  })

  it("valida DDDs do Sul", () => {
    expect(validateDDD("41")).toBe(true)
    expect(validateDDD("51")).toBe(true)
    expect(validateDDD("47")).toBe(true)
  })

  it("valida DDDs do Norte/Nordeste", () => {
    expect(validateDDD("91")).toBe(true)
    expect(validateDDD("85")).toBe(true)
    expect(validateDDD("61")).toBe(true)
  })

  it("rejeita DDDs inválidos", () => {
    expect(validateDDD("00")).toBe(false)
    expect(validateDDD("10")).toBe(false)
    expect(validateDDD("20")).toBe(false)
    expect(validateDDD("23")).toBe(false)
    expect(validateDDD("72")).toBe(false)
  })

  it("rejeita string vazia", () => {
    expect(validateDDD("")).toBe(false)
  })
})

describe("parseTelefoneDigits", () => {
  it("extrai dígitos de número mascarado", () => {
    expect(parseTelefoneDigits("(11) 98765-4321")).toBe("11987654321")
  })

  it("retorna dígitos de string sem máscara", () => {
    expect(parseTelefoneDigits("11987654321")).toBe("11987654321")
  })

  it("retorna vazio para string vazia", () => {
    expect(parseTelefoneDigits("")).toBe("")
  })
})
