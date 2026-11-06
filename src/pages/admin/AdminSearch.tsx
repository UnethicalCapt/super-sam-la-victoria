import React, { useState } from 'react'
import { profilesService } from '../../services/profilesService'
import { toUserMessage } from '../../lib/errors'

const AdminSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) {
      setError('Ingrese una cédula para buscar')
      return
    }
    setLoading(true)
    setError(null)
    setProfile(null)
    try {
      const normalized = searchTerm.replace(/[.\s-]/g, '')
      const data = await profilesService.searchByCedula(normalized)
      setProfile(data)
    } catch (err: any) {
      setError(toUserMessage(err))
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6 mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-100">Super Sam La Victoria</h1>
          <p className="text-sm text-gray-400">Buscar Participante</p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="cedulaSearch" className="block text-sm font-medium text-gray-400 mb-1">
              Cédula
            </label>
            <input
              id="cedulaSearch"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 active:scale-[0.98] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {profile && (
          <div className="mt-6 p-4 bg-gray-900 border border-gray-800 rounded-lg">
            <h3 className="text-lg font-medium text-gray-100 mb-2">Datos del Participante</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Cédula:</span> {profile.cedula}</div>
              <div><span className="font-medium">Nombre:</span> {profile.full_name}</div>
              <div><span className="font-medium">Teléfono:</span> {profile.phone ?? 'No proporcionado'}</div>
              <div><span className="font-medium">Rol:</span> {profile.role === 'admin' ? 'Administrador' : 'Participante'}</div>
              <div><span className="font-medium">Estado:</span> {profile.is_winner ? 'Ganador' : 'Participante regular'}</div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => {
                  window.location.href = `/admin/user/${profile.id}/payments`
                }}
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 active:scale-[0.98] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Ver pagos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminSearch
