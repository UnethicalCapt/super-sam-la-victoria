export function toUserMessage(err: unknown): string {
  const e = err as { message?: string; code?: string; status?: number }
  const raw = (e?.message ?? '').toLowerCase()
  if (e?.code === '23505' || raw.includes('duplicate')) return 'Ese valor ya está registrado.'
  if (e?.status === 429 || raw.includes('rate limit')) return 'Demasiados intentos. Espera unos minutos.'
  if (raw.includes('email not confirmed')) return 'Debes confirmar tu correo antes de iniciar sesión.'
  if (raw.includes('invalid login')) return 'Correo o contraseña incorrectos.'
  if (raw.includes('password')) return 'La contraseña no cumple los requisitos mínimos.'
  return 'Ocurrió un error inesperado. Intenta nuevamente.'
}
