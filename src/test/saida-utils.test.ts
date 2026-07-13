import { describe, it, expect } from "vitest"
import { aggregateSaidasPorTipo, calcularSaldoLiquido, labelTipoSaida, validateSaida } from "@/lib/saida-utils"

const saida = (tipo: string, valor: number) => ({ tipo, valor })

describe("aggregateSaidasPorTipo", () => {
  it("agrupa saidas do mesmo tipo e soma valores", () => {
    const saidas = [saida("DIESEL", 150), saida("DIESEL", 200), saida("OFICINA", 500)]
    const result = aggregateSaidasPorTipo(saidas)
    expect(result).toMatchObject([
      { tipo: "OFICINA", total: 500 },
      { tipo: "DIESEL", total: 350 },
    ])
  })

  it("ordena do maior para o menor total", () => {
    const saidas = [saida("DIESEL", 100), saida("OFICINA", 800), saida("VIAGEM_MOTORISTA", 300)]
    const result = aggregateSaidasPorTipo(saidas)
    expect(result[0].tipo).toBe("OFICINA")
    expect(result[1].tipo).toBe("VIAGEM_MOTORISTA")
    expect(result[2].tipo).toBe("DIESEL")
  })

  it("retorna array vazio para lista vazia", () => {
    expect(aggregateSaidasPorTipo([])).toEqual([])
  })

  it("tipo unico retorna um item", () => {
    const result = aggregateSaidasPorTipo([saida("OUTRO", 99.5)])
    expect(result).toEqual([{ tipo: "OUTRO", total: 99.5 }])
  })
})

describe("calcularSaldoLiquido", () => {
  it("retorna entradas minus saidas", () => {
    expect(calcularSaldoLiquido(10000, 3000)).toBe(7000)
  })

  it("retorna negativo quando saidas maiores que entradas", () => {
    expect(calcularSaldoLiquido(2000, 5000)).toBe(-3000)
  })

  it("retorna zero quando iguais", () => {
    expect(calcularSaldoLiquido(500, 500)).toBe(0)
  })
})

describe("labelTipoSaida", () => {
  it("retorna label legivel para cada tipo", () => {
    expect(labelTipoSaida("PAGAMENTO_FUNCIONARIO")).toBe("Pagamento Funcionário")
    expect(labelTipoSaida("DIESEL")).toBe("Diesel")
    expect(labelTipoSaida("VIAGEM_MOTORISTA")).toBe("Viagem Motorista")
    expect(labelTipoSaida("OFICINA")).toBe("Oficina")
    expect(labelTipoSaida("PRODUCAO_TERCEIRIZADA")).toBe("Produção Terceirizada")
    expect(labelTipoSaida("DESPACHO_VIAGEM")).toBe("Despacho Viagem")
    expect(labelTipoSaida("OUTRO")).toBe("Outro")
  })

  it("retorna o proprio valor para tipo desconhecido", () => {
    expect(labelTipoSaida("TIPO_INEXISTENTE")).toBe("TIPO_INEXISTENTE")
  })
})

describe("validateSaida", () => {
  const base = { data: "2026-07-13T10:00:00Z", tipo: "DIESEL", valor: 150, descricao: undefined }

  it("retorna null para saida valida", () => {
    expect(validateSaida(base)).toBeNull()
  })

  it("exige data", () => {
    expect(validateSaida({ ...base, data: "" })).toBe("Data obrigatória")
  })

  it("exige tipo", () => {
    expect(validateSaida({ ...base, tipo: "" })).toBe("Tipo obrigatório")
  })

  it("exige valor positivo", () => {
    expect(validateSaida({ ...base, valor: 0 })).toBe("Valor deve ser maior que zero")
    expect(validateSaida({ ...base, valor: -10 })).toBe("Valor deve ser maior que zero")
  })

  it("tipo OUTRO exige descricao", () => {
    expect(validateSaida({ ...base, tipo: "OUTRO", descricao: undefined })).toBe("Descrição obrigatória para tipo Outro")
    expect(validateSaida({ ...base, tipo: "OUTRO", descricao: "" })).toBe("Descrição obrigatória para tipo Outro")
  })

  it("tipo OUTRO com descricao valida retorna null", () => {
    expect(validateSaida({ ...base, tipo: "OUTRO", descricao: "Aluguel galpão" })).toBeNull()
  })
})
