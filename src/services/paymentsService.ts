import { supabase } from '../lib/supabase'
import { toUserMessage } from '../lib/errors'
import { WEEKLY_AMOUNT_USD } from '../lib/constants'

export interface PaymentInsert {
  user_id: string
  amount: number
  payment_method: 'pago_movil' | 'binance' | 'zelle' | 'other'
  proof_url: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface PaymentUpdate {
  status: 'approved' | 'rejected'
  reviewed_by: string
  reviewed_at: string
  notes: string
}

export interface PaymentRow {
  id: string
  user_id: string
  amount: number
  payment_method: string
  proof_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  week_number: number | null
  notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export const paymentsService = {
  async insert(payment: PaymentInsert) {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single()
    if (error) throw error
    return data as PaymentRow
  },

  async updateStatus(paymentId: string, update: PaymentUpdate) {
    const { data, error } = await supabase
      .from('payments')
      .update(update)
      .eq('id', paymentId)
      .select()
      .single()
    if (error) throw error
    return data as PaymentRow
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as PaymentRow[]
  },

  async getPending(limit = 10) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data || []) as PaymentRow[]
  },

  async countByStatus(status: 'pending' | 'approved' | 'rejected') {
    const { data, error } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)
    if (error) throw error
    return data?.length ?? 0
  },

  getDefaultAmount(): number {
    return WEEKLY_AMOUNT_USD
  },
}

export class PaymentsError extends Error {
  constructor(message: string, public readonly userMessage: string) {
    super(message)
    this.name = 'PaymentsError'
  }

  static fromUnknown(err: unknown): PaymentsError {
    return new PaymentsError(
      err instanceof Error ? err.message : String(err),
      toUserMessage(err),
    )
  }
}
