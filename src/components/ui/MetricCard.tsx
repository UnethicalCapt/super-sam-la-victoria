export interface MetricCardProps {
  label: string
  value: number | string
  color?: 'primary' | 'green' | 'yellow' | 'red'
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  color = 'primary',
}) => {
  const colorClasses: Record<string, string> = {
    primary: 'text-primary',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${colorClasses[color]}`}>
        {value}
      </p>
    </div>
  )
}
