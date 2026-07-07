import { describe, it, expect } from "vitest"
import { labelCarroceria, TIPOS_CARROCERIA } from "@/lib/veiculo-utils"

describe("labelCarroceria", () => {
  it("returns label for BAU", () => {
    expect(labelCarroceria("BAU")).toBe("Baú")
  })

  it("returns label for GRADE_BAIXA", () => {
    expect(labelCarroceria("GRADE_BAIXA")).toBe("Grade Baixa")
  })

  it("returns key itself for unknown type", () => {
    expect(labelCarroceria("DESCONHECIDO")).toBe("DESCONHECIDO")
  })
})

describe("TIPOS_CARROCERIA", () => {
  it("includes at least BAU and GRADE_BAIXA", () => {
    const values = TIPOS_CARROCERIA.map((t) => t.value)
    expect(values).toContain("BAU")
    expect(values).toContain("GRADE_BAIXA")
  })

  it("each entry has value and label", () => {
    TIPOS_CARROCERIA.forEach((t) => {
      expect(t.value).toBeTruthy()
      expect(t.label).toBeTruthy()
    })
  })
})
