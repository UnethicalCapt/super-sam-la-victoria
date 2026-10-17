import { Link } from 'react-router-dom'
import { StatusBadge } from '../ui/StatusBadge'
import { formatDateTime } from '../../lib/format'
import { formatCurrencyUSD } from '../../lib/format'

export interface PaymentCardProps {
  payment: {
    id: string
    user_id: string
    amount: number
    payment_method: string
    proof_url: string | null
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
    notes?: string | null
  }
  onReview?: (userId: string) => void
  userName?: string | null
  userCedula?: string | null
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  onReview,
  userName,
  userCedula,
}) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-100">
            {userName || 'Usuario desconocido'}
          </p>
          {userCedula && (
            <p className="text-xs text-gray-500">Cédula: {userCedula}</p>
          )}
          <p className="text-xs text-gray-400">
            {formatDateTime(payment.created_at)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-primary">
            {formatCurrencyUSD(payment.amount)}
          </p>
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

      <div className="flex justify-between items-start">
        <div className="font-medium text-gray-100">Estado</div>
        <StatusBadge status={payment.status} />
      </div>

      {payment.notes && (
        <div className="mt-2 pt-2 border-t">
          <p className="text-xs text-gray-400 font-medium">Nota:</p>
          <p className="text-sm text-gray-200">{payment.notes}</p>
        </div>
      )}

      <div className="flex justify-between items-start mt-2">
        <div className="font-medium text-gray-100">Comprobante</div>
        <div>
          {payment.proof_url ? (
            <a
              href={payment.proof_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm underline hover:no-underline"
            >
              Ver comprobante
            </a>
          ) : (
            <span className="text-red-500 text-sm">Sin comprobante</span>
          )}
        </div>
      </div>

      {onReview && payment.status === 'pending' && (
        <div className="mt-4 pt-3 border-t">
          <Link
            to={`/admin/user/${payment.user_id}/payments`}
            className="text-sm text-primary underline hover:no-underline"
          >
            Revisar
          </Link>
        </div>
      )}
    </div>
  )
}
