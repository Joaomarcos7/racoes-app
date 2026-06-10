import { describe, it, expect } from "vitest"
import { shouldRegistrarHistoricoStatus } from "@/lib/pedido-status-utils"

describe("shouldRegistrarHistoricoStatus", () => {
  it("returns true when status changes from AGUARDANDO to EM_ROTA", () => {
    expect(shouldRegistrarHistoricoStatus("AGUARDANDO", "EM_ROTA")).toBe(true)
  })

  it("returns true when status changes from EM_ROTA to ENTREGUE", () => {
    expect(shouldRegistrarHistoricoStatus("EM_ROTA", "ENTREGUE")).toBe(true)
  })

  it("returns true when previous status is null (first assignment)", () => {
    expect(shouldRegistrarHistoricoStatus(null, "AGUARDANDO")).toBe(true)
  })

  it("returns false when status is set to the same value", () => {
    expect(shouldRegistrarHistoricoStatus("AGUARDANDO", "AGUARDANDO")).toBe(false)
  })

  it("returns false when new status is null or undefined", () => {
    expect(shouldRegistrarHistoricoStatus("AGUARDANDO", null)).toBe(false)
  })
})
