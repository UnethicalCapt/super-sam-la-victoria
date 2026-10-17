import { supabase } from '../lib/supabase'
import { toUserMessage } from '../lib/errors'

export const storageService = {
  async createSignedUrls(
    paymentIds: string[],
    paths: Record<string, string>,
    ttl = 3600,
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {}

    await Promise.all(
      paymentIds.map(async (paymentId) => {
        const path = paths[paymentId]
        if (!path) return

        try {
          const { data, error } = await supabase.storage
            .from('payment-proofs')
            .createSignedUrl(path, ttl)

          if (!error && data?.signedUrl) {
            result[paymentId] = data.signedUrl
          }
        } catch {
          // ignore individual failures
        }
      })
    )

    return result
  },

  async uploadProof(filePath: string, file: File): Promise<string> {
    const { error } = await supabase.storage
      .from('payment-proofs')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (error) throw error
    return filePath
  },
}

export class StorageError extends Error {
  constructor(message: string, public readonly userMessage: string) {
    super(message)
    this.name = 'StorageError'
  }

  static fromUnknown(err: unknown): StorageError {
    return new StorageError(
      err instanceof Error ? err.message : String(err),
      toUserMessage(err),
    )
  }
}
