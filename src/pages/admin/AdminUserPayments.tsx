import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useParams, useNavigate } from 'react-router-dom'
import { useSignedUrls } from '../../hooks/useSignedUrls'

const AdminUserPayments: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>()
  const [payments, setPayments] = useState<any[]>([])
  const [participantName, setParticipantName] = useState<string>('')
  const [updating, setUpdating] = useState<Record<string, boolean>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const navigate = useNavigate()

  const { urls } = useSignedUrls(payments)

  useEffect(() => {
    if (!userId) {
      navigate('/admin')
      return
    }
    fetchPayments(userId)
  }, [userId, navigate])

  const fetchPayments = async (uid: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPayments(data || [])

      if (data && data.length > 0) {
        try {
          const { data: profData, error: profError } = await supabase
            .from('profiles')
            .select('full_name, cedula')
            .eq('id', uid)
            .single()
          if (!profError && profData) {
            setParticipantName(profData.full_name || profData.cedula || 'Participante')
          }
        } catch {
          // ignore, title will fallback
        }
      }
    } catch (err: any) {
      console.error('Error al cargar los pagos:', err)
      setPayments([])
    }
  }

  const handleUpdateStatus = async (paymentId: string, newStatus: 'approved' | 'rejected') => {
    if (!paymentId) return
    setUpdating(prev => ({ ...prev, [paymentId]: true }))
    try {
      const note = notes[paymentId] ?? ''
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('Usuario no autenticado')

      const { error } = await supabase
        .from('payments')
        .update({
          status: newStatus,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          notes: note
        } as any)
        .eq('id', paymentId)

      if (error) throw error

      if (userId) await fetchPayments(userId)
    } catch (err: any) {
      console.error(`Error al ${newStatus === 'approved' ? 'aprobar' : 'rechazar'} el pago:`, err)
    } finally {
      setUpdating(prev => ({ ...prev, [paymentId]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6 mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-100">Super Sam La Victoria</h1>
          <p className="text-sm text-gray-200">Pagos de {participantName || 'Usuario'}</p>
        </div>

        {payments.length === 0 ? (
          <p className="text-center text-gray-200">
            Este usuario no tiene pagos registrados.
          </p>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-100">Fecha de pago</div>
                  <div className="text-sm text-gray-200">
                    {new Date(payment.created_at).toLocaleDateString()}
                    {new Date(payment.created_at).toLocaleTimeString()}
                  </div>
                </div>

                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-100">Método de pago</div>
                  <div className="text-gray-100">
                    {payment.payment_method === 'pago_movil' ? 'Pago Móvil' :
                     payment.payment_method === 'binance' ? 'Binance USDT' :
                     payment.payment_method === 'zelle' ? 'Zelle' : 'Otro'}
                  </div>
                </div>

                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-100">Monto</div>
                  <div className="font-bold text-gray-100">${Number(payment.amount).toFixed(2)}</div>
                </div>

                <div className="flex justify-between items-start">
                  <div className="font-medium text-gray-100">Estado</div>
                  <div className={`px-2 py-1 rounded text-sm font-medium ${payment.status === 'pending' ? 'bg-yellow-900 text-yellow-100' : payment.status === 'approved' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'}`}>
                    {payment.status === 'pending' ? 'Pendiente' :
                     payment.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                  </div>
                </div>

                {/* Comprobante */}
                <div className="flex justify-between items-start mt-2">
                  <div className="font-medium text-gray-100">Comprobante</div>
                  <div>
                    {payment.proof_url ? (
                      urls[payment.id] ? (
                        <>
                          <a href={urls[payment.id]} target="_blank" rel="noopener noreferrer">
                            <img src={urls[payment.id]} alt="Comprobante" style={{ maxWidth: '100px', maxHeight: '100px', border: '1px solid #ddd', borderRadius: '4px' }} />
                          </a>
                        </>
                      ) : (
                        <span className="text-red-500">Comprobante no disponible</span>
                      )
                    ) : (
                      <span className="text-gray-200">Sin comprobante</span>
                    )}
                  </div>
                </div>

                {/* Approve/Reject actions for pending payments */}
                {payment.status === 'pending' && (
                  <div className="mt-4 pt-3 border-t">
                    <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-1">Nota (opcional)</label>
                         <textarea
                           value={notes[payment.id] ?? ''}
                           onChange={(e) => setNotes(prev => ({ ...prev, [payment.id]: e.target.value }))}
                           placeholder="Ej: Comprobante claro, pago verificado"
                           className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                           rows={2}
                         />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:sm:w-1/2">
                        <button
                          onClick={() => handleUpdateStatus(payment.id, 'approved')}
                          disabled={updating[payment.id]}
                           className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 active:scale-[0.98] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                          {updating[payment.id] ? 'Aprobando...' : 'Aprobar'}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(payment.id, 'rejected')}
                          disabled={updating[payment.id]}
                           className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 active:scale-[0.98] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                          {updating[payment.id] ? 'Rechazando...' : 'Rechazar'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUserPayments
