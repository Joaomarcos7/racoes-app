const VALID_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24,
  27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46,
  47, 48, 49,
  51, 53, 54, 55,
  61,
  62, 64,
  63,
  65, 66,
  67,
  68,
  69,
  71, 73, 74, 75, 77,
  79,
  81, 87,
  82,
  83,
  84,
  85, 88,
  86, 89,
  91, 93, 94,
  92, 97,
  95,
  96,
  98, 99,
])

export function formatTelefoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11)
  if (!digits) return ""

  const ddd = digits.slice(0, 2)
  const num = digits.slice(2)

  if (digits.length <= 1) return `(${digits}`
  if (digits.length === 2) return `(${ddd}) `
  if (num.length <= 5) return `(${ddd}) ${num}`
  return `(${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`
}

export function validateDDD(ddd: string): boolean {
  const n = Number(ddd)
  return !!ddd && !isNaN(n) && VALID_DDDS.has(n)
}

export function parseTelefoneDigits(masked: string): string {
  return masked.replace(/\D/g, "")
}
