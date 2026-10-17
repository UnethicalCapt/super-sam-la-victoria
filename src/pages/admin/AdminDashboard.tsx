import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { profilesService } from '../../services/profilesService'
import { paymentsService } from '../../services/paymentsService'
import { MetricCard } from '../../components/ui/MetricCard'
import { PaymentCard } from '../../components/payments/PaymentCard'
import { toUserMessage } from '../../lib/errors'

const AdminDashboard: React.FC = () => {
  const [totalProfiles, setTotalProfiles] = useState<number>(0)
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState<number>(0)
  const [approvedPaymentsCount, setApprovedPaymentsCount] = useState<number>(0)
  const [rejectedPaymentsCount, setRejectedPaymentsCount] = useState<number>(0)
  const [recentPendingPayments, setRecentPendingPayments] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const profiles = await profilesService.getAll()
        setTotalProfiles(profiles.length)

        setPendingPaymentsCount(await paymentsService.countByStatus('pending'))
        setApprovedPaymentsCount(await paymentsService.countByStatus('approved'))
        setRejectedPaymentsCount(await paymentsService.countByStatus('rejected'))

        const pending = await paymentsService.getPending(10)
        setRecentPendingPayments(pending)
      } catch (err: any) {
        setError(toUserMessage(err))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-gray-100">Cargando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-950/40 border border-red-700 text-red-200 p-4 w-full max-w-xl">
          <p className="font-bold">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col items-start gap-4">
          <div className="flex flex-wrap items-center justify-between w-full">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Panel de control</h1>
              <p className="text-sm text-gray-400">Resumen del san y pagos por revisar</p>
            </div>
            <div className="flex gap-2">
              <Link to="/admin/search" className="bg-primary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-primary/90 hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-colors duration-150">
                Buscar por cédula
              </Link>
              <Link to="/admin/participants" className="bg-primary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-primary/90 hover:shadow-md hover:brightness-110 active:scale-[0.98] transition-colors duration-150">
                Participantes
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard label="Total de participantes" value={totalProfiles} color="primary" />
            <MetricCard label="Pagos pendientes" value={pendingPaymentsCount} color="primary" />
            <MetricCard label="Pagos aprobados" value={approvedPaymentsCount} color="primary" />
            <MetricCard label="Pagos rechazados" value={rejectedPaymentsCount} color="primary" />
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-200">Pagos pendientes</h3>
            {pendingPaymentsCount === 0 ? (
              <p className="mt-2 text-gray-500">
                No hay pagos pendientes. <Link to="/admin/participants" className="text-primary underline hover:no-underline">Ver participantes →</Link>
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                {recentPendingPayments.map((payment) => (
                  <PaymentCard
                    key={payment.id}
                    payment={{
                      id: payment.id,
                      user_id: payment.user_id,
                      amount: payment.amount,
                      payment_method: payment.payment_method,
                      proof_url: payment.proof_url,
                      status: payment.status,
                      created_at: payment.created_at,
                      notes: payment.notes,
                    }}
                    userName={payment.profiles?.full_name || null}
                    userCedula={payment.profiles?.cedula || null}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
