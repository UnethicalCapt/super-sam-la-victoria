import React, { useState } from 'react'
import { authService } from '../../services/authService'

const ChangePassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (newPassword.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres')
      setMessageType('error')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden')
      setMessageType('error')
      setLoading(false)
      return
    }

    try {
      await authService.updatePassword(newPassword)
      setMessage('Contraseña actualizada correctamente. Por favor, inicia sesión con tu nueva contraseña.')
      setMessageType('success')
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    } catch (err: any) {
      setMessage(err.message || 'Error al actualizar la contraseña')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Cambiar contraseña</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-200 mb-1">Nueva contraseña</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="••••••"
              required
              minLength={6}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-1">Confirmar nueva contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="••••••"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-3 py-2 rounded-md bg-primary text-white font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
        {message && (
          <div className={`mt-4 px-3 py-2 rounded-md text-sm font-medium text-center ${
            messageType === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChangePassword
