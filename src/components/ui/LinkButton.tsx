import { LinkProps } from 'react-router-dom'
import { Button } from './Button'

export interface LinkButtonProps extends Omit<LinkProps, 'onClick'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  loading?: boolean
  children: React.ReactNode
  className?: string
}

export const LinkButton: React.FC<LinkButtonProps> = ({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  to,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      loading={loading}
      className={className}
      asChild
      {...(props as any)}
    >
      <a href={to as string}>{children}</a>
    </Button>
  )
}
