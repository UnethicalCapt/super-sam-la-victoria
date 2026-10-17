import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const getStoragePath = (proofUrl: string | null | undefined): string => {
  if (!proofUrl) return ''
  if (typeof proofUrl === 'string' && proofUrl.startsWith('http')) {
    const marker = '/payment-proofs/'
    const idx = proofUrl.indexOf(marker)
    if (idx >= 0) return decodeURIComponent(proofUrl.slice(idx + marker.length))
    return ''
  }
  return proofUrl
}

export type UseSignedUrlsResult = {
  urls: Record<string, string>
  loading: boolean
  error: string | null
}

export function useSignedUrls(
  payments: Array<{ id: string; proof_url?: string | null }>
): UseSignedUrlsResult {
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUrls = useCallback(async () => {
    if (!payments || payments.length === 0) {
      setUrls({})
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const result: Record<string, string> = {}

    try {
      await Promise.all(
        payments.map(async (payment) => {
          const path = getStoragePath(payment.proof_url)
          if (!path) return

          try {
            const { data, error: err } = await supabase.storage
              .from('payment-proofs')
              .createSignedUrl(path, 3600)

            if (!err && data?.signedUrl) {
              result[payment.id] = data.signedUrl
            }
          } catch {
            // ignore individual failures
          }
        })
      )

      setUrls(result)
    } catch (err: any) {
      setError(err.message || 'Error al cargar comprobantes')
    } finally {
      setLoading(false)
    }
  }, [payments])

  useEffect(() => {
    fetchUrls()
  }, [fetchUrls])

  return { urls, loading, error }
}
