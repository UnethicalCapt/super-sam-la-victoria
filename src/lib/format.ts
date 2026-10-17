export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  return d.toLocaleDateString('es-VE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  return d.toLocaleDateString('es-VE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCurrencyUSD(
  value: number | null | undefined,
  decimals = 2,
): string {
  if (value === null || value === undefined) return '$0.00'
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}
