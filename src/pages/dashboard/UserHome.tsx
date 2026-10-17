import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useProfile } from '../../hooks/useProfile'
import { Link } from 'react-router-dom'

const UserHome: React.FC = () => {
  const { profile, session } = useProfile()
  const [pendingCount, setPendingCount] = useState(0)
  const [approvedCount, setApprovedCount] = useState(0)
  const [rejectedCount, setRejectedCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCounts = async () => {
      if (!profile) return
      setLoading(true)
      try {
        // Fetch pending payments count for this user
        const { data: pendingData, error: pendingError } = await supabase
          .from('payments')
          .select('id', { count: 'exact' })
          .eq('user_id', profile.id)
          .eq('status', 'pending')
        if (pendingError) throw pendingError
        setPendingCount(pendingData?.length ?? 0)

        // Fetch approved payments count for this user
        const { data: approvedData, error: approvedError } = await supabase
          .from('payments')
          .select('id', { count: 'exact' })
          .eq('user_id', profile.id)
          .eq('status', 'approved')
        if (approvedError) throw approvedError
        setApprovedCount(approvedData?.length ?? 0)

        // Fetch rejected payments count for this user
        const { data: rejectedData, error: rejectedError } = await supabase
          .from('payments')
          .select('id', { count: 'exact' })
          .eq('user_id', profile.id)
          .eq('status', 'rejected')
        if (rejectedError) throw rejectedError
        setRejectedCount(rejectedData?.length ?? 0)
      } catch (err) {
        console.error('Error fetching payment counts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()
  }, [profile])

  if (loading) {
    return <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">Cargando...</div>
    </div>
  }

  if (!profile) {
    return <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">No autenticado</div>
    </div>
  }

    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-start py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl">
          <div className="mb-4 flex items-center">
            <h1 className="text-2xl font-bold text-gray-100">
              ¡Hola, {profile.full_name || session?.user?.email!.split('@')[0] || 'Usuario'}!
            </h1>
            {profile.is_winner && (
              <span className="ml-3 px-2 py-1 bg-primary/20 text-primary font-semibold rounded text-sm">
                Ganador del sorteo – continúa pagando
              </span>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-2">Pendientes de revisión</h2>
              <p className="text-3xl font-bold text-primary">{pendingCount}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-2">Aprobados</h2>
              <p className="text-3xl font-bold text-primary">{approvedCount}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-2">Rechazados</h2>
              <p className="text-3xl font-bold text-primary">{rejectedCount}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Link
              to="/app/upload-payment"
              className="w-full bg-primary text-white py-3 px-6 rounded-md shadow-sm text-lg font-medium hover:bg-primary/90 hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Subir comprobante de pago
            </Link>
              <Link
                to="/app/my-payments"
                className="w-full bg-primary text-white py-3 px-6 rounded-md shadow-sm text-lg font-medium hover:bg-primary/90 hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Ver mis pagos
              </Link>
              <Link
                to="/app/profile"
                className="w-full bg-primary text-white py-3 px-6 rounded-md shadow-sm text-lg font-medium hover:bg-primary/90 hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Mi perfil
              </Link>
          </div>
        </div>
      </div>
    )
}

export default UserHome