export function normalizeCedula(value: string): string {
  return value.replace(/[.\s-]/g, '')
}

export function isValidCedulaLength(value: string): boolean {
  const clean = normalizeCedula(value)
  return clean.length >= 6 && clean.length <= 12
}
