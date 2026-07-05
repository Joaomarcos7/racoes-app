export interface ViaCepResult {
  logradouro: string
  localidade: string
}

export async function fetchViaCep(cep: string): Promise<ViaCepResult | null> {
  const digits = cep.replace(/\D/g, "")
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.erro) return null
    return { logradouro: data.logradouro, localidade: data.localidade }
  } catch {
    return null
  }
}
