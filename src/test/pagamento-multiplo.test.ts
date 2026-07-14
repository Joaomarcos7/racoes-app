import { describe, it, expect } from "vitest"
import { validarPagamentosMultiplos, somarPagamentos } from "@/lib/pedido-utils"

describe("somarPagamentos", () => {
  it("retorna 0 para lista vazia", () => {
    expect(somarPagamentos([])).toBe(0)
  })

  it("soma valores de um pagamento", () => {
    expect(somarPagamentos([{ metodo: "PIX", valor: 1400 }])).toBe(1400)
  })

  it("soma múltiplos pagamentos", () => {
    expect(somarPagamentos([
      { metodo: "PIX", valor: 1400 },
      { metodo: "CARTAO_CREDITO", valor: 1100 },
    ])).toBe(2500)
  })
})

describe("validarPagamentosMultiplos", () => {
  it("retorna null para lista vazia (sem pagamento necessário)", () => {
    expect(validarPagamentosMultiplos([], 2500)).toBeNull()
  })

  it("retorna null quando soma bate o total", () => {
    expect(validarPagamentosMultiplos([
      { metodo: "PIX", valor: 1400 },
      { metodo: "CARTAO_CREDITO", valor: 1100 },
    ], 2500)).toBeNull()
  })

  it("retorna erro quando soma é menor que o total", () => {
    expect(validarPagamentosMultiplos([
      { metodo: "PIX", valor: 1000 },
    ], 2500)).not.toBeNull()
  })

  it("retorna erro quando soma excede o total", () => {
    expect(validarPagamentosMultiplos([
      { metodo: "PIX", valor: 3000 },
    ], 2500)).not.toBeNull()
  })

  it("retorna erro quando algum valor é zero", () => {
    expect(validarPagamentosMultiplos([
      { metodo: "PIX", valor: 0 },
      { metodo: "DINHEIRO", valor: 2500 },
    ], 2500)).not.toBeNull()
  })

  it("retorna erro quando algum valor é negativo", () => {
    expect(validarPagamentosMultiplos([
      { metodo: "PIX", valor: -100 },
      { metodo: "DINHEIRO", valor: 2600 },
    ], 2500)).not.toBeNull()
  })

  it("retorna erro quando método duplicado", () => {
    expect(validarPagamentosMultiplos([
      { metodo: "PIX", valor: 1000 },
      { metodo: "PIX", valor: 1500 },
    ], 2500)).not.toBeNull()
  })

  it("retorna null com um único pagamento cobrindo o total", () => {
    expect(validarPagamentosMultiplos([
      { metodo: "DINHEIRO", valor: 2500 },
    ], 2500)).toBeNull()
  })
})
