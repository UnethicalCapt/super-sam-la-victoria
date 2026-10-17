import { PAYMENT_STATUS } from '../../lib/constants'

export interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = PAYMENT_STATUS[status]
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}
