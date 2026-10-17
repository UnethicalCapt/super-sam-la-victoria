import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '../../hooks/useProfile'
import { paymentsService } from '../../services/paymentsService'
import { MetricCard } from '../../components/ui/MetricCard'

const UserHome: React.FC = () => {
  const { profile } = useProfile()
  const [pendingCount, setPendingCount] = useState(0)
  const [approvedCount, setApprovedCount] = useState(0)
  const [rejectedCount, setRejectedCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCounts = async () => {
      if (!profile) return
      setLoading(true)
      try {
        setPendingCount(await paymentsService.countByStatus('pending'))
        setApprovedCount(await paymentsService.countByStatus('approved'))
        setRejectedCount(await paymentsService.countByStatus('rejected'))
      } catch {
        // errors handled silently for dashboard
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
            ¡Hola, {profile.full_name || 'Usuario'}!
          </h1>
          {profile.is_winner && (
            <span className="ml-3 px-2 py-1 bg-primary/20 text-primary font-semibold rounded text-sm">
              Ganador del sorteo – continúa pagando
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MetricCard label="Pendientes de revisión" value={pendingCount} color="primary" />
          <MetricCard label="Aprobados" value={approvedCount} color="primary" />
          <MetricCard label="Rechazados" value={rejectedCount} color="primary" />
        </div>

        <div className="space-y-4">
          <Link
            to="/app/upload-payment"
            className="w-full bg-primary text-white py-3 px-6 rounded-md shadow-sm text-lg font-medium hover:bg-primary/90 hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Subir comprobante de pago
          </Link>
          <Link
            to="/app/my-payments"
            className="w-full bg-primary text-white py-3 px-6 rounded-md shadow-sm text-lg font-medium hover:bg-primary/90 hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Ver mis pagos
          </Link>
          <Link
            to="/app/profile"
            className="w-full bg-primary text-white py-3 px-6 rounded-md shadow-sm text-lg font-medium hover:bg-primary/90 hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Mi perfil
          </Link>
        </div>
      </div>
    </div>
  )
}

export default UserHome
