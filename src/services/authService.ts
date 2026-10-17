import { supabase } from '../lib/supabase'
import { toUserMessage } from '../lib/errors'

export interface SignUpData {
  email: string
  password: string
  fullName: string
  cedula: string
}

export interface SignInData {
  email: string
  password: string
}

export const authService = {
  async signUp(data: SignUpData) {
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          cedula: data.cedula,
        },
      },
    })
    if (error) throw error
    return result
  },

  async signIn(data: SignInData) {
    const { data: result, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) throw error
    return result
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  },

  async resetPassword(email: string, redirectTo: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })
    if (error) throw error
  },
}

export class AuthError extends Error {
  constructor(message: string, public readonly userMessage: string) {
    super(message)
    this.name = 'AuthError'
  }

  static fromUnknown(err: unknown): AuthError {
    return new AuthError(
      err instanceof Error ? err.message : String(err),
      toUserMessage(err),
    )
  }
}
