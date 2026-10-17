import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'

const AdminDashboard: React.FC = () => {
  const [totalProfiles, setTotalProfiles] = useState<number>(0)
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState<number>(0)
  const [approvedPaymentsCount, setApprovedPaymentsCount] = useState<number>(0)
  const [rejectedPaymentsCount, setRejectedPaymentsCount] = useState<number>(0)
  const [recentPendingPayments, setRecentPendingPayments] = useState<Array<any>>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch total profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' })
        
        if (profilesError) throw profilesError
        setTotalProfiles(profilesData?.length ?? 0)

        // Fetch pending payments count
        const { data: pendingData, error: pendingError } = await supabase
          .from('payments')
          .select('id', { count: 'exact' })
          .eq('status', 'pending')
        
        if (pendingError) throw pendingError
        setPendingPaymentsCount(pendingData?.length ?? 0)

        // Fetch approved payments count
        const { data: approvedData, error: approvedError } = await supabase
          .from('payments')
          .select('id', { count: 'exact' })
          .eq('status', 'approved')
        
        if (approvedError) throw approvedError
        setApprovedPaymentsCount(approvedData?.length ?? 0)

        // Fetch rejected payments count
        const { data: rejectedData, error: rejectedError } = await supabase
          .from('payments')
          .select('id', { count: 'exact' })
          .eq('status', 'rejected')
        
        if (rejectedError) throw rejectedError
        setRejectedPaymentsCount(rejectedData?.length ?? 0)

        // Fetch last 10 pending payments with user profile
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select(`
            id,
            user_id,
            amount,
            payment_method,
            created_at,
            profiles!user_id (full_name, cedula)
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(10)

        if (paymentsError) throw paymentsError
        setRecentPendingPayments(paymentsData || [])
      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos')
        console.error(err)
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

            {/* Grid métricas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Total de participantes</p>
                <p className="text-3xl font-bold text-primary">{totalProfiles}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Pagos pendientes</p>
                <p className="text-3xl font-bold text-primary">{pendingPaymentsCount}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Pagos aprobados</p>
                <p className="text-3xl font-bold text-primary">{approvedPaymentsCount}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Pagos rechazados</p>
                <p className="text-3xl font-bold text-primary">{rejectedPaymentsCount}</p>
              </div>
            </div>

            {/* Sección pendientes */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-200">Pagos pendientes</h3>
              {pendingPaymentsCount === 0 ? (
                <p className="mt-2 text-gray-500">
                  No hay pagos pendientes. <Link to="/admin/participants" className="text-primary underline hover:no-underline">Ver participantes →</Link>
                </p>
              ) : (
                <div className="mt-2 space-y-2">
                  {recentPendingPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-100">{payment.profiles?.full_name || 'Usuario desconocido'}</p>
                        {payment.profiles?.cedula && (
                          <p className="text-xs text-gray-500">Cédula: {payment.profiles.cedula}</p>
                        )}
                        <p className="text-xs text-gray-400">{new Date(payment.created_at).toLocaleDateString()} {new Date(payment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-primary">${Number(payment.amount).toFixed(2)}</p>
                      </div>
                      <div>
                        <Link
                          to={`/admin/user/${payment.user_id}/payments`}
                          className="text-sm text-primary underline hover:no-underline"
                        >
                          Revisar
                        </Link>
                      </div>
                    </div>
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