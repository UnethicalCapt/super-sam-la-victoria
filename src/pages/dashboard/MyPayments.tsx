import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../../services/authService'
import { paymentsService } from '../../services/paymentsService'
import { toUserMessage } from '../../lib/errors'
import { PaymentCard } from '../../components/payments/PaymentCard'

const MyPayments: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    setError(null)

    try {
      const user = await authService.getUser()
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      const data = await paymentsService.getByUser(user.id)
      setPayments(data)
    } catch (err: any) {
      setError(toUserMessage(err))
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

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

        <div className="mt-6 space-y-3">
          <Link
            to="/app/upload-payment"
            className="w-full bg-primary text-white py-3 px-6 rounded-md text-lg font-medium hover:bg-primary/90 active:scale-[0.98] transition-colors duration-150"
          >
            Subir comprobante de pago
          </Link>
          <Link
            to="/app/my-payments"
            className="w-full bg-primary text-white py-3 px-6 rounded-md text-lg font-medium hover:bg-primary/90 active:scale-[0.98] transition-colors duration-150"
          >
            Ver mis pagos
          </Link>
          <Link
            to="/app/profile"
            className="w-full bg-primary text-white py-3 px-6 rounded-md text-lg font-medium hover:bg-primary/90 active:scale-[0.98] transition-colors duration-150"
          >
            Mi perfil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6 mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-100">Super Sam La Victoria</h1>
          <p className="text-sm text-gray-200">Mis Pagos</p>
        </div>

        {payments.length === 0 ? (
          <div className="text-center space-y-4">
            <p className="text-gray-200">
              Aún no has enviado ningún comprobante de pago.
            </p>
            <Link
              to="/app/upload-payment"
              className="w-inline-flex bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 active:scale-[0.98] transition-colors duration-150 font-medium"
            >
              Subir comprobante
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyPayments
