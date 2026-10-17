export const PAYMENT_METHODS: Record<string, { label: string; value: string }> = {
  pago_movil: { label: 'Pago móvil', value: 'pago_movil' },
  binance: { label: 'Binance', value: 'binance' },
  zelle: { label: 'Zelle', value: 'zelle' },
  other: { label: 'Otro', value: 'other' },
}

export type PaymentMethod = 'pago_movil' | 'binance' | 'zelle' | 'other'

export const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-900 text-yellow-100' },
  approved: { label: 'Aprobado', color: 'bg-green-900 text-green-100' },
  rejected: { label: 'Rechazado', color: 'bg-red-900 text-red-100' },
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected'

export const APP_LIMITS = {
  MAX_FILE_SIZE_BYTES: 1024 * 1024, // 1 MB
  ACCEPTED_FILE_TYPES: ['image/jpeg', 'image/png'],
} as const

export const WEEKLY_AMOUNT_USD = 100
