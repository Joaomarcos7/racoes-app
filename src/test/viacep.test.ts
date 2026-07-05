import { describe, it, expect, vi, beforeEach } from "vitest"
import { fetchViaCep } from "@/lib/viacep"

describe("fetchViaCep", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("returns logradouro and localidade for valid CEP", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        cep: "01001-000",
        logradouro: "Praça da Sé",
        localidade: "São Paulo",
        uf: "SP",
        erro: undefined,
      }),
    }))

    const result = await fetchViaCep("01001000")

    expect(result).toEqual({ logradouro: "Praça da Sé", localidade: "São Paulo" })
  })

  it("returns null for CEP not found (erro field)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ erro: true }),
    }))

    const result = await fetchViaCep("00000000")

    expect(result).toBeNull()
  })

  it("returns null on network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("network")))

    const result = await fetchViaCep("01001000")

    expect(result).toBeNull()
  })

  it("strips non-digit characters from CEP before fetching", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ logradouro: "Rua X", localidade: "Curitiba" }),
    })
    vi.stubGlobal("fetch", mockFetch)

    await fetchViaCep("01001-000")

    expect(mockFetch).toHaveBeenCalledWith("https://viacep.com.br/ws/01001000/json/")
  })
})
