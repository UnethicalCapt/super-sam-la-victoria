import { supabase } from '../lib/supabase'
import { toUserMessage } from '../lib/errors'

export interface ProfileRow {
  id: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  address: string | null
  birth_date: string | null
  gender: string | null
  phone: string | null
  cedula: string | null
  role: 'user' | 'admin'
  is_winner: boolean
  group_id: string | null
  created_at: string
  updated_at: string
}

export interface ProfileUpdate {
  first_name?: string
  last_name?: string
  full_name?: string
  address?: string
  birth_date?: string
  gender?: string | null
  phone?: string
  cedula?: string
}

export const profilesService = {
  async getById(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data as ProfileRow
  },

  async searchByCedula(cedula: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('cedula', cedula)
      .single()
    if (error) throw error
    return data as ProfileRow
  },

  async update(userId: string, updates: ProfileUpdate) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data as ProfileRow
  },

  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name')
    if (error) throw error
    return (data || []) as ProfileRow[]
  },
}

export class ProfilesError extends Error {
  constructor(message: string, public readonly userMessage: string) {
    super(message)
    this.name = 'ProfilesError'
  }

  static fromUnknown(err: unknown): ProfilesError {
    return new ProfilesError(
      err instanceof Error ? err.message : String(err),
      toUserMessage(err),
    )
  }
}
