import { describe, it, expect } from "vitest"
import { isVencido, buildFiadoNotificacaoTexto, shouldGerarNotificacaoFiado, jaExisteNotificacaoFiado } from "@/lib/notificacao-utils"

describe("isVencido", () => {
  it("returns false when due date is in the future", () => {
    const future = new Date(Date.now() + 86400_000)
    expect(isVencido(future)).toBe(false)
  })

  it("returns true when due date is in the past", () => {
    const past = new Date(Date.now() - 86400_000)
    expect(isVencido(past)).toBe(true)
  })

  it("returns true when due date is exactly now (same ms boundary)", () => {
    const now = new Date(Date.now() - 1)
    expect(isVencido(now)).toBe(true)
  })
})

describe("buildFiadoNotificacaoTexto", () => {
  it("includes client name in text", () => {
    const texto = buildFiadoNotificacaoTexto({ clienteNome: "João Silva", dataVencimento: new Date("2026-01-01") })
    expect(texto).toContain("João Silva")
  })

  it("includes due date formatted as dd/mm/yyyy", () => {
    const texto = buildFiadoNotificacaoTexto({ clienteNome: "Maria", dataVencimento: new Date("2026-06-15") })
    expect(texto).toContain("15/06/2026")
  })

  it("includes fiado reference", () => {
    const texto = buildFiadoNotificacaoTexto({ clienteNome: "Carlos", dataVencimento: new Date("2026-01-01") })
    expect(texto.toLowerCase()).toContain("fiado")
  })
})

describe("jaExisteNotificacaoFiado", () => {
  it("returns true when unread notification exists for pedido", () => {
    // jaExisteNotificacaoFiado imported at top
    const notificacoes = [{ pedidoId: "p1", tipo: "FIADO_VENCIDO", lida: false }]
    expect(jaExisteNotificacaoFiado(notificacoes, "p1")).toBe(true)
  })

  it("returns true when READ notification exists for pedido — must not recreate", () => {
    // jaExisteNotificacaoFiado imported at top
    const notificacoes = [{ pedidoId: "p1", tipo: "FIADO_VENCIDO", lida: true }]
    expect(jaExisteNotificacaoFiado(notificacoes, "p1")).toBe(true)
  })

  it("returns false when no notification exists for pedido", () => {
    // jaExisteNotificacaoFiado imported at top
    const notificacoes: { pedidoId: string | null; tipo: string; lida: boolean }[] = []
    expect(jaExisteNotificacaoFiado(notificacoes, "p1")).toBe(false)
  })

  it("returns false when notification exists for different pedido", () => {
    // jaExisteNotificacaoFiado imported at top
    const notificacoes = [{ pedidoId: "p2", tipo: "FIADO_VENCIDO", lida: true }]
    expect(jaExisteNotificacaoFiado(notificacoes, "p1")).toBe(false)
  })
})

describe("shouldGerarNotificacaoFiado", () => {
  const yesterday = new Date(Date.now() - 86400_000)
  const tomorrow = new Date(Date.now() + 86400_000)

  it("returns true when fiado and overdue", () => {
    expect(shouldGerarNotificacaoFiado({ statusPagamento: "FIADO", dataVencimentoFiado: yesterday })).toBe(true)
  })

  it("returns false when fiado but not yet due", () => {
    expect(shouldGerarNotificacaoFiado({ statusPagamento: "FIADO", dataVencimentoFiado: tomorrow })).toBe(false)
  })

  it("returns false when already paid", () => {
    expect(shouldGerarNotificacaoFiado({ statusPagamento: "PAGO", dataVencimentoFiado: yesterday })).toBe(false)
  })

  it("returns false when no due date set", () => {
    expect(shouldGerarNotificacaoFiado({ statusPagamento: "FIADO", dataVencimentoFiado: null })).toBe(false)
  })
})
