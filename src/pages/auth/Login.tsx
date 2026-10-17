import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'
import { toUserMessage } from '../../lib/errors'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (signInError) throw signInError

        // Fetch user profile to determine role
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single()

        if (profileError) throw profileError

        const redirectPath = (profileData as { role?: string } | null)?.role === 'admin' ? '/admin' : '/app'
        navigate(redirectPath, { replace: true })
    } catch (err: any) {
        setError(toUserMessage(err))
    } finally {
        setLoading(false)
    }
}

    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-lg shadow-md p-6 space-y-6 mx-auto">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-100">Super Sam La Victoria</h1>
            <p className="text-sm text-gray-200">Accede a tu cuenta</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 px-6 rounded-md hover:bg-primary/90 active:scale-[0.98] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
          <p className="text-sm text-center text-gray-200">
            ¿No tienes una cuenta? <Link to="/register" className="text-primary hover:underline">Regístrate aquí</Link>
          </p>
          <p className="text-sm text-center text-gray-200">
            <button
              onClick={() => {
                if (email) {
                  supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` })
                  setError('Si existe una cuenta con ese correo, recibirás instrucciones para restablecer tu contraseña.')
                } else {
                  setError('Ingresa tu correo electrónico primero.')
                }
              }}
              className="text-primary hover:underline text-sm"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </p>
        </div>
      </div>
    )
}

export default Login